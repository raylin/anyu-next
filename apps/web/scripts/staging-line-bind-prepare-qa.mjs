#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

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
import { REQUEST_OUTPUT_FILE } from "./lib/module01-smoke-fixture.mjs";

if (process.env.QA_LINE_BIND_PREP_DISABLE_LOCAL_ENV !== "1") {
  loadLocalEnv();
}

const DEFAULT_BASE_URL = "https://staging.anyu.tw";
const MODULE_SLUG = "ambiguous-temperature";
const OUTPUT_DIR = ".qa";
const ARTIFACT_FILE = "module01-staging-line-bind-artifact.json";
const MOBILE_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148";

const baseUrl = normalizeBaseUrl(process.env.QA_LINE_BIND_PREP_BASE_URL, DEFAULT_BASE_URL);
const operatorSecret = process.env.OPERATOR_TEST_SECRET?.trim() ?? "";

function record(step, outcome, details = {}) {
  console.log(JSON.stringify(sanitizeRecord({ step, outcome, ...details })));
}

function readFixtureRequest(inputPath = path.resolve(process.cwd(), OUTPUT_DIR, REQUEST_OUTPUT_FILE)) {
  return JSON.parse(fs.readFileSync(inputPath, "utf8"));
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
  const body = result.json ?? {};
  const pass = result.status === 200 && body.environment === "preview" && body.gitBranch === "staging";

  record("staging_health", pass ? "pass" : "fail", {
    httpStatus: result.status,
    environment: body.environment ?? null,
    gitBranch: body.gitBranch ?? null,
    gitCommit: body.gitCommit ?? null,
    routeBundleVersion: body.routeBundleVersion ?? null,
  });

  if (!pass) {
    throw new Error("staging_health_failed");
  }
}

async function createSourceResult() {
  const analyzeRequest = readFixtureRequest();
  const result = await requestJson(`${baseUrl}/api/modules/${MODULE_SLUG}/analyze`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-operator-test-secret": operatorSecret,
    },
    body: JSON.stringify(analyzeRequest),
  });
  const resultId = result.json?.resultId ?? null;
  const cacheHit = result.json?.cacheHit ?? null;
  const pass =
    result.status === 200 &&
    result.json?.ok === true &&
    typeof resultId === "string" &&
    cacheHit === false;

  record("source_analyze", pass ? "pass" : "fail", {
    httpStatus: result.status,
    resultIdPresent: Boolean(resultId),
    cacheHit,
    error: result.json?.error ?? null,
  });

  if (!pass) {
    throw new Error(cacheHit === true ? "staging_result_cache_hit" : "staging_result_creation_failed");
  }

  return resultId;
}

async function verifyResultPage(resultId) {
  const response = await fetch(`${baseUrl}/m/${MODULE_SLUG}/result/${encodeURIComponent(resultId)}`);
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

async function verifyMobileCheckout(checkoutHref) {
  const checkoutUrl = new URL(checkoutHref, baseUrl);
  const response = await fetch(checkoutUrl, {
    headers: {
      "user-agent": MOBILE_USER_AGENT,
    },
  });
  const html = await response.text();
  const summary = summarizeCheckoutStartHtml(html);
  const lineIndex = html.indexOf("建議用 LINE 保存查看連結");
  const emailIndex = html.indexOf("Email 備用查看連結");
  const lineBeforeEmail = lineIndex >= 0 && emailIndex >= 0 && lineIndex < emailIndex;
  const reportBodyPromisePresent = html
    .replaceAll("不會包含完整報告內容", "")
    .includes("包含完整報告內容");
  const pass =
    response.status === 200 &&
    summary.recoverySoftGatePresent &&
    summary.recoveryLineFirstMobilePresent &&
    lineBeforeEmail &&
    summary.paymentLockedPresent &&
    summary.pricePresent &&
    summary.oneTimePresent &&
    summary.nonSubscriptionPresent &&
    summary.forbiddenCopyFound.length === 0 &&
    summary.secretNameLeaksFound.length === 0 &&
    !html.includes("短碼") &&
    !reportBodyPromisePresent;

  record("mobile_checkout_line_ready", pass ? "pass" : "fail", {
    httpStatus: response.status,
    checkoutHrefShape: redactRouteShape(checkoutUrl.pathname),
    lineBindHrefPresent: html.includes("用 LINE 保存查看連結"),
    lineBeforeEmail,
    noLegacyShortCodeCopy: !html.includes("短碼"),
    noReportBodyPromise: !reportBodyPromisePresent,
    ...summary,
    providerFieldValuesPrinted: false,
  });

  if (!pass) {
    throw new Error("mobile_checkout_line_not_ready");
  }

  return checkoutUrl;
}

function writeArtifact({ resultId, checkoutUrl }) {
  const outputPath = path.resolve(process.cwd(), OUTPUT_DIR, ARTIFACT_FILE);
  const artifact = sanitizeRecord({
    module: "ai-temperature",
    moduleSlug: MODULE_SLUG,
    environment: "staging",
    command: "qa:module01:staging-line-bind:prepare",
    status: "pass",
    resultId,
    resultIdPresent: true,
    resultIdSourceCategory: "staging_runtime_line_bind",
    checkoutPath: checkoutUrl.pathname,
    checkoutPathPrinted: true,
    checkoutUrlPrinted: false,
    tokenizedUrlPresent: false,
    generatedAt: new Date().toISOString(),
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(artifact, null, 2)}\n`);
  return outputPath;
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
  });

  if (!operatorSecret) {
    process.exitCode = 2;
    return;
  }

  await healthPreflight();
  const resultId = await createSourceResult();
  const checkoutHref = await verifyResultPage(resultId);
  const checkoutUrl = await verifyMobileCheckout(checkoutHref);
  const artifactPath = writeArtifact({ resultId, checkoutUrl });

  record("line_bind_prepare_summary", "pass", {
    artifactPath,
    resultIdPresent: true,
    resultIdSourceCategory: "staging_runtime_line_bind",
    checkoutPathShape: redactRouteShape(checkoutUrl.pathname),
    checkoutUrlPrinted: false,
    tokenizedUrlPresent: false,
    sendsRealEmail: false,
    sendsRealLine: false,
    productionTouched: false,
  });
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main().catch((error) => {
    record("runner_error", "fail", {
      error: error instanceof Error ? error.message : "unknown_error",
    });
    process.exitCode = 1;
  });
}

export { readFixtureRequest };
