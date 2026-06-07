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
  createOrUpdateLineRecoveryRecipientSecret,
  getActiveLineRecoveryRecipientSecretByContactId,
  markLineRecoveryRecipientSecretFailed,
  markLineRecoveryRecipientSecretUsed,
  PAYMENT_RECOVERY_CONTACT_SECRET_CHANNELS,
  PAYMENT_RECOVERY_CONTACT_SECRET_KEY_VERSION,
  PAYMENT_RECOVERY_CONTACT_SECRET_PURPOSES,
  PAYMENT_RECOVERY_CONTACT_SECRET_STATUSES,
  resolveLineRecoveryRecipientForSending,
  revokeLineRecoveryRecipientSecret,
} from "@/lib/db/payment-recovery-contact-secrets";
import {
  decryptLineRecoveryRecipient,
  encryptLineRecoveryRecipient,
  hashLineRecoveryRecipient,
  LineRecoveryRecipientConfigError,
} from "@/lib/payments/line-recovery-recipient-crypto";

const RECOVERY_CONTACT_ID = "77777777-7777-4777-8777-777777777777";
const SECRET_ID = "99999999-9999-4999-8999-999999999999";
const RAW_LINE_USER_ID = "line-user-test-only";
const NOW = new Date("2026-06-03T08:00:00.000Z");
const TEST_ENV = {
  PAYMENT_RECOVERY_CONTACT_HASH_SECRET: "test-only-recovery-contact-hash-secret",
  LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY: Buffer.alloc(32, 9).toString("base64url"),
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

function secretRecord(overrides: Record<string, unknown> = {}) {
  const encryptedRecipient = encryptLineRecoveryRecipient({
    lineUserId: RAW_LINE_USER_ID,
    env: TEST_ENV,
  });

  return {
    id: SECRET_ID,
    recoveryContactId: RECOVERY_CONTACT_ID,
    channel: "line",
    purpose: "access_link_delivery",
    recipientHash: hashLineRecoveryRecipient({
      lineUserId: RAW_LINE_USER_ID,
      env: TEST_ENV,
    }),
    encryptedRecipient,
    keyVersion: PAYMENT_RECOVERY_CONTACT_SECRET_KEY_VERSION,
    status: "active",
    failureCategory: null,
    lastUsedAt: null,
    revokedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

describe("payment recovery contact secrets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defines approved secret constants", () => {
    expect(PAYMENT_RECOVERY_CONTACT_SECRET_CHANNELS).toEqual(["line"]);
    expect(PAYMENT_RECOVERY_CONTACT_SECRET_PURPOSES).toEqual([
      "recovery_link_delivery",
      "access_link_delivery",
    ]);
    expect(PAYMENT_RECOVERY_CONTACT_SECRET_STATUSES).toEqual([
      "active",
      "revoked",
      "failed",
    ]);
  });

  it("encrypts and decrypts LINE recipients with a separate explicit key", () => {
    const encrypted = encryptLineRecoveryRecipient({
      lineUserId: RAW_LINE_USER_ID,
      env: TEST_ENV,
    });

    expect(encrypted).toMatch(/^v1\./u);
    expect(encrypted).not.toContain(RAW_LINE_USER_ID);
    expect(
      decryptLineRecoveryRecipient({
        encryptedRecipient: encrypted,
        env: TEST_ENV,
      }),
    ).toBe(RAW_LINE_USER_ID);
  });

  it("derives a stable AES key from high-entropy encoded LINE recipient secrets", () => {
    const derivedKeyEnv = {
      ...TEST_ENV,
      LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY: Buffer.alloc(48, 12).toString("base64url"),
    } as NodeJS.ProcessEnv;
    const encrypted = encryptLineRecoveryRecipient({
      lineUserId: RAW_LINE_USER_ID,
      env: derivedKeyEnv,
    });

    expect(encrypted).toMatch(/^v1\./u);
    expect(encrypted).not.toContain(RAW_LINE_USER_ID);
    expect(
      decryptLineRecoveryRecipient({
        encryptedRecipient: encrypted,
        env: derivedKeyEnv,
      }),
    ).toBe(RAW_LINE_USER_ID);
  });

  it("hashes LINE recipients deterministically without exposing raw values", () => {
    const first = hashLineRecoveryRecipient({
      lineUserId: RAW_LINE_USER_ID,
      env: TEST_ENV,
    });
    const second = hashLineRecoveryRecipient({
      lineUserId: RAW_LINE_USER_ID,
      env: TEST_ENV,
    });

    expect(first).toBe(second);
    expect(first).toMatch(/^[0-9a-f]{64}$/u);
    expect(first).not.toContain(RAW_LINE_USER_ID);
  });

  it("fails closed when encryption or hash config is missing or invalid", () => {
    expect(() =>
      encryptLineRecoveryRecipient({
        lineUserId: RAW_LINE_USER_ID,
        env: {
          PAYMENT_RECOVERY_CONTACT_HASH_SECRET: TEST_ENV.PAYMENT_RECOVERY_CONTACT_HASH_SECRET,
        } as NodeJS.ProcessEnv,
      }),
    ).toThrow(LineRecoveryRecipientConfigError);

    expect(() =>
      encryptLineRecoveryRecipient({
        lineUserId: RAW_LINE_USER_ID,
        env: {
          PAYMENT_RECOVERY_CONTACT_HASH_SECRET: TEST_ENV.PAYMENT_RECOVERY_CONTACT_HASH_SECRET,
          LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY: "not-a-valid-key",
        } as NodeJS.ProcessEnv,
      }),
    ).toThrow("line_recovery_recipient_encryption_key_invalid");

    expect(() =>
      hashLineRecoveryRecipient({
        lineUserId: RAW_LINE_USER_ID,
        env: {
          LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY:
            TEST_ENV.LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY,
        } as NodeJS.ProcessEnv,
      }),
    ).toThrow("payment_recovery_contact_hash_secret_missing");
  });

  it("rejects raw paid access, checkout session, or recovery link bearer tokens as recipients", () => {
    for (const lineUserId of ["pa_secret_value", "pcs_secret_value", "prl_secret_value"]) {
      expect(() =>
        encryptLineRecoveryRecipient({
          lineUserId,
          env: TEST_ENV,
        }),
      ).toThrow("line_recovery_recipient_bearer_token_not_allowed");
    }
  });

  it("stores encrypted recipient and hash but returns sanitized secret metadata", async () => {
    const inserted = secretRecord();
    const dbMock = createDbMock({
      selectRows: [],
      insertRows: [inserted],
    });
    mockRequireDb.mockReturnValue(dbMock.db);

    const result = await createOrUpdateLineRecoveryRecipientSecret({
      recoveryContactId: RECOVERY_CONTACT_ID,
      lineUserId: RAW_LINE_USER_ID,
      env: TEST_ENV,
      now: NOW,
    });

    expect(dbMock.capture.insertValues).toMatchObject({
      recoveryContactId: RECOVERY_CONTACT_ID,
      channel: "line",
      purpose: "access_link_delivery",
      keyVersion: "v1",
      status: "active",
      updatedAt: NOW,
    });
    expect(dbMock.capture.insertValues?.recipientHash).toBe(
      hashLineRecoveryRecipient({
        lineUserId: RAW_LINE_USER_ID,
        env: TEST_ENV,
      }),
    );
    expect(dbMock.capture.insertValues?.encryptedRecipient).not.toContain(
      RAW_LINE_USER_ID,
    );
    expect(result).toMatchObject({
      id: SECRET_ID,
      recoveryContactId: RECOVERY_CONTACT_ID,
      channel: "line",
      purpose: "access_link_delivery",
      status: "active",
    });
    expect(result).not.toHaveProperty("recipientHash");
    expect(result).not.toHaveProperty("encryptedRecipient");
    expect(JSON.stringify(result)).not.toContain(RAW_LINE_USER_ID);
  });

  it("updates an existing active recipient secret idempotently", async () => {
    const updated = secretRecord({ updatedAt: NOW });
    const dbMock = createDbMock({
      selectRows: [secretRecord()],
      updateRows: [updated],
    });
    mockRequireDb.mockReturnValue(dbMock.db);

    const result = await createOrUpdateLineRecoveryRecipientSecret({
      recoveryContactId: RECOVERY_CONTACT_ID,
      lineUserId: RAW_LINE_USER_ID,
      env: TEST_ENV,
      now: NOW,
    });

    expect(dbMock.db.insert).not.toHaveBeenCalled();
    expect(dbMock.capture.updateValues).toMatchObject({
      keyVersion: "v1",
      status: "active",
      failureCategory: null,
      revokedAt: null,
      updatedAt: NOW,
    });
    expect(result).toMatchObject({ id: SECRET_ID, status: "active" });
    expect(JSON.stringify(result)).not.toContain(RAW_LINE_USER_ID);
  });

  it("looks up active secrets and decrypts recipient only through explicit internal helper", async () => {
    const dbMock = createDbMock({
      selectRows: [secretRecord()],
    });
    mockRequireDb.mockReturnValue(dbMock.db);

    await expect(
      getActiveLineRecoveryRecipientSecretByContactId(RECOVERY_CONTACT_ID),
    ).resolves.toMatchObject({
      id: SECRET_ID,
      encryptedRecipient: expect.any(String),
      recipientHash: expect.any(String),
    });
    await expect(
      resolveLineRecoveryRecipientForSending({
        recoveryContactId: RECOVERY_CONTACT_ID,
        env: TEST_ENV,
      }),
    ).resolves.toBe(RAW_LINE_USER_ID);
  });

  it("revokes, marks failed, and records last-used timestamps with sanitized returns", async () => {
    const dbMock = createDbMock({
      updateRows: [secretRecord({ status: "revoked", revokedAt: NOW })],
    });
    mockRequireDb.mockReturnValue(dbMock.db);

    await expect(
      revokeLineRecoveryRecipientSecret({
        recoveryContactId: RECOVERY_CONTACT_ID,
        revokedAt: NOW,
      }),
    ).resolves.toMatchObject({
      id: SECRET_ID,
      status: "revoked",
      revokedAt: NOW,
    });
    expect(dbMock.capture.updateValues).toMatchObject({
      status: "revoked",
      revokedAt: NOW,
      updatedAt: NOW,
    });

    const failedDb = createDbMock({
      updateRows: [secretRecord({ status: "failed", failureCategory: "line_blocked" })],
    });
    mockRequireDb.mockReturnValue(failedDb.db);
    await expect(
      markLineRecoveryRecipientSecretFailed({
        recoveryContactId: RECOVERY_CONTACT_ID,
        failureCategory: "line_blocked",
        failedAt: NOW,
      }),
    ).resolves.toMatchObject({
      id: SECRET_ID,
      status: "failed",
      failureCategory: "line_blocked",
    });

    const usedDb = createDbMock({
      updateRows: [secretRecord({ lastUsedAt: NOW })],
    });
    mockRequireDb.mockReturnValue(usedDb.db);
    await expect(
      markLineRecoveryRecipientSecretUsed({
        recoveryContactId: RECOVERY_CONTACT_ID,
        usedAt: NOW,
      }),
    ).resolves.toMatchObject({
      id: SECRET_ID,
      status: "active",
      lastUsedAt: NOW,
    });
  });

  it("adds the payment recovery contact secrets migration and schema seam", () => {
    const migration = readFileSync(
      path.resolve(process.cwd(), "drizzle/0011_payment_recovery_contact_secrets.sql"),
      "utf8",
    );
    const schema = readFileSync(
      path.resolve(process.cwd(), "src/lib/db/schema.ts"),
      "utf8",
    );

    expect(migration).toContain('CREATE TABLE "payment_recovery_contact_secrets"');
    expect(migration).toContain('"encrypted_recipient" text NOT NULL');
    expect(migration).toContain('"recipient_hash" text NOT NULL');
    expect(migration).toContain('"key_version" text DEFAULT');
    expect(migration).toContain("payment_recovery_contact_secrets_active_contact_idx");
    expect(migration).not.toContain("line_user_id");
    expect(migration).not.toContain("pa_");
    expect(migration).not.toContain("pcs_");
    expect(migration).not.toContain("prl_");
    expect(schema).toContain(
      'export const paymentAccessLinkContactSecrets = pgTable(\n  "payment_access_link_contact_secrets"',
    );
    expect(schema).toContain(
      "export const paymentRecoveryContactSecrets = paymentAccessLinkContactSecrets;",
    );
  });
});
