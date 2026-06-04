#!/usr/bin/env node

import crypto from "node:crypto";
import { loadLocalEnv } from "./lib/load-local-env.mjs";
import {
  assertSafeQaBaseUrl,
  extractCheckoutHref,
  normalizeBaseUrl,
  redactRouteShape,
  sanitizeRecord,
  summarizeCheckoutStartHtml,
  summarizeResultPageHtml,
} from "./lib/result-checkout-no-card-qa.mjs";

if (process.env.QA_NO_CARD_DISABLE_LOCAL_ENV !== "1") {
  loadLocalEnv();
}

const DEFAULT_BASE_URL = "https://staging.anyu.tw";
const PRODUCTION_BASE_URL = "https://anyu.tw";
const MODULE_SLUG = "ambiguous-temperature";
const ROUTE_BUNDLE_VERSION = "payment-foundation-2026-05-29";
const PAYMENT_STATUS_READY = new Set(["completed"]);
const PAYMENT_STATUS_WAITING = new Set(["pending", "processing"]);
const SYNTHETIC_INPUT =
  "這是一段無卡 QA 用的曖昧情境：對方最近回覆變慢，但仍會主動分享生活片段，也會看限動。我想確認自己不要太急，也想用有界線但不冷的方式回覆。這段內容只用於驗證結果頁到結帳橋接頁與付費交付流程。";

const baseUrl = normalizeBaseUrl(process.env.QA_NO_CARD_BASE_URL, DEFAULT_BASE_URL);
const processorMode = process.env.QA_NO_CARD_PROCESSOR_MODE?.trim().toLowerCase() ?? "queue";
const operatorSecret = process.env.OPERATOR_TEST_SECRET?.trim() ?? "";
const internalJobSecret = process.env.INTERNAL_JOB_SECRET?.trim() ?? "";
const inputSuffix =
  process.env.QA_NO_CARD_INPUT_SUFFIX?.trim() ||
  `no-card-result-checkout-${new Date().toISOString()}-${crypto.randomUUID()}`;

function record(step, outcome, details = {}) {
  console.log(JSON.stringify(sanitizeRecord({ step, outcome, ...details })));
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
    json,
    text,
  };
}

async function healthPreflight() {
  const result = await requestJson(`${baseUrl}/api/health`);
  const marker = result.json ?? {};
  const pass =
    result.status === 200 &&
    marker.environment === "preview" &&
    marker.gitBranch === "staging" &&
    marker.routeBundleVersion === ROUTE_BUNDLE_VERSION;

  record("staging_health", pass ? "pass" : "fail", {
    httpStatus: result.status,
    environment: marker.environment ?? null,
    gitBranch: marker.gitBranch ?? null,
    gitCommit: marker.gitCommit ?? null,
    routeBundleVersion: marker.routeBundleVersion ?? null,
  });

  return pass;
}

