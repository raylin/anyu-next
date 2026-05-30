#!/usr/bin/env node

const STAGING_BASE_URL = "https://staging.anyu.tw";
const MODULE_SLUG = "ambiguous-temperature";
const ROUTE_BUNDLE_VERSION = "payment-foundation-2026-05-29";
const INVALID_OPERATOR_SECRET = "invalid-test-secret";
const SYNTHETIC_PA_TOKEN = ["pa", "invalid_synthetic_token_for_qa"].join("_");
const SYNTHETIC_INPUT =
  "我們上週末見面時聊得很自然，他也說下次可以再約。那天他會主動問我工作近況，還記得我之前提過的小事，所以我本來覺得關係有在靠近。可是這幾天訊息明顯變慢，常常隔半天才回，有時候只回一兩句，沒有像之前那樣延伸話題。奇怪的是，他還是會看我的限動，也偶爾傳一些生活小事給我，例如午餐或路上看到的東西。我不知道他是真的忙、需要空間，還是其實熱度在變低。我想回得有界線但不要太冷，也不想一直追問讓自己看起來很焦慮。";

const operatorSecret = process.env.OPERATOR_TEST_SECRET?.trim() ?? "";
const internalJobSecret = process.env.INTERNAL_JOB_SECRET?.trim() ?? "";
const processorMode = process.env.QA_FAKE_PAID_PROCESSOR_MODE?.trim().toLowerCase() ?? "manual";
const inputSuffix = process.env.QA_FAKE_PAID_INPUT_SUFFIX?.trim() ?? "";
const queueMode = processorMode === "queue";

function record(step, status, details = {}) {
  console.log(JSON.stringify({ step, outcome: status, ...details }));
}

function hasJsonContentType(response) {
  return response.headers.get("content-type")?.includes("application/json") ?? false;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = null;

  if (hasJsonContentType(response) && text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  return {
    status: response.status,
    contentType: response.headers.get("content-type")?.split(";")[0] ?? "",
    json: body,
    isJson: body !== null,
  };
}

function redactRouteShape(path) {
  if (typeof path !== "string") {
    return null;
  }

  return path.replace(/\/unlock\/[^/?#]+/u, "/unlock/[REDACTED]");
}

function summarizeFakePaidResponse(result) {
  const body = result.json ?? {};

  return {
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
    accessState: body.accessState ?? null,
    paidAccessTokenReturned: body.paidAccessTokenReturned ?? null,
    paidAccessTokenPresent: Boolean(body.paidAccessToken),
    unlockPathPresent: Boolean(body.unlockPath),
    unlockPathShape: redactRouteShape(body.unlockPath),
    queueTriggerOk: body.queueTrigger?.ok ?? null,
    queueTriggerCategory: body.queueTrigger?.category ?? null,
    queueTriggerProvider: body.queueTrigger?.provider ?? null,
    error: body.error ?? null,
  };
}

function assertTokenAvailable(token) {
  if (!token || typeof token !== "string") {
    throw new Error("paid_access_token_missing");
  }
}

async function healthPreflight() {
  const result = await requestJson(`${STAGING_BASE_URL}/api/health`);
  const marker = result.json ?? {};
  const pass =
    result.status === 200 &&
    marker.routeBundleVersion === ROUTE_BUNDLE_VERSION &&
    marker.gitBranch === "staging";

  record("staging_health_marker", pass ? "pass" : "fail", {
    httpStatus: result.status,
    app: marker.app ?? null,
    environment: marker.environment ?? null,
    gitCommit: marker.gitCommit ?? null,
    gitBranch: marker.gitBranch ?? null,
    routeBundleVersion: marker.routeBundleVersion ?? null,
  });

  return pass;
}

async function fakePaidGatePreflight() {
  const requestBody = JSON.stringify({
    moduleSlug: MODULE_SLUG,
    resultId: "00000000-0000-0000-0000-000000000000",
  });
  const cases = [
    { name: "missing_secret", headers: {} },
    { name: "invalid_secret", headers: { "x-operator-test-secret": INVALID_OPERATOR_SECRET } },
  ];
  let pass = true;

  for (const gateCase of cases) {
    const result = await requestJson(`${STAGING_BASE_URL}/api/operator/fake-paid-success`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...gateCase.headers,
      },
      body: requestBody,
    });
    const casePass = result.status === 401 && result.json?.error === "unauthorized";

    pass = pass && casePass;
    record(`fake_paid_gate_${gateCase.name}`, casePass ? "pass" : "fail", {
      httpStatus: result.status,
      jsonControlled: result.isJson,
      error: result.json?.error ?? null,
      genericHtml404: result.status === 404 && !result.isJson,
    });
  }

  return pass;
}

async function invalidPaidAccessRegression() {
  const result = await requestJson(`${STAGING_BASE_URL}/api/modules/${MODULE_SLUG}/paid-result/status`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ unlockToken: SYNTHETIC_PA_TOKEN }),
  });
  const pass = result.status === 200 && result.json?.errorCategory === "invalid_paid_access";

  record("invalid_pa_status", pass ? "pass" : "fail", {
    httpStatus: result.status,
    status: result.json?.status ?? null,
    errorCategory: result.json?.errorCategory ?? null,
  });

  return pass;
}

