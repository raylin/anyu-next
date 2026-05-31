import { Buffer } from "node:buffer";
import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRequireDb } = vi.hoisted(() => ({
  mockRequireDb: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  requireDb: mockRequireDb,
}));

import {
  bindRecoveryContactsToEntitlement,
  createOrUpdateEmailRecoveryContact,
  createOrUpdateLineRecoveryContact,
  PAYMENT_RECOVERY_CONTACT_SOURCES,
  PAYMENT_RECOVERY_CONTACT_STATUSES,
  PAYMENT_RECOVERY_CONTACT_TYPES,
  recordPaymentRecoveryMarketingOptIn,
} from "@/lib/db/payment-recovery-contacts";
import {
  decryptRecoveryContactValue,
  encryptRecoveryContactValue,
  hashRecoveryContact,
  RecoveryContactConfigError,
} from "@/lib/payments/recovery-contact-crypto";

const RESULT_ID = "22222222-2222-4222-8222-222222222222";
const PAYMENT_INTENT_ID = "33333333-3333-4333-8333-333333333333";
const ENTITLEMENT_ID = "44444444-4444-4444-8444-444444444444";
const RECOVERY_CONTACT_ID = "77777777-7777-4777-8777-777777777777";
const TEST_ENV = {
  PAYMENT_RECOVERY_CONTACT_HASH_SECRET: "test-only-recovery-hash-secret",
  PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString("base64url"),
} as NodeJS.ProcessEnv;

