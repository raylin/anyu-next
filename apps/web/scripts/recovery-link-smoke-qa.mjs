#!/usr/bin/env node

import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";
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
import {
  RECOVERY_LINK_CHANNEL,
  RECOVERY_LINK_PURPOSE,
  RECOVERY_LINK_TTL_DAYS,
  generateOperatorRecoveryToken,
  getDefaultOperatorRecoveryLinkExpiresAt,
  hashOperatorRecoveryToken,
  redactRecoveryLinkPath,
  sanitizeRecoverySmokeRecord,
  summarizeRecoveryLinkHtml,
} from "./lib/recovery-link-smoke-qa.mjs";

if (process.env.QA_RECOVERY_LINK_DISABLE_LOCAL_ENV !== "1") {
  loadLocalEnv();
}

const DEFAULT_BASE_URL = "https://staging.anyu.tw";
const PRODUCTION_BASE_URL = "https://anyu.tw";
const MODULE_SLUG = "ambiguous-temperature";
const ROUTE_BUNDLE_VERSION = "payment-foundation-2026-05-29";
const PAYMENT_STATUS_READY = new Set(["completed"]);
const PAYMENT_STATUS_WAITING = new Set(["pending", "processing"]);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const SYNTHETIC_INPUT =
  "這是一段無卡 QA 用的曖昧情境：對方最近回覆變慢，但仍會主動分享生活片段，也會看限動。我想確認自己不要太急，也想用有界線但不冷的方式回覆。這段內容只用於驗證結果頁到結帳橋接頁與付費交付流程。";

const baseUrl = normalizeBaseUrl(process.env.QA_RECOVERY_LINK_BASE_URL, DEFAULT_BASE_URL);
const operatorSecret = process.env.OPERATOR_TEST_SECRET?.trim() ?? "";
const internalJobSecret = process.env.INTERNAL_JOB_SECRET?.trim() ?? "";
const recoveryLinkSecret = process.env.PAYMENT_RECOVERY_LINK_TOKEN_SECRET?.trim() ?? "";
const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
const smokeMode = process.env.QA_RECOVERY_LINK_MODE?.trim().toLowerCase() || "runtime";
const processorMode =
  process.env.QA_RECOVERY_LINK_PROCESSOR_MODE?.trim().toLowerCase() ?? "queue";
const inputSuffix =
  process.env.QA_RECOVERY_LINK_INPUT_SUFFIX?.trim() ||
  `recovery-link-smoke-${new Date().toISOString()}-${crypto.randomUUID()}`;

function record(step, outcome, details = {}) {
  console.log(JSON.stringify(sanitizeRecord(sanitizeRecoverySmokeRecord({ step, outcome, ...details }))));
}

function hasJsonContentType(response) {
  return response.headers.get("content-type")?.includes("application/json") ?? false;
}

function isUuid(value) {
  return typeof value === "string" && UUID_PATTERN.test(value);
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

function getSqlClient() {
  return neon(databaseUrl);
}

async function verifyDbSchema() {
  const sql = getSqlClient();
  const [tables] = await sql`
    select
      to_regclass('public.analysis_results') as analysis_results,
      to_regclass('public.payment_intents') as payment_intents,
      to_regclass('public.entitlements') as entitlements,
      to_regclass('public.paid_result_recovery_links') as paid_result_recovery_links
  `;
  const pass =
    tables?.analysis_results === "analysis_results" &&
    tables?.payment_intents === "payment_intents" &&
    tables?.entitlements === "entitlements" &&
    tables?.paid_result_recovery_links === "paid_result_recovery_links";

  record("staging_db_schema_preflight", pass ? "pass" : "blocked", {
    connectionSourceCategory: "local DATABASE_URL",
    credentialsPrinted: false,
    expectedTablesPresent: pass,
    analysisResultsPresent: tables?.analysis_results === "analysis_results",
    paymentIntentsPresent: tables?.payment_intents === "payment_intents",
    entitlementsPresent: tables?.entitlements === "entitlements",
    recoveryLinksPresent: tables?.paid_result_recovery_links === "paid_result_recovery_links",
  });

  return pass;
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
      anonymousSessionId: `recovery-link-smoke-${crypto.randomUUID()}`,
      userContext: {
        relationshipStage: "曖昧中",
        userGoal: "我該怎麼回",
        primaryPain: "回覆變慢",
        replyTone: "溫柔但有界線",
      },
    }),
  });
  const resultId = result.json?.resultId ?? null;
  const pass = result.status === 200 && result.json?.ok === true && isUuid(resultId);

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
  const providerFieldsPresent = Object.values(summary.providerFieldNamesPresent).every(Boolean);
  const pass =
    response.status === 200 &&
    summary.recoverySoftGatePresent &&
    summary.recoveryEmailPrimaryPresent &&
    summary.recoveryLineDeferredPresent &&
    summary.recoverySkipWarningPresent &&
    summary.submitButtonPresent &&
    providerFieldsPresent &&
    summary.forbiddenCopyFound.length === 0 &&
    summary.secretNameLeaksFound.length === 0;

  record("checkout_start_page", pass ? "pass" : "fail", {
    httpStatus: response.status,
    checkoutHrefShape: redactRouteShape(checkoutUrl.pathname),
    recoverySoftGatePresent: summary.recoverySoftGatePresent,
    recoveryEmailPrimaryPresent: summary.recoveryEmailPrimaryPresent,
    recoveryLineDeferredPresent: summary.recoveryLineDeferredPresent,
    recoverySkipWarningPresent: summary.recoverySkipWarningPresent,
    submitButtonPresent: summary.submitButtonPresent,
    providerFieldNamesPresent: summary.providerFieldNamesPresent,
    providerFieldValuesPrinted: false,
    forbiddenCopyFound: summary.forbiddenCopyFound,
    secretNameLeaksFound: summary.secretNameLeaksFound,
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
      idempotencyKey: `recovery-link-smoke-${crypto.randomUUID()}`,
    }),
  });
  const body = result.json ?? {};
  const pass =
    result.status === 200 &&
    body.ok === true &&
    isUuid(body.paymentIntentId) &&
    isUuid(body.entitlementId) &&
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
    paidAccessTokenPresent: Boolean(body.paidAccessToken),
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
    paymentIntentId: body.paymentIntentId,
    entitlementId: body.entitlementId,
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

