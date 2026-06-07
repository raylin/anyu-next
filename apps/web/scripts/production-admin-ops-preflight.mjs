#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";

const COMMANDS = [
  {
    id: "payment_window_get",
    args: [
      "pnpm",
      "--silent",
      "ops",
      "config",
      "get",
      "--env",
      "production",
      "payment.window.enabled",
      "--module",
      "ai-temperature",
      "--json",
    ],
  },
  {
    id: "payment_global_disabled_get",
    args: [
      "pnpm",
      "--silent",
      "ops",
      "config",
      "get",
      "--env",
      "production",
      "payment.global.disabled",
      "--global",
      "--json",
    ],
  },
  {
    id: "payment_window_history",
    args: [
      "pnpm",
      "--silent",
      "ops",
      "config",
      "history",
      "--env",
      "production",
      "payment.window.enabled",
      "--module",
      "ai-temperature",
      "--json",
    ],
  },
];

const TOKEN_LIKE_PATTERNS = [
  /ADMIN_API_TOKEN\s*=/iu,
  /x-admin-api-token/iu,
  /Bearer\s+[A-Za-z0-9._-]+/u,
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

function repoRootFromWebCwd(cwd = process.cwd()) {
  return path.resolve(cwd, "../..");
}

function containsUnsafeOutput(value) {
  const serialized = typeof value === "string" ? value : JSON.stringify(value);
  return TOKEN_LIKE_PATTERNS.some((pattern) => pattern.test(serialized));
}

function parseJsonOutput(stdout = "") {
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

function defaultRunCommand(command) {
  const result = spawnSync("corepack", command.args, {
    cwd: repoRootFromWebCwd(),
    env: process.env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function classifyCommandResult(result) {
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;

  if (/admin_token_missing/iu.test(output)) {
    return "production_admin_token_missing";
  }

  if (/admin_auth_failed|unauthorized|401/iu.test(output)) {
    return "production_admin_auth_failed";
  }

  if (containsUnsafeOutput(output)) {
    return "production_admin_config_lookup_failed";
  }

  if (result.status !== 0) {
    return "production_admin_config_lookup_failed";
  }

  const parsed = parseJsonOutput(result.stdout ?? "");

  if (!parsed || parsed.ok !== true || containsUnsafeOutput(parsed)) {
    return "production_admin_config_lookup_failed";
  }

  return "production_admin_ops_ready";
}

function buildCommandCheck(command, result) {
  const category = classifyCommandResult(result);
  const pass = category === "production_admin_ops_ready";

  return {
    id: command.id,
    status: pass ? "pass" : "blocked",
    category,
    commandExitCode: result.status ?? 1,
    responseSanitized: !containsUnsafeOutput(`${result.stdout ?? ""}\n${result.stderr ?? ""}`),
  };
}

function buildSummary({ env = process.env, runCommand = defaultRunCommand } = {}) {
  const tokenPresent = Boolean(env.ADMIN_API_TOKEN?.trim());

  if (!tokenPresent) {
    return {
      step: "production_admin_ops_preflight",
      environment: "production",
      status: "blocked",
      gateStatus: "blocked",
      commandExitCode: 1,
      adminOpsStatus: "production_admin_token_missing",
      category: "production_admin_token_missing_owner_action_required",
      checks: [],
      tokenSourceCategory: "missing",
      tokenPresent: false,
      valuesPrinted: false,
      lengthsPrinted: false,
      prefixesPrinted: false,
      suffixesPrinted: false,
      hashesPrinted: false,
      checksumsPrinted: false,
      productionTouched: true,
      mutatesData: false,
      recommendedNextAction: "owner_exports_admin_api_token_then_rerun_admin_ops_preflight",
    };
  }

  const checks = COMMANDS.map((command) => buildCommandCheck(command, runCommand(command)));
  const firstBlocked = checks.find((check) => check.status !== "pass");
  const adminOpsStatus = firstBlocked?.category ?? "production_admin_ops_ready";
  const pass = adminOpsStatus === "production_admin_ops_ready";

  return {
    step: "production_admin_ops_preflight",
    environment: "production",
    status: pass ? "pass" : "blocked",
    gateStatus: pass ? "pass" : "blocked",
    commandExitCode: pass ? 0 : 1,
    adminOpsStatus,
    category: adminOpsStatus,
    checks,
    tokenSourceCategory: "process_env",
    tokenPresent: true,
    valuesPrinted: false,
    lengthsPrinted: false,
    prefixesPrinted: false,
    suffixesPrinted: false,
    hashesPrinted: false,
    checksumsPrinted: false,
    productionTouched: true,
    mutatesData: false,
    recommendedNextAction: pass
      ? "continue_to_production_smoke_pre_open_gates"
      : "resolve_production_admin_ops_auth_before_runtime_open",
  };
}

function main() {
  const summary = buildSummary();
  console.log(JSON.stringify(summary, null, 2));
  process.exitCode = summary.status === "pass" ? 0 : 1;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main();
}

export {
  buildCommandCheck,
  buildSummary,
  classifyCommandResult,
  containsUnsafeOutput,
  parseJsonOutput,
};
