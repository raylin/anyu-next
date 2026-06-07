#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  assertSanitizedPreflightOutput,
  getVercelProjectLinkingStatus,
  runProductionPaymentRuntimePreflight,
} from "./production-payment-runtime-preflight.mjs";
import { findWebAppDir, parseLocalEnvContent } from "./lib/load-local-env.mjs";

const PRODUCTION_BASE_URL = "https://anyu.tw";
const CANONICAL_PROJECT = "anyu-next";
const DEFAULT_VERCEL_SCOPE = "studioanyu-1488s-projects";
const REQUIRED_PRODUCTION_ALIASES = ["anyu.tw", "www.anyu.tw"];
const RUNTIME_CONFIG_KEYS = ["payment.global.disabled", "payment.window.enabled"];
const RUNTIME_CONFIG_MODULE_SCOPE_KEY = "ai-temperature";

class RuntimeWindowInputError extends Error {
  constructor(code, details = {}) {
    super(code);
    this.code = code;
    this.details = details;
  }
}

function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    action: "status",
    confirmControlledSmoke: false,
    confirmShutdown: false,
    skipPreflight: false,
    reason: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    switch (arg) {
      case "--":
        break;
      case "--action":
        options.action = requireValue(arg, next);
        index += 1;
        break;
      case "--confirm-controlled-smoke":
        options.confirmControlledSmoke = true;
        break;
      case "--confirm-shutdown":
        options.confirmShutdown = true;
        break;
      case "--skip-preflight":
        options.skipPreflight = true;
        break;
      case "--reason":
        options.reason = requireValue(arg, next);
        index += 1;
        break;
      default:
        throw new RuntimeWindowInputError("unsupported_arg", { arg });
    }
  }

  if (!["status", "plan-enable", "plan-disable", "enable", "disable"].includes(options.action)) {
    throw new RuntimeWindowInputError("invalid_action", {
      action: options.action,
      validActions: ["status", "plan-enable", "plan-disable", "enable", "disable"],
    });
  }

  return options;
}

function requireValue(arg, value) {
  if (!value || value.startsWith("--")) {
    throw new RuntimeWindowInputError("missing_arg_value", { arg });
  }

  return value.trim();
}

function loadProductionAdminApiToken(env = process.env) {
  if (env.ADMIN_API_TOKEN?.trim()) {
    return {
      token: env.ADMIN_API_TOKEN.trim(),
      sourceCategory: "process_env",
      valuesPrinted: false,
    };
  }

  const webAppDir = findWebAppDir();
  const mirrorPath = path.join(webAppDir, ".env.production");

  if (!fs.existsSync(mirrorPath)) {
    return {
      mirrorPathPresent: false,
      token: null,
      sourceCategory: "missing_production_mirror",
      valuesPrinted: false,
    };
  }

  const entries = new Map(parseLocalEnvContent(fs.readFileSync(mirrorPath, "utf8")));
  const token = entries.get("ADMIN_API_TOKEN")?.trim() ?? "";

  return {
    mirrorPathPresent: true,
    token: token || null,
    sourceCategory: token ? "production_mirror_admin_api_token" : "missing_admin_api_token",
    valuesPrinted: false,
  };
}

