#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { loadLocalEnv } from "./lib/load-local-env.mjs";
import { createModule01AnalyzeRequest } from "./lib/module01-smoke-fixture.mjs";

loadLocalEnv();

const DEFAULT_BASE_URL = "https://staging.anyu.tw";
const PRODUCTION_BASE_URL = "https://anyu.tw";
const MODULE_SLUG = "ambiguous-temperature";
const ROUTE_BUNDLE_VERSION = "payment-foundation-2026-05-29";
const TMP_DIR = "/private/tmp/anyu-newebpay-smoke";
const STATE_FILE_NAME = "latest-sandbox-e2e-state.json";
const PAYMENT_STATUSES_READY = new Set(["paid_ready"]);
const PAYMENT_STATUSES_WAITING = new Set(["waiting_for_payment", "paid_processing"]);

const operatorSecret = process.env.OPERATOR_TEST_SECRET?.trim() ?? "";
const baseUrl = (process.env.QA_NEWEBPAY_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/$/u, "");
const qaSuffix =
  process.env.QA_NEWEBPAY_INPUT_SUFFIX?.trim() ||
  `sandbox-e2e-${new Date().toISOString()}-${crypto.randomUUID()}`;

function record(step, outcome, details = {}) {
  console.log(JSON.stringify({ step, outcome, ...details }));
}

function usage() {
  return [
    "Usage:",
    "  corepack pnpm run qa:newebpay:sandbox -- create-checkout",
    "  corepack pnpm run qa:newebpay:sandbox -- verify-after-payment",
    "  corepack pnpm run qa:newebpay:sandbox -- poll-status",
    "",
    "Optional env names:",
    "  OPERATOR_TEST_SECRET            required for create-checkout",
    "  QA_NEWEBPAY_BASE_URL            default https://staging.anyu.tw",
    "  QA_NEWEBPAY_INPUT_SUFFIX        optional cache-busting suffix",
    "  QA_NEWEBPAY_STATE_FILE          optional state file path for verify/poll",
    "",
    "The helper never prints provider form fields, raw pcs_/pa_ tokens, tokenized URLs, or secrets.",
  ].join("\n");
}

function parseMode() {
  const mode = process.argv.slice(2).find((argument) => argument !== "--")?.trim();

  if (mode === "create-checkout" || mode === "verify-after-payment" || mode === "poll-status") {
    return mode;
  }

  record("usage", "blocked", { reason: "missing_or_invalid_mode" });
  console.error(usage());
  process.exitCode = 2;
  return null;
}

function hasJsonContentType(response) {
  return response.headers.get("content-type")?.includes("application/json") ?? false;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let json = null;

  if (hasJsonContentType(response) && text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  return {
    status: response.status,
    contentType: response.headers.get("content-type")?.split(";")[0] ?? "",
    json,
    text,
  };
}

async function healthPreflight() {
  const result = await requestJson(`${baseUrl}/api/health`);
  const marker = result.json ?? {};
  const pass =
    result.status === 200 &&
    marker.gitBranch === "staging" &&
    marker.routeBundleVersion === ROUTE_BUNDLE_VERSION;

  record("staging_health_marker", pass ? "pass" : "fail", {
    httpStatus: result.status,
    app: marker.app ?? null,
    environment: marker.environment ?? null,
    gitBranch: marker.gitBranch ?? null,
    gitCommit: marker.gitCommit ?? null,
    routeBundleVersion: marker.routeBundleVersion ?? null,
  });

  return pass;
}

async function createSourceResult() {
  const analyzeRequest = createModule01AnalyzeRequest({
    sessionPrefix: "secret-safe-newebpay-sandbox",
    suffix: qaSuffix,
  });
  const result = await requestJson(`${baseUrl}/api/modules/${MODULE_SLUG}/analyze`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(analyzeRequest),
  });
  const resultId = result.json?.resultId ?? null;
  const pass = result.status === 200 && result.json?.ok === true && typeof resultId === "string";

  record("source_analyze", pass ? "pass" : "fail", {
    httpStatus: result.status,
    resultIdPresent: Boolean(resultId),
    cacheHit: result.json?.cacheHit ?? null,
    error: result.json?.error ?? null,
  });

  if (!pass) {
    throw new Error("source_analyze_failed");
  }

  return resultId;
}

