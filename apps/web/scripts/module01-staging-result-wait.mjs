#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import {
  resolveAdminTokenForQa,
  summarizeAdminTokenForQa,
} from "./lib/admin-token-for-qa.mjs";

const MODULE = "ai-temperature";
const OUTPUT_DIR = ".qa";
const OUTPUT_PATH = path.join(OUTPUT_DIR, "module01-staging-result-wait-summary.json");
const BASE_URL_BY_ENV = {
  staging: "https://staging.anyu.tw",
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

function parseArgs(argv) {
  const args = {
    env: "",
    resultId: "",
    timeoutMs: 60_000,
    intervalMs: 3_000,
    json: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--env") {
      args.env = argv[index + 1] ?? "";
      index += 1;
    } else if (arg === "--result-id") {
      args.resultId = argv[index + 1] ?? "";
      index += 1;
    } else if (arg === "--timeout") {
      args.timeoutMs = Number(argv[index + 1] ?? args.timeoutMs);
      index += 1;
    } else if (arg === "--interval") {
      args.intervalMs = Number(argv[index + 1] ?? args.intervalMs);
      index += 1;
    } else if (arg === "--json") {
      args.json = true;
    }
  }

  return args;
}

function buildAccessLinkStatus(lookup) {
  const links = lookup?.accessLinks ?? {};

  return {
    email: {
      contactSaved: Boolean(links.email?.contactSaved),
      sent: Boolean(links.email?.sent),
      active: Boolean(links.email?.active),
    },
    line: {
      contactSaved: Boolean(links.line?.contactSaved),
      recipientSecretExists: Boolean(links.line?.recipientSecretExists),
      sent: Boolean(links.line?.sent),
      active: Boolean(links.line?.active),
    },
  };
}

function buildWaitSummary(input) {
  const lookup = input.lookup ?? null;
  const paidResultStatus = lookup?.result?.paidResultStatus ?? null;
  const paymentStatus = lookup?.payment?.status ?? null;
  const generationStatus = lookup?.generation?.status ?? null;
  const paidReady =
    paidResultStatus === "completed" &&
    lookup?.result?.deliveryArtifactReady === true &&
    generationStatus === "completed";
  const status = input.status ?? (paidReady ? "pass" : "partial");
  const nextAction =
    input.nextAction ??
    (status === "pass"
      ? "no_action_needed"
      : status === "timeout"
        ? "inspect_admin_lookup_or_processor_state"
        : "wait_or_debug_current_result_state");

  return {
    module: MODULE,
    environment: input.environment,
    command: "qa:module01:wait-result",
    status,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    resultIdPresent: Boolean(input.resultId),
    resultIdSourceCategory: input.resultIdSourceCategory ?? "explicit_staging_result_id",
    paidResultStatus,
    paymentStatus,
    generationStatus,
    accessLinkStatus: buildAccessLinkStatus(lookup),
    attempts: input.attempts ?? 0,
    blockers: input.blockers ?? [],
    warnings: input.warnings ?? [],
    adminToken: input.adminToken ?? null,
    nextAction,
    sendsRealEmail: false,
    sendsRealLine: false,
    mutatesData: false,
    productionTouched: false,
  };
}

function assertSafeSummary(summary) {
  const serialized = JSON.stringify(summary);

  for (const pattern of TOKEN_LIKE_PATTERNS) {
    if (pattern.test(serialized)) {
      throw new Error("module01_wait_summary_not_sanitized");
    }
  }

  return summary;
}

