import { describe, expect, it } from "vitest";
import {
  createPaymentCheckoutSessionToken,
  resolvePaymentCheckoutSessionToken,
} from "@/lib/payments/payment-checkout-session";

const env = {
  PAYMENT_CHECKOUT_SESSION_SECRET: "test-only-checkout-session-secret",
} as NodeJS.ProcessEnv;

describe("payment checkout session token", () => {
  it("creates and resolves a signed checkout session without persistence", () => {
    const created = createPaymentCheckoutSessionToken({
      moduleSlug: "ambiguous-temperature",
      merchantOrderNo: "ANYUNPORDEREXISTING000000000",
      env,
      now: new Date("2026-05-30T00:00:00.000Z"),
    });

    expect(created.ok).toBe(true);
    if (!created.ok) throw new Error("expected token");
    expect(created.token).toMatch(/^pcs_/u);

    const resolved = resolvePaymentCheckoutSessionToken({
      token: created.token,
      env,
      now: new Date("2026-05-30T00:00:01.000Z"),
    });

    expect(resolved).toMatchObject({
      ok: true,
      payload: {
        moduleSlug: "ambiguous-temperature",
        merchantOrderNo: "ANYUNPORDEREXISTING000000000",
      },
    });
  });

  it("rejects tampered or expired checkout sessions safely", () => {
    const created = createPaymentCheckoutSessionToken({
      moduleSlug: "ambiguous-temperature",
      merchantOrderNo: "ANYUNPORDEREXISTING000000000",
      env,
      now: new Date("2026-05-30T00:00:00.000Z"),
    });

    expect(created.ok).toBe(true);
    if (!created.ok) throw new Error("expected token");

    expect(
      resolvePaymentCheckoutSessionToken({
        token: `${created.token}tampered`,
        env,
      }),
    ).toEqual({ ok: false, error: "invalid_session" });
    expect(
      resolvePaymentCheckoutSessionToken({
        token: created.token,
        env,
        now: new Date("2026-06-01T00:00:00.000Z"),
      }),
    ).toEqual({ ok: false, error: "expired" });
  });

  it("uses existing paid access token hash secret as fallback signing config", () => {
    const created = createPaymentCheckoutSessionToken({
      moduleSlug: "ambiguous-temperature",
      merchantOrderNo: "ANYUNPORDEREXISTING000000000",
      env: { PAID_ACCESS_TOKEN_HASH_SECRET: "fallback-signing-secret" } as NodeJS.ProcessEnv,
    });

    expect(created.ok).toBe(true);
  });
});