async function createCheckout(resultId) {
  const result = await requestJson(`${baseUrl}/api/modules/${MODULE_SLUG}/checkout/newebpay`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-operator-test-secret": operatorSecret,
    },
    body: JSON.stringify({
      resultId,
      idempotencyKey: `secret-safe-newebpay-sandbox-${crypto.randomUUID()}`,
    }),
  });
  const body = result.json ?? {};
  const checkout = body.checkout ?? {};
  const fields = checkout.fields ?? {};
  const pendingReturnPath =
    typeof body.pendingReturnPath === "string" ? body.pendingReturnPath : null;
  const returnUrl = typeof checkout.returnUrl === "string" ? checkout.returnUrl : null;
  const checkoutToken = extractCheckoutToken(pendingReturnPath ?? returnUrl);
  const pass =
    result.status === 200 &&
    body.ok === true &&
    body.paymentIntentStatus === "checkout_started" &&
    checkout.actionUrl?.includes("ccore.newebpay.com") &&
    fields.Version === "2.0" &&
    typeof checkoutToken === "string";

  record("checkout_create", pass ? "pass" : "fail", {
    httpStatus: result.status,
    paymentIntentStatus: body.paymentIntentStatus ?? null,
    paymentIntentCreated: body.paymentIntentCreated ?? null,
    paymentIntentIdPresent: Boolean(body.paymentIntentId),
    merchantOrderNoPresent: Boolean(body.merchantOrderNo),
    sandboxGateway: checkout.actionUrl?.includes("ccore.newebpay.com") ? "ccore" : "unknown",
    version: fields.Version ?? null,
    amountMinor: 49,
    pcsHandoffPresent: Boolean(checkoutToken),
    tradeInfoPresent: Boolean(fields.TradeInfo),
    tradeShaPresent: Boolean(fields.TradeSha),
    error: body.error ?? null,
    missingConfig: Array.isArray(body.missingConfig) ? body.missingConfig : undefined,
  });

  if (!pass) {
    throw new Error(body.error ?? "checkout_create_failed");
  }

  return {
    actionUrl: checkout.actionUrl,
    method: checkout.method,
    fields,
    checkoutToken,
    resultId,
    paymentIntentIdPresent: Boolean(body.paymentIntentId),
    merchantOrderNoPresent: Boolean(body.merchantOrderNo),
  };
}

function extractCheckoutToken(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  try {
    const url = value.startsWith("http")
      ? new URL(value)
      : new URL(value, baseUrl);

    return url.searchParams.get("checkoutToken");
  } catch {
    return null;
  }
}

function htmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function writePaymentForm(checkout) {
  await fs.mkdir(TMP_DIR, { recursive: true, mode: 0o700 });
  const stamp = new Date().toISOString().replace(/[^0-9]/gu, "").slice(0, 14);
  const formPath = path.join(TMP_DIR, `newebpay-sandbox-submit-${stamp}.html`);
  const fields = Object.entries(checkout.fields)
    .map(
      ([name, value]) =>
        `      <input type="hidden" name="${htmlEscape(name)}" value="${htmlEscape(value)}">`,
    )
    .join("\n");
  const html = `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8">
    <title>ANYU NewebPay Sandbox Smoke Form</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Noto Sans TC", sans-serif; margin: 48px; background: #f7f3ec; color: #271f18; }
      main { max-width: 720px; margin: 0 auto; padding: 32px; border: 1px solid #dacbbc; border-radius: 24px; background: #fffaf3; }
      button { border: 0; border-radius: 999px; padding: 14px 22px; background: #2c221b; color: #fff; font-size: 16px; cursor: pointer; }
      .warn { color: #8a4b12; }
      code { background: #f1e8dc; padding: 2px 6px; border-radius: 8px; }
    </style>
  </head>
  <body>
    <main>
      <h1>ANYU NewebPay Sandbox Smoke</h1>
      <p class="warn">Use sandbox credit-card one-time payment only. Do not use a real card. Do not commit or share this file.</p>
      <p>This temporary form was generated outside the repository for manual browser submission.</p>
      <form method="${htmlEscape(checkout.method)}" action="${htmlEscape(checkout.actionUrl)}">
${fields}
        <button type="submit">Open NewebPay sandbox payment</button>
      </form>
    </main>
  </body>
</html>
`;

  await fs.writeFile(formPath, html, { mode: 0o600 });

  return formPath;
}

