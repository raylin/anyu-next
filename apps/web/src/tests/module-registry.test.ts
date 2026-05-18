import { describe, expect, it } from "vitest";
import { aiTemperatureModule } from "@/content/modules/ai-temperature";
import { getModuleBySlug, listModules } from "@/lib/modules/registry";

describe("module registry", () => {
  it("resolves ambiguous-temperature", () => {
    expect(getModuleBySlug("ambiguous-temperature")).toEqual(aiTemperatureModule);
  });

  it("lists the configured module", () => {
    expect(listModules()).toContainEqual(aiTemperatureModule);
  });
});
