import { describe, expect, it } from "vitest";

import {
  buildSummary,
  parseArgs,
} from "../../scripts/module01-staging-channels-qa.mjs";

describe("Module 01 staging channels QA guard", () => {
  it("parses explicit owner approval and json flags", () => {
    expect(parseArgs(["--confirm-owner-approved", "--json"])).toEqual({
      ownerApproved: true,
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
      nextRequiredAction: "rerun_only_with_explicit_owner_approval",
    });
    expect(summary.warnings).toEqual(
      expect.arrayContaining([
        "sends_one_real_staging_email_when_implemented",
        "may_send_one_real_staging_line_message_when_implemented",
        "requires_owner_approved_recipient_or_line_account",
      ]),
    );
  });

  it("still blocks when approved because the real channel runner is not implemented", () => {
    const summary = buildSummary({
      ownerApproved: true,
      generatedAt: "2026-06-06T00:00:00.000Z",
    });

    expect(summary.status).toBe("blocked");
    expect(summary.checks.ownerApproval).toBe("pass");
    expect(summary.blockers).toEqual(["staging_channels_runner_not_implemented"]);
    expect(summary.sendsRealEmail).toBe(false);
    expect(summary.sendsRealLine).toBe(false);
  });
});