function getStateFilePath() {
  const candidate = process.env.QA_NEWEBPAY_STATE_FILE?.trim() || path.join(TMP_DIR, STATE_FILE_NAME);
  const resolved = path.resolve(candidate);

  if (!resolved.startsWith("/private/tmp/")) {
    throw new Error("state_file_must_be_under_private_tmp");
  }

  return resolved;
}

async function writeState(input) {
  await fs.mkdir(TMP_DIR, { recursive: true, mode: 0o700 });
  const statePath = getStateFilePath();
  await fs.writeFile(
    statePath,
    JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        baseUrl,
        moduleSlug: MODULE_SLUG,
        checkoutToken: input.checkoutToken,
        formPath: input.formPath,
        resultIdPresent: true,
        merchantOrderNoPresent: input.merchantOrderNoPresent,
        paymentIntentIdPresent: input.paymentIntentIdPresent,
      },
      null,
      2,
    ),
    { mode: 0o600 },
  );

  return statePath;
}

async function readState() {
  const statePath = getStateFilePath();
  const parsed = JSON.parse(await fs.readFile(statePath, "utf8"));

  if (!parsed || typeof parsed !== "object" || typeof parsed.checkoutToken !== "string") {
    throw new Error("invalid_state_file");
  }

  return { statePath, state: parsed };
}

async function pollPaymentStatus(checkoutToken, stepName) {
  const result = await requestJson(`${baseUrl}/api/modules/${MODULE_SLUG}/payment/status`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ checkoutToken }),
  });
  const body = result.json ?? {};

  record(stepName, result.status === 200 && body.ok === true ? "pass" : "fail", {
    httpStatus: result.status,
    status: body.status ?? null,
    retryable: body.retryable ?? null,
    errorCategory: body.errorCategory ?? null,
    accessPathPresent: Boolean(body.accessPath),
  });

  return {
    status: body.status ?? null,
    accessPath: typeof body.accessPath === "string" ? body.accessPath : null,
    errorCategory: body.errorCategory ?? null,
  };
}

async function waitForPaymentReady(checkoutToken) {
  let latest = null;

  for (let attempt = 1; attempt <= 72; attempt += 1) {
    latest = await pollPaymentStatus(checkoutToken, `payment_status_poll_${attempt}`);

    if (PAYMENT_STATUSES_READY.has(latest.status)) {
      return latest;
    }

    if (!PAYMENT_STATUSES_WAITING.has(latest.status)) {
      return latest;
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  return latest ?? { status: "timeout", accessPath: null, errorCategory: "timeout" };
}

async function verifyAccessRender(accessPath) {
  if (!accessPath) {
    record("paid_access_render", "blocked", { reason: "access_path_missing" });
    return false;
  }

  const url = new URL(accessPath, baseUrl);
  const response = await fetch(url);
  const text = await response.text();
  const pass =
    response.status === 200 &&
    (text.includes("完整分析") || text.includes("48 小時") || text.includes("可直接使用"));

  record("paid_access_render", pass ? "pass" : "fail", {
    httpStatus: response.status,
    completedContentSignal: pass,
  });

  return pass;
}

async function productionDisabledCheck() {
  const [health, checkout, fakePaid] = await Promise.all([
    requestJson(`${PRODUCTION_BASE_URL}/api/health`),
    requestJson(`${PRODUCTION_BASE_URL}/api/modules/${MODULE_SLUG}/checkout/newebpay`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ resultId: "00000000-0000-0000-0000-000000000000" }),
    }),
    requestJson(`${PRODUCTION_BASE_URL}/api/operator/fake-paid-success`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        moduleSlug: MODULE_SLUG,
        resultId: "00000000-0000-0000-0000-000000000000",
      }),
    }),
  ]);
  const pass =
    health.status === 200 &&
    health.json?.environment === "production" &&
    checkout.status === 404 &&
    checkout.json?.error === "not_found" &&
    fakePaid.status === 404 &&
    fakePaid.json?.error === "not_found";

  record("production_disabled_check", pass ? "pass" : "fail", {
    productionHealthStatus: health.status,
    productionEnvironment: health.json?.environment ?? null,
    productionGitBranch: health.json?.gitBranch ?? null,
    checkoutHttpStatus: checkout.status,
    checkoutError: checkout.json?.error ?? null,
    fakePaidHttpStatus: fakePaid.status,
    fakePaidError: fakePaid.json?.error ?? null,
  });

  return pass;
}

