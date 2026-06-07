import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  buildAliasGuard,
  buildPlan,
  classifyRuntimeWindowState,
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

  it("refuses execute actions even with confirmation in v0", async () => {
    await expect(
      runProductionRuntimeWindow(["--action", "enable"]),
    ).resolves.toMatchObject({
      ok: false,
      blocker: "missing_confirm_controlled_smoke",
      executeImplemented: false,
    });
    await expect(
      runProductionRuntimeWindow(["--action", "enable", "--confirm-controlled-smoke"]),
    ).resolves.toMatchObject({
      ok: false,
      action: "enable",
      executeImplemented: false,
      plannedFlagsOnly: ["ENABLE_PAYMENT_RUNTIME", "ENABLE_NEWEBPAY_CHECKOUT"],
    });
    await expect(
      runProductionRuntimeWindow(["--action", "disable"]),
    ).resolves.toMatchObject({
      ok: false,
      blocker: "missing_confirm_shutdown",
      executeImplemented: false,
    });
  });

  it("plans only the two runtime-window flags", () => {
    expect(buildPlan("plan-enable")).toMatchObject({
      plannedAction: "enable_controlled_smoke_window",
      syncKeys: ["ENABLE_PAYMENT_RUNTIME", "ENABLE_NEWEBPAY_CHECKOUT"],
      localMirrorFirst: true,
      vercelSyncSecond: true,
      deployFromRepoRootOnly: true,
      valuesPrinted: false,
    });
    expect(buildPlan("plan-disable")).toMatchObject({
      plannedAction: "disable_controlled_smoke_window",
      syncKeys: ["ENABLE_PAYMENT_RUNTIME", "ENABLE_NEWEBPAY_CHECKOUT"],
      localMirrorFirst: true,
      vercelSyncSecond: true,
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
          },
        ],
        projectLinking: { ok: true },
        productionHealth: { environment: "production", gitCommit: "abcdef123456" },
      }),
    ).toMatchObject({
      status: "alias_target_unverified",
      blocker: true,
      aliasTargetDetected: false,
      aliasProjectMatchesCanonical: "unknown",
    });
  });

  it("keeps status ok false when alias guard blocks", () => {
    expect(
      classifyRuntimeWindowState({
        projectLinking: { ok: true },
        aliasGuard: { blocker: true, status: "alias_target_unverified" },
        preflight: { ok: true },
        flags: { runtimeEnabled: false, checkoutEnabled: false },
        routeStatus: {
          publicPagesStatus: { ok: true },
          checkoutRouteStatus: { failClosed: true },
          fakePaidRouteStatus: { failClosed: true },
          operatorRouteStatus: { failClosed: true },
        },
      }),
    ).toBe("alias_mismatch");
  });


  it("classifies fail-closed, runtime-enabled, project, alias, and preflight states", () => {
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
      flags: { runtimeEnabled: false, checkoutEnabled: false },
      routeStatus,
    };

    expect(classifyRuntimeWindowState(base)).toBe("fail_closed_ready");
    expect(
      classifyRuntimeWindowState({
        ...base,
        flags: { runtimeEnabled: true, checkoutEnabled: true },
        routeStatus: {
          ...routeStatus,
          checkoutRouteStatus: { failClosed: false },
        },
      }),
    ).toBe("runtime_enabled_controlled_window");
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
  });
});