function writeSummary(summary, outputPath = path.resolve(process.cwd(), OUTPUT_PATH)) {
  const safeSummary = assertSafeSummary(summary);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(safeSummary, null, 2)}\n`);
  return outputPath;
}

async function requestLookup({ baseUrl, resultId, token }) {
  const response = await fetch(
    `${baseUrl}/api/admin/paid-results/${encodeURIComponent(resultId)}`,
    {
      headers: {
        "x-admin-api-token": token,
      },
    },
  );
  const text = await response.text();
  let json = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  return { status: response.status, json };
}

async function waitForResult({ env, resultId, timeoutMs, intervalMs, token }) {
  const baseUrl = BASE_URL_BY_ENV[env];
  const startedAt = Date.now();
  let attempts = 0;
  let lastLookup = null;

  while (Date.now() - startedAt <= timeoutMs) {
    attempts += 1;
    const lookup = await requestLookup({ baseUrl, resultId, token });

    if (lookup.status === 401) {
      return buildWaitSummary({
        environment: env,
        resultId,
        status: "blocked",
        attempts,
        blockers: ["admin_auth_failed"],
        nextAction: "set_valid_admin_api_token",
      });
    }

    if (lookup.status === 404) {
      return buildWaitSummary({
        environment: env,
        resultId,
        status: "blocked",
        attempts,
        blockers: ["result_not_found"],
        nextAction: "verify_staging_result_id",
      });
    }

    if (lookup.status !== 200 || lookup.json?.ok !== true) {
      return buildWaitSummary({
        environment: env,
        resultId,
        status: "blocked",
        attempts,
        blockers: ["admin_lookup_failed"],
        nextAction: "inspect_admin_api_response",
      });
    }

    lastLookup = lookup.json;
    const summary = buildWaitSummary({
      environment: env,
      resultId,
      attempts,
      lookup: lastLookup,
    });

    if (summary.status === "pass") {
      return summary;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return buildWaitSummary({
    environment: env,
    resultId,
    status: "timeout",
    attempts,
    lookup: lastLookup,
    nextAction: "inspect_admin_lookup_or_processor_state",
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const tokenResolution = resolveAdminTokenForQa({ targetEnv: args.env || "staging" });
  const adminToken = summarizeAdminTokenForQa(tokenResolution);

  if (!args.env || !BASE_URL_BY_ENV[args.env]) {
    console.error(JSON.stringify({ ok: false, error: "env_required" }));
    process.exitCode = 2;
    return;
  }

  if (!args.resultId) {
    console.error(JSON.stringify({ ok: false, error: "result_id_missing" }));
    process.exitCode = 2;
    return;
  }

  if (!tokenResolution.token) {
    const summary = buildWaitSummary({
      environment: args.env,
      resultId: args.resultId,
      status: "blocked",
      blockers: ["staging_admin_token_unavailable_owner_action_required"],
      adminToken,
      nextAction: "provide_preview_admin_api_token_in_process_env_or_staging_mirror",
    });
    writeSummary(summary);
    console.error(
      JSON.stringify({
        ok: false,
        error: "staging_admin_token_unavailable_owner_action_required",
        adminToken,
      }),
    );
    process.exitCode = 2;
    return;
  }

  const waitSummary = await waitForResult({
    env: args.env,
    resultId: args.resultId,
    timeoutMs: Number.isFinite(args.timeoutMs) ? args.timeoutMs : 60_000,
    intervalMs: Number.isFinite(args.intervalMs) ? args.intervalMs : 3_000,
    token: tokenResolution.token,
  });
  const summary = {
    ...waitSummary,
    adminToken,
  };
  const outputPath = writeSummary(summary);

  if (args.json) {
    console.log(JSON.stringify({ ok: summary.status === "pass", outputPath, summary }, null, 2));
  } else {
    console.log(
      [
        "ANYU QA: Module 01 result wait",
        `Env: ${summary.environment}`,
        `Status: ${summary.status}`,
        `Paid result: ${summary.paidResultStatus ?? "unknown"}`,
        `Generation: ${summary.generationStatus ?? "unknown"}`,
        `Next action: ${summary.nextAction}`,
      ].join("\n"),
    );
  }

  if (summary.status === "blocked" || summary.status === "timeout") {
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main().catch((error) => {
    console.error(JSON.stringify({ ok: false, error: error?.message ?? "unknown_error" }));
    process.exitCode = 1;
  });
}

export {
  assertSafeSummary,
  buildAccessLinkStatus,
  buildWaitSummary,
  parseArgs,
  waitForResult,
};
