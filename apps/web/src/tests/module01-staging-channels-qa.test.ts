import { describe, expect, it } from "vitest";

import {
  buildSummary,
  parseArgs,
} from "../../scripts/module01-staging-channels-qa.mjs";

describe("Module 01 staging channels QA guard", () => {
  it("parses explicit owner approval and json flags", () => {
    expect(parseArgs(["--confirm-owner-approved", "--plan", "--json"])).toEqual({
      ownerApproved: true,
      plan: true,
      json: true,
    });
  });

  it("refuses by default without sending real channels", () => {
    const summary = buildSummary({
      ownerApproved: false,
      generatedAt: "2026-06-06T00:00:00.000Z",
    });

    expect(summary).toMatchObject({
      command: "qa:module01:staging:channels",
      status: "blocked",
      blockers: ["owner_approval_required"],
      sendsRealEmail: false,
      sendsRealLine: false,
      productionTouched: false,
      ownerApprovalRequired: true,
      realSendImplemented: false,
      nextRequiredAction: "rerun_plan_mode_or_rerun_real_mode_only_with_explicit_owner_approval",
    });
    expect(summary.warnings).toEqual(
      expect.arrayContaining([
        "sends_one_real_staging_email_when_implemented",
        "may_send_one_real_staging_line_message_when_implemented",
        "requires_owner_approved_recipient_or_line_account",
      ]),
    );
  });

  it("supports a non-sending plan mode without owner approval", () => {
    const summary = buildSummary({
      ownerApproved: false,
      plan: true,
      generatedAt: "2026-06-06T00:00:00.000Z",
    });

    expect(summary).toMatchObject({
      status: "pass",
      mode: "plan",
      blockers: [],
      sendsRealEmail: false,
      sendsRealLine: false,
      productionTouched: false,
      ownerApprovalRequired: false,
      realSendImplemented: false,
      nextRequiredAction: "implement_real_runner_only_after_owner_approved_channel_scope",
    });
    expect(summary.planSteps).toEqual(
      expect.arrayContaining([
        "assert_staging_freshness",
        "create_fresh_tracked_fixture_result",
        "verify_channel_receipt_and_safe_r_link_without_pasting_tokenized_url",
      ]),
    );
  });

  it("still blocks real-send mode when approved because the real channel runner is not implemented", () => {
    const summary = buildSummary({
      ownerApproved: true,
      generatedAt: "2026-06-06T00:00:00.000Z",
    });

    expect(summary.status).toBe("blocked");
    expect(summary.checks.ownerApproval).toBe("pass");
    expect(summary.blockers).toEqual(["staging_real_channel_runner_not_implemented"]);
    expect(summary.sendsRealEmail).toBe(false);
    expect(summary.sendsRealLine).toBe(false);
  });
});
