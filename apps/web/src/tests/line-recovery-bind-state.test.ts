import { Buffer } from "node:buffer";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRequireDb } = vi.hoisted(() => ({
  mockRequireDb: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  requireDb: mockRequireDb,
}));

import {
  bindVerifiedLineUserToRecoveryContact,
  createLineRecoveryBindStateToken,
  isSafeLineRecoveryReturnPath,
  LINE_RECOVERY_BIND_STATE_PREFIX,
  resolveLineRecoveryBindStateToken,
} from "@/lib/line/recovery-bind-state";
import { createLineRecoveryBindHref } from "@/lib/line/recovery-bind-link";
import {
  createOrUpdateEmailRecoveryContact,
} from "@/lib/db/payment-recovery-contacts";
import {
  hashRecoveryContact,
} from "@/lib/payments/recovery-contact-crypto";

const RESULT_ID = "22222222-2222-4222-8222-222222222222";
const PAYMENT_INTENT_ID = "33333333-3333-4333-8333-333333333333";
const ENTITLEMENT_ID = "44444444-4444-4444-8444-444444444444";
const RECOVERY_CONTACT_ID = "77777777-7777-4777-8777-777777777777";
const NOW = new Date("2026-06-01T10:00:00.000Z");
const TEST_ENV = {
  PAYMENT_RECOVERY_CONTACT_HASH_SECRET: "test-only-recovery-hash-secret",
  PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString("base64url"),
} as NodeJS.ProcessEnv;

function createDbMock(input?: {
  selectRows?: unknown[];
  insertRows?: unknown[];
  updateRows?: unknown[];
}) {
  const capture: {
    insertValues?: Record<string, unknown>;
    updateValues?: Record<string, unknown>;
  } = {};
  const selectChain = {
    from: vi.fn(() => selectChain),
    where: vi.fn(() => selectChain),
    limit: vi.fn(async () => input?.selectRows ?? []),
  };
  const insertChain = {
    values: vi.fn((values) => {
      capture.insertValues = values;
      return insertChain;
    }),
    returning: vi.fn(async () => input?.insertRows ?? []),
  };
  const updateChain = {
    set: vi.fn((values) => {
      capture.updateValues = values;
      return updateChain;
    }),
    where: vi.fn(() => updateChain),
    returning: vi.fn(async () => input?.updateRows ?? []),
  };
  const db = {
    select: vi.fn(() => selectChain),
    insert: vi.fn(() => insertChain),
    update: vi.fn(() => updateChain),
  };

  return { db, capture };
}

function createValidToken(overrides?: Partial<Parameters<typeof createLineRecoveryBindStateToken>[0]>) {
  return createLineRecoveryBindStateToken({
    moduleSlug: "ambiguous-temperature",
    resultId: RESULT_ID,
    paymentIntentId: PAYMENT_INTENT_ID,
    entitlementId: ENTITLEMENT_ID,
    source: "completed_result",
    returnPath: `/m/ambiguous-temperature/result/${RESULT_ID}`,
    marketingOptIn: true,
    env: TEST_ENV,
    now: NOW,
    ...overrides,
  });
}

