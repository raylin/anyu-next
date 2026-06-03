import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  assertSanitizedOutput,
  buildSupportDiagnosis,
  hashRecoveryEmail,
  isActiveAccessLink,
  maskEmail,
  parseSupportLookupArgs,
  resolveSupportOpsDatabaseUrl,
  summarizeAccessLinks,
  summarizeContacts,
} from "../../scripts/support-paid-result-lookup.mjs";

describe("support paid result lookup helpers", () => {
  it("registers the local operator command", () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf8"),
    );

    expect(packageJson.scripts["ops:paid-result:lookup"]).toBe(
      "node scripts/support-paid-result-lookup.mjs",
    );
  });

  it("blocks production target by default and allows explicit read-only mode", () => {
    expect(() =>
      parseSupportLookupArgs(["--target", "production", "--result-id", uuid("1")]),
    ).toThrow("production_target_rejected");

    expect(
      parseSupportLookupArgs([
        "--target",
        "production",
        "--allow-production-readonly",
        "--allow-database-url-fallback",
        "--result-id",
        uuid("1"),
      ]).options,
    ).toMatchObject({
      target: "production",
      allowProductionReadonly: true,
      allowDatabaseUrlFallback: true,
    });
  });

  it("prefers explicit support ops database URL and requires opt-in for DATABASE_URL fallback", () => {
    expect(
      resolveSupportOpsDatabaseUrl({
        SUPPORT_OPS_DATABASE_URL: "postgres://support-ops.example.invalid/db",
        DATABASE_URL: "postgres://ambiguous.example.invalid/db",
      } as NodeJS.ProcessEnv),
    ).toMatchObject({
      databaseUrl: "postgres://support-ops.example.invalid/db",
      connectionSourceCategory: "support_ops_database_url",
    });
    expect(
      resolveSupportOpsDatabaseUrl({
        DATABASE_URL: "postgres://ambiguous.example.invalid/db",
      } as NodeJS.ProcessEnv),
    ).toMatchObject({
      databaseUrl: null,
      connectionSourceCategory: "missing",
    });
    expect(
      resolveSupportOpsDatabaseUrl(
        {
          DATABASE_URL: "postgres://ambiguous.example.invalid/db",
        } as NodeJS.ProcessEnv,
        { allowDatabaseUrlFallback: true },
      ),
    ).toMatchObject({
      databaseUrl: "postgres://ambiguous.example.invalid/db",
      connectionSourceCategory: "database_url_explicit_fallback",
    });
  });

  it("requires exactly one supported lookup key", () => {
    expect(() => parseSupportLookupArgs([])).toThrow("exactly_one_lookup_key_required");
    expect(() =>
      parseSupportLookupArgs([
        "--result-id",
        uuid("1"),
        "--payment-intent-id",
        uuid("2"),
      ]),
    ).toThrow("exactly_one_lookup_key_required");
    expect(parseSupportLookupArgs(["--merchant-order-no", "ANYU202606030001"]).lookup).toEqual({
      type: "merchantOrderNo",
      value: "ANYU202606030001",
    });
  });

  it("hashes email lookup values without returning raw email", () => {
    const hash = hashRecoveryEmail("Owner@Example.com", {
      PAYMENT_RECOVERY_CONTACT_HASH_SECRET: "test-only-hash-secret",
    } as NodeJS.ProcessEnv);

    expect(hash).toMatch(/^[a-f0-9]{64}$/u);
    expect(maskEmail("Owner@Example.com")).toBe("o***@e***.com");
  });

  it("treats sent and used links as active until expiry or revocation", () => {
    const now = new Date("2026-06-03T00:00:00.000Z");
    const future = "2026-09-01T00:00:00.000Z";
    const past = "2026-06-02T00:00:00.000Z";

    expect(isActiveAccessLink({ status: "sent", sentAt: now.toISOString(), expiresAt: future }, now)).toBe(
      true,
    );
    expect(isActiveAccessLink({ status: "used", usedAt: now.toISOString(), expiresAt: future }, now)).toBe(
      true,
    );
    expect(isActiveAccessLink({ status: "used", usedAt: now.toISOString(), expiresAt: past }, now)).toBe(
      false,
    );
    expect(
      isActiveAccessLink({
        status: "sent",
        sentAt: now.toISOString(),
        revokedAt: now.toISOString(),
        expiresAt: future,
      }, now),
    ).toBe(false);
    expect(isActiveAccessLink({ status: "failed", sentAt: null, expiresAt: future }, now)).toBe(false);
  });

  it("summarizes access links without provider message IDs or token material", () => {
    const summary = summarizeAccessLinks([
      {
        channel: "email",
        status: "sent",
        sentAt: "2026-06-03T00:00:00.000Z",
        usedAt: null,
        revokedAt: null,
        expiresAt: "2026-09-01T00:00:00.000Z",
        sendAttemptCount: 1,
        lastProviderStatus: "accepted",
        lastFailureCategory: null,
        providerMessageIdPresent: true,
      },
      {
        channel: "line",
        status: "failed",
        sentAt: null,
        usedAt: null,
        revokedAt: null,
        expiresAt: "2026-09-01T00:00:00.000Z",
        sendAttemptCount: 2,
        lastProviderStatus: "failed",
        lastFailureCategory: "recipient_unavailable",
        providerMessageIdPresent: false,
      },
    ]);

    expect(summary.latestActiveLinkExists).toBe(true);
    expect(summary.channels.email).toMatchObject({
      activeLinkExists: true,
      providerMessageIdPresent: true,
      sendAttemptCount: 1,
    });
    expect(summary.channels.line).toMatchObject({
      activeLinkExists: false,
      lastFailureCategory: "recipient_unavailable",
      sendAttemptCount: 2,
    });
    expect(() => assertSanitizedOutput(summary)).not.toThrow();
  });

  it("summarizes saved contacts without raw email or LINE identifiers", () => {
    const contacts = summarizeContacts(
      [
        {
          id: uuid("3"),
          contactType: "email",
          source: "checkout_start",
          status: "verified",
          transactionalConsentAt: "2026-06-03T00:00:00.000Z",
        },
        {
          id: uuid("4"),
          contactType: "line",
          source: "checkout_start",
          status: "bound",
          transactionalConsentAt: "2026-06-03T00:00:00.000Z",
        },
      ],
      [{ recoveryContactId: uuid("4"), channel: "line", status: "active" }],
      { type: "email", value: ["owner", "example.com"].join("@") },
    );

    expect(contacts).toMatchObject({
      emailSaved: true,
      maskedEmail: "o***@e***.com",
      lineSaved: true,
      lineRecipientSecretActive: true,
    });
    expect(JSON.stringify(contacts)).not.toContain(["owner", "example.com"].join("@"));
  });

  it("builds support diagnosis categories and recommended actions", () => {
    const ready = buildSupportDiagnosis({
      payment: { found: true, latestStatus: "paid", duplicatePaymentPossible: false },
      entitlement: { found: true, latestStatus: "active" },
      generation: { latestStatus: "completed" },
      paidResult: { latestStatus: "completed" },
      contacts: { emailSaved: true, lineSaved: true },
      accessLinks: {
        latestActiveLinkExists: true,
        failedCount: 0,
        channels: { email: { activeLinkExists: true }, line: { activeLinkExists: true } },
      },
    });

    expect(ready.diagnosis).toContain("paid_result_ready");
    expect(ready.diagnosis).toContain("access_link_sent");
    expect(ready.recommendedActions).toContain("ask_user_to_use_saved_view_link");

    const noSend = buildSupportDiagnosis({
      payment: { found: true, latestStatus: "paid", duplicatePaymentPossible: false },
      entitlement: { found: true, latestStatus: "active" },
      generation: { latestStatus: "completed" },
      paidResult: { latestStatus: "completed" },
      contacts: { emailSaved: true, lineSaved: true },
      accessLinks: { latestActiveLinkExists: false, failedCount: 0, channels: {} },
    });

    expect(noSend.diagnosis).toEqual(
      expect.arrayContaining(["access_link_missing", "email_saved_no_send", "line_saved_no_send"]),
    );
    expect(noSend.recommendedActions).toEqual(
      expect.arrayContaining([
        "create_support_resend_link_future_gated_flow",
        "ask_user_to_check_spam",
        "ask_user_to_unblock_line_official_account",
      ]),
    );
  });

  it("rejects unsafe support output fields and token-like values", () => {
    expect(() =>
      assertSanitizedOutput({
        recoveryPath: `/r/${["prl", "abcdefghijklmnopqrstuvwxyz1234567890"].join("_")}`,
      }),
    ).toThrow("unsafe_support_lookup_output_detected");
    expect(() =>
      assertSanitizedOutput({
        contact_hash: "do-not-print",
      }),
    ).toThrow("unsafe_support_lookup_output_detected");
    expect(() =>
      assertSanitizedOutput({
        ok: true,
        providerMessageIdPresent: true,
        maskedEmail: "o***@e***.com",
      }),
    ).not.toThrow();
  });
});

function uuid(seed: string) {
  return `${seed.repeat(8).slice(0, 8)}-${seed.repeat(4).slice(0, 4)}-4${seed.repeat(3).slice(0, 3)}-8${seed.repeat(3).slice(0, 3)}-${seed.repeat(12).slice(0, 12)}`;
}
