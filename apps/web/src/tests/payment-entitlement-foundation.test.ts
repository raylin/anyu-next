import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockRequireDb } = vi.hoisted(() => ({
  mockRequireDb: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  requireDb: mockRequireDb,
}));

import {
  createPaymentSingleEntitlement,
  ENTITLEMENT_SOURCES,
  ENTITLEMENT_STATUSES,
  ENTITLEMENT_TYPES,
  getEntitlementByPaidAccessToken,
  markEntitlementExpired,
  markEntitlementRefunded,
  markEntitlementRevoked,
  rotatePaidAccessToken,
} from "@/lib/db/entitlements";
import {
  createPaymentIntent,
  markPaymentCheckoutStarted,
  markPaymentExpired,
  markPaymentFailed,
  markPaymentPaid,
  markPaymentRefunded,
  PAYMENT_INTENT_STATUSES,
  PAYMENT_PROVIDER_ENVIRONMENTS,
  PAYMENT_PROVIDERS,
} from "@/lib/db/payment-intents";
import {
  generateMerchantOrderNo,
  isValidMerchantOrderNo,
} from "@/lib/payments/merchant-order";
import {
  generatePaidAccessToken,
  hashPaidAccessToken,
  isPaidAccessToken,
} from "@/lib/payments/paid-access-token";

const REQUEST_ID = "11111111-1111-4111-8111-111111111111";
const RESULT_ID = "22222222-2222-4222-8222-222222222222";
const PAYMENT_INTENT_ID = "33333333-3333-4333-8333-333333333333";
const ENTITLEMENT_ID = "44444444-4444-4444-8444-444444444444";
const UNLOCK_INTENT_ID = "55555555-5555-4555-8555-555555555555";
const GENERATION_JOB_ID = "66666666-6666-4666-8666-666666666666";
const NOW = new Date("2026-05-27T15:30:12.000Z");
const TEST_ENV = {
  PAID_ACCESS_TOKEN_HASH_SECRET: "test-only-paid-access-secret",
} as NodeJS.ProcessEnv;

function createInsertDb(returningRows: unknown[] = []) {
  const capture: { values?: Record<string, unknown> } = {};
  const chain = {
    values: vi.fn((values) => {
      capture.values = values;
      return chain;
    }),
    returning: vi.fn(async () => returningRows),
  };

  return {
    capture,
    db: {
      insert: vi.fn(() => chain),
    },
  };
}

function createSelectDb(returningRows: unknown[] = []) {
  const chain = {
    from: vi.fn(() => chain),
    where: vi.fn(() => chain),
    limit: vi.fn(async () => returningRows),
  };

  return {
    db: {
      select: vi.fn(() => chain),
    },
  };
}

function createUpdateDb(returningRows: unknown[] = []) {
  const capture: { set?: Record<string, unknown> } = {};
  const chain = {
    set: vi.fn((values) => {
      capture.set = values;
      return chain;
    }),
    where: vi.fn(() => chain),
    returning: vi.fn(async () => returningRows),
  };

  return {
    capture,
    db: {
      update: vi.fn(() => chain),
    },
  };
}

