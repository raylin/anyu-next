import { afterEach, describe, expect, it, vi } from "vitest";

const lookupAdminPaidResultById = vi.fn();

vi.mock("@/lib/admin/paid-result-lookup", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/admin/paid-result-lookup")>();

  return {
    ...actual,
    lookupAdminPaidResultById,
  };
});

const { GET } = await import("@/app/api/admin/paid-results/[resultId]/route");

const RESULT_ID = "11111111-1111-4111-8111-111111111111";

function request(token?: string) {
  return new Request(`https://example.test/api/admin/paid-results/${RESULT_ID}`, {
    headers: token ? { "x-admin-api-token": token } : {},
  });
}

function params(resultId = RESULT_ID) {
  return { params: Promise.resolve({ resultId }) };
}

describe("admin paid result lookup route", () => {
  afterEach(() => {
    lookupAdminPaidResultById.mockReset();
    delete process.env.ADMIN_API_TOKEN;
  });

  it("fails closed when ADMIN_API_TOKEN is missing", async () => {
    const response = await GET(request("token"), params());

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "admin_api_not_configured",
    });
    expect(lookupAdminPaidResultById).not.toHaveBeenCalled();
  });

  it("returns 401 for missing or invalid token without lookup", async () => {
    process.env["ADMIN_API_TOKEN"] = "correct-token";

    await expect(GET(request(), params())).resolves.toMatchObject({ status: 401 });
    await expect(GET(request("wrong-token"), params())).resolves.toMatchObject({ status: 401 });
    expect(lookupAdminPaidResultById).not.toHaveBeenCalled();
  });

  it("returns safe 404 after auth for missing result", async () => {
    process.env["ADMIN_API_TOKEN"] = "correct-token";
    lookupAdminPaidResultById.mockResolvedValue(null);

    const response = await GET(request("correct-token"), params());

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "result_not_found",
    });
    expect(lookupAdminPaidResultById).toHaveBeenCalledWith(RESULT_ID);
  });

  it("returns sanitized summary for valid token and result", async () => {
    process.env["ADMIN_API_TOKEN"] = "correct-token";
    lookupAdminPaidResultById.mockResolvedValue({
      ok: true,
      result: {
        resultId: RESULT_ID,
        moduleSlug: "ambiguous-temperature",
        moduleLabel: "曖昧溫度計",
        freeResultExists: true,
        paidResultExists: true,
        paidResultStatus: "completed",
        deliveryArtifactReady: true,
      },
      payment: {
        paymentIntentExists: true,
        status: "paid",
        provider: "newebpay",
        paidAtPresent: true,
        merchantOrderNoPresent: true,
      },
      entitlement: { exists: true, status: "active", active: true },
      generation: { jobExists: true, status: "completed", failureCategory: null },
      accessLinks: {
        email: {
          contactSaved: true,
          deliverable: true,
          sent: true,
          active: true,
          used: false,
          revoked: false,
          expired: false,
          sendAttemptCount: 1,
          lastProviderStatus: "accepted",
          lastFailureCategory: null,
          providerMessageIdPresent: true,
        },
        line: {
          contactSaved: false,
          recipientSecretExists: false,
          deliverable: false,
          sent: false,
          active: false,
          used: false,
          revoked: false,
          expired: false,
          sendAttemptCount: 0,
          lastProviderStatus: null,
          lastFailureCategory: null,
          providerMessageIdPresent: false,
        },
      },
      diagnosis: ["paid_result_ready", "email_access_link_sent"],
      recommendedActions: ["ask_user_open_email_or_line_view_link"],
    });

    const response = await GET(request("correct-token"), params());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.payment).toMatchObject({ merchantOrderNoPresent: true });
    expect(data.accessLinks.email.providerMessageIdPresent).toBe(true);
    expect(JSON.stringify(data)).not.toContain("provider_message_id");
    expect(JSON.stringify(data)).not.toContain("merchant_order_no");
    expect(JSON.stringify(data)).not.toContain("pal_");
  });

  it("validates result ID after auth", async () => {
    process.env["ADMIN_API_TOKEN"] = "correct-token";

    const response = await GET(request("correct-token"), params("not-a-uuid"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "invalid_result_id",
    });
    expect(lookupAdminPaidResultById).not.toHaveBeenCalled();
  });
});