async function createSourceResult() {
  const result = await requestJson(`${STAGING_BASE_URL}/api/modules/${MODULE_SLUG}/analyze`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      text: inputSuffix ? `${SYNTHETIC_INPUT}\n\n${inputSuffix}` : SYNTHETIC_INPUT,
      situation: "ambiguous_temperature",
      anonymousSessionId: `secret-safe-fake-paid-${crypto.randomUUID()}`,
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
    apiStatus: result.json?.status ?? null,
    resultIdPresent: Boolean(resultId),
    cacheHit: result.json?.cacheHit ?? null,
    error: result.json?.error ?? null,
  });

  if (!pass) {
    throw new Error("source_analyze_failed");
  }

  const pageResponse = await fetch(`${STAGING_BASE_URL}/m/${MODULE_SLUG}/result/${encodeURIComponent(resultId)}`);
  const pagePass = pageResponse.status === 200;

  record("source_result_page", pagePass ? "pass" : "fail", {
    httpStatus: pageResponse.status,
  });

  if (!pagePass) {
    throw new Error("source_result_page_failed");
  }

  return resultId;
}

async function createLegacyUnlock(resultId) {
  const result = await requestJson(`${STAGING_BASE_URL}/api/unlock-intent`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      resultId,
      moduleId: "ai-temperature",
      themeSlug: MODULE_SLUG,
      anonymousSessionId: `secret-safe-legacy-${crypto.randomUUID()}`,
      source: "paid_preview",
      themeVariant: "classic",
      themeSource: "manual_override",
    }),
  });
  const unlockToken = result.json?.unlockToken ?? null;
  const pass = result.status === 200 && result.json?.ok === true && typeof unlockToken === "string";

  record("legacy_unlock_intent", pass ? "pass" : "fail", {
    httpStatus: result.status,
    unlockTokenPresent: Boolean(unlockToken),
    liffUrlPresent: Boolean(result.json?.liffUrl),
    lineAddUrlPresent: Boolean(result.json?.lineAddUrl),
    error: result.json?.error ?? null,
  });

  if (!pass) {
    return false;
  }

  const pageResponse = await fetch(`${STAGING_BASE_URL}/m/${MODULE_SLUG}/unlock/${encodeURIComponent(unlockToken)}`);
  const pagePass = pageResponse.status === 200;

  record("legacy_unlock_page", pagePass ? "pass" : "fail", {
    httpStatus: pageResponse.status,
  });

  return pagePass;
}