describe("payment and entitlement foundation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defines the approved payment and entitlement constants", () => {
    expect(PAYMENT_PROVIDERS).toEqual(["newebpay", "operator_fake"]);
    expect(PAYMENT_PROVIDER_ENVIRONMENTS).toEqual([
      "production",
      "staging",
      "sandbox",
      "unknown",
    ]);
    expect(PAYMENT_INTENT_STATUSES).toEqual([
      "created",
      "checkout_started",
      "paid",
      "failed",
      "cancelled",
      "expired",
      "refund_pending",
      "refunded",
    ]);
    expect(ENTITLEMENT_TYPES).toEqual([
      "single_paid_analysis",
      "future_relationship_pack",
      "future_observation_pass",
    ]);
    expect(ENTITLEMENT_SOURCES).toEqual([
      "payment_single",
      "line_first_free",
      "operator_test",
      "future_pack",
      "future_promo",
    ]);
    expect(ENTITLEMENT_STATUSES).toEqual([
      "active",
      "consumed",
      "expired",
      "revoked",
      "refunded",
    ]);
  });

  it("generates merchant order numbers without user data", () => {
    const orderNo = generateMerchantOrderNo(NOW);

    expect(orderNo).toMatch(/^ANYU260527153012[A-Z0-9]{6}$/u);
    expect(isValidMerchantOrderNo(orderNo)).toBe(true);
    expect(orderNo).not.toContain("LINE");
    expect(orderNo).not.toContain("user");
    expect(orderNo).not.toContain("曖昧");
  });

  it("generates unique-ish merchant order numbers", () => {
    const generated = new Set(
      Array.from({ length: 100 }, () => generateMerchantOrderNo(NOW)),
    );

    expect(generated.size).toBeGreaterThan(95);
  });

  it("generates and hashes paid access tokens safely", () => {
    const token = generatePaidAccessToken();
    const otherToken = generatePaidAccessToken();

    expect(token).toMatch(/^pa_[A-Za-z0-9_-]{43}$/u);
    expect(isPaidAccessToken(token)).toBe(true);
    expect(isPaidAccessToken("legacy-unlock-token")).toBe(false);
    expect(hashPaidAccessToken(token, TEST_ENV)).toBe(hashPaidAccessToken(token, TEST_ENV));
    expect(hashPaidAccessToken(token, TEST_ENV)).not.toBe(token);
    expect(hashPaidAccessToken(token, TEST_ENV)).not.toBe(
      hashPaidAccessToken(otherToken, TEST_ENV),
    );
    expect(() => hashPaidAccessToken(token, {} as NodeJS.ProcessEnv)).toThrow(
      "paid_access_token_hash_secret_missing",
    );
  });

  it("creates payment intents with only safe provider/order fields", async () => {
    const created = { id: PAYMENT_INTENT_ID, status: "created" };
    const { db, capture } = createInsertDb([created]);
    mockRequireDb.mockReturnValue(db);

    await expect(
      createPaymentIntent({
        provider: "newebpay",
        providerEnvironment: "staging",
        merchantOrderNo: "ANYU260527153012A1B2C3",
        moduleSlug: "ambiguous-temperature",
        analysisRequestId: REQUEST_ID,
        analysisResultId: RESULT_ID,
        unlockIntentId: UNLOCK_INTENT_ID,
        amountMinor: 49,
      }),
    ).resolves.toEqual(created);

    expect(capture.values).toMatchObject({
      provider: "newebpay",
      providerEnvironment: "staging",
      merchantOrderNo: "ANYU260527153012A1B2C3",
      moduleSlug: "ambiguous-temperature",
      analysisRequestId: REQUEST_ID,
      analysisResultId: RESULT_ID,
      unlockIntentId: UNLOCK_INTENT_ID,
      amountMinor: 49,
      currency: "TWD",
      status: "created",
    });
    expect(capture.values).not.toHaveProperty("rawProviderPayload");
    expect(capture.values).not.toHaveProperty("cardNumber");
  });

  it("marks payment transitions with safe timestamps and provider categories", async () => {
    const paid = createUpdateDb([{ id: PAYMENT_INTENT_ID, status: "paid" }]);
    mockRequireDb.mockReturnValue(paid.db);

    await markPaymentPaid({
      paymentIntentId: PAYMENT_INTENT_ID,
      paidAt: NOW,
      providerStatus: "SUCCESS",
      providerTradeNo: "provider-trade-ref",
      providerPaymentType: "credit_card",
      providerResponseCode: "00",
      providerMessageCategory: "approved",
      notifyReceivedAt: NOW,
    });

    expect(paid.capture.set).toMatchObject({
      status: "paid",
      paidAt: NOW,
      providerStatus: "SUCCESS",
      providerTradeNo: "provider-trade-ref",
      providerPaymentType: "credit_card",
      providerResponseCode: "00",
      providerMessageCategory: "approved",
      notifyReceivedAt: NOW,
    });

    for (const transition of [
      () => markPaymentCheckoutStarted({ paymentIntentId: PAYMENT_INTENT_ID, at: NOW }),
      () => markPaymentFailed({ paymentIntentId: PAYMENT_INTENT_ID, failedAt: NOW }),
      () => markPaymentExpired({ paymentIntentId: PAYMENT_INTENT_ID, expiredAt: NOW }),
      () => markPaymentRefunded({ paymentIntentId: PAYMENT_INTENT_ID, refundedAt: NOW }),
    ]) {
      const update = createUpdateDb([{ id: PAYMENT_INTENT_ID }]);
      mockRequireDb.mockReturnValue(update.db);
      await transition();
    }
  });

  it("creates payment entitlements with hashed token storage only", async () => {
    const { db, capture } = createInsertDb([{ id: ENTITLEMENT_ID, status: "active" }]);
    mockRequireDb.mockReturnValue(db);

    const result = await createPaymentSingleEntitlement({
      moduleSlug: "ambiguous-temperature",
      analysisRequestId: REQUEST_ID,
      analysisResultId: RESULT_ID,
      paymentIntentId: PAYMENT_INTENT_ID,
      unlockIntentId: UNLOCK_INTENT_ID,
      generationJobId: GENERATION_JOB_ID,
      paidAccessTokenExpiresAt: NOW,
      expiresAt: NOW,
      env: TEST_ENV,
    });

    expect(result.entitlement).toEqual({ id: ENTITLEMENT_ID, status: "active" });
    expect(result.paidAccessToken).toMatch(/^pa_/u);
    expect(capture.values).toMatchObject({
      entitlementType: "single_paid_analysis",
      source: "payment_single",
      status: "active",
      moduleSlug: "ambiguous-temperature",
      analysisRequestId: REQUEST_ID,
      analysisResultId: RESULT_ID,
      paymentIntentId: PAYMENT_INTENT_ID,
      unlockIntentId: UNLOCK_INTENT_ID,
      generationJobId: GENERATION_JOB_ID,
      paidAccessTokenExpiresAt: NOW,
      expiresAt: NOW,
      remainingUses: null,
    });
    expect(capture.values?.paidAccessTokenHash).toBe(
      hashPaidAccessToken(result.paidAccessToken, TEST_ENV),
    );
    expect(capture.values?.paidAccessTokenHash).not.toBe(result.paidAccessToken);
    expect(capture.values).not.toHaveProperty("paidAccessToken");
    expect(capture.values).not.toHaveProperty("paidResultJson");
  });

  it("looks up and rotates paid access tokens by hash", async () => {
    const token = generatePaidAccessToken();
    const selected = createSelectDb([{ id: ENTITLEMENT_ID, status: "active" }]);
    mockRequireDb.mockReturnValue(selected.db);

    await expect(getEntitlementByPaidAccessToken(token, TEST_ENV)).resolves.toEqual({
      id: ENTITLEMENT_ID,
      status: "active",
    });

    const rotated = createUpdateDb([{ id: ENTITLEMENT_ID, status: "active" }]);
    mockRequireDb.mockReturnValue(rotated.db);
    const result = await rotatePaidAccessToken({
      entitlementId: ENTITLEMENT_ID,
      paidAccessTokenExpiresAt: NOW,
      env: TEST_ENV,
    });

    expect(result.paidAccessToken).toMatch(/^pa_/u);
    expect(rotated.capture.set?.paidAccessTokenHash).toBe(
      hashPaidAccessToken(result.paidAccessToken, TEST_ENV),
    );
    expect(rotated.capture.set?.paidAccessTokenHash).not.toBe(result.paidAccessToken);
  });

  it("marks entitlement terminal states without changing product runtime", async () => {
    for (const transition of [
      () => markEntitlementRefunded({ entitlementId: ENTITLEMENT_ID, refundedAt: NOW }),
      () => markEntitlementRevoked({ entitlementId: ENTITLEMENT_ID, revokedAt: NOW }),
      () => markEntitlementExpired({ entitlementId: ENTITLEMENT_ID, expiredAt: NOW }),
    ]) {
      const update = createUpdateDb([{ id: ENTITLEMENT_ID }]);
      mockRequireDb.mockReturnValue(update.db);
      await transition();
      expect(update.capture.set?.updatedAt).toBeInstanceOf(Date);
    }
  });
});