async function fetchAdminJson(pathname, options = {}) {
  const tokenSource = loadProductionAdminApiToken(options.env ?? process.env);

  if (!tokenSource.token) {
    return {
      ok: false,
      error: "admin_api_token_missing",
      tokenSourceCategory: tokenSource.sourceCategory,
      valuesPrinted: false,
    };
  }

  const response = await (options.fetchImpl ?? fetch)(`${PRODUCTION_BASE_URL}${pathname}`, {
    method: options.method ?? "GET",
    headers: {
      "x-admin-api-token": tokenSource.token,
      accept: "application/json",
      ...(options.body ? { "content-type": "application/json" } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  let json = null;

  try {
    json = await response.clone().json();
  } catch {
    json = null;
  }

  return {
    ok: response.ok,
    status: response.status,
    json,
    error: json && typeof json === "object" && "error" in json ? json.error : null,
    tokenSourceCategory: tokenSource.sourceCategory,
    valuesPrinted: false,
  };
}

function configGetPath(key, scopeType, scopeKey) {
  const params = new URLSearchParams({
    environment: "production",
    key,
    scopeType,
    scopeKey,
  });

  return `/api/admin/runtime-config/get?${params.toString()}`;
}

async function getProductionRuntimeConfigStatus(options = {}) {
  const [globalDisabled, moduleWindow] = await Promise.all([
    fetchAdminJson(configGetPath("payment.global.disabled", "global", "global"), options),
    fetchAdminJson(
      configGetPath("payment.window.enabled", "module", RUNTIME_CONFIG_MODULE_SCOPE_KEY),
      options,
    ),
  ]);
  const globalValue = globalDisabled.json?.config?.value;
  const moduleValue = moduleWindow.json?.config?.value;

  return {
    checked: true,
    ok: globalDisabled.ok && moduleWindow.ok,
    paymentGlobalDisabled: typeof globalValue === "boolean" ? globalValue : null,
    paymentWindowEnabled: typeof moduleValue === "boolean" ? moduleValue : null,
    globalLookupStatus: globalDisabled.status ?? null,
    moduleLookupStatus: moduleWindow.status ?? null,
    tokenSourceCategory: globalDisabled.tokenSourceCategory ?? moduleWindow.tokenSourceCategory,
    error: globalDisabled.error ?? moduleWindow.error ?? null,
    valuesPrinted: false,
  };
}

async function setProductionPaymentWindow(enabled, options = {}) {
  return fetchAdminJson("/api/admin/runtime-config/set", {
    ...options,
    method: "POST",
    body: {
      environment: "production",
      key: "payment.window.enabled",
      scopeType: "module",
      scopeKey: RUNTIME_CONFIG_MODULE_SCOPE_KEY,
      value: enabled,
      reason: options.reason,
      actor: "runtime-window-helper",
    },
  });
}

async function getProductionRouteStatus(fetchImpl = fetch) {
  const fetchJsonWithImpl = async (url, init) => {
    const response = await fetchImpl(url, init);
    let json = null;

    try {
      json = await response.clone().json();
    } catch {
      json = null;
    }

    return {
      status: response.status,
      ok: response.ok,
      error: json && typeof json === "object" && "error" in json ? json.error : null,
      json,
    };
  };
  const [health, home, refund, legal, checkout, fakePaid, operatorRecovery] = await Promise.all([
    fetchJsonWithImpl(`${PRODUCTION_BASE_URL}/api/health`),
    fetchJsonWithImpl(`${PRODUCTION_BASE_URL}/`),
    fetchJsonWithImpl(`${PRODUCTION_BASE_URL}/refund`),
    fetchJsonWithImpl(`${PRODUCTION_BASE_URL}/legal`),
    fetchJsonWithImpl(`${PRODUCTION_BASE_URL}/api/modules/ambiguous-temperature/checkout/newebpay`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ resultId: "00000000-0000-4000-8000-000000000000" }),
    }),
    fetchJsonWithImpl(`${PRODUCTION_BASE_URL}/api/operator/fake-paid-success`, { method: "POST" }),
    fetchJsonWithImpl(`${PRODUCTION_BASE_URL}/api/operator/recovery-link-smoke`, {
      method: "POST",
    }),
  ]);

  return {
    environment: health.json?.environment ?? null,
    gitCommit: typeof health.json?.gitCommit === "string" ? health.json.gitCommit : null,
    publicPagesStatus: {
      home: home.status,
      refund: refund.status,
      legal: legal.status,
      ok: home.status === 200 && refund.status === 200 && legal.status === 200,
    },
    checkoutRouteStatus: {
      status: checkout.status,
      error: checkout.error,
      failClosed: checkout.status === 404 || checkout.error === "payment_disabled" || checkout.error === "not_found",
    },
    fakePaidRouteStatus: {
      status: fakePaid.status,
      failClosed: fakePaid.status === 404 || fakePaid.status === 403,
    },
    operatorRouteStatus: {
      status: operatorRecovery.status,
      failClosed: operatorRecovery.status === 404 || operatorRecovery.status === 403,
    },
  };
}

function parseVercelInspectOutput(hostname, output) {
  const deploymentId = /^\s*id\s+(dpl_[A-Za-z0-9]+)/imu.exec(output)?.[1] ?? null;
  const projectName = /^\s*name\s+([^\n\r]+)/imu.exec(output)?.[1]?.trim() ?? null;
  const target = /^\s*target\s+([^\n\r]+)/imu.exec(output)?.[1]?.trim() ?? null;
  const ready = /^\s*status\s+.*Ready\b/imu.test(output);
  const aliasListed = new RegExp(`https://${hostname.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}\\b`, "iu").test(
    output,
  );
  const projectMatches =
    projectName === CANONICAL_PROJECT ? true : projectName ? false : "unknown";

  return {
    hostname,
    aliasTargetDetected: Boolean(deploymentId && projectName),
    aliasProjectMatchesCanonical: projectMatches,
    aliasTargetDeploymentIdPresent: Boolean(deploymentId),
    aliasTargetProjectNameOrIdPresent: Boolean(projectName),
    aliasDeploymentTarget: target ?? "unknown",
    aliasDeploymentReady: ready,
    aliasListedOnDeployment: aliasListed,
    valuesPrinted: false,
  };
}

function inspectAliasWithVercelCli(hostname, options = {}) {
  const repoRoot = path.resolve(findWebAppDir(), "..", "..");
  const inspectUrl = `https://${hostname}`;

  try {
    const result = spawnSync(
      "vercel",
      ["inspect", inspectUrl, "--scope", options.vercelScope ?? DEFAULT_VERCEL_SCOPE],
      {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;

    if (result.status !== 0 || !output.trim()) {
      throw new Error("vercel_inspect_failed");
    }

    return {
      ...parseVercelInspectOutput(hostname, output),
      aliasInspectionStatus: "pass",
    };
  } catch {
    return {
      hostname,
      aliasTargetDetected: false,
      aliasProjectMatchesCanonical: "unknown",
      aliasTargetDeploymentIdPresent: false,
      aliasTargetProjectNameOrIdPresent: false,
      aliasDeploymentTarget: "unknown",
      aliasDeploymentReady: false,
      aliasListedOnDeployment: false,
      aliasInspectionStatus: "alias_inspection_failed",
      valuesPrinted: false,
    };
  }
}

async function getAliasHealthStatus(hostname, fetchImpl = fetch) {
  try {
    const response = await fetchImpl(`https://${hostname}/api/health`);
    let json = null;

    try {
      json = await response.clone().json();
    } catch {
      json = null;
    }

    return {
      aliasHealthEnvironment: json?.environment === "production" ? "production" : "unknown",
      aliasHealthGitCommitPresent: typeof json?.gitCommit === "string" && json.gitCommit.length > 0,
      aliasHealthStatus: response.status,
    };
  } catch {
    return {
      aliasHealthEnvironment: "unknown",
      aliasHealthGitCommitPresent: false,
      aliasHealthStatus: null,
    };
  }
}

async function inspectProductionAlias(hostname, options = {}) {
  const [inspection, health] = await Promise.all([
    Promise.resolve(inspectAliasWithVercelCli(hostname, options)),
    getAliasHealthStatus(hostname, options.fetchImpl ?? fetch),
  ]);

  return {
    ...inspection,
    ...health,
  };
}

function buildAliasGuard(input) {
  const aliases = input.aliases ?? [];
  const projectLinking = input.projectLinking;
  const aliasTargetDetected = aliases.length > 0 && aliases.every((alias) => alias.aliasTargetDetected);
  const allAliasesCanonical =
    aliases.length > 0 && aliases.every((alias) => alias.aliasProjectMatchesCanonical === true);
  const allAliasHealthProduction =
    aliases.length > 0 &&
    aliases.every(
      (alias) =>
        alias.aliasHealthEnvironment === "production" && alias.aliasHealthGitCommitPresent === true,
    );
  const anyInspectionFailed = aliases.some(
    (alias) => alias.aliasInspectionStatus === "alias_inspection_failed",
  );
  const anyProjectMismatch = aliases.some(
    (alias) => alias.aliasProjectMatchesCanonical === false,
  );
  const anyHealthMismatch = aliases.some(
    (alias) =>
      alias.aliasHealthEnvironment !== "production" || alias.aliasHealthGitCommitPresent !== true,
  );
  let status = "alias_target_unverified";
  let blocker = true;

  if (!projectLinking?.ok) {
    status = "project_mismatch";
    blocker = true;
  } else if (anyProjectMismatch) {
    status = "alias_project_mismatch";
    blocker = true;
  } else if (aliasTargetDetected && allAliasesCanonical && allAliasHealthProduction) {
    status = "pass";
    blocker = false;
  } else if (anyInspectionFailed) {
    status = "alias_inspection_failed";
    blocker = true;
  } else if (anyHealthMismatch) {
    status = "alias_health_mismatch";
    blocker = true;
  }

  return {
    status,
    blocker,
    aliases,
    aliasTargetDetected,
    aliasProjectMatchesCanonical: allAliasesCanonical ? true : anyProjectMismatch ? false : "unknown",
    aliasTargetDeploymentIdPresent: aliases.every((alias) => alias.aliasTargetDeploymentIdPresent),
    aliasTargetProjectNameOrIdPresent: aliases.every(
      (alias) => alias.aliasTargetProjectNameOrIdPresent,
    ),
    aliasHealthEnvironment: allAliasHealthProduction ? "production" : "unknown",
    aliasHealthGitCommitPresent: aliases.every((alias) => alias.aliasHealthGitCommitPresent),
  };
}

function classifyRuntimeWindowState(input) {
  if (!input.projectLinking?.ok) {
    return "project_mismatch";
  }

  if (input.aliasGuard?.blocker) {
    return input.aliasGuard.status === "project_mismatch" ? "project_mismatch" : "alias_mismatch";
  }

  if (input.preflight?.ok === false) {
    return "preflight_blocked";
  }

  if (!input.runtimeConfig?.ok) {
    return "env_mirror_blocked";
  }

  if (input.runtimeConfig.paymentGlobalDisabled === true) {
    return "fail_closed_ready";
  }

  if (input.runtimeConfig.paymentWindowEnabled === true) {
    if (input.routeStatus.checkoutRouteStatus?.failClosed === false) {
      return "runtime_enabled_controlled_window";
    }

    return "unsafe_runtime_enabled";
  }

  if (
    input.routeStatus.publicPagesStatus?.ok &&
    input.routeStatus.checkoutRouteStatus?.failClosed &&
    input.routeStatus.fakePaidRouteStatus?.failClosed &&
    input.routeStatus.operatorRouteStatus?.failClosed
  ) {
    return "fail_closed_ready";
  }

  return "unknown";
}

function buildPlan(action) {
  if (action === "plan-enable" || action === "enable") {
    return {
      plannedAction: "enable_controlled_smoke_window",
      configKeys: RUNTIME_CONFIG_KEYS,
      targetConfig: {
        key: "payment.window.enabled",
        scopeType: "module",
        scopeKey: RUNTIME_CONFIG_MODULE_SCOPE_KEY,
        value: true,
      },
      adminApiBoundary: true,
      redeployRequired: false,
      valuesPrinted: false,
    };
  }

  if (action === "plan-disable" || action === "disable") {
    return {
      plannedAction: "disable_controlled_smoke_window",
      configKeys: RUNTIME_CONFIG_KEYS,
      targetConfig: {
        key: "payment.window.enabled",
        scopeType: "module",
        scopeKey: RUNTIME_CONFIG_MODULE_SCOPE_KEY,
        value: false,
      },
      adminApiBoundary: true,
      redeployRequired: false,
      valuesPrinted: false,
    };
  }

  return {
    plannedAction: "status_only",
    configKeys: RUNTIME_CONFIG_KEYS,
    valuesPrinted: false,
  };
}

async function runProductionRuntimeWindow(argv = process.argv.slice(2), env = process.env) {
  const options = parseArgs(argv);

  if (options.action === "enable" && !options.confirmControlledSmoke) {
    return sanitized({
      ok: false,
      action: options.action,
      stateCategory: "preflight_blocked",
      blocker: "missing_confirm_controlled_smoke",
      executeImplemented: true,
      reason: "missing_confirmation",
    });
  }

  if (options.action === "disable" && !options.confirmShutdown) {
    return sanitized({
      ok: false,
      action: options.action,
      stateCategory: "preflight_blocked",
      blocker: "missing_confirm_shutdown",
      executeImplemented: true,
      reason: "missing_confirmation",
    });
  }

  const [routeStatus, preflight, runtimeConfig] = await Promise.all([
    getProductionRouteStatus(env.fetchImpl ?? fetch),
    options.skipPreflight
      ? Promise.resolve({ ok: null, readiness: "skipped" })
      : runProductionPaymentRuntimePreflight(
          ["--source", "vercel-production", "--mode", "dry-run"],
          env,
        ),
    getProductionRuntimeConfigStatus({ fetchImpl: env.fetchImpl ?? fetch, env }),
  ]);
  const projectLinking = getVercelProjectLinkingStatus();
  const aliases = await Promise.all(
    REQUIRED_PRODUCTION_ALIASES.map((hostname) =>
      inspectProductionAlias(hostname, { fetchImpl: env.fetchImpl ?? fetch }),
    ),
  );
  const aliasGuard = buildAliasGuard({
    aliases,
    projectLinking,
  });
  const stateCategory = classifyRuntimeWindowState({
    projectLinking,
    aliasGuard,
    preflight,
    runtimeConfig,
    routeStatus,
  });
  const plan = buildPlan(options.action);
  let executeResult = null;
  let finalRuntimeConfig = runtimeConfig;

  if (options.action === "enable") {
    if (stateCategory !== "fail_closed_ready" || preflight.ok !== true || aliasGuard.blocker) {
      return sanitized({
        ok: false,
        action: options.action,
        stateCategory,
        blocker: "runtime_window_not_ready_for_enable",
        runtimeConfig,
        aliasGuardStatus: aliasGuard.status,
        preflight: { ok: preflight.ok, readiness: preflight.readiness },
        plan,
      });
    }

    executeResult = await setProductionPaymentWindow(true, {
      fetchImpl: env.fetchImpl ?? fetch,
      env,
      reason: options.reason || "controlled production smoke",
    });
    finalRuntimeConfig = await getProductionRuntimeConfigStatus({ fetchImpl: env.fetchImpl ?? fetch, env });
  }

  if (options.action === "disable") {
    executeResult = await setProductionPaymentWindow(false, {
      fetchImpl: env.fetchImpl ?? fetch,
      env,
      reason: options.reason || "controlled production smoke shutdown",
    });
    finalRuntimeConfig = await getProductionRuntimeConfigStatus({ fetchImpl: env.fetchImpl ?? fetch, env });
  }

  const finalStateCategory =
    options.action === "enable" || options.action === "disable"
      ? classifyRuntimeWindowState({
          projectLinking,
          aliasGuard,
          preflight,
          runtimeConfig: finalRuntimeConfig,
          routeStatus: await getProductionRouteStatus(env.fetchImpl ?? fetch),
        })
      : stateCategory;
  const ok =
    options.action === "status"
      ? stateCategory === "fail_closed_ready"
      : options.action === "disable"
        ? executeResult?.ok === true && finalRuntimeConfig.paymentWindowEnabled === false
        : options.action === "enable"
          ? executeResult?.ok === true && finalRuntimeConfig.paymentWindowEnabled === true
          : stateCategory === "fail_closed_ready" && preflight.ok === true && !aliasGuard.blocker;

  return sanitized({
    ok,
    action: options.action,
    environment: "production",
    productionBaseUrl: PRODUCTION_BASE_URL,
    stateCategory: finalStateCategory,
    runtimeEnabled: finalRuntimeConfig.paymentWindowEnabled === true && finalRuntimeConfig.paymentGlobalDisabled === false,
    checkoutEnabled: finalRuntimeConfig.paymentWindowEnabled === true && finalRuntimeConfig.paymentGlobalDisabled === false,
    runtimeConfig: finalRuntimeConfig,
    publicPagesStatus: routeStatus.publicPagesStatus,
    checkoutRouteStatus: routeStatus.checkoutRouteStatus,
    fakePaidRouteStatus: routeStatus.fakePaidRouteStatus,
    operatorRouteStatus: routeStatus.operatorRouteStatus,
    canonicalProjectStatus: projectLinking.ok ? "pass" : "project_mismatch",
    aliasGuardStatus: aliasGuard.status,
    aliasGuard,
    targetDeployCommit: null,
    currentDeployCommit: routeStatus.gitCommit,
    preflight: {
      ok: preflight.ok,
      readiness: preflight.readiness,
    },
    plan,
    executeResult: executeResult
      ? {
          ok: executeResult.ok,
          status: executeResult.status,
          error: executeResult.error,
          valuesPrinted: false,
        }
      : null,
    recommendedNextAction: recommendNextAction({
      action: options.action,
      stateCategory,
      preflight,
      aliasGuard,
    }),
    redaction: {
      valuesPrinted: false,
      lengthsPrinted: false,
      prefixesPrinted: false,
      suffixesPrinted: false,
      hashesPrinted: false,
      checksumsPrinted: false,
    },
  });
}

function recommendNextAction(input) {
  if (input.aliasGuard?.blocker) {
    return "resolve_alias_guard_before_runtime_enablement";
  }

  if (input.preflight?.ok === false) {
    return "resolve_production_preflight_before_runtime_enablement";
  }

  if (input.action === "plan-enable" && input.stateCategory === "fail_closed_ready") {
    return "owner_may_approve_controlled_smoke_runtime_window";
  }

  if (input.action === "plan-disable") {
    return "set_module_payment_window_false_when_window_ends";
  }

  return "keep_production_fail_closed_until_controlled_smoke_task";
}

function sanitized(value) {
  return assertSanitizedPreflightOutput(value);
}

function printJson(value) {
  console.log(JSON.stringify(value, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const result = await runProductionRuntimeWindow();

    printJson(result);

    if (!result.ok && result.action !== "status") {
      process.exitCode = 2;
    }
  } catch (error) {
    printJson({
      ok: false,
      error: error instanceof RuntimeWindowInputError ? error.code : "runtime_window_failed",
      details: error instanceof RuntimeWindowInputError ? error.details : {},
      redaction: {
        valuesPrinted: false,
        lengthsPrinted: false,
        prefixesPrinted: false,
        suffixesPrinted: false,
        hashesPrinted: false,
        checksumsPrinted: false,
      },
    });
    process.exitCode = 2;
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
void isMain;

export {
  RuntimeWindowInputError,
  buildAliasGuard,
  buildPlan,
  classifyRuntimeWindowState,
  inspectAliasWithVercelCli,
  parseVercelInspectOutput,
  parseArgs,
  runProductionRuntimeWindow,
};