async function createCheckoutMode() {
  record("secret_preflight", operatorSecret ? "pass" : "blocked", {
    OPERATOR_TEST_SECRET: operatorSecret ? "present" : "missing",
    baseUrl,
  });

  if (!operatorSecret) {
    record("final_summary", "blocked", {
      reason: "operator_secret_missing",
      nextAction: "export OPERATOR_TEST_SECRET from a secure local source and rerun create-checkout",
    });
    process.exitCode = 2;
    return;
  }

  const healthOk = await healthPreflight();

  if (!healthOk) {
    record("final_summary", "blocked", { reason: "staging_health_failed" });
    process.exitCode = 3;
    return;
  }

  const resultId = await createSourceResult();
  const checkout = await createCheckout(resultId);
  const formPath = await writePaymentForm(checkout);
  const statePath = await writeState({
    checkoutToken: checkout.checkoutToken,
    formPath,
    merchantOrderNoPresent: checkout.merchantOrderNoPresent,
    paymentIntentIdPresent: checkout.paymentIntentIdPresent,
  });

  record("manual_browser_instruction", "ready", {
    formPath,
    statePath,
    openImmediately: true,
    paymentMethod: "sandbox_credit_card_one_time_only",
    useRealCard: false,
    shareOrCommitForm: false,
  });
  record("final_summary", "pass", {
    checkoutCreated: true,
    formPath,
    statePath,
    nextMode: "verify-after-payment",
  });
}

async function pollStatusMode() {
  const { statePath, state } = await readState();
  record("state_file", "pass", {
    statePath,
    checkoutTokenPresent: true,
    formPathPresent: Boolean(state.formPath),
  });
  await pollPaymentStatus(state.checkoutToken, "payment_status_once");
}

async function verifyAfterPaymentMode() {
  const { statePath, state } = await readState();
  record("state_file", "pass", {
    statePath,
    checkoutTokenPresent: true,
    formPathPresent: Boolean(state.formPath),
  });

  const latest = await waitForPaymentReady(state.checkoutToken);
  const ready = PAYMENT_STATUSES_READY.has(latest.status);
  const accessOk = ready ? await verifyAccessRender(latest.accessPath) : false;
  const productionOk = await productionDisabledCheck();
  const pass = ready && accessOk && productionOk;

  record("final_summary", pass ? "pass" : "fail", {
    paidReady: ready,
    finalStatus: latest.status,
    errorCategory: latest.errorCategory,
    paidAccessRenderPassed: accessOk,
    productionDisabledPassed: productionOk,
  });

  process.exitCode = pass ? 0 : 4;
}

async function main() {
  const mode = parseMode();

  if (!mode) {
    return;
  }

  if (mode === "create-checkout") {
    await createCheckoutMode();
    return;
  }

  if (mode === "poll-status") {
    await pollStatusMode();
    return;
  }

  await verifyAfterPaymentMode();
}

main().catch((error) => {
  record("runner_error", "fail", {
    error: error instanceof Error ? error.message : "unknown_error",
  });
  process.exitCode = 1;
});
