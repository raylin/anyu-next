#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const MODULE = "ai-temperature";
const STAGING_BASE_URL = "https://staging.anyu.tw";
const OUTPUT_DIR = ".qa";
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

function worstStatus(statuses) {
  return statuses.reduce(
    (worst, status) => (STATUS_ORDER[status] > STATUS_ORDER[worst] ? status : worst),
    "pass",
  );
}

function deriveGateStatus(checks) {
  const statuses = Object.values(checks).map((check) => check.status);
  const requiredBlocked = Object.values(checks).some(
    (check) => check.required !== false && check.status === "blocked",
  );

  if (requiredBlocked) {
    return "blocked";
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

  return {
    module: MODULE,
    environment: input.environment,
    command: input.command,
    status,
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
    nextRequiredAction: input.nextRequiredAction ?? inferNextRequiredAction(status, checks),
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

function safeAdminApiResponse(json) {
  if (!json || json.ok !== true) {
    return false;
  }

  const serialized = JSON.stringify(json);
  return !TOKEN_LIKE_PATTERNS.some((pattern) => pattern.test(serialized));
}

async function adminApiStagingCheck() {
  const token = process.env.ADMIN_API_TOKEN?.trim() ?? "";
  const resultId =
    process.env.MODULE01_ADMIN_LOOKUP_RESULT_ID?.trim() ??
    process.env.QA_MODULE01_ADMIN_RESULT_ID?.trim() ??
    "";

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

  if (!resultId) {
    return makeCheck("admin_api_lookup", "partial", {
      required: false,
      warnings: ["skipped_missing_known_result_id"],
      nextRequiredAction: "provide_module01_admin_lookup_result_id",
    });
  }

  const valid = await requestJson(
    `${STAGING_BASE_URL}/api/admin/paid-results/${encodeURIComponent(resultId)}`,
    { headers: { "x-admin-api-token": token } },
  );
  const pass = valid.response.status === 200 && safeAdminApiResponse(valid.json);

  return makeCheck("admin_api_lookup", pass ? "pass" : "blocked", {
    required: true,
    httpStatus: valid.response.status,
    responseSanitized: pass,
    blockers: pass ? [] : ["admin_api_lookup_failed_or_unsafe"],
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
  const checks = {
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
    channelManualAcceptance: makeCheck("channel_manual_acceptance", "partial", {
      required: false,
      manualRequired: true,
      ownerVerified: false,
      warnings: ["real_email_line_channel_checks_not_run_by_default"],
    }),
  };

  const summary = buildSummary({
    environment: "staging",
    command: "qa:module01:staging",
    checks,
    manualRequired: [
      "ownerEmailReceived",
      "ownerEmailLinkOpenedPaidResult",
      "ownerLineReceived",
      "ownerLineLinkOpenedPaidResult",
    ],
    ownerApprovalRequired: false,
    nextRequiredAction: "review_partial_checks_or_run_channels_with_owner_approval",
  });

  writeSummary("staging", summary);
  return summary;
}

async function runProductionPreflightSuite() {
  const checks = {
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
  worstStatus,
};