describe("LINE recovery bind state helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a signed short-lived recovery state without raw bearer tokens or private values", () => {
    const created = createValidToken({
      returnPath: `/m/ambiguous-temperature/result/${RESULT_ID}?from=recovery`,
    });

    expect(created.ok).toBe(true);
    expect(created.ok && created.token).toMatch(new RegExp(`^${LINE_RECOVERY_BIND_STATE_PREFIX}`));

    const token = created.ok ? created.token : "";
    expect(token).not.toContain("pa_x");
    expect(token).not.toContain("pcs_x");
    expect(token).not.toContain("unlock-token");
    expect(token).not.toContain("short-code");
    expect(token).not.toContain("line-user-1");
    expect(token).not.toContain("owner@example.com");

    const resolved = resolveLineRecoveryBindStateToken({
      token,
      env: TEST_ENV,
      now: NOW,
    });

    expect(resolved).toMatchObject({
      ok: true,
      payload: {
        moduleSlug: "ambiguous-temperature",
        resultId: RESULT_ID,
        paymentIntentId: PAYMENT_INTENT_ID,
        entitlementId: ENTITLEMENT_ID,
        source: "completed_result",
        returnPath: `/m/ambiguous-temperature/result/${RESULT_ID}?from=recovery`,
        marketingOptIn: true,
      },
    });
  });

  it("builds a recovery LIFF href with safe state and internal fallback only", () => {
    const result = createLineRecoveryBindHref({
      moduleSlug: "ambiguous-temperature",
      resultId: RESULT_ID,
      paymentIntentId: PAYMENT_INTENT_ID,
      entitlementId: ENTITLEMENT_ID,
      source: "checkout_start",
      returnPath: `/m/ambiguous-temperature/result/${RESULT_ID}/checkout`,
      env: TEST_ENV,
    });

    expect(result.ok).toBe(true);

    const href = result.ok ? result.href : "";
    expect(href).toContain("/line/recovery/bind?state=rlb_");
    expect(href).toContain("returnPath=%2Fm%2Fambiguous-temperature%2Fresult%2F");
    expect(href).not.toContain("pa_");
    expect(href).not.toContain("pcs_");
    expect(href).not.toContain("prl_");
    expect(href).not.toContain("/unlock/");
    expect(href).not.toContain("unlockToken");
    expect(href).not.toContain("short-code");
    expect(href).not.toContain("TradeInfo");
    expect(href).not.toContain("TradeSha");
    expect(href).not.toContain("line-user-1");

    const parsed = new URL(href, "https://staging.anyu.tw");
    const resolved = resolveLineRecoveryBindStateToken({
      token: parsed.searchParams.get("state"),
      env: TEST_ENV,
      now: NOW,
    });

    expect(resolved).toMatchObject({
      ok: true,
      payload: {
        source: "checkout_start",
        returnPath: `/m/ambiguous-temperature/result/${RESULT_ID}/checkout`,
      },
    });
  });

  it("builds a recovery LIFF entry URL when LINE LIFF base URL is configured", () => {
    const result = createLineRecoveryBindHref({
      moduleSlug: "ambiguous-temperature",
      resultId: RESULT_ID,
      paymentIntentId: PAYMENT_INTENT_ID,
      entitlementId: ENTITLEMENT_ID,
      source: "checkout_start",
      returnPath: `/m/ambiguous-temperature/result/${RESULT_ID}/checkout`,
      env: {
        ...TEST_ENV,
        NEXT_PUBLIC_LINE_LIFF_URL: "https://liff.line.me/2010157793-Q4JeeYv0/line/recovery/bind",
      },
    });

    expect(result.ok).toBe(true);

    const href = result.ok ? result.href : "";
    expect(href).toContain("https://liff.line.me/2010157793-Q4JeeYv0?");
    expect(href).not.toContain("/2010157793-Q4JeeYv0/line/recovery/bind");
    expect(href).not.toContain("pa_");
    expect(href).not.toContain("pcs_");
    expect(href).not.toContain("prl_");
    expect(href).not.toContain("/unlock/");
    expect(href).not.toContain("unlockToken");
    expect(href).not.toContain("short-code");
    expect(href).not.toContain("TradeInfo");
    expect(href).not.toContain("TradeSha");

    const parsed = new URL(href);
    const resolved = resolveLineRecoveryBindStateToken({
      token: parsed.searchParams.get("state"),
      env: TEST_ENV,
      now: NOW,
    });

    expect(resolved).toMatchObject({
      ok: true,
      payload: {
        source: "checkout_start",
        returnPath: `/m/ambiguous-temperature/result/${RESULT_ID}/checkout`,
      },
    });
  });

  it("rejects unsafe return paths and forbidden recovery state values", () => {
    expect(isSafeLineRecoveryReturnPath("/m/ambiguous-temperature/result/abc")).toBe(true);
    expect(isSafeLineRecoveryReturnPath("//evil.example/path")).toBe(false);
    expect(isSafeLineRecoveryReturnPath("https://evil.example/path")).toBe(false);
    expect(isSafeLineRecoveryReturnPath("/m/ambiguous-temperature/unlock/pa_x")).toBe(false);
    expect(isSafeLineRecoveryReturnPath("/payment/return?checkoutToken=pcs_x")).toBe(false);

    expect(createValidToken({ resultId: "pa_x" })).toEqual({
      ok: false,
      error: "state_invalid",
    });
    expect(createValidToken({ returnPath: "/payment/return?fulfillmentCode=short-code" })).toEqual({
      ok: false,
      error: "state_invalid",
    });
  });

  it("fails safely for missing, expired, unsigned, and tampered state", () => {
    expect(resolveLineRecoveryBindStateToken({ token: "", env: TEST_ENV })).toEqual({
      ok: false,
      error: "state_missing",
    });
    expect(resolveLineRecoveryBindStateToken({ token: "not_rlb", env: TEST_ENV })).toEqual({
      ok: false,
      error: "state_invalid",
    });

    const missingConfig = createValidToken({ env: {} as NodeJS.ProcessEnv });
    expect(missingConfig).toEqual({ ok: false, error: "config_missing" });

    const expired = createValidToken({ ttlSeconds: 1 });
    expect(expired.ok).toBe(true);
    expect(
      resolveLineRecoveryBindStateToken({
        token: expired.ok ? expired.token : "",
        env: TEST_ENV,
        now: new Date(NOW.getTime() + 2000),
      }),
    ).toEqual({ ok: false, error: "state_expired" });

    const created = createValidToken();
    const token = created.ok ? created.token : "";
    const tampered = token.replace(/.$/u, token.endsWith("a") ? "b" : "a");

    expect(resolveLineRecoveryBindStateToken({ token: tampered, env: TEST_ENV, now: NOW })).toEqual({
      ok: false,
      error: "state_invalid",
    });
  });

  it("binds a verified LINE user as a hash-only recovery contact", async () => {
    const dbMock = createDbMock({
      insertRows: [{ id: RECOVERY_CONTACT_ID }],
    });
    mockRequireDb.mockReturnValue(dbMock.db);

    const created = createValidToken();
    const resolved = resolveLineRecoveryBindStateToken({
      token: created.ok ? created.token : "",
      env: TEST_ENV,
      now: NOW,
    });
    expect(resolved.ok).toBe(true);

    const result = await bindVerifiedLineUserToRecoveryContact({
      state: resolved.ok ? resolved.payload : ({} as never),
      lineUserId: "line-user-1",
      env: TEST_ENV,
      now: NOW,
    });

    expect(result).toEqual({
      ok: true,
      category: "success",
      recoveryContactId: RECOVERY_CONTACT_ID,
      status: "bound",
    });

    const expectedHash = hashRecoveryContact({
      value: "line-user-1",
      contactType: "line",
      env: TEST_ENV,
    });
    expect(dbMock.capture.insertValues).toMatchObject({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: RESULT_ID,
      paymentIntentId: PAYMENT_INTENT_ID,
      entitlementId: ENTITLEMENT_ID,
      contactType: "line",
      contactHash: expectedHash,
      lineUserHash: expectedHash,
      contactEncrypted: null,
      emailHash: null,
      source: "completed_result",
      status: "bound",
      transactionalConsentAt: NOW,
      marketingOptInAt: NOW,
    });
    expect(dbMock.capture.insertValues).not.toHaveProperty("lineUserId");
    expect(JSON.stringify(dbMock.capture.insertValues)).not.toContain("line-user-1");
  });

  it("keeps LINE bind failures sanitized", async () => {
    const created = createValidToken();
    const resolved = resolveLineRecoveryBindStateToken({
      token: created.ok ? created.token : "",
      env: TEST_ENV,
      now: NOW,
    });
    expect(resolved.ok).toBe(true);

    await expect(
      bindVerifiedLineUserToRecoveryContact({
        state: resolved.ok ? resolved.payload : ({} as never),
        lineUserId: "",
        env: TEST_ENV,
      }),
    ).resolves.toEqual({ ok: false, category: "line_user_missing" });
    expect(mockRequireDb).not.toHaveBeenCalled();

    await expect(
      bindVerifiedLineUserToRecoveryContact({
        state: resolved.ok ? resolved.payload : ({} as never),
        lineUserId: "line-user-1",
        env: {} as NodeJS.ProcessEnv,
      }),
    ).resolves.toEqual({ ok: false, category: "line_hash_failed" });
  });

  it("leaves Email recovery helpers unaffected", async () => {
    const dbMock = createDbMock({
      insertRows: [{ id: RECOVERY_CONTACT_ID }],
    });
    mockRequireDb.mockReturnValue(dbMock.db);

    await createOrUpdateEmailRecoveryContact({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: RESULT_ID,
      email: "Owner@Example.com ",
      source: "checkout_start",
      env: TEST_ENV,
    });

    expect(dbMock.capture.insertValues).toMatchObject({
      contactType: "email",
      source: "checkout_start",
      status: "pending",
    });
    expect(dbMock.capture.insertValues?.emailHash).toEqual(
      hashRecoveryContact({
        value: "owner@example.com",
        contactType: "email",
        env: TEST_ENV,
      }),
    );
    expect(dbMock.capture.insertValues?.contactEncrypted).not.toContain("Owner@Example.com");
    expect(dbMock.capture.insertValues).not.toHaveProperty("email");
  });
});
