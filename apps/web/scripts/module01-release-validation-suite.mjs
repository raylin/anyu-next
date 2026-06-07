#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { checkDeployFreshness } from "./deploy-freshness-check.mjs";

const MODULE = "ai-temperature";
const STAGING_BASE_URL = "https://staging.anyu.tw";
const OUTPUT_DIR = ".qa";
const STAGING_ARTIFACT_PATH = path.join(OUTPUT_DIR, "module01-staging-artifact.json");
const STAGING_ENV_MIRROR_PATH = ".env.staging";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const STATUS_ORDER = {
  pass: 0,
  skipped: 1,
  partial: 2,
  blocked: 3,
};
const TOKEN_LIKE_PATTERNS = [
  /pa_[A-Za-z0-9_-]{8,}/u,
  /pcs_[A-Za-z0-9_-]{8,}/u,
  /pal_[A-Za-z0-9_-]{8,}/u,
  /prl_[A-Za-z0-9_-]{8,}/u,
  /\/r\/[A-Za-z0-9_-]{12,}/u,
  /token_hash/iu,
  /contact_hash/iu,
  /recipient_hash/iu,
  /encrypted_recipient/iu,
  /provider_payload/iu,
  /tradeinfo/iu,
  /tradesha/iu,
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/iu,
];
const PLACEHOLDER_VALUE_PATTERN = /^(?:todo|change_me|placeholder|owner_fill_required|""|'')$/iu;
const STAGING_ENV_MIRROR_REQUIRED_KEYS = [
  "ADMIN_API_TOKEN",
  "ANALYSIS_CACHE_HASH_SECRET",
  "ANTHROPIC_API_KEY",
  "CRON_SECRET",
  "DATABASE_URL",
  "EMAIL_FROM",
  "EMAIL_PROVIDER",
  "ENABLE_NEWEBPAY_CHECKOUT",
  "ENABLE_OPERATOR_FAKE_PAID_SUCCESS",
  "ENABLE_OPERATOR_RECOVERY_LINK_SMOKE",
  "ENABLE_PAID_GENERATION_PROCESSOR",
  "ENABLE_PAID_JOB_QUEUE_TRIGGER",
  "ENABLE_PAYMENT_RUNTIME",
  "INTERNAL_JOB_SECRET",
  "LINE_CHANNEL_ACCESS_TOKEN",
  "LINE_CHANNEL_SECRET",
  "LINE_RECOVERY_MESSAGE_PROVIDER",
  "LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY",
  "NEWEBPAY_CHECKOUT_URL",
  "NEWEBPAY_ENVIRONMENT",
  "NEWEBPAY_HASH_IV",
  "NEWEBPAY_HASH_KEY",
  "NEWEBPAY_MERCHANT_ID",
  "NEWEBPAY_NOTIFY_URL",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_LINE_LIFF_ID",
  "NEXT_PUBLIC_LINE_LIFF_URL",
  "OPERATOR_TEST_SECRET",
  "PAID_ACCESS_TOKEN_HASH_SECRET",
  "PAID_JOB_QUEUE_PROVIDER",
  "PAID_JOB_QUEUE_TOPIC",
  "PAYMENT_CHECKOUT_SESSION_SECRET",
  "PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY",
  "PAYMENT_RECOVERY_CONTACT_HASH_SECRET",
  "PAYMENT_RECOVERY_LINK_TOKEN_SECRET",
  "RESEND_API_KEY",
];

function nowIso() {
  return new Date().toISOString();
}

function makeCheck(id, status, details = {}) {
  return {
    id,
    status,
    manualRequired: false,
    ownerVerified: false,
    sendsRealEmail: false,
    sendsRealLine: false,
    mutatesData: false,
    productionTouched: false,
    blockers: [],
    warnings: [],
    ...details,
  };
}

