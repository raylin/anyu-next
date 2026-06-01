import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { assertSafeQaBaseUrl } from "../../scripts/lib/result-checkout-no-card-qa.mjs";
import {
  RECOVERY_LINK_CHANNEL,
  RECOVERY_LINK_PURPOSE,
  RECOVERY_LINK_TTL_DAYS,
  containsRecoverySmokeTokenLikeValue,
  generateOperatorRecoveryToken,
  getDefaultOperatorRecoveryLinkExpiresAt,
  hashOperatorRecoveryToken,
  isRecoveryLinkToken,
  redactRecoveryLinkPath,
  sanitizeRecoverySmokeRecord,
  summarizeRecoveryLinkHtml,
} from "../../scripts/lib/recovery-link-smoke-qa.mjs";

describe("recovery link smoke QA helpers", () => {
  it("keeps the operator smoke route staging-only", () => {
    expect(assertSafeQaBaseUrl("https://anyu.tw")).toEqual({
      ok: false,
      error: "production_target_rejected",
    });
    expect(assertSafeQaBaseUrl("https://staging.anyu.tw")).toEqual({ ok: true });
  });

  it("generates and hashes prl_ tokens without exposing token material in output helpers", () => {
    const token = generateOperatorRecoveryToken();

    expect(isRecoveryLinkToken(token)).toBe(true);
    expect(hashOperatorRecoveryToken(token, "test-only-recovery-link-secret")).toMatch(
      /^[a-f0-9]{64}$/u,
    );
    expect(redactRecoveryLinkPath(`/r/${token}`)).toBe("/r/[REDACTED]");
    expect(containsRecoverySmokeTokenLikeValue(`/r/${token}`)).toBe(true);
    expect(containsRecoverySmokeTokenLikeValue("/r/[REDACTED]")).toBe(false);
    expect(sanitizeRecoverySmokeRecord({ recoveryPathShape: "/r/[REDACTED]" })).toEqual({
      recoveryPathShape: "/r/[REDACTED]",
    });
    expect(() => sanitizeRecoverySmokeRecord({ recoveryPath: `/r/${token}` })).toThrow(
      "unsafe_recovery_smoke_output_detected",
    );
  });

  it("uses operator_test recovery links with the approved purpose and 90-day expiry", () => {
    const now = new Date("2026-06-01T00:00:00.000Z");
    const expiresAt = getDefaultOperatorRecoveryLinkExpiresAt(now);

    expect(RECOVERY_LINK_CHANNEL).toBe("operator_test");
    expect(RECOVERY_LINK_PURPOSE).toBe("paid_result_recovery");
    expect(RECOVERY_LINK_TTL_DAYS).toBe(90);
    expect(expiresAt.toISOString()).toBe("2026-08-30T00:00:00.000Z");
  });

  it("summarizes recovery-link HTML and detects token leakage", () => {
    const rawToken = `prl_${"a".repeat(43)}`;
    const clean = summarizeRecoveryLinkHtml("完整分析 48 小時", rawToken);
    const leaked = summarizeRecoveryLinkHtml(`完整分析 ${rawToken} pa_secret_value`, rawToken);

    expect(clean).toMatchObject({
      completedContentSignal: true,
      rawRecoveryTokenExposed: false,
      rawPaidAccessOrCheckoutTokenExposed: false,
    });
    expect(leaked).toMatchObject({
      completedContentSignal: true,
      rawRecoveryTokenExposed: true,
      rawPaidAccessOrCheckoutTokenExposed: true,
    });
  });

  it("registers the package script and env preflight mode without requiring secret values", () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf8"),
    );
    const preflight = fs.readFileSync(
      path.resolve(process.cwd(), "scripts/qa-env-preflight.mjs"),
      "utf8",
    );
    const script = fs.readFileSync(
      path.resolve(process.cwd(), "scripts/recovery-link-smoke-qa.mjs"),
      "utf8",
    );

    expect(packageJson.scripts["qa:recovery-link:smoke"]).toBe(
      "node scripts/recovery-link-smoke-qa.mjs",
    );
    expect(preflight).toContain("recovery_link_smoke");
    expect(preflight).toContain("PAYMENT_RECOVERY_LINK_TOKEN_SECRET");
    expect(script).toContain("operator_recovery_link_create");
    expect(script).toContain("rawTokenPrinted: false");
    expect(script).toContain("tokenHashPrinted: false");
    expect(script).not.toContain("console.log(rawToken");
    expect(script).not.toContain("console.log(tokenHash");
  });
});
