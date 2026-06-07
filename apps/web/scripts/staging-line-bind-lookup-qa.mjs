#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import {
  resolveAdminTokenForQa,
  summarizeAdminTokenForQa,
} from "./lib/admin-token-for-qa.mjs";

const OUTPUT_DIR = ".qa";
const OUTPUT_FILE = "module01-staging-line-bind-lookup-summary.json";
const TOKEN_LIKE_PATTERNS = [
  /pa_[A-Za-z0-9_-]{8,}/u,
  /pcs_[A-Za-z0-9_-]{8,}/u,
  /pal_[A-Za-z0-9_-]{8,}/u,
  /prl_[A-Za-z0-9_-]{8,}/u,
  /rlb_[A-Za-z0-9_-]{8,}/u,
  /\/r\/[A-Za-z0-9_-]{12,}/u,
  /token_hash/iu,
  /contact_hash/iu,
  /recipient_hash/iu,
  /encrypted_recipient/iu,
  /provider_payload/iu,
  /tradeinfo/iu,
  /tradesha/iu,
  /idtoken/iu,
  /liff\.state/iu,
  /lineuserid/iu,
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/iu,
];

function parseArgs(argv) {
  const args = {
    resultId: "",
    json: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--result-id") {
      args.resultId = argv[index + 1] ?? "";
      index += 1;
    } else if (arg === "--json") {
      args.json = true;
    } else if (arg !== "--") {
      throw new Error(`unknown_argument:${arg}`);
    }
  }

  return args;
}

function parseJsonOutput(stdout) {
  const jsonStart = stdout.indexOf("{");

  if (jsonStart === -1) {
    return null;
  }

  try {
    return JSON.parse(stdout.slice(jsonStart));
  } catch {
    return null;
  }
}

function assertSafePayload(value) {
  const serialized = JSON.stringify(value);

  for (const pattern of TOKEN_LIKE_PATTERNS) {
    if (pattern.test(serialized)) {
      throw new Error("staging_line_bind_lookup_not_sanitized");
    }
  }
}

function runOps(args, token) {
  const result = spawnSync("corepack", ["pnpm", "--silent", "ops", ...args, "--json"], {
    cwd: path.resolve(process.cwd(), "../.."),
    env: {
      ...process.env,
      ADMIN_API_TOKEN: token,
    },
    encoding: "utf8",
  });

  return {
    status: result.status ?? 1,
    parsed: parseJsonOutput(result.stdout ?? ""),
    stderr: result.stderr?.trim() ?? "",
  };
}

