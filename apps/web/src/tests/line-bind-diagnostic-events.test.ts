import { describe, expect, it } from "vitest";
import {
  getLineBindDiagnosticRecommendedActions,
  getLineBindDiagnosticStage,
  getLineBindDiagnosticStatus,
  isLineBindDiagnosticCategory,
  summarizeLineBindDiagnosticEvents,
} from "@/lib/line/recovery-bind-diagnostic-events";

const RESULT_ID = "11111111-1111-4111-8111-111111111111";

describe("LINE bind diagnostic event helpers", () => {
  it("maps diagnostic categories to safe stages and statuses", () => {
    expect(getLineBindDiagnosticStage("liff_sdk_load_failed")).toBe("liff_sdk");
    expect(getLineBindDiagnosticStage("id_token_missing_after_login")).toBe("id_token");
    expect(getLineBindDiagnosticStage("bind_api_recipient_secret_failed")).toBe("recipient_secret");
    expect(getLineBindDiagnosticStatus("bind_success")).toBe("succeeded");
    expect(getLineBindDiagnosticStatus("liff_login_redirect_started")).toBe("observed");
    expect(getLineBindDiagnosticStatus("bind_api_failed")).toBe("failed");
  });

  it("validates categories before persistence", () => {
    expect(isLineBindDiagnosticCategory("bind_success")).toBe(true);
    expect(isLineBindDiagnosticCategory("raw_line_user_id")).toBe(false);
  });

  it("summarizes sanitized events by latest category", () => {
    const summary = summarizeLineBindDiagnosticEvents([
      {
        createdAt: new Date("2030-01-01T00:02:00.000Z"),
        themeSlug: "ambiguous-temperature",
        metadataJson: {
          resultId: RESULT_ID,
          moduleSlug: "ambiguous-temperature",
          source: "server",
          category: "bind_api_recipient_secret_failed",
          stage: "recipient_secret",
          status: "failed",
          hasLiffState: true,
          hasIdToken: true,
          bindApiReached: true,
          recipientSecretRequired: true,
          recipientSecretCreated: false,
        },
      },
      {
        createdAt: new Date("2030-01-01T00:01:00.000Z"),
        themeSlug: "ambiguous-temperature",
        metadataJson: {
          resultId: RESULT_ID,
          moduleSlug: "ambiguous-temperature",
          source: "client",
          category: "liff_login_redirect_started",
          stage: "liff_login",
          status: "observed",
        },
      },
    ]);

    expect(summary).toMatchObject({
      ok: true,
      resultId: RESULT_ID,
      moduleSlug: "ambiguous-temperature",
      latestCategory: "bind_api_recipient_secret_failed",
      latestStage: "recipient_secret",
      latestStatus: "failed",
      eventCount: 2,
      latestCreatedAtPresent: true,
      recommendedActions: ["retry_line_bind", "use_email_fallback", "support_review_required"],
    });
    expect(summary?.categories).toEqual([
      { category: "bind_api_recipient_secret_failed", count: 1 },
      { category: "liff_login_redirect_started", count: 1 },
    ]);
    expect(JSON.stringify(summary)).not.toContain("rlb_");
    expect(JSON.stringify(summary)).not.toContain("lineUserId");
  });

  it("recommends no action for success", () => {
    expect(getLineBindDiagnosticRecommendedActions("bind_success")).toEqual(["no_action_needed"]);
  });
});
