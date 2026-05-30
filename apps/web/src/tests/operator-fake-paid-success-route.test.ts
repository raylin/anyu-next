import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockIsOperatorFakePaidSuccessEnabled,
  mockIsDbConfigured,
  mockCreateOperatorFakePaidSuccess,
} = vi.hoisted(() => ({
  mockIsOperatorFakePaidSuccessEnabled: vi.fn(),
  mockIsDbConfigured: vi.fn(),
  mockCreateOperatorFakePaidSuccess: vi.fn(),
}));

vi.mock("@/lib/runtime/feature-flags", () => ({
  isOperatorFakePaidSuccessEnabled: mockIsOperatorFakePaidSuccessEnabled,
}));

vi.mock("@/lib/db/client", () => ({
  isDbConfigured: mockIsDbConfigured,
}));

vi.mock("@/lib/payments/operator-fake-paid-success", () => ({
  createOperatorFakePaidSuccess: mockCreateOperatorFakePaidSuccess,
}));

import { POST } from "@/app/api/operator/fake-paid-success/route";

function request(input: {
  secret?: string;
  body?: Record<string, unknown>;
}) {
  return new Request("http://localhost/api/operator/fake-paid-success", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(input.secret ? { "x-operator-test-secret": input.secret } : {}),
    },
    body: JSON.stringify(input.body ?? {
      moduleSlug: "ambiguous-temperature",
      resultId: "result-1",
    }),
  });
}

describe("operator fake paid success route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPERATOR_TEST_SECRET = "operator-secret";
    mockIsOperatorFakePaidSuccessEnabled.mockReturnValue(true);
    mockIsDbConfigured.mockReturnValue(true);
    mockCreateOperatorFakePaidSuccess.mockResolvedValue({
      ok: true,
      moduleSlug: "ambiguous-temperature",
      resultId: "result-1",
      paymentIntent: { id: "payment-1", status: "paid" },
      paymentIntentCreated: true,
      entitlement: { id: "entitlement-1", status: "active" },
      entitlementCreated: true,
      generationJob: { id: "job-1", status: "queued" },
      generationJobCreated: true,
      accessState: "pending",
      paidAccessToken: "pa_test-token",
      paidAccessTokenReturned: true,
      unlockPath: "/m/ambiguous-temperature/unlock/pa_test-token",
      queueTrigger: {
        ok: true,
        category: "enqueued",
        provider: "vercel_queue",
      },
    });
  });

  it("is disabled by default when the explicit flag is off", async () => {
    mockIsOperatorFakePaidSuccessEnabled.mockReturnValue(false);

    const response = await POST(request({ secret: "operator-secret" }));

    expect(response.status).toBe(404);
    expect(mockCreateOperatorFakePaidSuccess).not.toHaveBeenCalled();
  });

  it("rejects missing or invalid operator secret", async () => {
    await expect(POST(request({}))).resolves.toMatchObject({ status: 401 });
    await expect(POST(request({ secret: "wrong-secret" }))).resolves.toMatchObject({
      status: 401,
    });
    expect(mockCreateOperatorFakePaidSuccess).not.toHaveBeenCalled();
  });

  it("returns safe operator metadata and first-use pa token when authorized", async () => {
    const response = await POST(request({ secret: "operator-secret" }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      ok: true,
      mode: "operator_fake_paid_success",
      moduleSlug: "ambiguous-temperature",
      resultId: "result-1",
      paymentIntentId: "payment-1",
      paymentIntentStatus: "paid",
      paymentIntentCreated: true,
      entitlementId: "entitlement-1",
      entitlementStatus: "active",
      entitlementCreated: true,
      generationJobId: "job-1",
      generationJobStatus: "queued",
      generationJobCreated: true,
      accessState: "pending",
      paidAccessToken: "pa_test-token",
      paidAccessTokenReturned: true,
      unlockPath: "/m/ambiguous-temperature/unlock/pa_test-token",
      queueTrigger: {
        ok: true,
        category: "enqueued",
        provider: "vercel_queue",
      },
    });
    expect(JSON.stringify(data)).not.toContain("operator-secret");
    expect(mockCreateOperatorFakePaidSuccess).toHaveBeenCalledWith({
      moduleSlug: "ambiguous-temperature",
      resultId: "result-1",
      idempotencyKey: undefined,
    });
  });

  it("returns safe error categories from the operator service", async () => {
    mockCreateOperatorFakePaidSuccess.mockResolvedValue({
      ok: false,
      status: 503,
      error: "paid_access_token_config_missing",
    });

    const response = await POST(request({ secret: "operator-secret" }));
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toEqual({
      ok: false,
      error: "paid_access_token_config_missing",
      message: "Operator fake paid success failed.",
    });
    expect(JSON.stringify(data)).not.toContain("operator-secret");
  });
});
