import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { assertSafeQaBaseUrl } from "../../scripts/lib/result-checkout-no-card-qa.mjs";
import {
  ACCESS_LINK_TOKEN_PREFIX,
  LEGACY_RECOVERY_LINK_TOKEN_PREFIX,
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

  it("generates and hashes pal_ tokens without exposing token material in output helpers", () => {
    const token = generateOperatorRecoveryToken();

    expect(token.startsWith(ACCESS_LINK_TOKEN_PREFIX)).toBe(true);
    expect(LEGACY_RECOVERY_LINK_TOKEN_PREFIX).toBe("prl_");
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

  it("redacts legacy prl_ shaped values without accepting them as access-link tokens", () => {
    const legacyToken = `prl_${"a".repeat(43)}`;

    expect(isRecoveryLinkToken(legacyToken)).toBe(false);
    expect(() => hashOperatorRecoveryToken(legacyToken, "test-only-recovery-link-secret")).toThrow(
      "invalid_recovery_link_token",
    );
    expect(redactRecoveryLinkPath(`/r/${legacyToken}`)).toBe("/r/[REDACTED]");
    expect(containsRecoverySmokeTokenLikeValue(`/r/${legacyToken}`)).toBe(true);
  });

  it("uses operator_test recovery links with the approved purpose and 90-day expiry", () => {
    const now = new Date("2026-06-01T00:00:00.000Z");
    const expiresAt = getDefaultOperatorRecoveryLinkExpiresAt(now);

    expect(RECOVERY_LINK_CHANNEL).toBe("operator_test");
    expect(RECOVERY_LINK_PURPOSE).toBe("paid_result_access_link");
    expect(RECOVERY_LINK_TTL_DAYS).toBe(90);
    expect(expiresAt.toISOString()).toBe("2026-08-30T00:00:00.000Z");
  });

  it("summarizes recovery-link HTML and detects token leakage", () => {
    const rawToken = `pal_${"a".repeat(43)}`;
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
    const lineScript = fs.readFileSync(
      path.resolve(process.cwd(), "scripts/line-recovery-smoke-qa.mjs"),
      "utf8",
    );

    expect(packageJson.scripts["qa:recovery-link:smoke"]).toBeUndefined();
    expect(packageJson.scripts["qa:access-link:smoke"]).toBe(
      "node scripts/recovery-link-smoke-qa.mjs",
    );
    expect(packageJson.scripts["qa:line-recovery:smoke"]).toBeUndefined();
    expect(packageJson.scripts["qa:line-access-link:smoke"]).toBe(
      "node scripts/line-recovery-smoke-qa.mjs",
    );
    expect(preflight).toContain("access_link_smoke");
    expect(preflight).toContain("line_access_link_smoke");
    expect(preflight).toContain("support_ops_lookup");
    expect(preflight).toContain("SUPPORT_OPS_DATABASE_URL");
    expect(preflight).toContain("PAYMENT_RECOVERY_LINK_TOKEN_SECRET");
    expect(preflight).toContain("ENABLE_OPERATOR_RECOVERY_LINK_SMOKE");
    expect(preflight).toContain("ENABLE_OPERATOR_LINE_RECOVERY_SMOKE");
    expect(preflight).toContain("LINE_MESSAGING_CHANNEL_ACCESS_TOKEN");
    expect(script).toContain("/api/operator/recovery-link-smoke");
    expect(script).toContain("not_required_for_runtime_mode");
    expect(script).toContain("operator_recovery_link_create");
    expect(script).toContain("rawTokenPrinted: false");
    expect(script).toContain("tokenHashPrinted: false");
    expect(script).not.toContain("console.log(rawToken");
    expect(script).not.toContain("console.log(tokenHash");
    expect(lineScript).toContain("/api/operator/line-recovery-smoke");
    expect(lineScript).toContain("privateRecipientPrinted: false");
    expect(lineScript).toContain("privateRecipientHashPrinted: false");
    expect(lineScript).toContain("/pal_[A-Za-z0-9_-]+/u");
    expect(lineScript).toContain('/"lineUserId"\\s*:');
    expect(lineScript).toContain('/"recipientHash"\\s*:');
    expect(lineScript).not.toContain("/lineUserId/u");
    expect(lineScript).not.toContain("console.log(lineUserId");
    expect(lineScript).not.toContain("console.log(recipientHash");
  });
});
