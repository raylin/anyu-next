#!/usr/bin/env node

import { randomUUID } from "node:crypto";
import { loadLocalEnv } from "./lib/load-local-env.mjs";

loadLocalEnv();

const DEFAULT_STAGING_BASE_URL = "https://staging.anyu.tw";
const PRODUCTION_BASE_URL = "https://anyu.tw";
const MODULE_SLUG = "ambiguous-temperature";
const OPERATOR_HEADER = "x-operator-test-secret";

const baseUrl = (process.env.QA_LINE_RECOVERY_BASE_URL || DEFAULT_STAGING_BASE_URL).replace(
  /\/+$/u,
  "",
);
const operatorSecret = process.env.OPERATOR_TEST_SECRET?.trim() ?? "";

function printStep(step, payload) {
  console.log(JSON.stringify({ step, ...payload }));
}

function isProductionHost(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "anyu.tw" || parsed.hostname === "www.anyu.tw";
  } catch {
    return false;
  }
}

async function fetchJson(url, init) {
  const response = await fetch(url, init);
  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  return { response, payload };
}

function assertSanitizedPayload(payload) {
  const serialized = JSON.stringify(payload ?? {});
  const forbiddenPatterns = [
    /prl_[A-Za-z0-9_-]+/u,
    /pa_[A-Za-z0-9_-]+/u,
    /pcs_[A-Za-z0-9_-]+/u,
    /lineUserId/u,
    /idToken/u,
    /encryptedRecipient/u,
    /"recipientHash"\s*:/u,
    /tokenHash/u,
  ];

  return !forbiddenPatterns.some((pattern) => pattern.test(serialized));
}

