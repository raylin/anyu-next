import { Buffer } from "node:buffer";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockIsDbConfigured, mockRecordLineBindDiagnosticEvent } = vi.hoisted(() => ({
  mockIsDbConfigured: vi.fn(),
  mockRecordLineBindDiagnosticEvent: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  isDbConfigured: mockIsDbConfigured,
}));

vi.mock("@/lib/line/recovery-bind-diagnostic-events", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/line/recovery-bind-diagnostic-events")>();

  return {
    ...actual,
    recordLineBindDiagnosticEvent: mockRecordLineBindDiagnosticEvent,
  };
});

import { POST } from "@/app/api/line/recovery/bind-diagnostics/route";
import { createLineRecoveryBindStateToken } from "@/lib/line/recovery-bind-state";

const RESULT_ID = "22222222-2222-4222-8222-222222222222";
const TEST_ENV = {
  PAYMENT_RECOVERY_CONTACT_HASH_SECRET: "test-only-recovery-hash-secret",
  PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString("base64url"),
  LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY: Buffer.alloc(32, 9).toString("base64url"),
} as NodeJS.ProcessEnv;

function request(body: Record<string, unknown>) {
  return new Request("http://localhost/api/line/recovery/bind-diagnostics", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function createState() {
  return createLineRecoveryBindStateToken({
    moduleSlug: "ambiguous-temperature",
    resultId: RESULT_ID,
    source: "checkout_start",
    returnPath: `/m/ambiguous-temperature/result/${RESULT_ID}`,
    env: TEST_ENV,
    now: new Date("2030-06-01T10:00:00.000Z"),
  });
}

describe("LINE recovery bind diagnostics route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PAYMENT_RECOVERY_CONTACT_HASH_SECRET =
      TEST_ENV.PAYMENT_RECOVERY_CONTACT_HASH_SECRET;
    mockIsDbConfigured.mockReturnValue(true);
    mockRecordLineBindDiagnosticEvent.mockResolvedValue({});
  });

  it("records a safe client diagnostic only after signed state verification", async () => {
    const state = createState();
    expect(state.ok).toBe(true);

    const response = await POST(
      request({
        state: state.ok ? state.token : "",
        category: "id_token_missing_after_login",
        hasLiffState: true,
        hasIdToken: false,
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, status: "recorded" });
    expect(mockRecordLineBindDiagnosticEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "client",
        category: "id_token_missing_after_login",
        hasLiffState: true,
        hasIdToken: false,
      }),
    );
  });

  it("rejects unsafe categories and invalid states without persistence", async () => {
    const unsafeResponse = await POST(
      request({
        state: "rlb_invalid",
        category: "raw_line_user_id",
      }),
    );

    expect(unsafeResponse.status).toBe(400);
    await expect(unsafeResponse.json()).resolves.toEqual({
      ok: false,
      error: "invalid_category",
    });

    const stateResponse = await POST(
      request({
        state: "rlb_invalid",
        category: "liff_state_invalid",
      }),
    );

    expect(stateResponse.status).toBe(400);
    await expect(stateResponse.json()).resolves.toEqual({
      ok: false,
      error: "state_invalid",
    });
    expect(mockRecordLineBindDiagnosticEvent).not.toHaveBeenCalled();
  });
});
