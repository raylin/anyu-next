import { Buffer } from "node:buffer";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockIsDbConfigured, mockRequireDb, mockVerifyLineIdToken } = vi.hoisted(() => ({
  mockIsDbConfigured: vi.fn(),
  mockRequireDb: vi.fn(),
  mockVerifyLineIdToken: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  isDbConfigured: mockIsDbConfigured,
  requireDb: mockRequireDb,
}));

vi.mock("@/lib/line/liff", () => ({
  verifyLineIdToken: mockVerifyLineIdToken,
}));

import { POST } from "@/app/api/line/recovery/bind-liff/route";
import { createLineRecoveryBindStateToken } from "@/lib/line/recovery-bind-state";
import { hashRecoveryContact } from "@/lib/payments/recovery-contact-crypto";

const RESULT_ID = "22222222-2222-4222-8222-222222222222";
const PAYMENT_INTENT_ID = "33333333-3333-4333-8333-333333333333";
const ENTITLEMENT_ID = "44444444-4444-4444-8444-444444444444";
const RECOVERY_CONTACT_ID = "77777777-7777-4777-8777-777777777777";
const NOW = new Date("2030-06-01T10:00:00.000Z");
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

function recoveryRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/line/recovery/bind-liff", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function createState(overrides?: Partial<Parameters<typeof createLineRecoveryBindStateToken>[0]>) {
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

describe("LINE recovery bind LIFF route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PAYMENT_RECOVERY_CONTACT_HASH_SECRET =
      TEST_ENV.PAYMENT_RECOVERY_CONTACT_HASH_SECRET;
    process.env.PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY =
      TEST_ENV.PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY;
    mockIsDbConfigured.mockReturnValue(true);
    mockVerifyLineIdToken.mockResolvedValue({
      ok: true,
      lineUserId: "verified-line-user",
      audience: "1234567890",
    });
  });

  it("binds verified LIFF identity to hash-only LINE recovery contact", async () => {
    const dbMock = createDbMock({
      insertRows: [{ id: RECOVERY_CONTACT_ID }],
    });
    mockRequireDb.mockReturnValue(dbMock.db);
    const state = createState();
    expect(state.ok).toBe(true);

    const response = await POST(
      recoveryRequest({
        state: state.ok ? state.token : "",
        idToken: "line-id-token",
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      ok: true,
      status: "success",
      recoveryContactStatus: "bound",
      returnPath: `/m/ambiguous-temperature/result/${RESULT_ID}?lineRecovery=line_saved`,
    });
    expect(mockVerifyLineIdToken).toHaveBeenCalledWith({ idToken: "line-id-token" });

    const expectedHash = hashRecoveryContact({
      value: "verified-line-user",
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
      marketingOptInAt: expect.any(Date),
    });
    expect(dbMock.capture.insertValues).not.toHaveProperty("lineUserId");
    expect(JSON.stringify(dbMock.capture.insertValues)).not.toContain("verified-line-user");
    expect(JSON.stringify(data)).not.toContain("verified-line-user");
    expect(JSON.stringify(data)).not.toContain("line-id-token");
    expect(JSON.stringify(data)).not.toContain("pa_");
    expect(JSON.stringify(data)).not.toContain("pcs_");
  });

  it("fails safely for missing or unverifiable LINE identity and keeps Email fallback return path", async () => {
    const state = createState({ marketingOptIn: false, entitlementId: null });
    expect(state.ok).toBe(true);

    const missingResponse = await POST(
      recoveryRequest({
        state: state.ok ? state.token : "",
      }),
    );
    const missingData = await missingResponse.json();

    expect(missingResponse.status).toBe(400);
    expect(missingData).toEqual({
      ok: false,
      error: "line_user_missing",
      returnPath: `/m/ambiguous-temperature/result/${RESULT_ID}?lineRecovery=line_error`,
    });
    expect(mockVerifyLineIdToken).not.toHaveBeenCalled();

    mockVerifyLineIdToken.mockResolvedValueOnce({ ok: false, error: "line_verify_failed" });
    const invalidResponse = await POST(
      recoveryRequest({
        state: state.ok ? state.token : "",
        idToken: "bad-line-id-token",
      }),
    );
    const invalidData = await invalidResponse.json();

    expect(invalidResponse.status).toBe(401);
    expect(invalidData).toEqual({
      ok: false,
      error: "line_user_missing",
      returnPath: `/m/ambiguous-temperature/result/${RESULT_ID}?lineRecovery=line_error`,
    });
  });

  it("rejects expired, tampered, and token-like recovery state safely", async () => {
    const expired = createState({ ttlSeconds: 1, now: new Date(Date.now() - 2000) });
    expect(expired.ok).toBe(true);

    const expiredResponse = await POST(
      recoveryRequest({
        state: expired.ok ? expired.token : "",
        idToken: "line-id-token",
      }),
    );
    await expect(expiredResponse.json()).resolves.toEqual({
      ok: false,
      error: "state_expired",
    });
    expect(expiredResponse.status).toBe(410);

    const valid = createState();
    const token = valid.ok ? valid.token : "";
    const tampered = token.replace(/.$/u, token.endsWith("a") ? "b" : "a");
    const tamperedResponse = await POST(
      recoveryRequest({
        state: tampered,
        idToken: "line-id-token",
      }),
    );
    await expect(tamperedResponse.json()).resolves.toEqual({
      ok: false,
      error: "state_invalid",
    });
    expect(tamperedResponse.status).toBe(400);

    const tokenLikeResponse = await POST(
      recoveryRequest({
        state: "pa_x",
        idToken: "line-id-token",
      }),
    );
    await expect(tokenLikeResponse.json()).resolves.toEqual({
      ok: false,
      error: "state_invalid",
    });
    expect(tokenLikeResponse.status).toBe(400);
    expect(mockVerifyLineIdToken).not.toHaveBeenCalled();
  });

  it("keeps marketing opt-in separate when the recovery state does not request it", async () => {
    const dbMock = createDbMock({
      insertRows: [{ id: RECOVERY_CONTACT_ID }],
    });
    mockRequireDb.mockReturnValue(dbMock.db);
    const state = createState({
      source: "paid_ready",
      entitlementId: null,
      marketingOptIn: false,
    });
    expect(state.ok).toBe(true);

    const response = await POST(
      recoveryRequest({
        state: state.ok ? state.token : "",
        idToken: "line-id-token",
      }),
    );

    expect(response.status).toBe(200);
    expect(dbMock.capture.insertValues).toMatchObject({
      source: "paid_ready",
      status: "verified",
      marketingOptInAt: null,
    });
  });

  it("fails closed when recovery config or DB config is unavailable", async () => {
    mockIsDbConfigured.mockReturnValueOnce(false);

    const dbResponse = await POST(recoveryRequest({}));
    await expect(dbResponse.json()).resolves.toEqual({
      ok: false,
      error: "config_error",
    });
    expect(dbResponse.status).toBe(503);

    delete process.env.PAYMENT_RECOVERY_CONTACT_HASH_SECRET;
    const configResponse = await POST(
      recoveryRequest({
        state: "rlb_missing-config",
        idToken: "line-id-token",
      }),
    );

    await expect(configResponse.json()).resolves.toEqual({
      ok: false,
      error: "config_error",
    });
    expect(configResponse.status).toBe(503);
  });
});
