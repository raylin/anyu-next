import { describe, expect, it } from "vitest";

import {
  TARGETED_TESTS,
  assertSafeSummary,
  buildMockFlowSummary,
} from "../../scripts/module01-mock-flow-qa.mjs";

describe("Module 01 mock-flow QA helper", () => {
  it("covers the expected no-provider test surface", () => {
    expect(TARGETED_TESTS).toEqual(
      expect.arrayContaining([
        "src/tests/admin-paid-result-lookup.test.ts",
        "src/tests/newebpay-checkout-start-page.test.tsx",
        "src/tests/payment-recovery-email-route.test.ts",
        "src/tests/line-recovery-bind-route.test.ts",
        "src/tests/payment-recovery-contact-secrets.test.ts",
        "src/tests/email-recovery-link.test.ts",
        "src/tests/line-recovery-link.test.ts",
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
      sendsRealEmail: false,
      sendsRealLine: false,
      mutatesData: false,
      productionTouched: false,
      nextRequiredAction: "use_for_backend_flow_regression",
    });
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