function parseEnvMirrorContent(content) {
  const env = new Map();
  const duplicateNames = [];

  for (const line of content.split(/\r?\n/u)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/u);

    if (!match) {
      continue;
    }

    const [, name, rawValue] = match;
    let value = rawValue.trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    } else {
      const commentIndex = value.search(/\s#/u);

      if (commentIndex >= 0) {
        value = value.slice(0, commentIndex).trimEnd();
      }
    }

    if (env.has(name)) {
      duplicateNames.push(name);
    }

    env.set(name, value);
  }

  return { env, duplicateNames };
}

function verifyEnvMirrorShape(content, requiredKeys) {
  const { env, duplicateNames } = parseEnvMirrorContent(content);
  const missingNames = [];
  const emptyNames = [];
  const placeholderNames = [];
  const passNames = [];

  for (const key of requiredKeys) {
    if (!env.has(key)) {
      missingNames.push(key);
      continue;
    }

    const value = env.get(key)?.trim() ?? "";

    if (!value) {
      emptyNames.push(key);
      continue;
    }

    if (PLACEHOLDER_VALUE_PATTERN.test(value)) {
      placeholderNames.push(key);
      continue;
    }

    passNames.push(key);
  }

  let category = "pass_mirror_shape";

  if (missingNames.length > 0) {
    category = "blocked_missing_local_mirror_secret";
  } else if (emptyNames.length > 0) {
    category = "blocked_empty_local_mirror_secret";
  } else if (placeholderNames.length > 0) {
    category = "blocked_placeholder_local_mirror_secret";
  } else if (duplicateNames.length > 0) {
    category = "blocked_duplicate_local_mirror_key";
  }

  return {
    category,
    passNames,
    missingNames,
    emptyNames,
    placeholderNames,
    duplicateNames,
  };
}

function stagingEnvMirrorCheck() {
  const mirrorPath = path.resolve(process.cwd(), STAGING_ENV_MIRROR_PATH);

  if (!fs.existsSync(mirrorPath)) {
    return makeCheck("staging_env_mirror", "blocked", {
      required: true,
      category: "blocked_missing_local_mirror_file",
      envMirrorPath: STAGING_ENV_MIRROR_PATH,
      blockers: ["staging_env_mirror_missing"],
    });
  }

  const shape = verifyEnvMirrorShape(
    fs.readFileSync(mirrorPath, "utf8"),
    STAGING_ENV_MIRROR_REQUIRED_KEYS,
  );
  const pass = shape.category === "pass_mirror_shape";

  return makeCheck("staging_env_mirror", pass ? "pass" : "blocked", {
    required: true,
    category: shape.category,
    envMirrorPath: STAGING_ENV_MIRROR_PATH,
    passCount: shape.passNames.length,
    missingNames: shape.missingNames,
    emptyNames: shape.emptyNames,
    placeholderNames: shape.placeholderNames,
    duplicateNames: shape.duplicateNames,
    valuesPrinted: false,
    lengthsPrinted: false,
    prefixesPrinted: false,
    suffixesPrinted: false,
    hashesPrinted: false,
    checksumsPrinted: false,
    blockers: pass ? [] : [shape.category],
  });
}

function worstStatus(statuses) {
  return statuses.reduce(
    (worst, status) => (STATUS_ORDER[status] > STATUS_ORDER[worst] ? status : worst),
    "pass",
  );
}

function deriveGateStatus(checks) {
  const statuses = Object.values(checks)
    .filter((check) => check.required !== false || check.status !== "skipped")
    .map((check) => check.status);
  const requiredBlocked = Object.values(checks).some(
    (check) => check.required !== false && check.status === "blocked",
  );

  if (requiredBlocked) {
    return "blocked";
  }

  return worstStatus(statuses);
}

function deriveChecksStatus(checks, required) {
  const statuses = Object.values(checks)
    .filter((check) => (required ? check.required !== false : check.required === false))
    .map((check) => check.status);

  if (statuses.length === 0) {
    return "not_applicable";
  }

  return worstStatus(statuses);
}

