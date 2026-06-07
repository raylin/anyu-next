import { describe, expect, it } from "vitest";
import {
  assertRuntimeConfigRegistryIsValid,
  getRuntimeConfigDefinition,
  listRuntimeConfigDefinitions,
} from "@/lib/runtime-config/registry";
import {
  validateRuntimeConfigIdentity,
  validateRuntimeConfigValue,
} from "@/lib/runtime-config/store";

describe("runtime config registry", () => {
  it("keeps the v0 registry valid and secret-free", () => {
    expect(() => assertRuntimeConfigRegistryIsValid()).not.toThrow();
    expect(listRuntimeConfigDefinitions().map((entry) => entry.key)).toEqual([
      "payment.window.enabled",
      "payment.global.disabled",
    ]);
  });

  it("does not expose unwired delivery controls as active runtime config keys", () => {
    expect(getRuntimeConfigDefinition("delivery.line.enabled")).toBeNull();
    expect(getRuntimeConfigDefinition("delivery.email.enabled")).toBeNull();
  });

  it("defines payment.window.enabled as module-scoped and high-risk", () => {
    expect(getRuntimeConfigDefinition("payment.window.enabled")).toMatchObject({
      valueType: "boolean",
      allowedScopes: ["module"],
      moduleAllowlist: ["ai-temperature"],
      critical: true,
      riskLevel: "high",
      requiresReason: true,
    });
  });

  it("rejects unknown keys, wrong scope, wrong module, and wrong value type", () => {
    expect(() =>
      validateRuntimeConfigIdentity({
        environment: "production",
        key: "secret.token",
        scopeType: "global",
        scopeKey: "global",
      }),
    ).toThrow("ConfigKeyNotRegistered");
    expect(() =>
      validateRuntimeConfigIdentity({
        environment: "production",
        key: "payment.window.enabled",
        scopeType: "global",
        scopeKey: "global",
      }),
    ).toThrow("ConfigScopeNotAllowed");
    expect(() =>
      validateRuntimeConfigIdentity({
        environment: "production",
        key: "payment.window.enabled",
        scopeType: "module",
        scopeKey: "module-02",
      }),
    ).toThrow("ConfigScopeNotAllowed");
    expect(() =>
      validateRuntimeConfigValue({
        key: "payment.window.enabled",
        value: "true",
        valueType: "boolean",
      }),
    ).toThrow("ConfigValueTypeMismatch");
  });
});