async function runRuntimeOperatorSmoke(resultId) {
  const result = await requestJson(`${baseUrl}/api/operator/recovery-link-smoke`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-operator-test-secret": operatorSecret,
    },
    body: JSON.stringify({
      moduleSlug: MODULE_SLUG,
      resultId,
      idempotencyKey: `recovery-link-smoke-${crypto.randomUUID()}`,
    }),
  });
  const body = result.json ?? {};
  const pass =
    result.status === 200 &&
    body.ok === true &&
    body.createdLink === true &&
    body.resolverStatus === "passed" &&
    body.invalidLinkSafety === "passed" &&
    body.paidResultRenderMarker === true &&
    (body.cleanup === "revoked" || body.cleanup === "deleted");

  record("runtime_operator_recovery_link_smoke", pass ? "pass" : "fail", {
    httpStatus: result.status,
    ok: Boolean(body.ok),
    createdLink: body.createdLink ?? null,
    resolverStatus: body.resolverStatus ?? null,
    invalidLinkSafety: body.invalidLinkSafety ?? null,
    cleanup: body.cleanup ?? null,
    paymentIntentStatus: body.paymentIntentStatus ?? null,
    entitlementStatus: body.entitlementStatus ?? null,
    generationJobStatus: body.generationJobStatus ?? null,
    generationJobProcessorCategory: body.generationJobProcessorCategory ?? null,
    paidResultRenderMarker: body.paidResultRenderMarker ?? null,
    rawRecoveryTokenReturned: body.rawRecoveryTokenReturned ?? null,
    tokenHashReturned: body.tokenHashReturned ?? null,
    rawPaidAccessTokenReturned: body.rawPaidAccessTokenReturned ?? null,
    rawCheckoutSessionTokenReturned: body.rawCheckoutSessionTokenReturned ?? null,
    emailOrLineSent: body.emailOrLineSent ?? null,
    error: body.error ?? null,
  });

  return pass;
}

async function createOperatorRecoveryLink(input) {
  const rawToken = generateOperatorRecoveryToken();
  const tokenHash = hashOperatorRecoveryToken(rawToken, recoveryLinkSecret);
  const now = new Date();
  const expiresAt = getDefaultOperatorRecoveryLinkExpiresAt(now);
  const sql = getSqlClient();
  const [link] = await sql`
    insert into paid_result_recovery_links (
      module_slug,
      analysis_result_id,
      payment_intent_id,
      entitlement_id,
      recovery_contact_id,
      token_hash,
      purpose,
      channel,
      status,
      expires_at,
      updated_at
    )
    values (
      ${MODULE_SLUG},
      ${input.resultId},
      ${input.paymentIntentId},
      ${input.entitlementId},
      null,
      ${tokenHash},
      ${RECOVERY_LINK_PURPOSE},
      ${RECOVERY_LINK_CHANNEL},
      'created',
      ${expiresAt.toISOString()},
      ${now.toISOString()}
    )
    returning id, channel, status, expires_at
  `;
  const pass = isUuid(link?.id) && link.channel === RECOVERY_LINK_CHANNEL;

  record("operator_recovery_link_create", pass ? "pass" : "fail", {
    created: pass,
    channel: RECOVERY_LINK_CHANNEL,
    purpose: RECOVERY_LINK_PURPOSE,
    expiryDays: RECOVERY_LINK_TTL_DAYS,
    rawTokenPrinted: false,
    tokenHashPrinted: false,
    rowIdPrinted: false,
    expiresAtPrinted: false,
  });

  if (!pass) {
    throw new Error("operator_recovery_link_create_failed");
  }

  return { linkId: link.id, rawToken };
}

