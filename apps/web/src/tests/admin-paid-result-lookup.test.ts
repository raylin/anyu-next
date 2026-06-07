import { describe, expect, it } from "vitest";
import {
  assertAdminPaidResultLookupResponseIsSafe,
  buildAdminPaidResultLookupSummary,
  isValidAdminResultId,
} from "@/lib/admin/paid-result-lookup";

const RESULT_ID = "11111111-1111-4111-8111-111111111111";
const EMAIL_CONTACT_ID = "22222222-2222-4222-8222-222222222222";
const LINE_CONTACT_ID = "33333333-3333-4333-8333-333333333333";
const NOW = new Date("2026-06-05T00:00:00.000Z");
const FUTURE = new Date("2026-07-05T00:00:00.000Z");

function baseRows(overrides: Record<string, unknown> = {}) {
  return {
    result: {
      id: RESULT_ID,
      moduleId: "ai-temperature",
      themeSlug: "ambiguous-temperature",
    },
    payments: [],
    entitlements: [],
    generationJobs: [],
    paidResults: [],
    contacts: [],
    contactSecrets: [],
    accessLinks: [],
    ...overrides,
  } as never;
}

describe("admin paid result lookup summary", () => {
  it("validates result IDs", () => {
    expect(isValidAdminResultId(RESULT_ID)).toBe(true);
    expect(isValidAdminResultId("not-a-result-id")).toBe(false);
  });

  it("summarizes a ready paid result without private values", () => {
    const summary = buildAdminPaidResultLookupSummary(
      baseRows({
        payments: [
          {
            provider: "newebpay",
            moduleSlug: "ambiguous-temperature",
            status: "paid",
            paidAt: NOW,
            merchantOrderNo: "ANYU-PRIVATE-ORDER",
            createdAt: NOW,
          },
        ],
        entitlements: [
          {
            status: "active",
            activatedAt: NOW,
            revokedAt: null,
            refundedAt: null,
            expiresAt: FUTURE,
            createdAt: NOW,
          },
        ],
        generationJobs: [
          {
            status: "completed",
            lastErrorCategory: null,
            createdAt: NOW,
            updatedAt: new Date("2026-06-05T00:00:40.000Z"),
            nextRunAt: new Date("2026-06-05T00:00:05.000Z"),
            lockedAt: new Date("2026-06-05T00:00:10.000Z"),
            lastErrorAt: null,
            attemptCount: 1,
            maxAttempts: 3,
          },
        ],
        paidResults: [
          {
            status: "completed",
            startedAt: new Date("2026-06-05T00:00:10.000Z"),
            completedAt: NOW,
            failedAt: null,
            errorCode: null,
            createdAt: NOW,
          },
        ],
        contacts: [
          {
            id: EMAIL_CONTACT_ID,
            contactType: "email",
            status: "verified",
            transactionalConsentAt: NOW,
            createdAt: NOW,
          },
          {
            id: LINE_CONTACT_ID,
            contactType: "line",
            status: "bound",
            transactionalConsentAt: NOW,
            createdAt: NOW,
          },
        ],
        contactSecrets: [
          {
            recoveryContactId: LINE_CONTACT_ID,
            channel: "line",
            purpose: "access_link_delivery",
            status: "active",
            revokedAt: null,
            createdAt: NOW,
          },
        ],
        accessLinks: [
          {
            channel: "email",
            status: "used",
            expiresAt: FUTURE,
            usedAt: NOW,
            revokedAt: null,
            sentAt: NOW,
            sendAttemptCount: 1,
            lastFailureCategory: null,
            lastProviderStatus: "accepted",
            providerMessageId: "provider-message-id-not-exposed",
            createdAt: NOW,
          },
          {
            channel: "line",
            status: "sent",
            expiresAt: FUTURE,
            usedAt: null,
            revokedAt: null,
            sentAt: NOW,
            sendAttemptCount: 1,
            lastFailureCategory: null,
            lastProviderStatus: "accepted",
            providerMessageId: null,
            createdAt: NOW,
          },
        ],
      }),
      { resultId: RESULT_ID, now: NOW },
    );

    expect(summary.result).toMatchObject({
      resultId: RESULT_ID,
      moduleSlug: "ambiguous-temperature",
      moduleLabel: "曖昧溫度計",
      freeResultExists: true,
      paidResultExists: true,
      paidResultStatus: "completed",
      deliveryArtifactReady: true,
    });
    expect(summary.payment).toMatchObject({
      paymentIntentExists: true,
      status: "paid",
      provider: "newebpay",
      paidAtPresent: true,
      merchantOrderNoPresent: true,
    });
    expect(summary.generation).toMatchObject({
      jobExists: true,
      status: "completed",
      jobCreatedAtPresent: true,
      jobStartedAtPresent: true,
      jobCompletedAtPresent: true,
      paidResultCompletedAtPresent: true,
      attemptCount: 1,
      maxAttempts: 3,
      queueStateCategory: "completed",
      recommendedAction: "no_action_needed",
    });
    expect(summary.generation.latency.totalPaidReadyMs).toBe(0);
    expect(summary.accessLinks.email).toMatchObject({
      contactSaved: true,
      sent: true,
      active: true,
      used: true,
      providerMessageIdPresent: true,
    });
    expect(summary.accessLinks.line).toMatchObject({
      contactSaved: true,
      recipientSecretExists: true,
      deliverable: true,
      sent: true,
      active: true,
      providerMessageIdPresent: false,
    });
    expect(summary.diagnosis).toEqual(
      expect.arrayContaining([
        "paid_result_ready",
        "email_access_link_sent",
        "line_access_link_sent",
      ]),
    );
    expect(summary.recommendedActions).toContain("ask_user_open_email_or_line_view_link");
    expect(() => assertAdminPaidResultLookupResponseIsSafe(summary)).not.toThrow();
    expect(JSON.stringify(summary)).not.toContain("ANYU-PRIVATE-ORDER");
    expect(JSON.stringify(summary)).not.toContain("provider-message-id-not-exposed");
  });

  it("diagnoses paid delivery pending without saved contacts", () => {
    const summary = buildAdminPaidResultLookupSummary(
      baseRows({
        payments: [
          {
            provider: "newebpay",
            moduleSlug: "ambiguous-temperature",
            status: "paid",
            paidAt: NOW,
            merchantOrderNo: "PRIVATE-ORDER",
            createdAt: NOW,
          },
        ],
        generationJobs: [
          {
            status: "queued",
            lastErrorCategory: null,
            createdAt: new Date("2026-06-04T23:50:00.000Z"),
            updatedAt: new Date("2026-06-04T23:50:00.000Z"),
            nextRunAt: new Date("2026-06-04T23:50:00.000Z"),
            lockedAt: null,
            lastErrorAt: null,
            attemptCount: 0,
            maxAttempts: 3,
          },
        ],
      }),
      { resultId: RESULT_ID, now: NOW },
    );

    expect(summary.diagnosis).toEqual(
      expect.arrayContaining([
        "entitlement_missing",
        "paid_processing",
        "payment_paid_delivery_pending",
        "no_saved_contact",
      ]),
    );
    expect(summary.recommendedActions).toEqual(
      expect.arrayContaining(["wait_for_processing", "retry_processor_if_safe"]),
    );
    expect(summary.generation).toMatchObject({
      queueStateCategory: "queued_stuck",
      recommendedAction: "invoke_processor_if_approved",
      attemptCount: 0,
    });
  });

  it("diagnoses saved contact with missing access link", () => {
    const summary = buildAdminPaidResultLookupSummary(
      baseRows({
        payments: [
          {
            provider: "newebpay",
            moduleSlug: "ambiguous-temperature",
            status: "paid",
            paidAt: NOW,
            merchantOrderNo: "PRIVATE-ORDER",
            createdAt: NOW,
          },
        ],
        entitlements: [
          {
            status: "active",
            activatedAt: NOW,
            revokedAt: null,
            refundedAt: null,
            expiresAt: FUTURE,
            createdAt: NOW,
          },
        ],
        paidResults: [
          {
            status: "completed",
            completedAt: NOW,
            failedAt: null,
            errorCode: null,
            createdAt: NOW,
          },
        ],
        contacts: [
          {
            id: EMAIL_CONTACT_ID,
            contactType: "email",
            status: "verified",
            transactionalConsentAt: NOW,
            createdAt: NOW,
          },
        ],
      }),
      { resultId: RESULT_ID, now: NOW },
    );

    expect(summary.diagnosis).toEqual(
      expect.arrayContaining(["paid_result_ready", "email_contact_saved", "access_link_missing"]),
    );
    expect(summary.recommendedActions).toContain("retry_processor_if_safe");
  });

  it("diagnoses partial LINE bind without recipient secret as not deliverable", () => {
    const summary = buildAdminPaidResultLookupSummary(
      baseRows({
        payments: [
          {
            provider: "newebpay",
            moduleSlug: "ambiguous-temperature",
            status: "paid",
            paidAt: NOW,
            merchantOrderNo: "PRIVATE-ORDER",
            createdAt: NOW,
          },
        ],
        entitlements: [
          {
            status: "active",
            activatedAt: NOW,
            revokedAt: null,
            refundedAt: null,
            expiresAt: FUTURE,
            createdAt: NOW,
          },
        ],
        generationJobs: [
          {
            status: "completed",
            lastErrorCategory: null,
            createdAt: NOW,
          },
        ],
        paidResults: [
          {
            status: "completed",
            completedAt: NOW,
            failedAt: null,
            errorCode: null,
            createdAt: NOW,
          },
        ],
        contacts: [
          {
            id: LINE_CONTACT_ID,
            contactType: "line",
            status: "bound",
            transactionalConsentAt: NOW,
            createdAt: NOW,
          },
        ],
      }),
      { resultId: RESULT_ID, now: NOW },
    );

    expect(summary.accessLinks.line).toMatchObject({
      contactSaved: true,
      recipientSecretExists: false,
      deliverable: false,
      sent: false,
      active: false,
    });
    expect(summary.diagnosis).toEqual(
      expect.arrayContaining([
        "paid_result_ready",
        "line_contact_saved",
        "line_bind_incomplete",
        "line_recipient_secret_missing",
        "access_link_missing",
      ]),
    );
    expect(summary.recommendedActions).toContain("retry_line_bind_or_use_email");
    expect(() => assertAdminPaidResultLookupResponseIsSafe(summary)).not.toThrow();
  });

  it("does not report failed contact-only LINE state as saved", () => {
    const summary = buildAdminPaidResultLookupSummary(
      baseRows({
        payments: [
          {
            provider: "newebpay",
            moduleSlug: "ambiguous-temperature",
            status: "checkout_started",
            paidAt: null,
            merchantOrderNo: "PRIVATE-ORDER",
            createdAt: NOW,
          },
        ],
        contacts: [
          {
            id: LINE_CONTACT_ID,
            contactType: "line",
            status: "failed",
            transactionalConsentAt: NOW,
            createdAt: NOW,
          },
        ],
      }),
      { resultId: RESULT_ID, now: NOW },
    );

    expect(summary.accessLinks.line).toMatchObject({
      contactSaved: false,
      latestContactStatus: "failed",
      recipientSecretExists: false,
      deliverable: false,
    });
    expect(summary.diagnosis).toEqual(
      expect.arrayContaining(["payment_waiting", "no_saved_contact"]),
    );
    expect(summary.diagnosis).not.toContain("line_contact_saved");
    expect(summary.diagnosis).not.toContain("line_bind_incomplete");
    expect(() => assertAdminPaidResultLookupResponseIsSafe(summary)).not.toThrow();
  });

  it("surfaces sanitized save diagnostics without contact values", () => {
    const summary = buildAdminPaidResultLookupSummary(
      baseRows({
        saveDiagnostics: {
          email: {
            channel: "email",
            latestCategory: "email_save_contact_write_failed",
            latestStatus: "failed",
            eventCount: 2,
            latestCreatedAtPresent: true,
          },
        },
      }),
      { resultId: RESULT_ID, now: NOW },
    );

    expect(summary.accessLinks.email).toMatchObject({
      contactSaved: false,
      latestSaveCategory: "email_save_contact_write_failed",
      latestSaveStatus: "failed",
      saveAttemptCount: 2,
    });
    expect(JSON.stringify(summary)).not.toContain("owner@example.com");
    expect(() => assertAdminPaidResultLookupResponseIsSafe(summary)).not.toThrow();
  });

  it("rejects unsafe response shapes", () => {
    expect(() =>
      assertAdminPaidResultLookupResponseIsSafe({
        ok: true,
        raw: "pal_private_token",
      }),
    ).toThrow("admin_paid_result_lookup_response_not_sanitized");
    expect(() =>
      assertAdminPaidResultLookupResponseIsSafe({
        ok: true,
        raw: "provider_message_id",
      }),
    ).toThrow("admin_paid_result_lookup_response_not_sanitized");
    expect(() =>
      assertAdminPaidResultLookupResponseIsSafe({
        ok: true,
        raw: "merchant_order_no",
      }),
    ).toThrow("admin_paid_result_lookup_response_not_sanitized");
    expect(() =>
      assertAdminPaidResultLookupResponseIsSafe({
        ok: true,
        raw: "owner@example.test",
      }),
    ).toThrow("admin_paid_result_lookup_response_not_sanitized");
  });
});
