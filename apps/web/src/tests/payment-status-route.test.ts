import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockIsDbConfigured, mockGetModuleBySlug, mockResolvePaymentAccessHandoff } = vi.hoisted(
  () => ({
    mockIsDbConfigured: vi.fn(),
    mockGetModuleBySlug: vi.fn(),
    mockResolvePaymentAccessHandoff: vi.fn(),
  }),
);

vi.mock("@/lib/db/client", () => ({
  isDbConfigured: mockIsDbConfigured,
}));

vi.mock("@/lib/modules/registry", () => ({
  getModuleBySlug: mockGetModuleBySlug,
}));

vi.mock("@/lib/payments/payment-access-handoff", () => ({
  resolvePaymentAccessHandoff: mockResolvePaymentAccessHandoff,
}));

import { POST } from "@/app/api/modules/[moduleSlug]/payment/status/route";

const params = { params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }) };

function request(body: Record<string, unknown>) {
  return new Request("http://localhost/api/modules/ambiguous-temperature/payment/status", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("payment status route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsDbConfigured.mockReturnValue(true);
    mockGetModuleBySlug.mockReturnValue({ slug: "ambiguous-temperature" });
    mockResolvePaymentAccessHandoff.mockResolvedValue({
      ok: true,
      state: "waiting_for_payment",
      retryable: true,
      accessPath: null,
    });
  });

  it("rejects missing checkout token", async () => {
    const response = await POST(request({}), params);

    expect(response.status).toBe(400);
    expect(mockResolvePaymentAccessHandoff).not.toHaveBeenCalled();
  });

  it("returns sanitized pending status for a valid session", async () => {
    const response = await POST(request({ checkoutToken: "pcs_redacted" }), params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      ok: true,
      status: "waiting_for_payment",
      retryable: true,
      errorCategory: null,
      accessPath: null,
    });
    expect(JSON.stringify(data)).not.toContain("paymentIntent");
  });

  it("returns ready access path only from session-bound handoff", async () => {
    mockResolvePaymentAccessHandoff.mockResolvedValue({
      ok: true,
      state: "paid_ready",
      retryable: false,
      accessPath: "/m/ambiguous-temperature/payment/access?checkoutToken=pcs_redacted",
    });

    const response = await POST(request({ checkoutToken: "pcs_redacted" }), params);
    const data = await response.json();

    expect(data).toMatchObject({
      ok: true,
      status: "paid_ready",
      retryable: false,
      accessPath: "/m/ambiguous-temperature/payment/access?checkoutToken=pcs_redacted",
    });
    expect(JSON.stringify(data)).not.toContain("pa_");
  });

  it("returns safe invalid session status", async () => {
    mockResolvePaymentAccessHandoff.mockResolvedValue({
      ok: false,
      state: "invalid_session",
      errorCategory: "invalid_session",
    });

    const response = await POST(request({ checkoutToken: "bad" }), params);
    const data = await response.json();

    expect(data).toEqual({
      ok: true,
      status: "invalid_session",
      retryable: false,
      errorCategory: "invalid_session",
      accessPath: null,
    });
  });
});

