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

const consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);

function formRequest(body: Record<string, string>) {
  return new Request("http://localhost/api/payments/newebpay/notify", {
    method: "POST",
    body: new URLSearchParams(body),
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });
}

function rawFormRequest(body: string) {
  return new Request("http://localhost/api/payments/newebpay/notify", {
    method: "POST",
    body,
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });
}

function lastDiagnostic() {
  const message = consoleInfoSpy.mock.calls.at(-1)?.[0];

  if (typeof message !== "string") {
    throw new Error("expected diagnostic log");
  }

  return JSON.parse(message) as Record<string, unknown>;
}

describe("NewebPay NotifyURL route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsDbConfigured.mockReturnValue(true);
    mockProcessNewebPayNotify.mockResolvedValue({
      ok: true,
      category: "payment_marked_paid",
      paymentIntentStatus: "paid",
      paymentIntent: { id: "payment-1", moduleSlug: "ambiguous-temperature" },
      queueTrigger: { category: "disabled" },
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
    expect(lastDiagnostic()).toMatchObject({
      event: "newebpay_notify_processed",
      ok: true,
      category: "payment_marked_paid",
      httpTransportStatus: 200,
      providerResponse: "1|OK",
      payloadShape: {
        merchantIdPresent: true,
        tradeInfoPresent: true,
        tradeShaPresent: true,
        versionPresent: true,
      },
    });
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

    expect(response.status).toBe(200);
    const body = await response.text();

    expect(body).toBe("0|ERROR");
    expect(response.headers.get("x-anyu-payment-category")).toBe("signature_invalid");
    expect(body).not.toContain("TradeInfo");
    expect(body).not.toContain("TradeSha");

    const diagnostic = lastDiagnostic();

    expect(diagnostic).toMatchObject({
      event: "newebpay_notify_failed",
      ok: false,
      category: "signature_invalid",
      httpTransportStatus: 200,
      providerResponse: "0|ERROR",
      contentTypeCategory: "form_urlencoded",
      payloadShape: {
        merchantIdPresent: true,
        tradeInfoPresent: true,
        tradeShaPresent: true,
        versionPresent: true,
      },
    });
    expect(JSON.stringify(diagnostic)).not.toContain("encrypted");
    expect(JSON.stringify(diagnostic)).not.toContain("bad");
  });

  it("parses x-www-form-urlencoded provider callbacks", async () => {
    await POST(
      rawFormRequest("MerchantID=MS123456789&TradeInfo=encrypted&TradeSha=sha&Version=2.0"),
    );

    expect(mockProcessNewebPayNotify).toHaveBeenCalledTimes(1);
    const payload = mockProcessNewebPayNotify.mock.calls[0]?.[0];

    expect(payload).toBeInstanceOf(FormData);
    expect(payload.get("MerchantID")).toBe("MS123456789");
    expect(payload.get("TradeInfo")).toBe("encrypted");
    expect(payload.get("TradeSha")).toBe("sha");
    expect(payload.get("Version")).toBe("2.0");
  });

  it("returns HTTP 200 with provider-compatible failure for missing fields", async () => {
    mockProcessNewebPayNotify.mockResolvedValue({
      ok: false,
      status: 400,
      category: "malformed_payload",
    });

    const response = await POST(rawFormRequest("MerchantID=MS123456789"));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toBe("0|ERROR");
    expect(response.headers.get("x-anyu-payment-category")).toBe("malformed_payload");
    expect(body).not.toContain("MerchantID");
    expect(lastDiagnostic()).toMatchObject({
      event: "newebpay_notify_failed",
      category: "malformed_payload",
      payloadShape: {
        merchantIdPresent: true,
        tradeInfoPresent: false,
        tradeShaPresent: false,
        versionPresent: false,
      },
    });
  });

  it("logs safe category booleans for merchant mismatch without raw payload values", async () => {
    mockProcessNewebPayNotify.mockResolvedValue({
      ok: false,
      status: 400,
      category: "merchant_mismatch",
    });

    await POST(
      rawFormRequest("MerchantID=MS123456789&TradeInfo=encrypted&TradeSha=sha&Version=2.0"),
    );

    const diagnostic = lastDiagnostic();
    const serialized = JSON.stringify(diagnostic);

    expect(diagnostic).toMatchObject({
      event: "newebpay_notify_failed",
      category: "merchant_mismatch",
      merchantMatch: false,
      payloadShape: {
        merchantIdPresent: true,
        tradeInfoPresent: true,
        tradeShaPresent: true,
        versionPresent: true,
      },
    });
    expect(serialized).not.toContain("MS123456789");
    expect(serialized).not.toContain("encrypted");
    expect(serialized).not.toContain("sha");
  });

  it("logs safe category booleans for amount mismatch and missing payment intent", async () => {
    mockProcessNewebPayNotify.mockResolvedValueOnce({
      ok: false,
      status: 409,
      category: "amount_mismatch",
    });

    await POST(
      rawFormRequest("MerchantID=MS123456789&TradeInfo=encrypted&TradeSha=sha&Version=2.0"),
    );

    expect(lastDiagnostic()).toMatchObject({
      event: "newebpay_notify_failed",
      category: "amount_mismatch",
      amountMatch: false,
    });

    mockProcessNewebPayNotify.mockResolvedValueOnce({
      ok: false,
      status: 404,
      category: "payment_intent_not_found",
    });

    await POST(
      rawFormRequest("MerchantID=MS123456789&TradeInfo=encrypted&TradeSha=sha&Version=2.0"),
    );

    expect(lastDiagnostic()).toMatchObject({
      event: "newebpay_notify_failed",
      category: "payment_intent_not_found",
      paymentIntentFound: false,
    });
  });

  it("fails safely when database/runtime config is missing", async () => {
    mockIsDbConfigured.mockReturnValue(false);

    const response = await POST(formRequest({}));

    expect(response.status).toBe(503);
    expect(await response.text()).toBe("0|ERROR");
    expect(mockProcessNewebPayNotify).not.toHaveBeenCalled();
  });
});
