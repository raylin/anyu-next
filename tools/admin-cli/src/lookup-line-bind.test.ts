import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { writeCredentials } from "./auth.js";
import {
  formatPretty,
  main,
  parseArgs,
  validateLineBindDiagnosticLookupResponse,
} from "./lookup-line-bind.js";

const RESULT_ID = "11111111-1111-4111-8111-111111111111";

function safeResponse(overrides: Record<string, unknown> = {}) {
  return {
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
    ...overrides,
  };
}

function makeContext(fetchImpl: typeof fetch, token = "admin-token") {
  return {
    env: {
      ...(token ? { ADMIN_API_TOKEN: token } : {}),
      ANYU_OPS_CREDENTIALS_PATH: path.join(tmpdir(), "missing-anyu-line-bind-creds.json"),
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

describe("admin CLI lookup-line-bind", () => {
  it("requires --env and --result-id", () => {
    expect(() => parseArgs(["lookup-line-bind", "--result-id", RESULT_ID])).toThrow("env_required");
    expect(() => parseArgs(["lookup-line-bind", "--env", "staging"])).toThrow("result_id_missing");
  });

  it("rejects unsupported base URL, token, and lookup-result id flags", () => {
    expect(() =>
      parseArgs(["lookup-line-bind", "--env", "staging", "--result-id", RESULT_ID, "--base-url", "https://x.test"]),
    ).toThrow("unsupported_option");
    expect(() =>
      parseArgs(["lookup-line-bind", "--env", "staging", "--result-id", RESULT_ID, "--token", "secret"]),
    ).toThrow("unsupported_option");
    expect(() => parseArgs(["lookup-line-bind", "--env", "staging", "--id", RESULT_ID])).toThrow(
      "unsupported_option",
    );
  });

  it("requires ADMIN_API_TOKEN from process env only", async () => {
    const fetchImpl = vi.fn<typeof fetch>();
    const context = makeContext(fetchImpl, "");

    const exitCode = await main(["lookup-line-bind", "--env", "staging", "--result-id", RESULT_ID], context);

    expect(exitCode).toBe(1);
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(context.stderr.write).toHaveBeenCalledWith("ANYU ops error: admin_token_missing\n");
  });

  it("calls the staging diagnostics endpoint with x-admin-api-token", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(200, safeResponse()));
    const context = makeContext(fetchImpl);

    const exitCode = await main(["lookup-line-bind", "--env", "staging", "--result-id", RESULT_ID], context);

    expect(exitCode).toBe(0);
    expect(fetchImpl).toHaveBeenCalledWith(
      `https://staging.anyu.tw/api/admin/line-bind-diagnostics?resultId=${RESULT_ID}`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "x-admin-api-token": "admin-token",
          accept: "application/json",
        }),
      }),
    );
  });

  it("calls production only when production env is explicit", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(200, safeResponse()));
    const context = makeContext(fetchImpl);

    const exitCode = await main(["lookup-line-bind", "--env", "production", "--result-id", RESULT_ID], context);

    expect(exitCode).toBe(0);
    expect(fetchImpl).toHaveBeenCalledWith(
      `https://anyu.tw/api/admin/line-bind-diagnostics?resultId=${RESULT_ID}`,
      expect.any(Object),
    );
  });

  it("uses credentials file when process env token is absent", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "anyu-line-bind-creds-"));
    const credentialsPath = path.join(dir, "credentials.json");

    try {
      writeCredentials(
        { version: 1, profiles: { production: { adminApiToken: "file-token" } } },
        { ANYU_OPS_CREDENTIALS_PATH: credentialsPath },
      );
      const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(200, safeResponse()));
      const context = {
        ...makeContext(fetchImpl, ""),
        env: {
          ANYU_OPS_CREDENTIALS_PATH: credentialsPath,
        },
      };

      const exitCode = await main(["lookup-line-bind", "--env", "production", "--result-id", RESULT_ID], context);

      expect(exitCode).toBe(0);
      expect(fetchImpl).toHaveBeenCalledWith(
        `https://anyu.tw/api/admin/line-bind-diagnostics?resultId=${RESULT_ID}`,
        expect.objectContaining({
          headers: expect.objectContaining({ "x-admin-api-token": "file-token" }),
        }),
      );
      expect(String(vi.mocked(context.stdout.write).mock.calls[0]?.[0])).not.toContain("file-token");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("handles 401 and no-events without stack traces", async () => {
    const unauthorizedContext = makeContext(vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(401, {})));
    const missingContext = makeContext(vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(404, {})));

    await expect(main(["lookup-line-bind", "--env", "staging", "--result-id", RESULT_ID], unauthorizedContext)).resolves.toBe(
      1,
    );
    expect(unauthorizedContext.stderr.write).toHaveBeenCalledWith("ANYU ops error: admin_auth_failed\n");

    await expect(main(["lookup-line-bind", "--env", "staging", "--result-id", RESULT_ID], missingContext)).resolves.toBe(
      1,
    );
    expect(missingContext.stderr.write).toHaveBeenCalledWith("ANYU ops error: no_events_found\n");
  });

  it("validates safe response and pretty output", () => {
    const response = validateLineBindDiagnosticLookupResponse(safeResponse());
    const pretty = formatPretty("staging", response);

    expect(pretty).toContain("ANYU ops: LINE bind diagnostics");
    expect(pretty).toContain("Env: staging");
    expect(pretty).toContain("Latest category: id_token_missing_after_login");
    expect(pretty).toContain("retry_line_bind");
    expect(pretty).not.toContain("@");
    expect(pretty).not.toContain("line-user");
  });

  it("prints sanitized JSON output", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(200, safeResponse()));
    const context = makeContext(fetchImpl);

    const exitCode = await main(["lookup-line-bind", "--env", "staging", "--result-id", RESULT_ID, "--json"], context);

    expect(exitCode).toBe(0);
    const output = String(vi.mocked(context.stdout.write).mock.calls[0]?.[0]);
    expect(JSON.parse(output)).toMatchObject({
      ok: true,
      env: "staging",
      diagnostics: { ok: true },
    });
    expect(output).not.toContain("rlb_");
    expect(output).not.toContain("lineUserId");
  });

  it("rejects unsafe response fields and token-looking values", () => {
    expect(() => validateLineBindDiagnosticLookupResponse(safeResponse({ lineUserId: "raw-line-user" }))).toThrow(
      "unsafe_response_shape",
    );
    expect(() =>
      validateLineBindDiagnosticLookupResponse(safeResponse({ latestCategory: "https://anyu.tw/r/pal_123456789" })),
    ).toThrow("unsafe_response_shape");
  });

  it("does not read web env mirror files or DB/Vercel env when token exists", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(200, safeResponse()));
    const context = makeContext(fetchImpl);

    const exitCode = await main(["lookup-line-bind", "--env", "staging", "--result-id", RESULT_ID], context);

    expect(exitCode).toBe(0);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(String(vi.mocked(context.stdout.write).mock.calls[0]?.[0])).not.toContain("should-not-be-read");
  });
});
