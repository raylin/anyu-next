import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  buildAliasGuard,
  buildPlan,
  classifyRuntimeWindowState,
  parseVercelInspectOutput,
  parseArgs,
  runProductionRuntimeWindow,
} from "../../scripts/production-runtime-window.mjs";

describe("production runtime-window helper", () => {
  it("registers the package command", () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(process.cwd(), "package.json"), "utf8"),
    );

    expect(packageJson.scripts["qa:production:runtime-window"]).toBe(
      "node scripts/production-runtime-window.mjs",
    );
  });

  it("defaults to read-only status and parses guarded actions", () => {
    expect(parseArgs([])).toMatchObject({ action: "status" });
    expect(parseArgs(["--", "--action", "plan-enable"])).toMatchObject({
      action: "plan-enable",
    });
    expect(parseArgs(["--action", "enable", "--confirm-controlled-smoke"])).toMatchObject({
      action: "enable",
      confirmControlledSmoke: true,
    });
    expect(() => parseArgs(["--action", "rotate-secret"])).toThrow("invalid_action");
  });

  it("refuses execute actions without confirmation", async () => {
    await expect(
      runProductionRuntimeWindow(["--action", "enable"]),
    ).resolves.toMatchObject({
      ok: false,
      blocker: "missing_confirm_controlled_smoke",
      executeImplemented: true,
    });
    await expect(
      runProductionRuntimeWindow(["--action", "disable"]),
    ).resolves.toMatchObject({
      ok: false,
      blocker: "missing_confirm_shutdown",
      executeImplemented: true,
    });
  });

  it("plans only scoped runtime config keys", () => {
    expect(buildPlan("plan-enable")).toMatchObject({
      plannedAction: "enable_controlled_smoke_window",
      configKeys: ["payment.global.disabled", "payment.window.enabled"],
      targetConfig: {
        key: "payment.window.enabled",
        scopeType: "module",
        scopeKey: "ai-temperature",
        value: true,
      },
      redeployRequired: false,
      valuesPrinted: false,
    });
    expect(buildPlan("plan-disable")).toMatchObject({
      plannedAction: "disable_controlled_smoke_window",
      configKeys: ["payment.global.disabled", "payment.window.enabled"],
      targetConfig: {
        key: "payment.window.enabled",
        scopeType: "module",
        scopeKey: "ai-temperature",
        value: false,
      },
      redeployRequired: false,
    });
  });

  it("reports alias target unverified explicitly", () => {
    expect(
      buildAliasGuard({
        aliases: [
          {
            hostname: "anyu.tw",
            aliasTargetDetected: false,
            aliasProjectMatchesCanonical: "unknown",
            aliasHealthEnvironment: "production",
            aliasHealthGitCommitPresent: true,
          },
        ],
        projectLinking: { ok: true },
      }),
    ).toMatchObject({
      status: "alias_target_unverified",
      blocker: true,
      aliasTargetDetected: false,
      aliasProjectMatchesCanonical: "unknown",
    });
  });

  it("passes alias proof when inspect links both aliases to canonical production deployment", () => {
    expect(
      buildAliasGuard({
        aliases: [
          {
            hostname: "anyu.tw",
            aliasTargetDetected: true,
            aliasProjectMatchesCanonical: true,
            aliasTargetDeploymentIdPresent: true,
            aliasTargetProjectNameOrIdPresent: true,
            aliasHealthEnvironment: "production",
            aliasHealthGitCommitPresent: true,
          },
          {
            hostname: "www.anyu.tw",
            aliasTargetDetected: true,
            aliasProjectMatchesCanonical: true,
            aliasTargetDeploymentIdPresent: true,
            aliasTargetProjectNameOrIdPresent: true,
            aliasHealthEnvironment: "production",
            aliasHealthGitCommitPresent: true,
          },
        ],
        projectLinking: { ok: true },
      }),
    ).toMatchObject({
      status: "pass",
      blocker: false,
      aliasProjectMatchesCanonical: true,
      aliasTargetDeploymentIdPresent: true,
      aliasTargetProjectNameOrIdPresent: true,
      aliasHealthEnvironment: "production",
    });
  });

  it("blocks alias project mismatch", () => {
    expect(
      buildAliasGuard({
        aliases: [
          {
            hostname: "anyu.tw",
            aliasTargetDetected: true,
            aliasProjectMatchesCanonical: false,
            aliasTargetDeploymentIdPresent: true,
            aliasTargetProjectNameOrIdPresent: true,
            aliasHealthEnvironment: "production",
            aliasHealthGitCommitPresent: true,
          },
        ],
        projectLinking: { ok: true },
      }),
    ).toMatchObject({
      status: "alias_project_mismatch",
      blocker: true,
      aliasProjectMatchesCanonical: false,
    });
  });

  it("blocks health-only evidence", () => {
    expect(
      buildAliasGuard({
        aliases: [
          {
            hostname: "anyu.tw",
            aliasTargetDetected: false,
            aliasProjectMatchesCanonical: "unknown",
            aliasTargetDeploymentIdPresent: false,
            aliasTargetProjectNameOrIdPresent: false,
            aliasHealthEnvironment: "production",
            aliasHealthGitCommitPresent: true,
          },
          {
            hostname: "www.anyu.tw",
            aliasTargetDetected: false,
            aliasProjectMatchesCanonical: "unknown",
            aliasTargetDeploymentIdPresent: false,
            aliasTargetProjectNameOrIdPresent: false,
            aliasHealthEnvironment: "production",
            aliasHealthGitCommitPresent: true,
          },
        ],
        projectLinking: { ok: true },
      }),
    ).toMatchObject({
      status: "alias_target_unverified",
      blocker: true,
    });
  });

  it("categorizes alias inspection failure", () => {
    expect(
      buildAliasGuard({
        aliases: [
          {
            hostname: "anyu.tw",
            aliasTargetDetected: false,
            aliasProjectMatchesCanonical: "unknown",
            aliasTargetDeploymentIdPresent: false,
            aliasTargetProjectNameOrIdPresent: false,
            aliasInspectionStatus: "alias_inspection_failed",
            aliasHealthEnvironment: "production",
            aliasHealthGitCommitPresent: true,
          },
        ],
        projectLinking: { ok: true },
      }),
    ).toMatchObject({
      status: "alias_inspection_failed",
      blocker: true,
    });
  });

  it("parses safe Vercel inspect fields without requiring secret output", () => {
    expect(
      parseVercelInspectOutput(
        "anyu.tw",
        `
  General

    id          dpl_abc123DEF
    name        anyu-next
    target      production
    status      ● Ready
    url         https://anyu-next-example.vercel.app

  Aliases

    ╶ https://anyu.tw
`,
      ),
    ).toMatchObject({
      hostname: "anyu.tw",
      aliasTargetDetected: true,
      aliasProjectMatchesCanonical: true,
      aliasTargetDeploymentIdPresent: true,
      aliasTargetProjectNameOrIdPresent: true,
      aliasDeploymentTarget: "production",
      aliasDeploymentReady: true,
      aliasListedOnDeployment: true,
      valuesPrinted: false,
    });
  });

  it("keeps status ok false when alias guard blocks", () => {
    expect(
      classifyRuntimeWindowState({
        projectLinking: { ok: true },
        aliasGuard: { blocker: true, status: "alias_target_unverified" },
        preflight: { ok: true },
        runtimeConfig: { ok: true, paymentGlobalDisabled: false, paymentWindowEnabled: false },
        routeStatus: {
          publicPagesStatus: { ok: true },
          checkoutRouteStatus: { failClosed: true },
          fakePaidRouteStatus: { failClosed: true },
          operatorRouteStatus: { failClosed: true },
        },
      }),
    ).toBe("alias_mismatch");
  });


  it("classifies fail-closed, runtime-config-open, project, alias, and preflight states", () => {
    const routeStatus = {
      publicPagesStatus: { ok: true },
      checkoutRouteStatus: { failClosed: true },
      fakePaidRouteStatus: { failClosed: true },
      operatorRouteStatus: { failClosed: true },
    };
    const base = {
      projectLinking: { ok: true },
      aliasGuard: { blocker: false, status: "pass" },
      preflight: { ok: true },
        runtimeConfig: { ok: true, paymentGlobalDisabled: false, paymentWindowEnabled: false },
      routeStatus,
    };

    expect(classifyRuntimeWindowState(base)).toBe("fail_closed_ready");
    expect(
      classifyRuntimeWindowState({
        ...base,
        runtimeConfig: { ok: true, paymentGlobalDisabled: false, paymentWindowEnabled: true },
        routeStatus: {
          ...routeStatus,
          checkoutRouteStatus: { failClosed: false },
        },
      }),
    ).toBe("runtime_config_open");
    expect(
      classifyRuntimeWindowState({
        ...base,
        preflight: { ok: false, readiness: "blocked_production_not_fail_closed" },
        runtimeConfig: { ok: true, paymentGlobalDisabled: false, paymentWindowEnabled: true },
        routeStatus: {
          ...routeStatus,
          checkoutRouteStatus: { failClosed: false },
        },
      }),
    ).toBe("runtime_config_open");
    expect(
      classifyRuntimeWindowState({
        ...base,
        preflight: { ok: false, readiness: "blocked_production_not_fail_closed" },
        runtimeConfig: { ok: true, paymentGlobalDisabled: false, paymentWindowEnabled: true },
        routeStatus: {
          ...routeStatus,
          fakePaidRouteStatus: { failClosed: false },
        },
      }),
    ).toBe("unsafe_runtime_enabled");
    expect(classifyRuntimeWindowState({ ...base, projectLinking: { ok: false } })).toBe(
      "project_mismatch",
    );
    expect(
      classifyRuntimeWindowState({
        ...base,
        aliasGuard: { blocker: true, status: "alias_target_unverified" },
      }),
    ).toBe("alias_mismatch");
    expect(classifyRuntimeWindowState({ ...base, preflight: { ok: false } })).toBe(
      "preflight_blocked",
    );
    expect(
      classifyRuntimeWindowState({
        ...base,
        runtimeConfig: { ok: false },
      }),
    ).toBe("env_mirror_blocked");
  });
});