async function createSourceResult() {
  const result = await requestJson(`${baseUrl}/api/modules/${MODULE_SLUG}/analyze`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-operator-test-secret": operatorSecret,
    },
    body: JSON.stringify({
      text: `${SYNTHETIC_INPUT}\n\n${inputSuffix}`,
      situation: "回訊變慢但看限動",
      anonymousSessionId: `no-card-result-checkout-${crypto.randomUUID()}`,
      userContext: {
        relationshipStage: "曖昧中",
        userGoal: "我該怎麼回",
        primaryPain: "回覆變慢",
        replyTone: "有界線但不冷",
      },
    }),
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

async function verifyResultPage(resultId) {
  const path = `/m/${MODULE_SLUG}/result/${encodeURIComponent(resultId)}`;
  const response = await fetch(`${baseUrl}${path}`);
  const html = await response.text();
  const summary = summarizeResultPageHtml(html, MODULE_SLUG);
  const pass =
    response.status === 200 &&
    summary.paidCtaVisible &&
    summary.checkoutHrefPresent &&
    summary.forbiddenCopyFound.length === 0 &&
    summary.secretNameLeaksFound.length === 0;

  record("result_page_checkout_cta", pass ? "pass" : "fail", {
    httpStatus: response.status,
    ...summary,
  });

  if (!pass) {
    throw new Error("result_page_checkout_cta_failed");
  }

  return extractCheckoutHref(html, MODULE_SLUG);
}

async function verifyCheckoutStart(checkoutHref) {
  const checkoutUrl = new URL(checkoutHref, baseUrl);
  const response = await fetch(checkoutUrl);
  const html = await response.text();
  const summary = summarizeCheckoutStartHtml(html);
  const providerFieldsHidden = Object.values(summary.providerFieldNamesPresent).every(
    (present) => !present,
  );
  const pass =
    response.status === 200 &&
    summary.anyuWordmarkPresent &&
    summary.backLinkPresent &&
    summary.moduleIdentityPresent &&
    summary.stepperPresent &&
    summary.pricePresent &&
    summary.oneTimePresent &&
    summary.nonSubscriptionPresent &&
    summary.newebpayTrustPresent &&
    summary.providerNotificationTruthPresent &&
    summary.webDeliveryPresent &&
    summary.recoverySoftGatePresent &&
    summary.recoveryEmailPrimaryPresent &&
    summary.recoveryEmailOnlyDesktopPresent &&
    summary.recoveryRequiredWarningPresent &&
    summary.paymentLockedPresent &&
    summary.supportRefundPresent &&
    summary.submitButtonPresent &&
    !summary.sandboxCcoreTargetPresent &&
    summary.formMethodPostPresent &&
    providerFieldsHidden &&
    summary.forbiddenCopyFound.length === 0 &&
    summary.secretNameLeaksFound.length === 0;

  record("checkout_start_page", pass ? "pass" : "fail", {
    httpStatus: response.status,
    checkoutHrefShape: redactRouteShape(checkoutUrl.pathname),
    ...summary,
    providerFieldValuesPrinted: false,
  });

  if (!pass) {
    throw new Error("checkout_start_page_failed");
  }
}

async function fakePaidSuccess(resultId) {
  const result = await requestJson(`${baseUrl}/api/operator/fake-paid-success`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-operator-test-secret": operatorSecret,
    },
    body: JSON.stringify({
      moduleSlug: MODULE_SLUG,
      resultId,
      idempotencyKey: `no-card-result-checkout-${crypto.randomUUID()}`,
    }),
  });
  const body = result.json ?? {};
  const pass =
    result.status === 200 &&
    body.ok === true &&
    Boolean(body.paidAccessToken) &&
    Boolean(body.unlockPath);

  record("operator_fake_paid_success", pass ? "pass" : "fail", {
    httpStatus: result.status,
    ok: Boolean(body.ok),
    paymentIntentIdPresent: Boolean(body.paymentIntentId),
    paymentIntentStatus: body.paymentIntentStatus ?? null,
    paymentIntentCreated: body.paymentIntentCreated ?? null,
    entitlementIdPresent: Boolean(body.entitlementId),
    entitlementStatus: body.entitlementStatus ?? null,
    entitlementCreated: body.entitlementCreated ?? null,
    generationJobIdPresent: Boolean(body.generationJobId),
    generationJobStatus: body.generationJobStatus ?? null,
    generationJobCreated: body.generationJobCreated ?? null,
    paidAccessTokenReturned: body.paidAccessTokenReturned ?? null,
    paidAccessTokenPresent: Boolean(body.paidAccessToken),
    unlockPathPresent: Boolean(body.unlockPath),
    unlockPathShape: redactRouteShape(body.unlockPath),
    queueTriggerOk: body.queueTrigger?.ok ?? null,
    queueTriggerCategory: body.queueTrigger?.category ?? null,
    queueTriggerProvider: body.queueTrigger?.provider ?? null,
    error: body.error ?? null,
  });

  if (!pass) {
    throw new Error(body.error ?? "operator_fake_paid_success_failed");
  }

  return {
    paidAccessToken: body.paidAccessToken,
    unlockPath: body.unlockPath,
    queueTrigger: body.queueTrigger ?? null,
  };
}

async function pollPaidStatus(paidAccessToken, stepName) {
  const result = await requestJson(`${baseUrl}/api/modules/${MODULE_SLUG}/paid-result/status`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ unlockToken: paidAccessToken }),
  });
  const body = result.json ?? {};
  const pass = result.status === 200 && body.ok === true;

  record(stepName, pass ? "pass" : "fail", {
    httpStatus: result.status,
    status: body.status ?? null,
    retryable: body.retryable ?? null,
    errorCategory: body.errorCategory ?? null,
  });

  return body.status ?? null;
}

