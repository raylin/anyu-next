import { describe, expect, it } from "vitest";

import {
  assertSafeLineRecoveryBindDiagnosticOutput,
  evaluateLineRecoveryBindDiagnostic,
  mapLineRecoveryBindApiFailure,
} from "@/lib/line/recovery-bind-diagnostics";
import type { LineRecoveryBindContext } from "@/lib/line/recovery-liff-context";

function context(overrides: Partial<LineRecoveryBindContext> = {}): LineRecoveryBindContext {
  return {
    state: "rlb_safeState",
    fallbackReturnPath: "/m/ambiguous-temperature/result/result-1/checkout",
    stateSource: "direct_query",
    isStateShapeValid: true,
    ...overrides,
  };
}

describe("LINE recovery bind diagnostics", () => {
  it("classifies valid LIFF state plus idToken plus bind API success", () => {
    const result = evaluateLineRecoveryBindDiagnostic({
      context: context(),
      liffIdConfigured: true,
      sdkLoadStatus: "loaded",
      initStatus: "success",
      loggedIn: true,
      idTokenPresent: true,
      bindApiResult: { ok: true },
    });

    expect(result).toMatchObject({
      status: "success",
      category: "bind_success",
      canRetryLine: false,
      canUseEmailFallback: false,
    });
    expect(result.safeMessage).toContain("已用 LINE 保存專屬查看連結");
    expect(() => assertSafeLineRecoveryBindDiagnosticOutput(result)).not.toThrow();
  });

  it("classifies missing and invalid LIFF state before SDK work starts", () => {
    expect(evaluateLineRecoveryBindDiagnostic({ context: context({ state: "" }) })).toMatchObject({
      status: "fallback",
      category: "liff_state_missing",
      canRetryLine: true,
      canUseEmailFallback: true,
    });
    expect(
      evaluateLineRecoveryBindDiagnostic({
        context: context({ state: "pa_x", isStateShapeValid: false }),
      }),
    ).toMatchObject({
      status: "fallback",
      category: "liff_state_invalid",
    });
  });

  it("classifies expired state returned by bind API", () => {
    const result = evaluateLineRecoveryBindDiagnostic({
      context: context(),
      sdkLoadStatus: "loaded",
      initStatus: "success",
      loggedIn: true,
      idTokenPresent: true,
      bindApiResult: { ok: false, error: "state_expired" },
    });

    expect(result).toMatchObject({
      status: "fallback",
      category: "liff_state_expired",
    });
    expect(result.safeMessage).toContain("已過期");
  });

  it("classifies SDK, init, login redirect, and missing idToken states safely", () => {
    expect(
      evaluateLineRecoveryBindDiagnostic({
        context: context(),
        sdkLoadStatus: "failed",
      }),
    ).toMatchObject({ category: "liff_sdk_load_failed" });
    expect(
      evaluateLineRecoveryBindDiagnostic({
        context: context(),
        sdkLoadStatus: "loaded",
        initStatus: "failed",
      }),
    ).toMatchObject({ category: "liff_init_failed" });
    expect(
      evaluateLineRecoveryBindDiagnostic({
        context: context(),
        sdkLoadStatus: "loaded",
        initStatus: "success",
        loggedIn: false,
      }),
    ).toMatchObject({
      status: "login_redirect",
      category: "liff_login_redirect_started",
    });
    expect(
      evaluateLineRecoveryBindDiagnostic({
        context: context(),
        sdkLoadStatus: "loaded",
        initStatus: "success",
        loggedIn: true,
        idTokenPresent: false,
      }),
    ).toMatchObject({
      status: "fallback",
      category: "id_token_missing_after_login",
    });
  });

  it("maps bind API failures into safe diagnostic categories", () => {
    expect(mapLineRecoveryBindApiFailure({ error: "state_missing" })).toBe(
      "bind_api_state_missing",
    );
    expect(mapLineRecoveryBindApiFailure({ error: "state_invalid" })).toBe(
      "bind_api_state_invalid",
    );
    expect(mapLineRecoveryBindApiFailure({ error: "line_user_missing" })).toBe(
      "bind_api_line_identity_missing",
    );
    expect(
      mapLineRecoveryBindApiFailure({
        error: "bind_failed",
        bindCategory: "recipient_secret_write_failed",
      }),
    ).toBe("bind_api_recipient_secret_failed");
    expect(mapLineRecoveryBindApiFailure({ error: "bind_failed" })).toBe("bind_api_failed");
  });

  it("rejects private values in diagnostic output", () => {
    const safe = evaluateLineRecoveryBindDiagnostic({
      context: context(),
      bindApiResult: { ok: false, error: "bind_failed", bindCategory: "recipient_secret_write_failed" },
    });

    expect(() => assertSafeLineRecoveryBindDiagnosticOutput(safe)).not.toThrow();
    expect(() =>
      assertSafeLineRecoveryBindDiagnosticOutput({
        category: "bind_api_failed",
        idToken: "private-id-token",
      }),
    ).toThrow("line_recovery_bind_diagnostic_not_sanitized");
    expect(() =>
      assertSafeLineRecoveryBindDiagnosticOutput({
        category: "bind_api_failed",
        tokenizedUrl: "/r/pal_private_token_value",
      }),
    ).toThrow("line_recovery_bind_diagnostic_not_sanitized");
  });
});

