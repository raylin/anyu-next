import { describe, expect, it, vi } from "vitest";
import { helpText, main, parseArgs } from "./config.js";

function createContext(input: {
  status?: number;
  body?: unknown;
  token?: string;
} = {}) {
  let stdout = "";
  let stderr = "";
  const fetchImpl = vi.fn<typeof fetch>(async () =>
    new Response(
      JSON.stringify(input.body ?? { ok: true, config: { active: true, valueType: "boolean", riskLevel: "high" } }),
      {
        status: input.status ?? 200,
        headers: { "content-type": "application/json" },
      },
    ),
  );

  return {
    context: {
      env: input.token === undefined ? { ADMIN_API_TOKEN: "token" } : { ADMIN_API_TOKEN: input.token },
      fetchImpl,
      stdout: { write: vi.fn((chunk: string) => { stdout += chunk; return true; }) },
      stderr: { write: vi.fn((chunk: string) => { stderr += chunk; return true; }) },
    },
    fetchImpl,
    get stdout() { return stdout; },
    get stderr() { return stderr; },
  };
}

describe("admin CLI config", () => {
  it("prints useful help without requiring token", async () => {
    const run = createContext({ token: "" });
    const exitCode = await main(["config", "--help"], run.context);

    expect(exitCode).toBe(0);
    expect(run.stdout).toContain("pnpm ops config set --env production payment.window.enabled true --module ai-temperature");
    expect(run.stdout).not.toContain("delivery.line.enabled");
    expect(run.stdout).not.toContain("delivery.email.enabled");
    expect(helpText()).toContain("ADMIN_API_TOKEN");

    const helpRun = createContext({ token: "" });
    await expect(main(["config", "help"], helpRun.context)).resolves.toBe(0);
  });

  it("parses required scopes and rejects unsupported token/base-url flags", () => {
    expect(() => parseArgs(["config", "get", "--env", "production", "payment.window.enabled"])).toThrow("scope_required");
    expect(() =>
      parseArgs(["config", "get", "--env", "production", "payment.window.enabled", "--module", "ai-temperature", "--token", "x"]),
    ).toThrow("unsupported_option");
    expect(() =>
      parseArgs(["config", "set", "--env", "production", "payment.global.disabled", "true", "--global", "--reason", "x"]),
    ).toThrow("global_confirm_required");
  });

  it("calls runtime config Admin API and supports JSON output", async () => {
    const run = createContext({
      body: {
        ok: true,
        config: {
          key: "payment.window.enabled",
          active: true,
          value: false,
          valueType: "boolean",
          riskLevel: "high",
        },
      },
    });
    const exitCode = await main(
      ["config", "get", "--env", "production", "payment.window.enabled", "--module", "ai-temperature", "--json"],
      run.context,
    );

    expect(exitCode).toBe(0);
    expect(run.fetchImpl).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/runtime-config/get?"),
      expect.objectContaining({ method: "GET" }),
    );
    expect(run.stdout).toContain("\"ok\": true");
    expect(run.stdout).not.toContain("token");
  });

  it("sets scoped config with reason and shell token only", async () => {
    const run = createContext();
    const exitCode = await main(
      [
        "config",
        "set",
        "--env",
        "production",
        "payment.window.enabled",
        "true",
        "--module",
        "ai-temperature",
        "--reason",
        "controlled smoke",
      ],
      run.context,
    );
    const firstCall = run.fetchImpl.mock.calls[0];
    expect(firstCall).toBeDefined();
    const init = firstCall?.[1] as RequestInit;

    expect(exitCode).toBe(0);
    expect(init).toMatchObject({ method: "POST" });
    expect(JSON.parse(String(init.body))).toMatchObject({
      key: "payment.window.enabled",
      value: true,
      reason: "controlled smoke",
      actor: "pnpm-ops",
    });
  });

  it("returns sanitized auth and server errors", async () => {
    const missing = createContext({ token: "" });
    await expect(main(["config", "list", "--env", "production"], missing.context)).resolves.toBe(1);
    expect(missing.stderr).toContain("admin_token_missing");

    const wrong = createContext({ status: 401, body: { ok: false, error: "admin_auth_failed" } });
    await expect(main(["config", "list", "--env", "production"], wrong.context)).resolves.toBe(1);
    expect(wrong.stderr).toContain("admin_auth_failed");
  });
});
