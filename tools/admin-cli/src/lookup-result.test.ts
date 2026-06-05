import { describe, expect, it, vi } from "vitest";
import {
  BASE_URLS,
  assertSafePayload,
  formatPretty,
  main,
  parseArgs,
  validateAdminLookupResponse,
} from "./lookup-result.js";

const RESULT_ID = "11111111-1111-4111-8111-111111111111";

function safeResponse(overrides: Record<string, unknown> = {}) {
  return {
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
    entitlement: {
      exists: true,
      status: "active",
      active: true,
    },
    generation: {
      jobExists: true,
      status: "completed",
      failureCategory: null,
    },
    accessLinks: {
      email: {
        contactSaved: true,
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
        contactSaved: true,
        recipientSecretExists: true,
        sent: true,
        active: true,
        used: false,
        revoked: false,
        expired: false,
        sendAttemptCount: 1,
        lastProviderStatus: "accepted",
        lastFailureCategory: null,
        providerMessageIdPresent: false,
      },
    },
    diagnosis: ["paid_result_ready", "email_access_link_sent", "line_access_link_sent"],
    recommendedActions: ["ask_user_open_email_or_line_view_link"],
    ...overrides,
  };
}

function makeContext(fetchImpl: typeof fetch, token = "admin-token") {
  return {
    env: {
      ADMIN_API_TOKEN: token,
      DATABASE_URL: "should-not-be-read",
      VERCEL_TOKEN: "should-not-be-read",
    },
    fetchImpl,
    stdout: { write: vi.fn() },
    stderr: { write: vi.fn() },
  };
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("admin CLI lookup-result", () => {
  it("requires --env and --id", () => {
    expect(() => parseArgs(["lookup-result", "--id", RESULT_ID])).toThrow("env_required");
    expect(() => parseArgs(["lookup-result", "--env", "staging"])).toThrow("result_id_missing");
  });

  it("rejects unsupported base URL and token flags", () => {
    expect(() =>
      parseArgs(["lookup-result", "--env", "staging", "--id", RESULT_ID, "--base-url", "https://x.test"]),
    ).toThrow("unsupported_option");
    expect(() =>
      parseArgs(["lookup-result", "--env", "staging", "--id", RESULT_ID, "--token", "secret"]),
    ).toThrow("unsupported_option");
  });

  it("maps environments to hardcoded base URLs", () => {
    expect(BASE_URLS.staging).toBe("https://staging.anyu.tw");
    expect(BASE_URLS.production).toBe("https://anyu.tw");
  });

  it("requires ADMIN_API_TOKEN from process env only", async () => {
    const fetchImpl = vi.fn<typeof fetch>();
    const context = makeContext(fetchImpl, "");

    const exitCode = await main(["lookup-result", "--env", "staging", "--id", RESULT_ID], context);

    expect(exitCode).toBe(1);
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(context.stderr.write).toHaveBeenCalledWith("ANYU ops error: admin_token_missing\n");
  });

  it("sends x-admin-api-token and calls staging endpoint", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(200, safeResponse()));
    const context = makeContext(fetchImpl);

    const exitCode = await main(["lookup-result", "--env", "staging", "--id", RESULT_ID], context);

    expect(exitCode).toBe(0);
    expect(fetchImpl).toHaveBeenCalledWith(
      `https://staging.anyu.tw/api/admin/paid-results/${RESULT_ID}`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "x-admin-api-token": "admin-token",
          accept: "application/json",
        }),
      }),
    );
  });

  it("calls production endpoint when production env is explicit", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(200, safeResponse()));
    const context = makeContext(fetchImpl);

    const exitCode = await main(["lookup-result", "--env", "production", "--id", RESULT_ID], context);

    expect(exitCode).toBe(0);
    expect(fetchImpl).toHaveBeenCalledWith(
      `https://anyu.tw/api/admin/paid-results/${RESULT_ID}`,
      expect.any(Object),
    );
  });

  it("handles 401 and 404 without stack traces", async () => {
    const unauthorizedContext = makeContext(vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(401, {})));
    const missingContext = makeContext(vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(404, {})));

    await expect(main(["lookup-result", "--env", "staging", "--id", RESULT_ID], unauthorizedContext)).resolves.toBe(1);
    expect(unauthorizedContext.stderr.write).toHaveBeenCalledWith("ANYU ops error: admin_auth_failed\n");

    await expect(main(["lookup-result", "--env", "staging", "--id", RESULT_ID], missingContext)).resolves.toBe(1);
    expect(missingContext.stderr.write).toHaveBeenCalledWith("ANYU ops error: result_not_found\n");
  });

  it("handles unreachable API", async () => {
    const context = makeContext(vi.fn<typeof fetch>().mockRejectedValue(new Error("network down")));

    await expect(main(["lookup-result", "--env", "staging", "--id", RESULT_ID], context)).resolves.toBe(1);
    expect(context.stderr.write).toHaveBeenCalledWith("ANYU ops error: api_unreachable\n");
  });

  it("validates safe response and pretty output", () => {
    const response = validateAdminLookupResponse(safeResponse());
    const pretty = formatPretty("staging", response);

    expect(pretty).toContain("ANYU ops: paid result lookup");
    expect(pretty).toContain("Env: staging");
    expect(pretty).toContain("Diagnosis: paid_result_ready");
    expect(pretty).toContain("Email: saved, sent, active");
    expect(pretty).toContain("LINE: saved, recipient-secret, sent, active");
    expect(pretty).not.toContain("provider-message-id");
    expect(pretty).not.toContain("ANYU-PRIVATE-ORDER");
    expect(pretty).not.toContain("@");
  });

  it("prints sanitized JSON output", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(200, safeResponse()));
    const context = makeContext(fetchImpl);

    const exitCode = await main(["lookup-result", "--env", "staging", "--id", RESULT_ID, "--json"], context);

    expect(exitCode).toBe(0);
    const output = String(vi.mocked(context.stdout.write).mock.calls[0]?.[0]);
    expect(JSON.parse(output)).toMatchObject({
      ok: true,
      env: "staging",
      lookup: { ok: true },
    });
    expect(output).not.toContain("provider-message-id");
    expect(output).not.toContain("ANYU-PRIVATE-ORDER");
  });

  it("rejects unsafe response fields and token-looking values", () => {
    expect(() => assertSafePayload({ email: "owner@example.com" })).toThrow("unsafe_response_shape");
    expect(() => assertSafePayload({ accessUrl: "https://staging.anyu.tw/r/pal_123456789" })).toThrow(
      "unsafe_response_shape",
    );
    expect(() => assertSafePayload({ providerMessageId: "raw-provider-id" })).toThrow("unsafe_response_shape");
    expect(() => assertSafePayload({ merchantOrderNo: "raw-order" })).toThrow("unsafe_response_shape");
    expect(() =>
      assertSafePayload({ providerMessageIdPresent: true, merchantOrderNoPresent: true }),
    ).not.toThrow();
  });

  it("does not read web env mirror files or DB/Vercel env when token exists", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(200, safeResponse()));
    const context = makeContext(fetchImpl);

    const exitCode = await main(["lookup-result", "--env", "staging", "--id", RESULT_ID], context);

    expect(exitCode).toBe(0);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(String(vi.mocked(context.stdout.write).mock.calls[0]?.[0])).not.toContain("should-not-be-read");
  });
});