async function verifyRecoveryLinkRender(rawToken) {
  const path = `/r/${rawToken}`;
  const response = await fetch(`${baseUrl}${path}`);
  const html = await response.text();
  const summary = summarizeRecoveryLinkHtml(html, rawToken);
  const pass =
    response.status === 200 &&
    summary.completedContentSignal &&
    !summary.rawRecoveryTokenExposed &&
    !summary.rawPaidAccessOrCheckoutTokenExposed;

  record("recovery_link_render", pass ? "pass" : "fail", {
    httpStatus: response.status,
    recoveryPathShape: redactRecoveryLinkPath(path),
    ...summary,
  });

  return pass;
}

async function verifyInvalidRecoveryLinkFailsSafely() {
  const invalidPath = `/r/prl_${"x".repeat(43)}`;
  const response = await fetch(`${baseUrl}${invalidPath}`);
  const html = await response.text();
  const safeFailureSignal =
    html.includes("找回連結") && html.includes("hello@anyu.tw") && !html.includes("完整分析");
  const pass = response.status === 200 && safeFailureSignal;

  record("invalid_recovery_link_safety", pass ? "pass" : "fail", {
    httpStatus: response.status,
    recoveryPathShape: redactRecoveryLinkPath(invalidPath),
    safeFailureSignal,
  });

  return pass;
}

async function cleanupOperatorRecoveryLink(linkId) {
  const sql = getSqlClient();
  const result = await sql`
    delete from paid_result_recovery_links
    where id = ${linkId}
      and channel = ${RECOVERY_LINK_CHANNEL}
    returning id
  `;
  const deleted = result.length === 1;

  record("operator_recovery_link_cleanup", deleted ? "pass" : "partial", {
    cleanupStrategy: "delete_operator_test_row",
    deleted,
    rowIdPrinted: false,
  });

  return deleted;
}