function buildSummary(input) {
  const checks = input.checks ?? {};
  const checkValues = Object.values(checks);
  const blockers = [
    ...(input.blockers ?? []),
    ...checkValues.flatMap((check) => check.blockers ?? []),
  ];
  const warnings = [
    ...(input.warnings ?? []),
    ...checkValues.flatMap((check) => check.warnings ?? []),
  ];
  const status = blockers.length > 0 ? "blocked" : deriveGateStatus(checks);

  const requiredChecksStatus = deriveChecksStatus(checks, true);
  const optionalChecksStatus = deriveChecksStatus(checks, false);
  const deploy = input.deployFreshness ?? {};
  const mixedDeploymentDetected = Boolean(deploy.mixedDeploymentDetected);
  const gateStatus = mixedDeploymentDetected ? "blocked" : status;

  return {
    module: MODULE,
    environment: input.environment,
    command: input.command,
    status: gateStatus,
    gateStatus,
    commandExitCode: gateStatus === "blocked" ? 1 : 0,
    requiredChecksStatus,
    optionalChecksStatus,
    targetDeployCommit: deploy.targetDeployCommit ?? null,
    deployedCommitAtGateStart: deploy.deployedCommitAtGateStart ?? null,
    deployedCommitAtGateEnd: deploy.deployedCommitAtGateEnd ?? null,
    freshnessStatus: deploy.freshnessStatus ?? "not_applicable",
    mixedDeploymentDetected,
    generatedAt: input.generatedAt ?? nowIso(),
    checks,
    manualRequired: input.manualRequired ?? [],
    blockers,
    warnings,
    sendsRealEmail: checkValues.some((check) => check.sendsRealEmail),
    sendsRealLine: checkValues.some((check) => check.sendsRealLine),
    mutatesData: checkValues.some((check) => check.mutatesData),
    productionTouched: checkValues.some((check) => check.productionTouched),
    ownerApprovalRequired: input.ownerApprovalRequired ?? false,
    nextRequiredAction: input.nextRequiredAction ?? inferNextRequiredAction(gateStatus, checks),
  };
}

function inferNextRequiredAction(status, checks) {
  if (status === "blocked") {
    return "fix_blockers_and_rerun";
  }

  if (Object.values(checks).some((check) => check.status === "partial")) {
    return "review_partial_checks";
  }

  return "no_action_needed";
}

function assertSanitizedSummary(summary) {
  const serialized = JSON.stringify(summary);

  for (const pattern of TOKEN_LIKE_PATTERNS) {
    if (pattern.test(serialized)) {
      throw new Error("module01_validation_summary_not_sanitized");
    }
  }

  return summary;
}

function outputPathForMode(mode) {
  return path.join(
    process.cwd(),
    OUTPUT_DIR,
    `module01-${mode === "production" ? "production-preflight" : mode}-summary.json`,
  );
}

function parseSuiteKnownResultArtifact(raw) {
  try {
    const artifact = JSON.parse(raw);
    const resultId = typeof artifact.resultId === "string" ? artifact.resultId.trim() : "";
    const sourceCategory =
      typeof artifact.resultIdSourceCategory === "string"
        ? artifact.resultIdSourceCategory.trim()
        : "";
    const environment = typeof artifact.environment === "string" ? artifact.environment.trim() : "";

    if (!UUID_PATTERN.test(resultId)) {
      return null;
    }

    if (environment !== "staging" || sourceCategory !== "staging_runtime_no_card") {
      return null;
    }

    return {
      resultId,
      sourceCategory,
    };
  } catch {
    return null;
  }
}

function resolveKnownResultId(input = {}) {
  const env = input.env ?? process.env;
  const explicit =
    env.MODULE01_ADMIN_LOOKUP_RESULT_ID?.trim() ?? env.QA_MODULE01_ADMIN_RESULT_ID?.trim() ?? "";

  if (explicit) {
    if (!UUID_PATTERN.test(explicit)) {
      return null;
    }

    return {
      resultId: explicit,
      sourceCategory: "explicit_env_known_result_id",
    };
  }

  const artifactPath =
    input.artifactPath ?? path.resolve(process.cwd(), STAGING_ARTIFACT_PATH);

  if (!fs.existsSync(artifactPath)) {
    return null;
  }

  return parseSuiteKnownResultArtifact(fs.readFileSync(artifactPath, "utf8"));
}