function createDbMock(input?: { selectRows?: unknown[]; insertRows?: unknown[]; updateRows?: unknown[] }) {
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

describe("payment recovery contacts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defines the approved recovery contact constants", () => {
    expect(PAYMENT_RECOVERY_CONTACT_TYPES).toEqual(["line", "email"]);
    expect(PAYMENT_RECOVERY_CONTACT_SOURCES).toEqual([
      "checkout_start",
      "return_waiting",
      "paid_ready",
      "completed_result",
      "support",
      "operator_test",
    ]);
    expect(PAYMENT_RECOVERY_CONTACT_STATUSES).toEqual([
      "pending",
      "verified",
      "bound",
      "failed",
      "revoked",
    ]);
  });

  it("encrypts and decrypts recovery contact values without using raw values as ciphertext", () => {
    const encrypted = encryptRecoveryContactValue({
      value: "owner@example.com",
      env: TEST_ENV,
    });

    expect(encrypted).toMatch(/^v1\./u);
    expect(encrypted).not.toContain("owner@example.com");
    expect(
      decryptRecoveryContactValue({
        encryptedValue: encrypted,
        env: TEST_ENV,
      }),
    ).toBe("owner@example.com");
  });

  it("fails closed when email encryption key is missing", async () => {
    const dbMock = createDbMock();
    mockRequireDb.mockReturnValue(dbMock.db);

    await expect(
      createOrUpdateEmailRecoveryContact({
        moduleSlug: "ambiguous-temperature",
        analysisResultId: RESULT_ID,
        email: "owner@example.com",
        source: "checkout_start",
        env: {
          PAYMENT_RECOVERY_CONTACT_HASH_SECRET: "hash-only",
        } as NodeJS.ProcessEnv,
      }),
    ).rejects.toMatchObject(
      new RecoveryContactConfigError("payment_recovery_contact_encryption_key_missing"),
    );
    expect(dbMock.db.insert).not.toHaveBeenCalled();
  });

  it("creates email recovery contacts with hashed and encrypted values only", async () => {
    const dbMock = createDbMock({
      insertRows: [{ id: RECOVERY_CONTACT_ID }],
    });
    mockRequireDb.mockReturnValue(dbMock.db);

    await createOrUpdateEmailRecoveryContact({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: RESULT_ID,
      paymentIntentId: PAYMENT_INTENT_ID,
      email: "Owner@Example.com ",
      source: "checkout_start",
      env: TEST_ENV,
    });

    expect(dbMock.capture.insertValues).toMatchObject({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: RESULT_ID,
      paymentIntentId: PAYMENT_INTENT_ID,
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
    expect(dbMock.capture.insertValues?.contactHash).toEqual(dbMock.capture.insertValues?.emailHash);
    expect(dbMock.capture.insertValues?.contactEncrypted).not.toContain("Owner@Example.com");
    expect(dbMock.capture.insertValues).not.toHaveProperty("email");
  });

  it("reuses an existing active contact instead of inserting a duplicate", async () => {
    const existing = {
      id: RECOVERY_CONTACT_ID,
      paymentIntentId: null,
      entitlementId: null,
      contactEncrypted: "old",
      lineUserHash: null,
      emailHash: "old-hash",
      transactionalConsentAt: new Date("2026-05-31T01:00:00.000Z"),
      marketingOptInAt: null,
      status: "pending",
    };
    const dbMock = createDbMock({
      selectRows: [existing],
      updateRows: [{ ...existing, paymentIntentId: PAYMENT_INTENT_ID }],
    });
    mockRequireDb.mockReturnValue(dbMock.db);

    await createOrUpdateEmailRecoveryContact({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: RESULT_ID,
      paymentIntentId: PAYMENT_INTENT_ID,
      email: "owner@example.com",
      source: "return_waiting",
      env: TEST_ENV,
    });

    expect(dbMock.db.insert).not.toHaveBeenCalled();
    expect(dbMock.db.update).toHaveBeenCalled();
    expect(dbMock.capture.updateValues).toMatchObject({
      paymentIntentId: PAYMENT_INTENT_ID,
      source: "return_waiting",
    });
  });

  it("stores LINE recovery contacts as hashed identity without encrypted payload", async () => {
    const dbMock = createDbMock({
      insertRows: [{ id: RECOVERY_CONTACT_ID }],
    });
    mockRequireDb.mockReturnValue(dbMock.db);

    await createOrUpdateLineRecoveryContact({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: RESULT_ID,
      lineUserId: "line-user-1",
      source: "checkout_start",
      status: "verified",
      env: TEST_ENV,
    });

    expect(dbMock.capture.insertValues).toMatchObject({
      contactType: "line",
      contactEncrypted: null,
      emailHash: null,
      lineUserHash: hashRecoveryContact({
        value: "line-user-1",
        contactType: "line",
        env: TEST_ENV,
      }),
      status: "verified",
    });
    expect(dbMock.capture.insertValues).not.toHaveProperty("lineUserId");
  });

  it("keeps transactional consent and marketing opt-in separate", async () => {
    const transactionalConsentAt = new Date("2026-05-31T02:00:00.000Z");
    const dbMock = createDbMock({
      insertRows: [{ id: RECOVERY_CONTACT_ID }],
      updateRows: [{ id: RECOVERY_CONTACT_ID }],
    });
    mockRequireDb.mockReturnValue(dbMock.db);

    await createOrUpdateEmailRecoveryContact({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: RESULT_ID,
      email: "owner@example.com",
      source: "checkout_start",
      transactionalConsentAt,
      marketingOptInAt: null,
      env: TEST_ENV,
    });
    await recordPaymentRecoveryMarketingOptIn({
      recoveryContactId: RECOVERY_CONTACT_ID,
      marketingOptInAt: new Date("2026-05-31T03:00:00.000Z"),
    });

    expect(dbMock.capture.insertValues).toMatchObject({
      transactionalConsentAt,
      marketingOptInAt: null,
    });
    expect(dbMock.capture.updateValues).toHaveProperty("marketingOptInAt");
  });

  it("links pre-payment contacts to entitlement after payment", async () => {
    const dbMock = createDbMock({
      updateRows: [{ id: RECOVERY_CONTACT_ID, entitlementId: ENTITLEMENT_ID }],
    });
    mockRequireDb.mockReturnValue(dbMock.db);

    await bindRecoveryContactsToEntitlement({
      paymentIntentId: PAYMENT_INTENT_ID,
      entitlementId: ENTITLEMENT_ID,
    });

    expect(dbMock.capture.updateValues).toMatchObject({
      entitlementId: ENTITLEMENT_ID,
      status: "bound",
    });
  });

  it("rejects raw paid access or checkout session bearer tokens as contact values", async () => {
    await expect(
      createOrUpdateEmailRecoveryContact({
        moduleSlug: "ambiguous-temperature",
        analysisResultId: RESULT_ID,
        email: "pcs_secret_token@example.com",
        source: "checkout_start",
        env: TEST_ENV,
      }),
    ).rejects.toThrow("recovery_contact_bearer_token_not_allowed");

    await expect(
      createOrUpdateLineRecoveryContact({
        moduleSlug: "ambiguous-temperature",
        analysisResultId: RESULT_ID,
        lineUserId: "pa_secret_token_value",
        source: "checkout_start",
        env: TEST_ENV,
      }),
    ).rejects.toThrow("recovery_contact_bearer_token_not_allowed");
  });

  it("adds the payment recovery contacts migration and schema seam", () => {
    const migration = readFileSync(
      path.resolve(process.cwd(), "drizzle/0009_payment_recovery_contacts.sql"),
      "utf8",
    );
    const schema = readFileSync(
      path.resolve(process.cwd(), "src/lib/db/schema.ts"),
      "utf8",
    );

    expect(migration).toContain('CREATE TABLE "payment_recovery_contacts"');
    expect(migration).toContain('"contact_hash" text NOT NULL');
    expect(migration).toContain('"contact_encrypted" text');
    expect(migration).toContain('"transactional_consent_at" timestamp with time zone NOT NULL');
    expect(migration).toContain('"marketing_opt_in_at" timestamp with time zone');
    expect(migration).toContain('"payment_recovery_contacts_result_contact_active_idx"');
    expect(schema).toContain("export const paymentRecoveryContacts = pgTable(");
    expect(schema).not.toContain("raw_pcs");
    expect(schema).not.toContain("raw_pa");
  });
});
