import { describe, expect, it } from "vitest";

import {
  SCENARIOS,
  TARGETED_TESTS,
  assertSafeSummary,
  buildMockFlowSummary,
} from "../../scripts/module01-mock-flow-qa.mjs";

describe("Module 01 mock-flow QA helper", () => {
  it("covers the expected no-provider test surface", () => {
    expect(SCENARIOS.map((scenario) => scenario.id)).toEqual([
      "email_happy_path",
      "email_save_to_mock_paid_access_link",
      "line_happy_path_with_recipient_secret",
      "line_liff_bind_success",
      "line_liff_missing_state",
      "line_liff_missing_id_token",
      "line_bind_recipient_secret_failure",
      "line_bind_admin_diagnostics_summary",
      "line_email_fallback_after_bind_failure",
      "line_partial_bind_without_recipient_secret",
      "email_fallback_after_line_incomplete",
      "paid_generation_to_admin_ready_summary",
    ]);
    expect(TARGETED_TESTS).toEqual(
      expect.arrayContaining([
        "src/tests/admin-paid-result-lookup.test.ts",
        "src/tests/admin-line-bind-diagnostics-route.test.ts",
        "src/tests/newebpay-checkout-start-page.test.tsx",
        "src/tests/payment-recovery-email-route.test.ts",
        "src/tests/result-checkout-no-card-qa.test.ts",
        "src/tests/line-recovery-bind-route.test.ts",
        "src/tests/line-recovery-bind-diagnostics-route.test.ts",
        "src/tests/line-bind-diagnostic-events.test.ts",
        "src/tests/payment-recovery-contact-secrets.test.ts",
        "src/tests/email-recovery-link.test.ts",
        "src/tests/line-recovery-link.test.ts",
        "src/tests/line-recovery-bind-diagnostics.test.ts",
        "src/tests/operator-fake-paid-success.test.ts",
        "src/tests/operator-fake-paid-success-route.test.ts",
      ]),
    );
  });

  it("emits a pass summary without production or real channels", () => {
    const summary = buildMockFlowSummary({
      exitStatus: 0,
      generatedAt: "2026-06-06T00:00:00.000Z",
    });

    expect(summary).toMatchObject({
      module: "ai-temperature",
      environment: "local",
      command: "qa:module01:mock-flow",
      status: "pass",
      fixtureName: "module01_valid_smoke_analyze_request_v0",
      fixtureSource: "src/tests/fixtures/module01/valid-analyze-request.json",
      sendsRealEmail: false,
      sendsRealLine: false,
      mutatesData: false,
      productionTouched: false,
      nextRequiredAction: "use_for_backend_flow_regression",
    });
    expect(summary.scenarios.line_partial_bind_without_recipient_secret).toMatchObject({
      status: "pass",
      validates: expect.arrayContaining([
        "contact_only_not_deliverable",
        "contact_only_does_not_unlock_checkout",
        "recipient_secret_missing_diagnosis",
      ]),
      sendsRealEmail: false,
      sendsRealLine: false,
      productionTouched: false,
    });
    expect(summary.scenarios.email_save_to_mock_paid_access_link).toMatchObject({
      status: "pass",
      validates: expect.arrayContaining([
        "pre_payment_email_save_success",
        "checkout_unlock_after_email_save",
        "mock_paid_transition_uses_saved_email_contact",
        "paid_access_link_ready",
        "r_link_resolves_completed_paid_result",
      ]),
      sendsRealEmail: false,
      sendsRealLine: false,
      productionTouched: false,
    });
    expect(summary.scenarios.line_happy_path_with_recipient_secret.validates).toEqual(
      expect.arrayContaining(["recipient_secret_write", "deliverable_line_summary"]),
    );
    expect(summary.scenarios.line_liff_missing_id_token.validates).toEqual(
      expect.arrayContaining(["id_token_missing_after_login_category", "no_id_token_output"]),
    );
    expect(summary.scenarios.line_bind_recipient_secret_failure.validates).toEqual(
      expect.arrayContaining(["recipient_secret_failure_category", "no_raw_line_identity_output"]),
    );
    expect(summary.warnings).toEqual(
      expect.arrayContaining(["no_real_newebpay", "no_real_email", "no_real_line"]),
    );
    expect(() => assertSafeSummary(summary)).not.toThrow();
  });

  it("emits a blocked summary when the mock-flow test slice fails", () => {
    const summary = buildMockFlowSummary({
      exitStatus: 1,
      generatedAt: "2026-06-06T00:00:00.000Z",
    });

    expect(summary.status).toBe("blocked");
    expect(summary.blockers).toEqual(["module01_mock_flow_tests_failed"]);
    expect(() =>
      assertSafeSummary({
        ...summary,
        unsafe: "owner@example.test",
      }),
    ).toThrow("module01_mock_flow_summary_not_sanitized");
  });
});
