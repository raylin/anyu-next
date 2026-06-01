import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockIsOperatorRecoveryLinkSmokeEnabled,
  mockIsDbConfigured,
  mockRunOperatorRecoveryLinkSmoke,
} = vi.hoisted(() => ({
  mockIsOperatorRecoveryLinkSmokeEnabled: vi.fn(),
  mockIsDbConfigured: vi.fn(),
  mockRunOperatorRecoveryLinkSmoke: vi.fn(),
}));

vi.mock("@/lib/runtime/feature-flags", () => ({
  isOperatorRecoveryLinkSmokeEnabled: mockIsOperatorRecoveryLinkSmokeEnabled,
}));

vi.mock("@/lib/db/client", () => ({
  isDbConfigured: mockIsDbConfigured,
}));

vi.mock("@/lib/payments/operator-recovery-link-smoke", () => ({
  runOperatorRecoveryLinkSmoke: mockRunOperatorRecoveryLinkSmoke,
}));

import { POST } from "@/app/api/operator/recovery-link-smoke/route";

function request(input: {
  secret?: string;
  body?: Record<string, unknown>;
}) {
  return new Request("http://localhost/api/operator/recovery-link-smoke", {
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

describe("operator recovery link smoke route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPERATOR_TEST_SECRET = "operator-secret";
    mockIsOperatorRecoveryLinkSmokeEnabled.mockReturnValue(true);
    mockIsDbConfigured.mockReturnValue(true);
    mockRunOperatorRecoveryLinkSmoke.mockResolvedValue({
      ok: true,
      mode: "operator_recovery_link_smoke",
      createdLink: true,
      resolverStatus: "passed",
      invalidLinkSafety: "passed",
      cleanup: "revoked",
      paymentIntentStatus: "paid",
      entitlementStatus: "active",
      generationJobStatus: "queued",
      generationJobProcessorCategory: "processed",
      paidResultRenderMarker: true,
    });
  });

  it("is disabled when the Preview(staging)-only flag is off", async () => {
    mockIsOperatorRecoveryLinkSmokeEnabled.mockReturnValue(false);

    const response = await POST(request({ secret: "operator-secret" }));

    expect(response.status).toBe(404);
    expect(mockRunOperatorRecoveryLinkSmoke).not.toHaveBeenCalled();
  });

  it("rejects missing or invalid operator secret", async () => {
    await expect(POST(request({}))).resolves.toMatchObject({ status: 401 });
    await expect(POST(request({ secret: "wrong-secret" }))).resolves.toMatchObject({
      status: 401,
    });
    expect(mockRunOperatorRecoveryLinkSmoke).not.toHaveBeenCalled();
  });

  it("returns sanitized smoke results without token material", async () => {
    const response = await POST(request({ secret: "operator-secret" }));
    const data = await response.json();
    const serialized = JSON.stringify(data);

    expect(response.status).toBe(200);
    expect(data).toEqual({
      ok: true,
      mode: "operator_recovery_link_smoke",
      createdLink: true,
      resolverStatus: "passed",
      invalidLinkSafety: "passed",
      cleanup: "revoked",
      paymentIntentStatus: "paid",
      entitlementStatus: "active",
      generationJobStatus: "queued",
      generationJobProcessorCategory: "processed",
      paidResultRenderMarker: true,
      rawRecoveryTokenReturned: false,
      tokenHashReturned: false,
      rawPaidAccessTokenReturned: false,
      rawCheckoutSessionTokenReturned: false,
      emailOrLineSent: false,
    });
    expect(serialized).not.toContain("operator-secret");
    expect(serialized).not.toContain("prl_");
    expect(serialized).not.toContain("pa_");
    expect(serialized).not.toContain("pcs_");
    expect(serialized).not.toContain("stored-token-hash");
    expect(mockRunOperatorRecoveryLinkSmoke).toHaveBeenCalledWith({
      moduleSlug: "ambiguous-temperature",
      resultId: "result-1",
      idempotencyKey: undefined,
    });
  });

  it("returns safe categories from the smoke service", async () => {
    mockRunOperatorRecoveryLinkSmoke.mockResolvedValue({
      ok: false,
      status: 503,
      error: "paid_result_not_ready",
      category: "processing",
    });

    const response = await POST(request({ secret: "operator-secret" }));
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toEqual({
      ok: false,
      error: "paid_result_not_ready",
      message: "Recovery link smoke failed.",
    });
    expect(JSON.stringify(data)).not.toContain("processing");
  });
});