async function waitForPaidCompleted(paidAccessToken) {
  for (let attempt = 1; attempt <= 24; attempt += 1) {
    const status = await pollPaidStatus(paidAccessToken, `paid_status_poll_${attempt}`);

    if (PAYMENT_STATUS_READY.has(status)) {
      return true;
    }

    if (!PAYMENT_STATUS_WAITING.has(status)) {
      return false;
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  return false;
}

async function processPaidGenerationJob() {
  const result = await requestJson(`${baseUrl}/api/internal/jobs/process`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${internalJobSecret}`,
    },
    body: JSON.stringify({
      jobType: "paid_analysis",
      limit: 1,
    }),
  });
  const body = result.json ?? {};
  const pass = result.status === 200 && body.ok !== false;

  record("manual_processor", pass ? "pass" : "fail", {
    httpStatus: result.status,
    processed: body.processed ?? null,
    completed: body.completed ?? null,
    failed: body.failed ?? null,
    retryScheduled: body.retryScheduled ?? null,
    error: body.error ?? null,
  });

  return pass;
}

async function verifyPaidAccessRender(unlockPath) {
  const url = new URL(unlockPath, baseUrl);
  const response = await fetch(url);
  const html = await response.text();
  const completedContentSignal =
    html.includes("完整分析") || html.includes("48 小時") || html.includes("可直接使用");
  const pass = response.status === 200 && completedContentSignal;

  record("paid_access_render", pass ? "pass" : "fail", {
    httpStatus: response.status,
    completedContentSignal,
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

async function main() {
  const target = assertSafeQaBaseUrl(baseUrl);

  record("target_preflight", target.ok ? "pass" : "blocked", {
    baseUrl,
    error: target.ok ? null : target.error,
  });

  if (!target.ok) {
    process.exitCode = 2;
    return;
  }

  record("secret_preflight", operatorSecret ? "pass" : "blocked", {
    OPERATOR_TEST_SECRET: operatorSecret ? "present" : "missing",
    INTERNAL_JOB_SECRET: internalJobSecret ? "present" : "missing",
    processorMode,
  });

  if (!operatorSecret) {
    record("final_summary", "blocked", {
      reason: "operator_secret_missing",
      noCardQaPassed: false,
    });
    process.exitCode = 2;
    return;
  }

  const healthOk = await healthPreflight();

  if (!healthOk) {
    record("final_summary", "blocked", {
      reason: "staging_health_failed",
      noCardQaPassed: false,
    });
    process.exitCode = 3;
    return;
  }

  const resultId = await createSourceResult();
  const checkoutHref = await verifyResultPage(resultId);
  await verifyCheckoutStart(checkoutHref);
  const fakePaid = await fakePaidSuccess(resultId);

  if (processorMode === "manual") {
    if (!internalJobSecret) {
      record("final_summary", "partial", {
        reason: "internal_job_secret_missing",
        noCardQaPassed: false,
      });
      process.exitCode = 4;
      return;
    }

    await processPaidGenerationJob();
  }

  const completed = await waitForPaidCompleted(fakePaid.paidAccessToken);
  const accessRendered = completed ? await verifyPaidAccessRender(fakePaid.unlockPath) : false;
  const productionOk = await productionDisabledCheck();
  const queueProof =
    processorMode === "manual" ||
    (fakePaid.queueTrigger?.ok === true && fakePaid.queueTrigger?.category === "enqueued");
  const pass = completed && accessRendered && productionOk && queueProof;

  record("final_summary", pass ? "pass" : "fail", {
    noCardQaPassed: pass,
    providerPaymentSubmitted: false,
    browserOperatorSecretExposure: false,
    resultPageCheckoutPathCovered: true,
    checkoutStartCovered: true,
    downstreamFakePaidCovered: true,
    paidStatusCompleted: completed,
    paidAccessRenderPassed: accessRendered,
    productionDisabledPassed: productionOk,
    limitation: "operator_fake_paid_uses_operator_payment_intent_not_newebpay_checkout_intent",
  });

  process.exitCode = pass ? 0 : 5;
}

main().catch((error) => {
  record("runner_error", "fail", {
    error: error instanceof Error ? error.message : "unknown_error",
  });
  process.exitCode = 1;
});