function writeSummary(mode, summary) {
  const safeSummary = assertSanitizedSummary(summary);
  const outputPath = outputPathForMode(mode);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(safeSummary, null, 2)}\n`);
  console.log(JSON.stringify({ step: "module01_suite_summary", outputPath, ...safeSummary }));
  return outputPath;
}

function runCommand(id, command, args, options = {}) {
  console.log(JSON.stringify({ step: "module01_suite_check_start", id, command: [command, ...args] }));
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? process.cwd(),
    env: { ...process.env, ...(options.env ?? {}) },
    stdio: "inherit",
  });
  const status = result.status === 0 ? "pass" : "blocked";

  return makeCheck(id, status, {
    required: options.required !== false,
    mutatesData: Boolean(options.mutatesData),
    productionTouched: Boolean(options.productionTouched),
    warnings: options.warnings ?? [],
    blockers: status === "blocked" ? [options.blocker ?? `${id}_failed`] : [],
  });
}

function runCommandCapture(id, command, args, options = {}) {
  console.log(
    JSON.stringify({
      step: "module01_suite_check_start",
      id,
      command: options.logArgs ? [command, ...options.logArgs] : [command, ...args],
    }),
  );
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? process.cwd(),
    env: { ...process.env, ...(options.env ?? {}) },
    encoding: "utf8",
  });

  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let json = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  return { response, json, text };
}

async function stagingHealthCheck() {
  try {
    const { response, json } = await requestJson(`${STAGING_BASE_URL}/api/health`);
    const pass =
      response.status === 200 &&
      json?.environment === "preview" &&
      json?.gitBranch === "staging" &&
      json?.routeBundleVersion === "payment-foundation-2026-05-29";

    return makeCheck("staging_health", pass ? "pass" : "blocked", {
      required: true,
      httpStatus: response.status,
      environment: json?.environment ?? null,
      gitBranch: json?.gitBranch ?? null,
      gitCommitPresent: Boolean(json?.gitCommit),
      routeBundleVersion: json?.routeBundleVersion ?? null,
      blockers: pass ? [] : ["staging_freshness_untrusted"],
    });
  } catch {
    return makeCheck("staging_health", "blocked", {
      required: true,
      blockers: ["staging_health_unreachable"],
    });
  }
}

function expectedDeployCommitFromEnv(env = process.env) {
  return (
    env.MODULE01_EXPECTED_DEPLOY_COMMIT?.trim() ??
    env.QA_EXPECTED_DEPLOY_COMMIT?.trim() ??
    ""
  );
}

function deployFreshnessCheckFromResult(result, options = {}) {
  const pass = result.status === "pass";
  const category = result.category ?? (pass ? "pass" : "staging_freshness_not_ready");

  return makeCheck("deployed_freshness", pass ? "pass" : "blocked", {
    required: true,
    category,
    targetDeployCommit: result.targetDeployCommit ?? null,
    deployedCommitAtGateStart: result.deployedCommitAtGateStart ?? null,
    deployedCommitAtGateEnd: result.deployedCommitAtGateEnd ?? null,
    freshnessStatus: result.freshnessStatus ?? (pass ? "pass" : "blocked"),
    mixedDeploymentDetected: Boolean(result.mixedDeploymentDetected),
    attempts: result.attempts ?? null,
    blockers: pass ? [] : [category],
    warnings: options.warnings ?? [],
    valuesPrinted: false,
    lengthsPrinted: false,
    prefixesPrinted: false,
    suffixesPrinted: false,
    hashesPrinted: false,
    checksumsPrinted: false,
  });
}

function deployFreshnessNotAssertedCheck() {
  return makeCheck("deployed_freshness", "skipped", {
    required: false,
    category: "not_asserted",
    freshnessStatus: "not_asserted",
    warnings: ["expected_deploy_commit_not_provided"],
  });
}

function deployFreshnessSummaryFromCheck(check) {
  return {
    targetDeployCommit: check.targetDeployCommit ?? null,
    deployedCommitAtGateStart: check.deployedCommitAtGateStart ?? null,
    deployedCommitAtGateEnd: check.deployedCommitAtGateEnd ?? null,
    freshnessStatus: check.freshnessStatus ?? check.category ?? "not_applicable",
    mixedDeploymentDetected: Boolean(check.mixedDeploymentDetected),
  };
}

function safeAdminApiResponse(json) {
  if (!json || json.ok !== true) {
    return false;
  }

  const serialized = JSON.stringify(json);
  return !TOKEN_LIKE_PATTERNS.some((pattern) => pattern.test(serialized));
}

async function adminApiStagingCheck() {
  const token = process.env.ADMIN_API_TOKEN?.trim() ?? "";
  const knownResult = resolveKnownResultId();

  if (!token) {
    return makeCheck("admin_api_lookup", "partial", {
      required: false,
      blockers: [],
      warnings: ["skipped_missing_admin_token"],
      nextRequiredAction: "set_preview_admin_api_token_and_rerun",
    });
  }

  const noToken = await requestJson(`${STAGING_BASE_URL}/api/admin/paid-results/00000000-0000-4000-8000-000000000000`);
  const wrongToken = await requestJson(
    `${STAGING_BASE_URL}/api/admin/paid-results/00000000-0000-4000-8000-000000000000`,
    { headers: { "x-admin-api-token": "wrong-admin-token-for-module01-suite" } },
  );

  if (noToken.response.status !== 401 || wrongToken.response.status !== 401) {
    return makeCheck("admin_api_lookup", "blocked", {
      required: true,
      blockers: ["admin_api_auth_gate_failed"],
    });
  }

  if (!knownResult) {
    return makeCheck("admin_api_lookup", "partial", {
      required: false,
      warnings: ["skipped_missing_known_result_id"],
      nextRequiredAction: "provide_module01_admin_lookup_result_id",
    });
  }

  const valid = await requestJson(
    `${STAGING_BASE_URL}/api/admin/paid-results/${encodeURIComponent(knownResult.resultId)}`,
    { headers: { "x-admin-api-token": token } },
  );
  const pass = valid.response.status === 200 && safeAdminApiResponse(valid.json);

  return makeCheck("admin_api_lookup", pass ? "pass" : "blocked", {
    required: true,
    httpStatus: valid.response.status,
    knownResultIdSourceCategory: knownResult.sourceCategory,
    responseSanitized: pass,
    blockers: pass ? [] : ["admin_api_lookup_failed_or_unsafe"],
  });
}

function parseAdminCliJsonOutput(stdout) {
  const jsonStart = stdout.indexOf("{");

  if (jsonStart === -1) {
    return null;
  }

  try {
    return JSON.parse(stdout.slice(jsonStart));
  } catch {
    return null;
  }
}

function safeAdminCliOutput(stdout) {
  let parsed = null;

  parsed = parseAdminCliJsonOutput(stdout);

  if (!parsed || parsed.ok !== true || parsed.env !== "staging" || parsed.lookup?.ok !== true) {
    return false;
  }

  const serialized = JSON.stringify(parsed);
  return !TOKEN_LIKE_PATTERNS.some((pattern) => pattern.test(serialized));
}

function parseJsonOutput(stdout) {
  const jsonStart = stdout.indexOf("{");

  if (jsonStart === -1) {
    return null;
  }

  try {
    return JSON.parse(stdout.slice(jsonStart));
  } catch {
    return null;
  }
}

function adminCliStagingCheck() {
  const token = process.env.ADMIN_API_TOKEN?.trim() ?? "";
  const knownResult = resolveKnownResultId();

  if (!token) {
    return makeCheck("admin_cli_lookup", "partial", {
      required: false,
      adminCliLookupStatus: "skipped_missing_admin_token",
      adminCliLookupCommand: "pnpm ops lookup-result --env staging --id [REDACTED] --json",
      warnings: ["skipped_missing_admin_token"],
      nextRequiredAction: "set_preview_admin_api_token_and_rerun",
    });
  }

  if (!knownResult) {
    return makeCheck("admin_cli_lookup", "partial", {
      required: false,
      adminCliLookupStatus: "skipped_missing_known_result_id",
      adminCliLookupCommand: "pnpm ops lookup-result --env staging --id [REDACTED] --json",
      warnings: ["skipped_missing_known_result_id"],
      nextRequiredAction: "provide_module01_admin_lookup_result_id",
    });
  }

  const rootDir = path.resolve(process.cwd(), "../..");
  const result = runCommandCapture(
    "admin_cli_lookup",
    "corepack",
    [
      "pnpm",
      "--silent",
      "ops",
      "lookup-result",
      "--env",
      "staging",
      "--id",
      knownResult.resultId,
      "--json",
    ],
    {
      cwd: rootDir,
      env: {
        ADMIN_API_TOKEN: token,
      },
      logArgs: [
        "pnpm",
        "--silent",
        "ops",
        "lookup-result",
        "--env",
        "staging",
        "--id",
        "[REDACTED]",
        "--json",
      ],
    },
  );
  const pass = result.status === 0 && safeAdminCliOutput(result.stdout);

  return makeCheck("admin_cli_lookup", pass ? "pass" : "blocked", {
    required: true,
    adminCliLookupCommand: "pnpm ops lookup-result --env staging --id [REDACTED] --json",
    adminCliLookupStatus: pass ? "pass" : "blocked",
    knownResultIdSourceCategory: knownResult.sourceCategory,
    responseSanitized: pass,
    blockers: pass ? [] : ["admin_cli_lookup_failed_or_unsafe"],
  });
}

function productionRuntimeWindowStatusCheck() {
  const result = runCommandCapture(
    "production_runtime_window_status",
    "corepack",
    ["pnpm", "run", "qa:production:runtime-window", "--", "--action", "status"],
  );
  const parsed = parseJsonOutput(result.stdout);
  const responseSanitized =
    parsed !== null && !TOKEN_LIKE_PATTERNS.some((pattern) => pattern.test(JSON.stringify(parsed)));
  const commandOk = result.status === 0 && responseSanitized;
  const aliasGuardStatus =
    parsed && typeof parsed.aliasGuardStatus === "string" ? parsed.aliasGuardStatus : "unknown";
  const stateCategory =
    parsed && typeof parsed.stateCategory === "string" ? parsed.stateCategory : "unknown";
  const gateOk = commandOk && aliasGuardStatus === "pass" && stateCategory === "fail_closed_ready";
  const warnings = [];

  if (aliasGuardStatus !== "pass") {
    warnings.push(aliasGuardStatus);
  }

  if (stateCategory !== "fail_closed_ready") {
    warnings.push(stateCategory);
  }

  return makeCheck("production_runtime_window_status", gateOk ? "pass" : "blocked", {
    required: true,
    productionTouched: true,
    runtimeWindowStatus: stateCategory,
    aliasGuardStatus,
    responseSanitized,
    warnings,
    blockers: gateOk ? [] : [`production_runtime_window_${aliasGuardStatus}`],
  });
}

async function runLocalSuite() {
  const checks = {
    lint: runCommand("lint", "corepack", ["pnpm", "lint"]),
    targetedTests: runCommand("targeted_tests", "corepack", [
      "pnpm",
      "exec",
      "vitest",
      "run",
      "src/tests/admin-paid-result-lookup.test.ts",
      "src/tests/admin-paid-result-lookup-route.test.ts",
      "src/tests/newebpay-checkout-start-page.test.tsx",
      "src/tests/newebpay-return-page.test.tsx",
      "src/tests/paid-result-recovery-links.test.ts",
      "src/tests/email-recovery-link.test.ts",
      "src/tests/line-recovery-link.test.ts",
    ]),
    fullTests: runCommand("full_tests", "corepack", ["pnpm", "test"]),
    build: runCommand("build", "corepack", ["pnpm", "build"]),
  };

  const summary = buildSummary({
    environment: "local",
    command: "qa:module01:local",
    checks,
    nextRequiredAction: "run_qa_module01_staging",
  });

  writeSummary("local", summary);
  return summary;
}

async function runStagingSuite() {
  const expectedCommit = expectedDeployCommitFromEnv();
  const stagingEnvMirror = stagingEnvMirrorCheck();
  let deployedFreshness;

  if (expectedCommit) {
    const freshnessResult = await checkDeployFreshness({
      env: "staging",
      expectedCommit,
      timeoutMs: Number(process.env.MODULE01_DEPLOY_FRESHNESS_TIMEOUT_MS),
      intervalMs: Number(process.env.MODULE01_DEPLOY_FRESHNESS_INTERVAL_MS),
    });
    deployedFreshness = deployFreshnessCheckFromResult(freshnessResult);
  } else {
    deployedFreshness = deployFreshnessNotAssertedCheck();
  }

  if (deployedFreshness.status === "blocked") {
    const checks = {
      stagingEnvMirror,
      deployedFreshness,
    };
    const summary = buildSummary({
      environment: "staging",
      command: "qa:module01:staging",
      checks,
      deployFreshness: deployFreshnessSummaryFromCheck(deployedFreshness),
      nextRequiredAction: "wait_for_target_deploy_commit_and_rerun",
    });

    writeSummary("staging", summary);
    return summary;
  }

  const checks = {
    stagingEnvMirror,
    deployedFreshness,
    stagingHealth: await stagingHealthCheck(),
    accessLinkSmoke: runCommand("access_link_smoke", "corepack", ["pnpm", "run", "qa:access-link:smoke"], {
      mutatesData: true,
      productionTouched: true,
      warnings: ["read_only_production_fail_closed_check"],
    }),
    resultCheckoutNoCard: runCommand(
      "result_checkout_no_card",
      "corepack",
      ["pnpm", "run", "qa:result-checkout:no-card"],
      {
        mutatesData: true,
        productionTouched: true,
        warnings: ["read_only_production_fail_closed_check"],
      },
    ),
    adminApiLookup: await adminApiStagingCheck(),
    adminCliLookup: adminCliStagingCheck(),
    channelManualAcceptance: makeCheck("channel_manual_acceptance", "skipped", {
      required: false,
      manualRequired: true,
      ownerVerified: false,
      warnings: ["real_email_line_channel_checks_not_run_by_default"],
    }),
  };
  const deployFreshness = deployFreshnessSummaryFromCheck(deployedFreshness);

  if (expectedCommit) {
    const endFreshness = await checkDeployFreshness({
      env: "staging",
      expectedCommit,
      timeoutMs: 0,
      intervalMs: 1,
    });
    deployFreshness.deployedCommitAtGateEnd = endFreshness.deployedCommitAtGateEnd ?? null;
    deployFreshness.mixedDeploymentDetected =
      Boolean(deployFreshness.deployedCommitAtGateStart && deployFreshness.deployedCommitAtGateEnd) &&
      deployFreshness.deployedCommitAtGateStart !== deployFreshness.deployedCommitAtGateEnd;

    if (deployFreshness.mixedDeploymentDetected || endFreshness.status !== "pass") {
      const category = deployFreshness.mixedDeploymentDetected
        ? "mixed_deployment_gate_invalid"
        : (endFreshness.category ?? "staging_freshness_not_ready");
      checks.deployedFreshness = makeCheck("deployed_freshness", "blocked", {
        required: true,
        category,
        targetDeployCommit: deployFreshness.targetDeployCommit,
        deployedCommitAtGateStart: deployFreshness.deployedCommitAtGateStart,
        deployedCommitAtGateEnd: deployFreshness.deployedCommitAtGateEnd,
        freshnessStatus: "blocked",
        mixedDeploymentDetected: deployFreshness.mixedDeploymentDetected,
        blockers: [category],
      });
      deployFreshness.freshnessStatus = "blocked";
    }
  }

  const summary = buildSummary({
    environment: "staging",
    command: "qa:module01:staging",
    checks,
    deployFreshness,
    manualRequired: [
      "ownerEmailReceived",
      "ownerEmailLinkOpenedPaidResult",
      "ownerLineReceived",
      "ownerLineLinkOpenedPaidResult",
    ],
    ownerApprovalRequired: false,
    nextRequiredAction: "owner_accept_staging_gate_or_run_channels_with_owner_approval",
  });

  writeSummary("staging", summary);
  return summary;
}

async function runProductionPreflightSuite() {
  const checks = {
    productionRuntimeWindowStatus: productionRuntimeWindowStatusCheck(),
    productionPaymentPreflight: runCommand(
      "production_payment_preflight",
      "corepack",
      [
        "pnpm",
        "run",
        "qa:production:payment-preflight",
        "--",
        "--source",
        "vercel-production",
        "--mode",
        "dry-run",
      ],
      {
        productionTouched: true,
      },
    ),
  };

  const summary = buildSummary({
    environment: "production",
    command: "qa:module01:production-preflight",
    checks,
    nextRequiredAction: "production_stays_frozen_until_owner_gate",
  });

  writeSummary("production", summary);
  return summary;
}

async function runReleaseSuite() {
  const local = await runLocalSuite();
  const staging = await runStagingSuite();
  const production = await runProductionPreflightSuite();
  const checks = {
    local: makeCheck("local", local.status === "pass" ? "pass" : local.status, {
      required: true,
      blockers: local.status === "blocked" ? ["local_suite_blocked"] : [],
      warnings: local.status === "partial" ? ["local_suite_partial"] : [],
    }),
    staging: makeCheck("staging", staging.status, {
      required: true,
      mutatesData: staging.mutatesData,
      productionTouched: staging.productionTouched,
      blockers: staging.status === "blocked" ? ["staging_suite_blocked"] : [],
      warnings: staging.status === "partial" ? ["staging_suite_partial"] : [],
    }),
    productionPreflight: makeCheck("production_preflight", production.status, {
      required: true,
      productionTouched: true,
      blockers: production.status === "blocked" ? ["production_preflight_blocked"] : [],
      warnings: production.status === "partial" ? ["production_preflight_partial"] : [],
    }),
  };

  const summary = buildSummary({
    environment: "release",
    command: "qa:module01:release",
    checks,
    manualRequired: staging.manualRequired,
    nextRequiredAction: "owner_accept_release_gate_or_fix_partials",
  });

  writeSummary("release", summary);
  return summary;
}

async function main() {
  const mode = process.argv[2] ?? "";
  const modeMap = {
    local: runLocalSuite,
    staging: runStagingSuite,
    "production-preflight": runProductionPreflightSuite,
    production: runProductionPreflightSuite,
    release: runReleaseSuite,
  };
  const run = modeMap[mode];

  if (!run) {
    console.error("Usage: node scripts/module01-release-validation-suite.mjs <local|staging|production-preflight|release>");
    process.exitCode = 2;
    return;
  }

  const summary = await run();

  if (summary.status === "blocked") {
    process.exitCode = 1;
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  main().catch((error) => {
    console.error(JSON.stringify({ step: "module01_suite_error", error: error?.message ?? "unknown" }));
    process.exitCode = 1;
  });
}

export {
  assertSanitizedSummary,
  buildSummary,
  deriveGateStatus,
  makeCheck,
  parseAdminCliJsonOutput,
  parseEnvMirrorContent,
  parseSuiteKnownResultArtifact,
  deployFreshnessCheckFromResult,
  deployFreshnessNotAssertedCheck,
  resolveKnownResultId,
  deployFreshnessSummaryFromCheck,
  deriveChecksStatus,
  stagingEnvMirrorCheck,
  verifyEnvMirrorShape,
  worstStatus,
};
