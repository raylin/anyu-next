import { afterEach, describe, expect, it, vi } from "vitest";

const lookupLineBindDiagnosticsByResultId = vi.fn();

vi.mock("@/lib/line/recovery-bind-diagnostic-events", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/line/recovery-bind-diagnostic-events")>();

  return {
    ...actual,
    lookupLineBindDiagnosticsByResultId,
  };
});

const { GET } = await import("@/app/api/admin/line-bind-diagnostics/route");

const RESULT_ID = "11111111-1111-4111-8111-111111111111";

function request(token?: string, resultId = RESULT_ID) {
  return new Request(`https://example.test/api/admin/line-bind-diagnostics?resultId=${resultId}`, {
    headers: token ? { "x-admin-api-token": token } : {},
  });
}

describe("admin LINE bind diagnostics route", () => {
  afterEach(() => {
    lookupLineBindDiagnosticsByResultId.mockReset();
    delete process.env.ADMIN_API_TOKEN;
  });

  it("authenticates before lookup", async () => {
    const response = await GET(request("token"));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "admin_api_not_configured",
    });
    expect(lookupLineBindDiagnosticsByResultId).not.toHaveBeenCalled();

    process.env.ADMIN_API_TOKEN = "correct-token";
    const unauthorized = await GET(request("wrong-token"));
    expect(unauthorized.status).toBe(401);
    expect(lookupLineBindDiagnosticsByResultId).not.toHaveBeenCalled();
  });

  it("returns safe 404 after auth when no diagnostics exist", async () => {
    process.env.ADMIN_API_TOKEN = "correct-token";
    lookupLineBindDiagnosticsByResultId.mockResolvedValue(null);

    const response = await GET(request("correct-token"));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "no_events_found",
    });
    expect(lookupLineBindDiagnosticsByResultId).toHaveBeenCalledWith(RESULT_ID);
  });

  it("returns sanitized diagnostics for valid result ID", async () => {
    process.env.ADMIN_API_TOKEN = "correct-token";
    lookupLineBindDiagnosticsByResultId.mockResolvedValue({
      ok: true,
      resultId: RESULT_ID,
      moduleSlug: "ambiguous-temperature",
      latestCategory: "id_token_missing_after_login",
      latestStage: "id_token",
      latestStatus: "failed",
      eventCount: 2,
      latestCreatedAtPresent: true,
      latestCreatedAt: "2030-01-01T00:00:00.000Z",
      categories: [{ category: "id_token_missing_after_login", count: 2 }],
      recommendedActions: ["retry_line_bind", "use_email_fallback", "check_liff_channel_config"],
    });

    const response = await GET(request("correct-token"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      ok: true,
      latestCategory: "id_token_missing_after_login",
      eventCount: 2,
    });
    expect(JSON.stringify(data)).not.toContain("lineUserId");
    expect(JSON.stringify(data)).not.toContain("idToken");
    expect(JSON.stringify(data)).not.toContain("rlb_");
  });

  it("validates result ID after auth", async () => {
    process.env.ADMIN_API_TOKEN = "correct-token";

    const response = await GET(request("correct-token", "not-a-uuid"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "invalid_result_id",
    });
    expect(lookupLineBindDiagnosticsByResultId).not.toHaveBeenCalled();
  });
});
