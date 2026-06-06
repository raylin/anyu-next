import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MODULE = "ai-temperature";
const MODULE_SLUG = "ambiguous-temperature";
const MIN_VISIBLE_LENGTH = 80;
const FIXTURE_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../src/tests/fixtures/module01/valid-analyze-request.json",
);
const DEFAULT_OUTPUT_DIR = ".qa";
const REQUEST_OUTPUT_FILE = "module01-valid-analyze-request.json";
const SUMMARY_OUTPUT_FILE = "module01-smoke-fixture-summary.json";
const ALLOWED_SITUATIONS = new Set([
  "已讀不回",
  "忽冷忽熱",
  "回訊變慢但看限動",
  "不確定 / 跳過",
]);
const ALLOWED_USER_CONTEXT = {
  relationshipStage: new Set(["剛認識", "曖昧中", "見過幾次", "曾經比較靠近", "不確定 / 跳過"]),
  userGoal: new Set(["我該怎麼回", "我要不要主動", "想確認對方投入", "想自然推進", "想保留尊嚴", "不確定 / 跳過"]),
  primaryPain: new Set(["回覆變慢", "有互動但不約", "已讀不回", "忽冷忽熱", "怕自己太主動", "不確定 / 跳過"]),
  replyTone: new Set(["有界線但不冷", "輕鬆像聊天", "自然一點", "低壓試探", "坦白但不施壓", "不確定 / 跳過"]),
};
const TOKEN_LIKE_PATTERNS = [
  /pa_[A-Za-z0-9_-]{8,}/u,
  /pcs_[A-Za-z0-9_-]{8,}/u,
  /pal_[A-Za-z0-9_-]{8,}/u,
  /prl_[A-Za-z0-9_-]{8,}/u,
  /\/r\/[A-Za-z0-9_-]{12,}/u,
  /TradeInfo/iu,
  /TradeSha/iu,
  /encrypted_recipient/iu,
  /recipient_hash/iu,
  /contact_hash/iu,
  /provider_payload/iu,
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/iu,
];

function getVisibleAnalyzeLength(input) {
  return String(input ?? "").trim().replace(/\s+/gu, "").length;
}

function loadModule01ValidAnalyzeFixture() {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8"));
}

function createModule01AnalyzeRequest(options = {}) {
  const fixture = loadModule01ValidAnalyzeFixture();
  const suffix = options.suffix?.trim();
  const sessionPrefix = options.sessionPrefix?.trim() || "module01-smoke-fixture";
  const request = structuredClone(fixture.request);

  request.text = suffix ? `${request.text}\n\n${suffix}` : request.text;
  request.anonymousSessionId =
    options.anonymousSessionId?.trim() || `${sessionPrefix}-${crypto.randomUUID()}`;

  if (options.userContext && typeof options.userContext === "object") {
    request.userContext = {
      ...request.userContext,
      ...options.userContext,
    };
  }

  return request;
}

function validateModule01AnalyzeRequest(request) {
  const blockers = [];
  const warnings = [];
  const userContext = request?.userContext && typeof request.userContext === "object"
    ? request.userContext
    : {};
  const userContextKeys = Object.keys(userContext);
  const visibleLength = getVisibleAnalyzeLength(request?.text);

  if (visibleLength < MIN_VISIBLE_LENGTH) {
    blockers.push("visible_length_too_short");
  }

  if (!ALLOWED_SITUATIONS.has(request?.situation)) {
    blockers.push("invalid_situation");
  }

  for (const key of userContextKeys) {
    const allowed = ALLOWED_USER_CONTEXT[key];
    const value = userContext[key];

    if (!allowed || typeof value !== "string" || !allowed.has(value)) {
      blockers.push(`invalid_user_context_${key}`);
    }
  }

  if (userContextKeys.length === 0) {
    warnings.push("no_user_context");
  }

  return {
    validationStatus: blockers.length === 0 ? "pass" : "blocked",
    visibleLengthPass: visibleLength >= MIN_VISIBLE_LENGTH,
    visibleLengthCategory:
      visibleLength >= 240 ? "rich" : visibleLength >= 140 ? "recommended" : "minimum_pass",
    userContextKeys,
    blockers,
    warnings,
  };
}

function assertSafeModule01SmokeFixtureOutput(value) {
  const serialized = JSON.stringify(value);

  for (const pattern of TOKEN_LIKE_PATTERNS) {
    if (pattern.test(serialized)) {
      throw new Error("module01_smoke_fixture_output_not_sanitized");
    }
  }
}

function buildModule01SmokeFixtureArtifacts(options = {}) {
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const fixture = loadModule01ValidAnalyzeFixture();
  const request = createModule01AnalyzeRequest({
    sessionPrefix: options.sessionPrefix,
    suffix: options.suffix,
    anonymousSessionId: options.anonymousSessionId,
  });
  const validation = validateModule01AnalyzeRequest(request);
  const summary = {
    module: MODULE,
    moduleSlug: MODULE_SLUG,
    command: "qa:module01:smoke-fixture",
    status: validation.validationStatus,
    generatedAt,
    fixtureName: fixture.fixtureName,
    validationStatus: validation.validationStatus,
    visibleLengthPass: validation.visibleLengthPass,
    visibleLengthCategory: validation.visibleLengthCategory,
    userContextKeys: validation.userContextKeys,
    intendedUse: fixture.intendedUse,
    requestArtifact: path.join(DEFAULT_OUTPUT_DIR, REQUEST_OUTPUT_FILE),
    blockers: validation.blockers,
    warnings: validation.warnings,
    containsPrivateData: false,
    containsTokenizedUrl: false,
    sendsRealEmail: false,
    sendsRealLine: false,
    mutatesData: false,
    productionTouched: false,
    nextRequiredAction:
      validation.validationStatus === "pass"
        ? "use_this_fixture_for_smoke_prep_before_runtime_enablement"
        : "fix_module01_valid_analyze_fixture",
  };

  assertSafeModule01SmokeFixtureOutput(summary);
  assertSafeModule01SmokeFixtureOutput(request);

  return {
    request,
    summary,
  };
}

function writeModule01SmokeFixtureArtifacts(options = {}) {
  const outputDir = path.resolve(process.cwd(), options.outputDir ?? DEFAULT_OUTPUT_DIR);
  const artifacts = buildModule01SmokeFixtureArtifacts(options);
  const requestPath = path.join(outputDir, REQUEST_OUTPUT_FILE);
  const summaryPath = path.join(outputDir, SUMMARY_OUTPUT_FILE);
  const summary = {
    ...artifacts.summary,
    requestArtifact: path.relative(process.cwd(), requestPath),
  };

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(requestPath, `${JSON.stringify(artifacts.request, null, 2)}\n`);
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);

  return {
    requestPath,
    summaryPath,
    request: artifacts.request,
    summary,
  };
}

export {
  DEFAULT_OUTPUT_DIR,
  FIXTURE_PATH,
  MODULE,
  MODULE_SLUG,
  REQUEST_OUTPUT_FILE,
  SUMMARY_OUTPUT_FILE,
  assertSafeModule01SmokeFixtureOutput,
  buildModule01SmokeFixtureArtifacts,
  createModule01AnalyzeRequest,
  getVisibleAnalyzeLength,
  loadModule01ValidAnalyzeFixture,
  validateModule01AnalyzeRequest,
  writeModule01SmokeFixtureArtifacts,
};
