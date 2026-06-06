#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const OUTPUT_DIR = ".qa";
const OUTPUT_PATH = path.join(OUTPUT_DIR, "module01-staging-channels-summary.json");

function parseArgs(argv) {
  const args = {
    ownerApproved: false,
    json: false,
  };

  for (const arg of argv) {
    if (arg === "--owner-approved" || arg === "--confirm-owner-approved") {
      args.ownerApproved = true;
    } else if (arg === "--json") {
      args.json = true;
    }
  }

  return args;
}

function buildSummary(input = {}) {
  const approved =
    input.ownerApproved === true ||
    process.env.MODULE01_STAGING_CHANNELS_OWNER_APPROVED?.trim() === "1";
  const status = approved ? "blocked" : "blocked";
  const blocker = approved ? "staging_channels_runner_not_implemented" : "owner_approval_required";

  return {
    module: "ai-temperature",
    environment: "staging",
    command: "qa:module01:staging:channels",
    status,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    checks: {
      ownerApproval: approved ? "pass" : "blocked",
      realEmailChannel: "skipped",
      realLineChannel: "skipped",
    },
    blockers: [blocker],
    warnings: [
      "sends_one_real_staging_email_when_implemented",
      "may_send_one_real_staging_line_message_when_implemented",
      "requires_owner_approved_recipient_or_line_account",
      "not_run_by_default",
    ],
    sendsRealEmail: false,
    sendsRealLine: false,
    mutatesData: false,
    productionTouched: false,
    ownerApprovalRequired: true,
    nextRequiredAction: approved
      ? "implement_owner_approved_channel_runner"
      : "rerun_only_with_explicit_owner_approval",
  };
}

function writeSummary(summary, outputPath = path.resolve(process.cwd(), OUTPUT_PATH)) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`);
  return outputPath;
}

function printWarning() {
  console.error(
    [
      "ANYU QA: Module 01 staging channels gate is owner-approved only.",
      "This command is reserved for real staging Email and LINE user-channel checks.",
      "It must not run as part of qa:module01:staging or qa:module01:release.",
      "Current v1 skeleton refuses by default and sends no messages.",
    ].join("\n"),
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const summary = buildSummary({ ownerApproved: args.ownerApproved });
  const outputPath = writeSummary(summary);

  printWarning();

  const payload = { ok: false, outputPath, summary };

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log(
      [
        "ANYU QA: Module 01 staging channels",
        `Status: ${summary.status}`,
        `Blocker: ${summary.blockers[0]}`,
        `Next action: ${summary.nextRequiredAction}`,
      ].join("\n"),
    );
  }

  process.exitCode = 2;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main();
}

export { buildSummary, parseArgs, writeSummary };
