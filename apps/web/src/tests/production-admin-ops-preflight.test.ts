import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  buildSummary,
  classifyCommandResult,
  containsUnsafeOutput,
} from "../../scripts/production-admin-ops-preflight.mjs";

function successResult(body: unknown = { ok: true, config: { value: false } }) {
  return {
    status: 0,
    stdout: JSON.stringify(body),
    stderr: "",
  };
}

describe("production Admin/Ops preflight", () => {
  it("registers the package command", () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf8"),
    );

    expect(packageJson.scripts["qa:production:admin-ops-preflight"]).toBe(
      "node scripts/production-admin-ops-preflight.mjs",
    );
  });

  it("blocks before subprocess calls when ADMIN_API_TOKEN is missing", () => {
    const calls: string[] = [];
    const summary = buildSummary({
      env: {},
      runCommand: (command) => {
        calls.push(command.id);
        return successResult();
      },
    });

    expect(summary).toMatchObject({
      status: "blocked",
      gateStatus: "blocked",
      adminOpsStatus: "production_admin_token_missing",
      category: "production_admin_token_missing_owner_action_required",
      tokenSourceCategory: "missing",
      tokenPresent: false,
      commandExitCode: 1,
    });
    expect(calls).toEqual([]);
    expect(JSON.stringify(summary)).not.toContain("secret");
  });

  it("reports production_admin_auth_failed for unauthorized ops responses", () => {
    const summary = buildSummary({
      env: { ADMIN_API_TOKEN: "redacted-test-token" },
      runCommand: () => ({
        status: 1,
        stdout: "",
        stderr: "admin_auth_failed",
      }),
    });

    expect(summary).toMatchObject({
      status: "blocked",
      adminOpsStatus: "production_admin_auth_failed",
      tokenSourceCategory: "process_env",
      tokenPresent: true,
    });
    expect(JSON.stringify(summary)).not.toContain("redacted-test-token");
  });

  it("passes when all mocked production ops calls succeed", () => {
    const called: string[] = [];
    const summary = buildSummary({
      env: { ADMIN_API_TOKEN: "redacted-test-token" },
      runCommand: (command) => {
        called.push(command.id);
        return successResult({ ok: true, config: { value: command.id === "payment_global_disabled_get" ? false : true } });
      },
    });

    expect(called).toEqual([
      "payment_window_get",
      "payment_global_disabled_get",
      "payment_window_history",
    ]);
    expect(summary).toMatchObject({
      status: "pass",
      gateStatus: "pass",
      adminOpsStatus: "production_admin_ops_ready",
      category: "production_admin_ops_ready",
      commandExitCode: 0,
      mutatesData: false,
      productionTouched: true,
    });
  });

  it("classifies unsafe or failed output as config lookup failure", () => {
    expect(
      classifyCommandResult({
        status: 1,
        stdout: "",
        stderr: "server unavailable",
      }),
    ).toBe("production_admin_config_lookup_failed");
    expect(
      classifyCommandResult({
        status: 0,
        stdout: JSON.stringify({ ok: true, leaked: "pa_123456789abcdef" }),
        stderr: "",
      }),
    ).toBe("production_admin_config_lookup_failed");
    expect(containsUnsafeOutput("ADMIN_API_TOKEN=abc")).toBe(true);
  });

  it("documents that pnpm ops remains pure and does not load production mirrors", () => {
    const adminCliSource = fs.readFileSync(
      path.resolve(process.cwd(), "../../tools/admin-cli/src/index.ts"),
      "utf8",
    );
    const configCliSource = fs.readFileSync(
      path.resolve(process.cwd(), "../../tools/admin-cli/src/config.ts"),
      "utf8",
    );

    expect(adminCliSource).not.toContain(".env.production");
    expect(configCliSource).not.toContain(".env.production");
    expect(configCliSource).toContain("ADMIN_API_TOKEN must be present in the shell/process environment.");
  });
});