async function main() {
  if (isProductionHost(baseUrl)) {
    printStep("target_preflight", {
      outcome: "fail",
      baseUrl,
      error: "production_host_rejected",
    });
    process.exitCode = 1;
    return;
  }

  printStep("target_preflight", { outcome: "pass", baseUrl, error: null });

  if (!operatorSecret) {
    printStep("secret_preflight", {
      outcome: "fail",
      OPERATOR_TEST_SECRET: "missing",
      valuesPrinted: false,
      lengthsPrinted: false,
      prefixesPrinted: false,
      suffixesPrinted: false,
      hashesPrinted: false,
    });
    process.exitCode = 1;
    return;
  }

  printStep("secret_preflight", {
    outcome: "pass",
    OPERATOR_TEST_SECRET: "present",
    LINE_RECOVERY_MESSAGE_PROVIDER: "runtime_only",
    LINE_MESSAGING_CHANNEL_ACCESS_TOKEN: "runtime_only",
    valuesPrinted: false,
    lengthsPrinted: false,
    prefixesPrinted: false,
    suffixesPrinted: false,
    hashesPrinted: false,
  });

  const health = await fetchJson(`${baseUrl}/api/health`);
  printStep("staging_health", {
    outcome:
      health.response.ok &&
      health.payload?.environment === "preview" &&
      health.payload?.gitBranch === "staging"
        ? "pass"
        : "fail",
    httpStatus: health.response.status,
    environment: health.payload?.environment ?? null,
    gitBranch: health.payload?.gitBranch ?? null,
    gitCommit: health.payload?.gitCommit ?? null,
    routeBundleVersion: health.payload?.routeBundleVersion ?? null,
  });

  if (
    !health.response.ok ||
    health.payload?.environment !== "preview" ||
    health.payload?.gitBranch !== "staging"
  ) {
    process.exitCode = 1;
    return;
  }

  const smoke = await fetchJson(`${baseUrl}/api/operator/line-recovery-smoke`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [OPERATOR_HEADER]: operatorSecret,
    },
    body: JSON.stringify({
      moduleSlug: MODULE_SLUG,
      idempotencyKey: `line-recovery-real-message-smoke-${randomUUID()}`,
    }),
  });
  const sanitized = assertSanitizedPayload(smoke.payload);

  printStep("runtime_operator_line_recovery_message_smoke", {
    outcome: smoke.response.ok && smoke.payload?.ok === true && sanitized ? "pass" : "fail",
    httpStatus: smoke.response.status,
    ok: smoke.payload?.ok ?? false,
    autoSendHookExercised: smoke.payload?.autoSendHookExercised ?? false,
    fakePaidCreated: smoke.payload?.fakePaidCreated ?? false,
    lineContactBound: smoke.payload?.lineContactBound ?? false,
    recipientSecretResolvedServerSide:
      smoke.payload?.recipientSecretResolvedServerSide ?? false,
    processorCategory: smoke.payload?.processorCategory ?? null,
    processorJobResult: smoke.payload?.processorJobResult ?? null,
    lineMessageSent: smoke.payload?.lineMessageSent ?? false,
    recoveryLinkCreated: smoke.payload?.recoveryLinkCreated ?? false,
    recoveryLinkStatus: smoke.payload?.recoveryLinkStatus ?? null,
    rawRecoveryTokenReturned: smoke.payload?.rawRecoveryTokenReturned ?? null,
    tokenHashReturned: smoke.payload?.tokenHashReturned ?? null,
    rawLineUserIdReturned: smoke.payload?.rawLineUserIdReturned ?? null,
    privateRecipientReturned: smoke.payload?.privateRecipientReturned ?? null,
    privateRecipientHashReturned: smoke.payload?.privateRecipientHashReturned ?? null,
    rawPaidAccessTokenReturned: smoke.payload?.rawPaidAccessTokenReturned ?? null,
    rawCheckoutSessionTokenReturned: smoke.payload?.rawCheckoutSessionTokenReturned ?? null,
    reportContentReturned: smoke.payload?.reportContentReturned ?? null,
    sanitizedPayload: sanitized,
    error: smoke.payload?.error ?? null,
  });

  const prod = await fetchJson(`${PRODUCTION_BASE_URL}/api/operator/line-recovery-smoke`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [OPERATOR_HEADER]: operatorSecret,
    },
    body: JSON.stringify({ moduleSlug: MODULE_SLUG }),
  });
  const prodHealth = await fetchJson(`${PRODUCTION_BASE_URL}/api/health`);

  printStep("production_disabled_check", {
    outcome:
      prod.response.status === 404 &&
      prodHealth.response.ok &&
      prodHealth.payload?.environment === "production"
        ? "pass"
        : "fail",
    productionHealthStatus: prodHealth.response.status,
    productionEnvironment: prodHealth.payload?.environment ?? null,
    productionGitBranch: prodHealth.payload?.gitBranch ?? null,
    lineSmokeHttpStatus: prod.response.status,
    lineSmokeError: prod.payload?.error ?? null,
  });

  const ok =
    smoke.response.ok &&
    smoke.payload?.ok === true &&
    sanitized &&
    prod.response.status === 404 &&
    prodHealth.response.ok &&
    prodHealth.payload?.environment === "production";

  printStep("final_summary", {
    outcome: ok ? "pass" : "fail",
    realLineMessageSmokePassed: smoke.response.ok && smoke.payload?.lineMessageSent === true,
    productionDisabledPassed: prod.response.status === 404,
    rawRecoveryTokenPrinted: false,
    tokenHashPrinted: false,
    rawLineUserIdPrinted: false,
    privateRecipientPrinted: false,
    privateRecipientHashPrinted: false,
    rawPaidAccessTokenPrinted: false,
    rawCheckoutSessionTokenPrinted: false,
    reportContentPrinted: false,
  });

  if (!ok) {
    process.exitCode = 1;
  }
}

await main().catch((error) => {
  printStep("unexpected_error", {
    outcome: "fail",
    error: error instanceof Error ? error.name : "unknown",
  });
  process.exitCode = 1;
});
