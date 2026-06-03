import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRequireDb, mockGetEntitlementById } = vi.hoisted(() => ({
  mockRequireDb: vi.fn(),
  mockGetEntitlementById: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  requireDb: mockRequireDb,
}));

vi.mock("@/lib/db/entitlements", () => ({
  getEntitlementById: mockGetEntitlementById,
}));

import {
  createPaidResultAccessLink,
  createSupportPaidResultAccessLink,
  createSupportPaidResultRecoveryLink,
  findActivePaidResultAccessLinkForContact,
  getRecentPaidResultAccessLinkForContact,
  createPaidResultRecoveryLink,
  getRecentPaidResultRecoveryLinkForContact,
  isPaidResultAccessLinkActive,
  isPaidResultRecoveryLinkActive,
  markPaidResultAccessLinkFailed,
  markPaidResultAccessLinkSent,
  markPaidResultRecoveryLinkFailed,
  markPaidResultRecoveryLinkSent,
  PAID_RESULT_ACCESS_LINK_CHANNELS,
  PAID_RESULT_ACCESS_LINK_FAILURE_CATEGORIES,
  PAID_RESULT_ACCESS_LINK_PURPOSE,
  PAID_RESULT_ACCESS_LINK_STATUSES,
  PAID_RESULT_RECOVERY_LINK_CHANNELS,
  PAID_RESULT_RECOVERY_LINK_FAILURE_CATEGORIES,
  PAID_RESULT_RECOVERY_LINK_STATUSES,
  resolvePaidResultAccessLink,
  resolvePaidResultRecoveryLink,
  revokePaidResultAccessLink,
  revokePaidResultRecoveryLink,
} from "@/lib/db/paid-result-recovery-links";
import {
  getDefaultPaidResultAccessLinkExpiresAt,
  getDefaultPaidResultRecoveryLinkExpiresAt,
  hashPaidResultAccessLinkToken,
  hashPaidResultRecoveryToken,
  isPaidResultAccessLinkToken,
  isPaidResultRecoveryToken,
  PAID_RESULT_ACCESS_LINK_TOKEN_PREFIX,
  PAID_RESULT_LEGACY_RECOVERY_LINK_TOKEN_PREFIX,
  PAID_RESULT_RECOVERY_LINK_PURPOSE,
} from "@/lib/payments/recovery-link-token";
import {
  createPaidResultAccessLink as createPaidResultAccessLinkFromAliasModule,
  resolvePaidResultAccessLink as resolvePaidResultAccessLinkFromAliasModule,
} from "@/lib/db/paid-result-access-links";

const RESULT_ID = "22222222-2222-4222-8222-222222222222";
const PAYMENT_INTENT_ID = "33333333-3333-4333-8333-333333333333";
const ENTITLEMENT_ID = "44444444-4444-4444-8444-444444444444";
const RECOVERY_CONTACT_ID = "77777777-7777-4777-8777-777777777777";
const RECOVERY_LINK_ID = "88888888-8888-4888-8888-888888888888";
const NOW = new Date("2026-06-01T08:00:00.000Z");
const TEST_ENV = {
  PAYMENT_RECOVERY_LINK_TOKEN_SECRET: "test-only-recovery-link-secret",
} as NodeJS.ProcessEnv;

function syntheticRecoveryToken(seed: string) {
  return `prl_${seed.repeat(43)}`;
}

function syntheticAccessLinkToken(seed: string) {
  return `pal_${seed.repeat(43)}`;
}