async function productionDisabledCheck() {
  const [health, checkout, fakePaid, recoveryLinkSmoke] = await Promise.all([
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
    requestJson(`${PRODUCTION_BASE_URL}/api/operator/recovery-link-smoke`, {
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
    fakePaid.json?.error === "not_found" &&
    recoveryLinkSmoke.status === 404 &&
    recoveryLinkSmoke.json?.error === "not_found";

  record("production_disabled_check", pass ? "pass" : "fail", {
    productionHealthStatus: health.status,
    productionEnvironment: health.json?.environment ?? null,
    productionGitBranch: health.json?.gitBranch ?? null,
    checkoutHttpStatus: checkout.status,
    checkoutError: checkout.json?.error ?? null,
    fakePaidHttpStatus: fakePaid.status,
    fakePaidError: fakePaid.json?.error ?? null,
    recoveryLinkSmokeHttpStatus: recoveryLinkSmoke.status,
    recoveryLinkSmokeError: recoveryLinkSmoke.json?.error ?? null,
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

  const runtimeMode = smokeMode !== "local-db";
  const secretsReady = runtimeMode ? Boolean(operatorSecret) : Boolean(operatorSecret && recoveryLinkSecret && databaseUrl);

  record("secret_preflight", secretsReady ? "pass" : "blocked", {
    OPERATOR_TEST_SECRET: operatorSecret ? "present" : "missing",
    PAYMENT_RECOVERY_LINK_TOKEN_SECRET: runtimeMode ? "not_required_for_runtime_mode" : recoveryLinkSecret ? "present" : "missing",
    DATABASE_URL: runtimeMode ? "not_required_for_runtime_mode" : databaseUrl ? "present" : "missing",
    INTERNAL_JOB_SECRET: internalJobSecret ? "present" : "missing",
    valuesPrinted: false,
    lengthsPrinted: false,
    prefixesPrinted: false,
    suffixesPrinted: false,
    hashesPrinted: false,
    smokeMode,
    processorMode,
  });

  if (!secretsReady) {
    record("final_summary", "blocked", {
      reason: "required_operator_smoke_env_missing",
      validRecoveryLinkSmokePassed: false,
    });
    process.exitCode = 2;
    return;
  }

  const healthOk = await healthPreflight();

  if (!healthOk) {
    record("final_summary", "blocked", {
      reason: "staging_health_failed",
      validRecoveryLinkSmokePassed: false,
    });
    process.exitCode = 3;
    return;
  }

  if (runtimeMode) {
    const resultId = await createSourceResult();
    const checkoutHref = await verifyResultPage(resultId);
    await verifyCheckoutStart(checkoutHref);
    const runtimeSmokePassed = await runRuntimeOperatorSmoke(resultId);
    const productionOk = await productionDisabledCheck();
    const pass = runtimeSmokePassed && productionOk;

    record("final_summary", pass ? "pass" : "fail", {
      validRecoveryLinkSmokePassed: pass,
      runtimeOperatorEndpointCovered: true,
      localDbModeUsed: false,
      productionDisabledPassed: productionOk,
      rawRecoveryTokenPrinted: false,
      tokenHashPrinted: false,
      rawPaidAccessTokenPrinted: false,
      rawCheckoutSessionTokenPrinted: false,
      emailOrLineSent: false,
    });

    process.exitCode = pass ? 0 : 5;
    return;
  }

  const schemaOk = await verifyDbSchema();

  if (!schemaOk) {
    record("final_summary", "blocked", {
      reason: "database_target_not_staging_or_schema_missing",
      validRecoveryLinkSmokePassed: false,
    });
    process.exitCode = 3;
    return;
  }

  let recoveryLink = null;

  try {
    const resultId = await createSourceResult();
    const checkoutHref = await verifyResultPage(resultId);
    await verifyCheckoutStart(checkoutHref);
    const fakePaid = await fakePaidSuccess(resultId);

    if (processorMode === "manual") {
      if (!internalJobSecret) {
        record("final_summary", "partial", {
          reason: "internal_job_secret_missing",
          validRecoveryLinkSmokePassed: false,
        });
        process.exitCode = 4;
        return;
      }

      await processPaidGenerationJob();
    }

    const completed = await waitForPaidCompleted(fakePaid.paidAccessToken);
    const accessRendered = completed ? await verifyPaidAccessRender(fakePaid.unlockPath) : false;
    recoveryLink = accessRendered
      ? await createOperatorRecoveryLink({
          resultId,
          paymentIntentId: fakePaid.paymentIntentId,
          entitlementId: fakePaid.entitlementId,
        })
      : null;
    const recoveryLinkRendered = recoveryLink
      ? await verifyRecoveryLinkRender(recoveryLink.rawToken)
      : false;
    const invalidLinkSafe = await verifyInvalidRecoveryLinkFailsSafely();
    const productionOk = await productionDisabledCheck();
    const queueProof =
      processorMode === "manual" ||
      (fakePaid.queueTrigger?.ok === true && fakePaid.queueTrigger?.category === "enqueued");
    const pass =
      completed &&
      accessRendered &&
      recoveryLinkRendered &&
      invalidLinkSafe &&
      productionOk &&
      queueProof;

    record("final_summary", pass ? "pass" : "fail", {
      validRecoveryLinkSmokePassed: pass,
      noCardPaidFlowPassed: completed && accessRendered && queueProof,
      operatorTestRecoveryLinkCreated: Boolean(recoveryLink),
      recoveryLinkRendered,
      invalidRecoveryLinkSafe: invalidLinkSafe,
      productionDisabledPassed: productionOk,
      rawRecoveryTokenPrinted: false,
      tokenHashPrinted: false,
      rawPaidAccessTokenPrinted: false,
      rawCheckoutSessionTokenPrinted: false,
      emailOrLineSent: false,
      limitation: "requires local operator environment to target the same Preview(staging) DB and runtime secret",
    });

    process.exitCode = pass ? 0 : 5;
  } finally {
    if (recoveryLink?.linkId) {
      try {
        await cleanupOperatorRecoveryLink(recoveryLink.linkId);
      } catch {
        record("operator_recovery_link_cleanup", "partial", {
          cleanupStrategy: "delete_operator_test_row",
          deleted: false,
          rowIdPrinted: false,
          errorCategory: "cleanup_failed",
        });
      }
    }
  }
}

main().catch((error) => {
  record("runner_error", "fail", {
    error: error instanceof Error ? error.message : "unknown_error",
  });
  process.exitCode = 1;
});