async function fakePaidSuccess(resultId, idempotencyKey) {
  return requestJson(`${STAGING_BASE_URL}/api/operator/fake-paid-success`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-operator-test-secret": operatorSecret,
    },
    body: JSON.stringify({
      moduleSlug: MODULE_SLUG,
      resultId,
      idempotencyKey,
    }),
  });
}

async function pollPaidStatus(token, stepName) {
  const result = await requestJson(`${STAGING_BASE_URL}/api/modules/${MODULE_SLUG}/paid-result/status`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ unlockToken: token }),
  });

  record(stepName, result.json?.ok ? "pass" : "fail", {
    httpStatus: result.status,
    status: result.json?.status ?? null,
    retryable: result.json?.retryable ?? null,
    errorCategory: result.json?.errorCategory ?? null,
  });

  return result.json?.status ?? null;
}

async function processPaidGenerationJob() {
  const processorEndpointPath = "/api/internal/jobs/process";
  const result = await requestJson(`${STAGING_BASE_URL}${processorEndpointPath}`, {
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

  record("processor_manual_completion", pass ? "pass" : "fail", {
    httpStatus: result.status,
    processorEndpointPath,
    processorAuthHeaderUsed: Boolean(internalJobSecret),
    processorAuthMode: "authorization_bearer_internal_job_secret",
    processed: body.processed ?? null,
    completed: body.completed ?? null,
    failed: body.failed ?? null,
    retryScheduled: body.retryScheduled ?? null,
    error: body.error ?? null,
  });

  return pass;
}

async function verifyPaidUnlockPage(token, expectedReady = false) {
  const response = await fetch(`${STAGING_BASE_URL}/m/${MODULE_SLUG}/unlock/${encodeURIComponent(token)}`);
  const text = await response.text();
  const hasCompletedCopy =
    text.includes("完整分析") || text.includes("48 小時") || text.includes("可直接使用");
  const pass = response.status === 200 && (!expectedReady || hasCompletedCopy);

  record(expectedReady ? "paid_access_unlock_completed_page" : "paid_access_unlock_page", pass ? "pass" : "fail", {
    httpStatus: response.status,
    completedContentSignal: expectedReady ? hasCompletedCopy : null,
  });

  return pass;
}

async function waitForReady(token, labelPrefix = "paid_status_after_processor_attempt", attempts = 8) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const status = await pollPaidStatus(token, `${labelPrefix}_${attempt}`);

    if (status === "completed") {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  return false;
}

async function main() {
  record("secret_preflight", operatorSecret ? "pass" : "blocked", {
    OPERATOR_TEST_SECRET: operatorSecret ? "present" : "missing",
    INTERNAL_JOB_SECRET: internalJobSecret ? "present" : "missing",
    processorMode: queueMode ? "queue" : "manual",
  });

  const healthOk = await healthPreflight();
  const gateOk = await fakePaidGatePreflight();
  const invalidPaOk = await invalidPaidAccessRegression();

  if (!healthOk || !gateOk || !invalidPaOk) {
    record("final_summary", "blocked", {
      reason: "preflight_failed",
      fullQaPassed: false,
    });
    process.exitCode = 1;
    return;
  }

  if (!operatorSecret) {
    record("final_summary", "blocked", {
      reason: "operator_secret_missing",
      fullQaPassed: false,
    });
    process.exitCode = 2;
    return;
  }

  const resultId = await createSourceResult();
  const legacyOk = await createLegacyUnlock(resultId);
  const idempotencyKey = `secret-safe-${crypto.randomUUID()}`;

  const first = await fakePaidSuccess(resultId, idempotencyKey);
  const firstSummary = summarizeFakePaidResponse(first);
  record("fake_paid_authorized_first", firstSummary.ok ? "pass" : "fail", firstSummary);

  const paidAccessToken = first.json?.paidAccessToken ?? null;
  if (!firstSummary.ok) {
    record("final_summary", "blocked", {
      reason: firstSummary.error ?? "fake_paid_authorized_failed",
      fullQaPassed: false,
    });
    process.exitCode = 4;
    return;
  }

  assertTokenAvailable(paidAccessToken);

  const second = await fakePaidSuccess(resultId, idempotencyKey);
  const secondSummary = summarizeFakePaidResponse(second);
  const idsReused =
    first.json?.paymentIntentId === second.json?.paymentIntentId &&
    first.json?.entitlementId === second.json?.entitlementId &&
    first.json?.generationJobId === second.json?.generationJobId;
  const secondTokenReturned = Boolean(second.json?.paidAccessToken);
  const idempotencyPass = secondSummary.ok && idsReused && !secondTokenReturned;
  const queueTriggerPass = queueMode
    ? firstSummary.queueTriggerOk === true &&
      firstSummary.queueTriggerCategory === "enqueued" &&
      firstSummary.queueTriggerProvider === "vercel_queue"
    : true;

  record("fake_paid_idempotency", idempotencyPass ? "pass" : "fail", {
    ...secondSummary,
    idsReused,
    secondPaidAccessTokenReturned: secondTokenReturned,
  });

  await pollPaidStatus(paidAccessToken, "paid_status_before_processor");
  await verifyPaidUnlockPage(paidAccessToken, false);

  if (queueMode) {
    record("queue_trigger_result", queueTriggerPass ? "pass" : "fail", {
      queueTriggerOk: firstSummary.queueTriggerOk,
      queueTriggerCategory: firstSummary.queueTriggerCategory,
      queueTriggerProvider: firstSummary.queueTriggerProvider,
      generationJobIdPresent: firstSummary.generationJobIdPresent,
    });

    const ready = queueTriggerPass
      ? await waitForReady(paidAccessToken, "paid_status_after_queue_attempt", 20)
      : false;
    const completedPageOk = ready ? await verifyPaidUnlockPage(paidAccessToken, true) : false;
    const fullQaPassed = Boolean(
      firstSummary.ok &&
        idempotencyPass &&
        legacyOk &&
        queueTriggerPass &&
        ready &&
        completedPageOk,
    );

    record("final_summary", fullQaPassed ? "pass" : "fail", {
      fullQaPassed,
      idempotencyPassed: idempotencyPass,
      queueTriggerPassed: queueTriggerPass,
      processorMode: "queue",
      paidStatusReady: ready,
      exactJobProcessed: ready,
      paUnlockCompletedRenderingPassed: completedPageOk,
      legacyRegressionPassed: legacyOk,
    });

    process.exitCode = fullQaPassed ? 0 : 4;
    return;
  }

  if (!internalJobSecret) {
    record("final_summary", "partial", {
      reason: "internal_job_secret_missing",
      fullQaPassed: false,
      legacyRegressionPassed: legacyOk,
      idempotencyPassed: idempotencyPass,
    });
    process.exitCode = 3;
    return;
  }

  const processorOk = await processPaidGenerationJob();
  const ready = processorOk ? await waitForReady(paidAccessToken) : false;
  const completedPageOk = ready ? await verifyPaidUnlockPage(paidAccessToken, true) : false;
  const fullQaPassed = Boolean(
    firstSummary.ok &&
      idempotencyPass &&
      legacyOk &&
      processorOk &&
      ready &&
      completedPageOk,
  );

  record("final_summary", fullQaPassed ? "pass" : "fail", {
    fullQaPassed,
    idempotencyPassed: idempotencyPass,
    processorPassed: processorOk,
    paidStatusReady: ready,
    paUnlockCompletedRenderingPassed: completedPageOk,
    legacyRegressionPassed: legacyOk,
  });

  process.exitCode = fullQaPassed ? 0 : 4;
}

main().catch((error) => {
  record("runner_error", "fail", {
    error: error instanceof Error ? error.message : "unknown_error",
  });
  process.exitCode = 1;
});
