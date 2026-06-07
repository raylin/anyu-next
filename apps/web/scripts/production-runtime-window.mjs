#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  assertSanitizedPreflightOutput,
  getVercelProjectLinkingStatus,
  runProductionPaymentRuntimePreflight,
} from "./production-payment-runtime-preflight.mjs";
import { findWebAppDir, parseLocalEnvContent } from "./lib/load-local-env.mjs";

const PRODUCTION_BASE_URL = "https://anyu.tw";
const CANONICAL_PROJECT = "anyu-next";
const RUNTIME_FLAGS = ["ENABLE_PAYMENT_RUNTIME", "ENABLE_NEWEBPAY_CHECKOUT"];
const EXECUTE_NOT_IMPLEMENTED =
  "execute_actions_deferred_to_v1_status_and_plan_only";

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

function loadProductionMirrorFlags() {
  const webAppDir = findWebAppDir();
  const mirrorPath = path.join(webAppDir, ".env.production");

  if (!fs.existsSync(mirrorPath)) {
    return {
      mirrorPathPresent: false,
      runtimeEnabled: null,
      checkoutEnabled: null,
      valuesPrinted: false,
    };
  }

  const entries = new Map(parseLocalEnvContent(fs.readFileSync(mirrorPath, "utf8")));

  return {
    mirrorPathPresent: true,
    runtimeEnabled: isTruthy(entries.get("ENABLE_PAYMENT_RUNTIME")),
    checkoutEnabled: isTruthy(entries.get("ENABLE_NEWEBPAY_CHECKOUT")),
    valuesPrinted: false,
  };
}

function isTruthy(value) {
  return ["1", "true", "yes", "on"].includes(String(value ?? "").trim().toLowerCase());
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

function inspectAliasWithVercelCli(hostname, options = {}) {
  const repoRoot = path.resolve(findWebAppDir(), "..", "..");

  try {
    const output = execFileSync(
      "vercel",
      ["alias", "inspect", hostname, "--scope", options.vercelScope ?? "studioanyu-1488s-projects"],
      {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    const projectMatches = output.includes(CANONICAL_PROJECT);

    return {
      hostname,
      aliasTargetDetected: true,
      aliasProjectMatchesCanonical: projectMatches ? "yes" : "unknown",
      deploymentIdPresent: /\bdpl_[A-Za-z0-9]+/u.test(output),
      gitCommitPresent: /[0-9a-f]{7,40}/iu.test(output),
      valuesPrinted: false,
    };
  } catch {
    return {
      hostname,
      aliasTargetDetected: false,
      aliasProjectMatchesCanonical: "unknown",
      deploymentIdPresent: false,
      gitCommitPresent: false,
      valuesPrinted: false,
    };
  }
}

function buildAliasGuard(input) {
  const aliases = input.aliases ?? [];
  const projectLinking = input.projectLinking;
  const productionHealth = input.productionHealth;
  const aliasTargetDetected = aliases.some((alias) => alias.aliasTargetDetected);
  const allAliasesCanonical =
    aliases.length > 0 && aliases.every((alias) => alias.aliasProjectMatchesCanonical === "yes");
  const healthConsistent =
    productionHealth?.environment === "production" && Boolean(productionHealth?.gitCommit);
  let status = "alias_target_unverified";
  let blocker = true;

  if (aliasTargetDetected && allAliasesCanonical && projectLinking?.ok && healthConsistent) {
    status = "pass";
    blocker = false;
  } else if (!aliasTargetDetected && projectLinking?.ok && healthConsistent) {
    status = "alias_target_unverified";
    blocker = true;
  } else if (!projectLinking?.ok) {
    status = "project_mismatch";
    blocker = true;
  }

  return {
    status,
    blocker,
    aliases,
    aliasTargetDetected,
    aliasProjectMatchesCanonical: allAliasesCanonical ? "yes" : "unknown",
    productionHealthEnvironment: productionHealth?.environment ?? null,
    productionHealthGitCommitPresent: Boolean(productionHealth?.gitCommit),
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

  if (input.flags.runtimeEnabled || input.flags.checkoutEnabled) {
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
      syncKeys: RUNTIME_FLAGS,
      localMirrorFirst: true,
      vercelSyncSecond: true,
      deployFromRepoRootOnly: true,
      valuesPrinted: false,
    };
  }

  if (action === "plan-disable" || action === "disable") {
    return {
      plannedAction: "disable_controlled_smoke_window",
      syncKeys: RUNTIME_FLAGS,
      localMirrorFirst: true,
      vercelSyncSecond: true,
      deployFromRepoRootOnly: true,
      valuesPrinted: false,
    };
  }

  return {
    plannedAction: "status_only",
    syncKeys: [],
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
      executeImplemented: false,
      reason: EXECUTE_NOT_IMPLEMENTED,
    });
  }

  if (options.action === "disable" && !options.confirmShutdown) {
    return sanitized({
      ok: false,
      action: options.action,
      stateCategory: "preflight_blocked",
      blocker: "missing_confirm_shutdown",
      executeImplemented: false,
      reason: EXECUTE_NOT_IMPLEMENTED,
    });
  }

  if (options.action === "enable" || options.action === "disable") {
    return sanitized({
      ok: false,
      action: options.action,
      stateCategory: "preflight_blocked",
      executeImplemented: false,
      reason: EXECUTE_NOT_IMPLEMENTED,
      plannedFlagsOnly: RUNTIME_FLAGS,
    });
  }

  const [routeStatus, preflight] = await Promise.all([
    getProductionRouteStatus(env.fetchImpl ?? fetch),
    options.skipPreflight
      ? Promise.resolve({ ok: null, readiness: "skipped" })
      : runProductionPaymentRuntimePreflight(
          ["--source", "vercel-production", "--mode", "dry-run"],
          env,
        ),
  ]);
  const projectLinking = getVercelProjectLinkingStatus();
  const aliases = [
    inspectAliasWithVercelCli("anyu.tw"),
    inspectAliasWithVercelCli("www.anyu.tw"),
  ];
  const aliasGuard = buildAliasGuard({
    aliases,
    projectLinking,
    productionHealth: routeStatus,
  });
  const flags = loadProductionMirrorFlags();
  const stateCategory = classifyRuntimeWindowState({
    projectLinking,
    aliasGuard,
    preflight,
    flags,
    routeStatus,
  });
  const plan = buildPlan(options.action);
  const ok =
    options.action === "status"
      ? stateCategory === "fail_closed_ready"
      : stateCategory === "fail_closed_ready" && preflight.ok === true && !aliasGuard.blocker;

  return sanitized({
    ok,
    action: options.action,
    environment: "production",
    productionBaseUrl: PRODUCTION_BASE_URL,
    stateCategory,
    runtimeEnabled: flags.runtimeEnabled,
    checkoutEnabled: flags.checkoutEnabled,
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
    return "disable_runtime_flags_and_redeploy_fail_closed_when_window_ends";
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
  parseArgs,
  runProductionRuntimeWindow,
};
