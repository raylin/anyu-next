#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const OUTPUT_DIR = ".qa";
const OUTPUT_PATH = path.join(OUTPUT_DIR, "module01-staging-channels-summary.json");

function parseArgs(argv) {
  const args = {
    ownerApproved: false,
    plan: false,
    json: false,
  };

  for (const arg of argv) {
    if (arg === "--owner-approved" || arg === "--confirm-owner-approved") {
      args.ownerApproved = true;
    } else if (arg === "--plan" || arg === "--dry-run") {
      args.plan = true;
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
  const plan = input.plan === true;
  const status = plan ? "pass" : "blocked";
  const blockers = plan
    ? []
    : [approved ? "staging_real_channel_runner_not_implemented" : "owner_approval_required"];

  return {
    module: "ai-temperature",
    environment: "staging",
    command: "qa:module01:staging:channels",
    status,
    mode: plan ? "plan" : "guarded_real_send",
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    checks: {
      ownerApproval: approved ? "pass" : plan ? "not_required_for_plan" : "blocked",
      stagingRuntimeConfig: "planned",
      freshFixture: "planned",
      adminOpsLookup: "planned",
      realEmailChannel: plan ? "planned_owner_approved_only" : "skipped",
      realLineChannel: plan ? "planned_owner_approved_only" : "skipped",
    },
    blockers,
    warnings: [
      "sends_one_real_staging_email_when_implemented",
      "may_send_one_real_staging_line_message_when_implemented",
      "requires_owner_approved_recipient_or_line_account",
      "not_run_by_default",
    ],
    planSteps: [
      "confirm_owner_approved_staging_recipients",
      "assert_staging_freshness",
      "assert_staging_runtime_config_open_for_module01",
      "create_fresh_tracked_fixture_result",
      "save_staging_email_without_printing_address",
      "perform_staging_line_bind_without_printing_line_identity",
      "use_admin_ops_lookup_for_sanitized_state",
      "verify_channel_receipt_and_safe_r_link_without_pasting_tokenized_url",
    ],
    sendsRealEmail: false,
    sendsRealLine: false,
    mutatesData: false,
    productionTouched: false,
    ownerApprovalRequired: !plan,
    realSendImplemented: false,
    nextRequiredAction: plan
      ? "implement_real_runner_only_after_owner_approved_channel_scope"
      : approved
        ? "use_plan_mode_or_implement_owner_approved_channel_runner"
        : "rerun_plan_mode_or_rerun_real_mode_only_with_explicit_owner_approval",
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
      "Current v2 runner supports --plan/--dry-run and sends no messages.",
      "Real sends remain unimplemented until owner-approved staging recipient scope is defined.",
    ].join("\n"),
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const summary = buildSummary({ ownerApproved: args.ownerApproved, plan: args.plan });
  const outputPath = writeSummary(summary);

  printWarning();

  const payload = { ok: summary.status === "pass", outputPath, summary };

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log(
      [
        "ANYU QA: Module 01 staging channels",
        `Status: ${summary.status}`,
        `Blocker: ${summary.blockers[0] ?? "none"}`,
        `Next action: ${summary.nextRequiredAction}`,
      ].join("\n"),
    );
  }

  process.exitCode = summary.status === "pass" ? 0 : 2;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main();
}

export { buildSummary, parseArgs, writeSummary };