function buildSummary({ resultId, tokenResolution, lineBindResult, lookupResult }) {
  const diagnostics = lineBindResult.parsed?.diagnostics ?? null;
  const lookup = lookupResult.parsed?.lookup ?? null;
  const lineAccess = lookup?.accessLinks?.line ?? null;
  const lineDiagnosticsPass =
    lineBindResult.status === 0 &&
    lineBindResult.parsed?.ok === true &&
    diagnostics?.latestStatus === "succeeded";
  const lookupPass =
    lookupResult.status === 0 &&
    lookupResult.parsed?.ok === true &&
    lineAccess?.contactSaved === true &&
    lineAccess?.recipientSecretExists === true &&
    lineAccess?.deliverable === true;
  const pass = lineDiagnosticsPass && lookupPass;
  const summary = {
    module: "ai-temperature",
    moduleSlug: "ambiguous-temperature",
    environment: "staging",
    command: "qa:module01:staging-line-bind:lookup",
    status: pass ? "pass" : "blocked",
    gateStatus: pass ? "pass" : "blocked",
    resultIdPresent: Boolean(resultId),
    resultIdSourceCategory: "staging_runtime_line_bind",
    adminToken: summarizeAdminTokenForQa(tokenResolution),
    lineBindDiagnostics: {
      commandExitCode: lineBindResult.status,
      ok: lineBindResult.parsed?.ok === true,
      latestCategory: diagnostics?.latestCategory ?? null,
      latestStage: diagnostics?.latestStage ?? null,
      latestStatus: diagnostics?.latestStatus ?? null,
      eventCount: typeof diagnostics?.eventCount === "number" ? diagnostics.eventCount : null,
      recommendedActions: Array.isArray(diagnostics?.recommendedActions)
        ? diagnostics.recommendedActions
        : [],
      responseSanitized: Boolean(lineBindResult.parsed),
    },
    lookupResult: {
      commandExitCode: lookupResult.status,
      ok: lookupResult.parsed?.ok === true,
      lineContactSaved: lineAccess?.contactSaved === true,
      recipientSecretExists: lineAccess?.recipientSecretExists === true,
      deliverable: lineAccess?.deliverable === true,
      latestContactStatus: lineAccess?.latestContactStatus ?? null,
      latestSaveCategory: lineAccess?.latestSaveCategory ?? null,
      latestSaveStatus: lineAccess?.latestSaveStatus ?? null,
      diagnosis: Array.isArray(lookup?.diagnosis) ? lookup.diagnosis : [],
      responseSanitized: Boolean(lookupResult.parsed),
    },
    blockers: pass
      ? []
      : [
          lineDiagnosticsPass ? null : "line_bind_diagnostics_not_success",
          lookupPass ? null : "line_contact_not_deliverable",
        ].filter(Boolean),
    valuesPrinted: false,
    lengthsPrinted: false,
    prefixesPrinted: false,
    suffixesPrinted: false,
    hashesPrinted: false,
    checksumsPrinted: false,
    sendsRealEmail: false,
    sendsRealLine: false,
    productionTouched: false,
  };

  assertSafePayload(summary);
  return summary;
}

function writeSummary(summary) {
  const outputPath = path.resolve(process.cwd(), OUTPUT_DIR, OUTPUT_FILE);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`);

  return outputPath;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const tokenResolution = resolveAdminTokenForQa({ targetEnv: "staging" });

  if (!args.resultId) {
    console.error(JSON.stringify({ ok: false, error: "result_id_missing" }));
    process.exitCode = 2;
    return;
  }

  if (!tokenResolution.token) {
    const summary = {
      module: "ai-temperature",
      environment: "staging",
      command: "qa:module01:staging-line-bind:lookup",
      status: "blocked",
      gateStatus: "blocked",
      resultIdPresent: true,
      adminToken: summarizeAdminTokenForQa(tokenResolution),
      blockers: ["staging_admin_token_unavailable_owner_action_required"],
      valuesPrinted: false,
      lengthsPrinted: false,
      prefixesPrinted: false,
      suffixesPrinted: false,
      hashesPrinted: false,
      checksumsPrinted: false,
    };
    writeSummary(summary);
    console.error(JSON.stringify({ ok: false, error: "staging_admin_token_unavailable_owner_action_required" }));
    process.exitCode = 2;
    return;
  }

  const lineBindResult = runOps(
    ["lookup-line-bind", "--env", "staging", "--result-id", args.resultId],
    tokenResolution.token,
  );
  const lookupResult = runOps(
    ["lookup-result", "--env", "staging", "--id", args.resultId],
    tokenResolution.token,
  );
  const summary = buildSummary({
    resultId: args.resultId,
    tokenResolution,
    lineBindResult,
    lookupResult,
  });
  const outputPath = writeSummary(summary);

  if (args.json) {
    console.log(JSON.stringify({ ok: summary.status === "pass", outputPath, summary }, null, 2));
  } else {
    console.log(
      [
        "ANYU QA: staging LINE bind lookup",
        `Status: ${summary.status}`,
        `Latest category: ${summary.lineBindDiagnostics.latestCategory ?? "unknown"}`,
        `Recipient secret: ${summary.lookupResult.recipientSecretExists ? "yes" : "no"}`,
        `Deliverable: ${summary.lookupResult.deliverable ? "yes" : "no"}`,
      ].join("\n"),
    );
  }

  process.exitCode = summary.status === "pass" ? 0 : 1;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main();
}

export { buildSummary, parseArgs, parseJsonOutput };
