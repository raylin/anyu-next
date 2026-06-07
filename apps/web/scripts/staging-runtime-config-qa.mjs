#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  resolveAdminTokenForQa,
  summarizeAdminTokenForQa,
} from "./lib/admin-token-for-qa.mjs";

const EXPECTED = [
  {
    key: "payment.window.enabled",
    scope: ["--module", "ai-temperature"],
    expectedValue: true,
  },
  {
    key: "payment.global.disabled",
    scope: ["--global"],
    expectedValue: false,
  },
];
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

function isSafe(value) {
  return !TOKEN_LIKE_PATTERNS.some((pattern) => pattern.test(JSON.stringify(value)));
}

function runConfigGet(input, token) {
  const rootDir = path.resolve(process.cwd(), "../..");
  const args = [
    "pnpm",
    "--silent",
    "ops",
    "config",
    "get",
    "--env",
    "staging",
    input.key,
    ...input.scope,
    "--json",
  ];
  const result = spawnSync("corepack", args, {
    cwd: rootDir,
    env: {
      ...process.env,
      ADMIN_API_TOKEN: token,
    },
    encoding: "utf8",
  });
  const parsed = parseJsonOutput(result.stdout ?? "");

  return {
    key: input.key,
    commandStatus: result.status ?? 1,
    parsed,
    stderrPresent: Boolean(result.stderr?.trim()),
  };
}

function valueFromConfigResponse(parsed) {
  return parsed?.response?.config?.value ?? parsed?.value?.value ?? parsed?.config?.value ?? parsed?.value ?? null;
}

function buildSummary(results, tokenResolution) {
  const checks = results.map((result) => {
    const expected = EXPECTED.find((item) => item.key === result.key);
    const value = valueFromConfigResponse(result.parsed);
    const pass =
      result.commandStatus === 0 &&
      result.parsed?.ok === true &&
      value === expected?.expectedValue &&
      isSafe(result.parsed);

    return {
      key: result.key,
      status: pass ? "pass" : "blocked",
      valueMatchesExpected: value === expected?.expectedValue,
      value: typeof value === "boolean" ? value : null,
      responseSanitized: Boolean(result.parsed && isSafe(result.parsed)),
      commandExitCode: result.commandStatus,
    };
  });
  const pass = checks.every((check) => check.status === "pass");

  return {
    step: "staging_runtime_config_summary",
    status: pass ? "pass" : "blocked",
    gateStatus: pass ? "pass" : "blocked",
    commandExitCode: pass ? 0 : 1,
    environment: "staging",
    adminToken: summarizeAdminTokenForQa(tokenResolution),
    checks,
    valuesPrinted: false,
    lengthsPrinted: false,
    prefixesPrinted: false,
    suffixesPrinted: false,
    hashesPrinted: false,
    checksumsPrinted: false,
  };
}

function main() {
  const tokenResolution = resolveAdminTokenForQa({ targetEnv: "staging" });

  if (!tokenResolution.token) {
    console.log(JSON.stringify({
      step: "staging_runtime_config_summary",
      status: "blocked",
      gateStatus: "blocked",
      commandExitCode: 1,
      environment: "staging",
      category: "staging_admin_token_unavailable_owner_action_required",
      adminToken: summarizeAdminTokenForQa(tokenResolution),
      valuesPrinted: false,
      lengthsPrinted: false,
      prefixesPrinted: false,
      suffixesPrinted: false,
      hashesPrinted: false,
      checksumsPrinted: false,
    }));
    process.exitCode = 1;
    return;
  }

  const results = EXPECTED.map((item) => runConfigGet(item, tokenResolution.token));
  const summary = buildSummary(results, tokenResolution);

  console.log(JSON.stringify(summary));
  process.exitCode = summary.status === "pass" ? 0 : 1;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main();
}

export { buildSummary, parseJsonOutput, valueFromConfigResponse };