function createDbMock(input?: { selectRows?: unknown[]; insertRows?: unknown[]; updateRows?: unknown[] }) {
  const capture: {
    insertValues?: Record<string, unknown>;
    updateValues?: Record<string, unknown>;
  } = {};
  const selectChain = {
    from: vi.fn(() => selectChain),
    where: vi.fn(() => selectChain),
    orderBy: vi.fn(() => selectChain),
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

  return { db, capture, selectChain };
}

function activeEntitlement(overrides: Record<string, unknown> = {}) {
  return {
    id: ENTITLEMENT_ID,
    status: "active",
    moduleSlug: "ambiguous-temperature",
    analysisResultId: RESULT_ID,
    paymentIntentId: PAYMENT_INTENT_ID,
    ...overrides,
  };
}

function recoveryLinkRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: RECOVERY_LINK_ID,
    moduleSlug: "ambiguous-temperature",
    analysisResultId: RESULT_ID,
    paymentIntentId: PAYMENT_INTENT_ID,
    entitlementId: ENTITLEMENT_ID,
    recoveryContactId: RECOVERY_CONTACT_ID,
    tokenHash: "stored-token-hash",
    purpose: PAID_RESULT_RECOVERY_LINK_PURPOSE,
    channel: "email",
    status: "created",
    expiresAt: getDefaultPaidResultRecoveryLinkExpiresAt(NOW),
    usedAt: null,
    revokedAt: null,
    sentAt: null,
    providerMessageId: null,
    lastSendAttemptAt: null,
    sendAttemptCount: 0,
    lastFailureCategory: null,
    lastProviderStatus: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

describe("paid result recovery links", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defines approved recovery link constants", () => {
    expect(PAID_RESULT_RECOVERY_LINK_CHANNELS).toEqual([
      "email",
      "line",
      "support",
      "operator_test",
    ]);
    expect(PAID_RESULT_RECOVERY_LINK_STATUSES).toEqual([
      "created",
      "sent",
      "used",
      "expired",
      "revoked",
      "failed",
    ]);
    expect(PAID_RESULT_RECOVERY_LINK_FAILURE_CATEGORIES).toEqual([
      "provider_config_missing",
      "provider_request_failed",
      "provider_rejected",
      "rate_limited",
      "recipient_unavailable",
      "recipient_blocked_or_unreachable",
      "unknown",
    ]);
    expect(PAID_RESULT_ACCESS_LINK_CHANNELS).toBe(PAID_RESULT_RECOVERY_LINK_CHANNELS);
    expect(PAID_RESULT_ACCESS_LINK_STATUSES).toBe(PAID_RESULT_RECOVERY_LINK_STATUSES);
    expect(PAID_RESULT_ACCESS_LINK_FAILURE_CATEGORIES).toBe(
      PAID_RESULT_RECOVERY_LINK_FAILURE_CATEGORIES,
    );
    expect(PAID_RESULT_ACCESS_LINK_PURPOSE).toBe("paid_result_access_link");
  });

  it("generates access links with pal_ tokens, hash-only token storage, and 90-day default expiry", async () => {
    const dbMock = createDbMock({
      insertRows: [recoveryLinkRecord()],
    });
    mockRequireDb.mockReturnValue(dbMock.db);

    const result = await createPaidResultRecoveryLink({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: RESULT_ID,
      paymentIntentId: PAYMENT_INTENT_ID,
      entitlementId: ENTITLEMENT_ID,
      recoveryContactId: RECOVERY_CONTACT_ID,
      channel: "email",
      now: NOW,
      env: TEST_ENV,
    });

    expect(result.rawToken.startsWith(PAID_RESULT_ACCESS_LINK_TOKEN_PREFIX)).toBe(true);
    expect(isPaidResultRecoveryToken(result.rawToken)).toBe(true);
    expect(isPaidResultAccessLinkToken(result.rawToken)).toBe(true);
    expect(dbMock.capture.insertValues).toMatchObject({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: RESULT_ID,
      paymentIntentId: PAYMENT_INTENT_ID,
      entitlementId: ENTITLEMENT_ID,
      recoveryContactId: RECOVERY_CONTACT_ID,
      purpose: PAID_RESULT_ACCESS_LINK_PURPOSE,
      channel: "email",
      status: "created",
      expiresAt: getDefaultPaidResultRecoveryLinkExpiresAt(NOW),
    });
    expect(dbMock.capture.insertValues?.tokenHash).toBe(
      hashPaidResultRecoveryToken(result.rawToken, TEST_ENV),
    );
    expect(dbMock.capture.insertValues?.tokenHash).toBe(
      hashPaidResultAccessLinkToken(result.rawToken, TEST_ENV),
    );
    expect(dbMock.capture.insertValues?.tokenHash).not.toBe(result.rawToken);
    expect(dbMock.capture.insertValues).not.toHaveProperty("rawToken");
    expect(JSON.stringify(dbMock.capture.insertValues)).not.toContain(result.rawToken);
  });

  it("keeps access-link helper aliases and alias modules compatible", async () => {
    expect(createPaidResultAccessLink).toBe(createPaidResultRecoveryLink);
    expect(resolvePaidResultAccessLink).toBe(resolvePaidResultRecoveryLink);
    expect(createSupportPaidResultRecoveryLink).toBe(createSupportPaidResultAccessLink);
    expect(getRecentPaidResultAccessLinkForContact).toBe(
      getRecentPaidResultRecoveryLinkForContact,
    );
    expect(markPaidResultAccessLinkSent).toBe(markPaidResultRecoveryLinkSent);
    expect(markPaidResultAccessLinkFailed).toBe(markPaidResultRecoveryLinkFailed);
    expect(revokePaidResultAccessLink).toBe(revokePaidResultRecoveryLink);
    expect(isPaidResultAccessLinkActive).toBe(isPaidResultRecoveryLinkActive);
    expect(createPaidResultAccessLinkFromAliasModule).toBe(createPaidResultRecoveryLink);
    expect(resolvePaidResultAccessLinkFromAliasModule).toBe(resolvePaidResultRecoveryLink);
  });

  it("accepts only pal_ access-link tokens for new clean schema", () => {
    const legacyToken = syntheticRecoveryToken("l");
    const accessToken = syntheticAccessLinkToken("a");

    expect(PAID_RESULT_LEGACY_RECOVERY_LINK_TOKEN_PREFIX).toBe("prl_");
    expect(PAID_RESULT_ACCESS_LINK_TOKEN_PREFIX).toBe("pal_");
    expect(isPaidResultRecoveryToken(legacyToken)).toBe(false);
    expect(isPaidResultRecoveryToken(accessToken)).toBe(true);
    expect(isPaidResultAccessLinkToken(legacyToken)).toBe(false);
    expect(isPaidResultAccessLinkToken(accessToken)).toBe(true);
    expect(hashPaidResultRecoveryToken(accessToken, TEST_ENV)).toMatch(/^[a-f0-9]{64}$/u);
    expect(getDefaultPaidResultAccessLinkExpiresAt(NOW)).toEqual(
      getDefaultPaidResultRecoveryLinkExpiresAt(NOW),
    );
  });

  it("fails closed when recovery link token secret is missing", async () => {
    const dbMock = createDbMock();
    mockRequireDb.mockReturnValue(dbMock.db);

    await expect(
      createPaidResultRecoveryLink({
        moduleSlug: "ambiguous-temperature",
        analysisResultId: RESULT_ID,
        entitlementId: ENTITLEMENT_ID,
        channel: "email",
        env: {} as NodeJS.ProcessEnv,
      }),
    ).rejects.toThrow("payment_recovery_link_token_secret_missing");
    expect(dbMock.db.insert).not.toHaveBeenCalled();
  });

  it("resolves valid recovery links to active entitlements and marks usage", async () => {
    const rawToken = syntheticAccessLinkToken("a");
    const dbMock = createDbMock({
      selectRows: [recoveryLinkRecord()],
      updateRows: [recoveryLinkRecord({ status: "used", usedAt: NOW })],
    });
    mockRequireDb.mockReturnValue(dbMock.db);
    mockGetEntitlementById.mockResolvedValue(activeEntitlement());

    const result = await resolvePaidResultAccessLink({
      rawToken,
      now: NOW,
      env: TEST_ENV,
    });

    expect(result).toMatchObject({
      ok: true,
      link: { id: RECOVERY_LINK_ID },
      entitlement: { id: ENTITLEMENT_ID },
    });
    expect(dbMock.capture.updateValues).toMatchObject({
      status: "used",
      usedAt: NOW,
      updatedAt: NOW,
    });
    expect(JSON.stringify(result)).not.toContain(rawToken);
  });

  it("rejects legacy prl_ links after clean access-link reset", async () => {
    const rawToken = syntheticRecoveryToken("z");
    const dbMock = createDbMock();
    mockRequireDb.mockReturnValue(dbMock.db);

    await expect(
      resolvePaidResultAccessLink({
        rawToken,
        now: NOW,
        env: TEST_ENV,
      }),
    ).resolves.toMatchObject({
      ok: false,
      category: "invalid_token",
    });
    expect(dbMock.db.select).not.toHaveBeenCalled();
  });

  it("fails invalid, expired, revoked, failed, and inactive entitlement links safely", async () => {
    await expect(
      resolvePaidResultRecoveryLink({
        rawToken: "not-a-recovery-link",
        env: TEST_ENV,
      }),
    ).resolves.toEqual({ ok: false, category: "invalid_token" });

    const expiredDb = createDbMock({
      selectRows: [recoveryLinkRecord({ expiresAt: new Date("2026-05-01T00:00:00.000Z") })],
    });
    mockRequireDb.mockReturnValue(expiredDb.db);
    await expect(
      resolvePaidResultRecoveryLink({
        rawToken: syntheticAccessLinkToken("b"),
        now: NOW,
        env: TEST_ENV,
      }),
    ).resolves.toEqual({ ok: false, category: "expired" });

    const revokedDb = createDbMock({
      selectRows: [recoveryLinkRecord({ status: "revoked", revokedAt: NOW })],
    });
    mockRequireDb.mockReturnValue(revokedDb.db);
    await expect(
      resolvePaidResultRecoveryLink({
        rawToken: syntheticAccessLinkToken("c"),
        now: NOW,
        env: TEST_ENV,
      }),
    ).resolves.toEqual({ ok: false, category: "revoked" });

    const failedDb = createDbMock({
      selectRows: [recoveryLinkRecord({ status: "failed" })],
    });
    mockRequireDb.mockReturnValue(failedDb.db);
    await expect(
      resolvePaidResultRecoveryLink({
        rawToken: syntheticAccessLinkToken("d"),
        now: NOW,
        env: TEST_ENV,
      }),
    ).resolves.toEqual({ ok: false, category: "failed" });

    const inactiveDb = createDbMock({
      selectRows: [recoveryLinkRecord()],
    });
    mockRequireDb.mockReturnValue(inactiveDb.db);
    mockGetEntitlementById.mockResolvedValue(activeEntitlement({ status: "refunded" }));
    await expect(
      resolvePaidResultRecoveryLink({
        rawToken: syntheticAccessLinkToken("e"),
        now: NOW,
        env: TEST_ENV,
      }),
    ).resolves.toEqual({ ok: false, category: "entitlement_inactive" });
  });

  it("revokes recovery links without exposing token values", async () => {
    const dbMock = createDbMock({
      updateRows: [recoveryLinkRecord({ status: "revoked", revokedAt: NOW })],
    });
    mockRequireDb.mockReturnValue(dbMock.db);

    await revokePaidResultRecoveryLink({
      linkId: RECOVERY_LINK_ID,
      revokedAt: NOW,
    });

    expect(dbMock.capture.updateValues).toMatchObject({
      status: "revoked",
      revokedAt: NOW,
      updatedAt: NOW,
    });
    expect(dbMock.capture.updateValues).not.toHaveProperty("rawToken");
  });

  it("marks recovery link send status without exposing token values", async () => {
    const sentDb = createDbMock({
      updateRows: [recoveryLinkRecord({ status: "sent", sentAt: NOW })],
    });
    mockRequireDb.mockReturnValue(sentDb.db);

    await markPaidResultRecoveryLinkSent({
      linkId: RECOVERY_LINK_ID,
      sentAt: NOW,
      providerMessageId: "email-1",
      providerStatus: "accepted",
    });

    expect(sentDb.capture.updateValues).toMatchObject({
      status: "sent",
      sentAt: NOW,
      providerMessageId: "email-1",
      lastSendAttemptAt: NOW,
      lastFailureCategory: null,
      lastProviderStatus: "accepted",
      updatedAt: NOW,
    });
    expect(sentDb.capture.updateValues?.sendAttemptCount).toBeDefined();
    expect(sentDb.capture.updateValues).not.toHaveProperty("rawToken");

    const failedDb = createDbMock({
      updateRows: [recoveryLinkRecord({ status: "failed" })],
    });
    mockRequireDb.mockReturnValue(failedDb.db);

    await markPaidResultRecoveryLinkFailed({
      linkId: RECOVERY_LINK_ID,
      failedAt: NOW,
      failureCategory: "provider_rejected",
      providerStatus: "rejected",
    });

    expect(failedDb.capture.updateValues).toMatchObject({
      status: "failed",
      lastSendAttemptAt: NOW,
      lastFailureCategory: "provider_rejected",
      lastProviderStatus: "rejected",
      updatedAt: NOW,
    });
    expect(failedDb.capture.updateValues?.sendAttemptCount).toBeDefined();
    expect(failedDb.capture.updateValues).not.toHaveProperty("rawToken");
  });

  it("finds existing recovery links for duplicate send prevention", async () => {
    const dbMock = createDbMock({
      selectRows: [recoveryLinkRecord({ status: "sent" })],
    });
    mockRequireDb.mockReturnValue(dbMock.db);

    const result = await getRecentPaidResultRecoveryLinkForContact({
      entitlementId: ENTITLEMENT_ID,
      recoveryContactId: RECOVERY_CONTACT_ID,
      channel: "email",
    });

    expect(result).toMatchObject({
      id: RECOVERY_LINK_ID,
      status: "sent",
    });
    expect(dbMock.selectChain.orderBy).toHaveBeenCalled();
    expect(JSON.stringify(result)).not.toContain("pal_");
    expect(JSON.stringify(result)).not.toContain("prl_");
  });

  it("classifies active access links as multi-use until expiry or revocation", () => {
    expect(
      isPaidResultRecoveryLinkActive({
        link: recoveryLinkRecord({ status: "sent", sentAt: NOW }),
        now: NOW,
      }),
    ).toBe(true);
    expect(
      isPaidResultRecoveryLinkActive({
        link: recoveryLinkRecord({ status: "used", usedAt: NOW }),
        now: NOW,
      }),
    ).toBe(true);
    expect(
      isPaidResultRecoveryLinkActive({
        link: recoveryLinkRecord({ status: "created", sentAt: NOW }),
        now: NOW,
      }),
    ).toBe(true);
    expect(
      isPaidResultRecoveryLinkActive({
        link: recoveryLinkRecord({ status: "created", usedAt: NOW }),
        now: NOW,
      }),
    ).toBe(true);
    expect(
      isPaidResultRecoveryLinkActive({
        link: recoveryLinkRecord({ status: "created" }),
        now: NOW,
      }),
    ).toBe(false);
    expect(
      isPaidResultRecoveryLinkActive({
        link: recoveryLinkRecord({ status: "revoked", revokedAt: NOW }),
        now: NOW,
      }),
    ).toBe(false);
    expect(
      isPaidResultRecoveryLinkActive({
        link: recoveryLinkRecord({ status: "failed" }),
        now: NOW,
      }),
    ).toBe(false);
    expect(
      isPaidResultRecoveryLinkActive({
        link: recoveryLinkRecord({ status: "sent", expiresAt: new Date("2026-05-01") }),
        now: NOW,
      }),
    ).toBe(false);
  });

  it("finds the latest active access link and skips inactive rows", async () => {
    const activeUsedLink = recoveryLinkRecord({
      id: "active-used-link",
      status: "used",
      usedAt: NOW,
      createdAt: new Date("2026-05-30T00:00:00.000Z"),
    });
    const dbMock = createDbMock({
      selectRows: [
        recoveryLinkRecord({ id: "latest-failed-link", status: "failed" }),
        recoveryLinkRecord({ id: "latest-revoked-link", status: "revoked", revokedAt: NOW }),
        activeUsedLink,
      ],
    });
    mockRequireDb.mockReturnValue(dbMock.db);

    const result = await findActivePaidResultAccessLinkForContact({
      entitlementId: ENTITLEMENT_ID,
      recoveryContactId: RECOVERY_CONTACT_ID,
      channel: "email",
      now: NOW,
    });

    expect(result).toMatchObject({
      id: "active-used-link",
      status: "used",
    });
    expect(dbMock.selectChain.orderBy).toHaveBeenCalled();
    expect(JSON.stringify(result)).not.toContain("pal_");
    expect(JSON.stringify(result)).not.toContain("prl_");
  });

  it("creates fresh support-channel access links for verified operator resend contexts", async () => {
    const dbMock = createDbMock({
      insertRows: [recoveryLinkRecord({ channel: "support" })],
    });
    mockRequireDb.mockReturnValue(dbMock.db);

    const result = await createSupportPaidResultAccessLink({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: RESULT_ID,
      paymentIntentId: PAYMENT_INTENT_ID,
      entitlementId: ENTITLEMENT_ID,
      recoveryContactId: RECOVERY_CONTACT_ID,
      now: NOW,
      env: TEST_ENV,
    });

    expect(isPaidResultAccessLinkToken(result.rawToken)).toBe(true);
    expect(dbMock.capture.insertValues).toMatchObject({
      channel: "support",
      entitlementId: ENTITLEMENT_ID,
      recoveryContactId: RECOVERY_CONTACT_ID,
      status: "created",
    });
    expect(dbMock.capture.insertValues).not.toHaveProperty("rawToken");
    expect(JSON.stringify(result.link)).not.toContain(result.rawToken);
  });

  it("adds the paid result recovery links migration and schema seam", () => {
    const migration = readFileSync(
      path.resolve(process.cwd(), "drizzle/0010_paid_result_recovery_links.sql"),
      "utf8",
    );

    expect(migration).toContain('CREATE TABLE "paid_result_recovery_links"');
    expect(migration).toContain('"token_hash" text NOT NULL');
    expect(migration).toContain('"paid_result_recovery_links_token_hash_idx"');
    expect(migration).toContain('"expires_at" timestamp with time zone NOT NULL');
    expect(migration).not.toContain("paid_access_token");
    expect(migration).not.toContain("checkout_session_token");
    expect(migration).not.toContain("report_content");
  });

  it("adds send audit fields without storing provider payloads", () => {
    const migration = readFileSync(
      path.resolve(process.cwd(), "drizzle/0012_paid_result_recovery_link_send_audit.sql"),
      "utf8",
    );

    expect(migration).toContain('"provider_message_id" text');
    expect(migration).toContain('"last_send_attempt_at" timestamp with time zone');
    expect(migration).toContain('"send_attempt_count" integer DEFAULT 0 NOT NULL');
    expect(migration).toContain('"last_failure_category" text');
    expect(migration).toContain('"last_provider_status" text');
    expect(migration).not.toContain("provider_payload");
    expect(migration).not.toContain("raw_email");
    expect(migration).not.toContain("line_user_id");
    expect(migration).not.toContain("paid_access_token");
  });

  it("adds a clean access-link table rename/reset migration without compatibility views", () => {
    const migration = readFileSync(
      path.resolve(process.cwd(), "drizzle/0013_access_link_technical_rename.sql"),
      "utf8",
    );
    const schema = readFileSync(
      path.resolve(process.cwd(), "src/lib/db/schema.ts"),
      "utf8",
    );

    expect(migration).toContain("RENAME TO payment_access_link_contacts");
    expect(migration).toContain("RENAME TO paid_result_access_links");
    expect(migration).toContain("RENAME TO payment_access_link_contact_secrets");
    expect(migration).toContain("TRUNCATE TABLE ' || array_to_string(reset_tables, ', ') || ' CASCADE");
    expect(migration).toContain("'paid_result_recovery_links'");
    expect(migration).toContain("'payment_recovery_contacts'");
    expect(migration).toContain("'paid_result_access_links'");
    expect(migration).not.toContain("CREATE OR REPLACE VIEW public.payment_recovery_contacts");
    expect(migration).not.toContain("CREATE OR REPLACE VIEW public.paid_result_recovery_links");
    expect(migration).not.toContain(
      "CREATE OR REPLACE VIEW public.payment_recovery_contact_secrets",
    );
    expect(migration).not.toContain("DROP TABLE");
    expect(migration).not.toContain("raw_email");
    expect(migration).not.toContain("line_user_id");
    expect(migration).not.toContain("provider_payload");
    expect(schema).toContain(
      'export const paidResultAccessLinks = pgTable(\n  "paid_result_access_links"',
    );
  });
});
