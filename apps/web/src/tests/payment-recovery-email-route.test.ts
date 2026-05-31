import { describe, expect, it, vi, beforeEach } from "vitest";

const {
  mockCanStartNewebPayCheckoutFromResult,
  mockIsDbConfigured,
  mockCreateOrUpdateEmailRecoveryContact,
} = vi.hoisted(() => ({
  mockCanStartNewebPayCheckoutFromResult: vi.fn(),
  mockIsDbConfigured: vi.fn(),
  mockCreateOrUpdateEmailRecoveryContact: vi.fn(),
}));

vi.mock("@/lib/runtime/feature-flags", () => ({
  canStartNewebPayCheckoutFromResult: mockCanStartNewebPayCheckoutFromResult,
}));

vi.mock("@/lib/db/client", () => ({
  isDbConfigured: mockIsDbConfigured,
}));

vi.mock("@/lib/db/payment-recovery-contacts", () => ({
  createOrUpdateEmailRecoveryContact: mockCreateOrUpdateEmailRecoveryContact,
}));

import { POST } from "@/app/api/modules/[moduleSlug]/result/[resultId]/recovery/email/route";
import { RecoveryContactConfigError } from "@/lib/payments/recovery-contact-crypto";

const routeParams = {
  params: Promise.resolve({
    moduleSlug: "ambiguous-temperature",
    resultId: "22222222-2222-4222-8222-222222222222",
  }),
};

function createFormRequest(input: {
  email?: string;
  paymentIntentId?: string;
  marketingOptIn?: boolean;
}) {
  const form = new FormData();

  if (input.email) {
    form.set("email", input.email);
  }

  if (input.paymentIntentId) {
    form.set("paymentIntentId", input.paymentIntentId);
  }

  if (input.marketingOptIn) {
    form.set("marketingOptIn", "1");
  }

  return new Request(
    "https://staging.anyu.tw/api/modules/ambiguous-temperature/result/22222222-2222-4222-8222-222222222222/recovery/email",
    {
      method: "POST",
      body: form,
    },
  );
}

describe("payment recovery email route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCanStartNewebPayCheckoutFromResult.mockReturnValue(true);
    mockIsDbConfigured.mockReturnValue(true);
    mockCreateOrUpdateEmailRecoveryContact.mockResolvedValue({ id: "contact-1" });
  });

  it("captures email recovery contact without returning raw email", async () => {
    const response = await POST(
      createFormRequest({
        email: "Owner@Example.com",
        paymentIntentId: "33333333-3333-4333-8333-333333333333",
        marketingOptIn: true,
      }),
      routeParams,
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "https://staging.anyu.tw/m/ambiguous-temperature/result/22222222-2222-4222-8222-222222222222/checkout?recovery=email_saved",
    );
    expect(mockCreateOrUpdateEmailRecoveryContact).toHaveBeenCalledWith(
      expect.objectContaining({
        moduleSlug: "ambiguous-temperature",
        analysisResultId: "22222222-2222-4222-8222-222222222222",
        paymentIntentId: "33333333-3333-4333-8333-333333333333",
        email: "Owner@Example.com",
        source: "checkout_start",
        status: "pending",
        marketingOptInAt: expect.any(Date),
      }),
    );
    expect(response.headers.get("location")).not.toContain("Owner@Example.com");
    expect(response.headers.get("location")).not.toContain("pa_");
    expect(response.headers.get("location")).not.toContain("pcs_");
  });

  it("fails safely when recovery secrets are missing", async () => {
    mockCreateOrUpdateEmailRecoveryContact.mockRejectedValue(
      new RecoveryContactConfigError("payment_recovery_contact_encryption_key_missing"),
    );

    const response = await POST(
      createFormRequest({
        email: "owner@example.com",
      }),
      routeParams,
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("recovery=email_error");
    expect(response.headers.get("location")).not.toContain("owner@example.com");
  });

  it("does not capture recovery contact when checkout gates are closed", async () => {
    mockCanStartNewebPayCheckoutFromResult.mockReturnValue(false);

    const response = await POST(
      createFormRequest({
        email: "owner@example.com",
      }),
      routeParams,
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("recovery=email_error");
    expect(mockCreateOrUpdateEmailRecoveryContact).not.toHaveBeenCalled();
  });
});
