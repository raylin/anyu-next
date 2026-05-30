import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockIsDbConfigured, mockProcessNewebPayNotify } = vi.hoisted(() => ({
  mockIsDbConfigured: vi.fn(),
  mockProcessNewebPayNotify: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  isDbConfigured: mockIsDbConfigured,
}));

vi.mock("@/lib/payments/newebpay/notify-service", () => ({
  processNewebPayNotify: mockProcessNewebPayNotify,
}));

import { POST } from "@/app/api/payments/newebpay/notify/route";

function formRequest(body: Record<string, string>) {
  return new Request("http://localhost/api/payments/newebpay/notify", {
    method: "POST",
    body: new URLSearchParams(body),
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });
}

describe("NewebPay NotifyURL route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsDbConfigured.mockReturnValue(true);
    mockProcessNewebPayNotify.mockResolvedValue({
      ok: true,
      category: "payment_marked_paid",
      paymentIntentStatus: "paid",
      paymentIntent: { id: "payment-1" },
    });
  });

  it("returns provider-compatible success without exposing payment internals", async () => {
    const response = await POST(
      formRequest({
        MerchantID: "MS123456789",
        TradeInfo: "encrypted",
        TradeSha: "sha",
        Version: "2.0",
      }),
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toBe("1|OK");
    expect(response.headers.get("x-anyu-payment-category")).toBe("payment_marked_paid");
    expect(body).not.toContain("payment-1");
    expect(body).not.toContain("TradeInfo");
    expect(body).not.toContain("TradeSha");
  });

  it("returns provider-compatible error with safe category for invalid callbacks", async () => {
    mockProcessNewebPayNotify.mockResolvedValue({
      ok: false,
      status: 400,
      category: "signature_invalid",
    });

    const response = await POST(
      formRequest({
        MerchantID: "MS123456789",
        TradeInfo: "encrypted",
        TradeSha: "bad",
        Version: "2.0",
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.text()).toBe("0|ERROR");
    expect(response.headers.get("x-anyu-payment-category")).toBe("signature_invalid");
  });

  it("fails safely when database/runtime config is missing", async () => {
    mockIsDbConfigured.mockReturnValue(false);

    const response = await POST(formRequest({}));

    expect(response.status).toBe(503);
    expect(await response.text()).toBe("0|ERROR");
    expect(mockProcessNewebPayNotify).not.toHaveBeenCalled();
  });
});

