import { describe, expect, it, vi } from "vitest";
import {
  MODULE_THEME_SOURCE_STORAGE_KEY,
  MODULE_THEME_VARIANT_STORAGE_KEY,
  assignModuleThemeVariant,
  encodeModuleThemeInUnlockToken,
  getModuleThemeEventMetadata,
  getModuleThemeFromSearchParams,
  getModuleThemeFromUnlockToken,
  readModuleThemeState,
  resolveModuleThemeState,
  writeManualModuleThemeVariant,
} from "@/lib/modules/module-theme";
import { CORE_THEME, resolveThemeForModule } from "@/lib/modules/theme-registry";
import { aiTemperatureModule } from "@/content/modules/ai-temperature";

class MemoryStorage implements Pick<Storage, "getItem" | "setItem"> {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("Module 01 theme assignment", () => {
  it("resolves Module 01 to Riso without an active A/B branch", () => {
    expect(resolveThemeForModule(aiTemperatureModule).id).toBe("ai-temperature-riso");
    expect(resolveThemeForModule(aiTemperatureModule.slug).id).toBe("ai-temperature-riso");
    expect(resolveThemeForModule(aiTemperatureModule.moduleId).id).toBe("ai-temperature-riso");
    expect(resolveThemeForModule("unknown-module")).toEqual(CORE_THEME);
    expect(assignModuleThemeVariant()).toBe("riso");
  });

  it("ignores legacy storage and always returns the Riso module default", () => {
    const storage = new MemoryStorage();
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.9);

    try {
      storage.setItem(MODULE_THEME_VARIANT_STORAGE_KEY, "classic");
      storage.setItem(MODULE_THEME_SOURCE_STORAGE_KEY, "manual_override");

      const first = readModuleThemeState();
      const second = readModuleThemeState();

      expect(first).toEqual({
        variant: "riso",
        source: "module_default",
        hydrated: true,
        themeId: "ai-temperature-riso",
      });
      expect(second).toEqual(first);
      expect(storage.getItem(MODULE_THEME_VARIANT_STORAGE_KEY)).toBe("classic");
      expect(storage.getItem(MODULE_THEME_SOURCE_STORAGE_KEY)).toBe("manual_override");
      expect(randomSpy).not.toHaveBeenCalled();
    } finally {
      randomSpy.mockRestore();
    }
  });

  it("neutralizes manual override attempts and keeps event metadata safe", () => {
    const storage = new MemoryStorage();
    const manual = writeManualModuleThemeVariant();

    expect(manual).toEqual({
      variant: "riso",
      source: "module_default",
      hydrated: true,
      themeId: "ai-temperature-riso",
    });
    expect(readModuleThemeState()).toEqual(manual);
    expect(getModuleThemeEventMetadata(manual)).toEqual({
      themeVariant: "riso",
      themeSource: "module_default",
    });
    expect(storage.getItem(MODULE_THEME_VARIANT_STORAGE_KEY)).toBeNull();
  });

  it("parses safe query theme hints as Riso-only fulfillment carryover", () => {
    expect(
      getModuleThemeFromSearchParams(
        new URLSearchParams("themeVariant=riso&themeSource=manual_override"),
      ),
    ).toEqual({
      variant: "riso",
      source: "legacy_hint",
      hydrated: true,
      themeId: "ai-temperature-riso",
    });
    expect(
      getModuleThemeFromSearchParams(new URLSearchParams("themeVariant=classic&themeSource=query_hint")),
    ).toEqual({
      variant: "riso",
      source: "query_hint",
      hydrated: true,
      themeId: "ai-temperature-riso",
    });
    expect(getModuleThemeFromSearchParams(new URLSearchParams("themeVariant=bad"))).toBeNull();
  });

  it("can encode and recover compact legacy theme hints as Riso-only", () => {
    expect(encodeModuleThemeInUnlockToken("token", "riso")).toBe("token.r");
    expect(encodeModuleThemeInUnlockToken("token", "classic")).toBe("token.r");
    expect(getModuleThemeFromUnlockToken("token.r")).toEqual({
      variant: "riso",
      source: "query_hint",
      hydrated: true,
      themeId: "ai-temperature-riso",
    });
    expect(getModuleThemeFromUnlockToken("token.c")).toEqual({
      variant: "riso",
      source: "legacy_hint",
      hydrated: true,
      themeId: "ai-temperature-riso",
    });
    expect(getModuleThemeFromUnlockToken("legacy-token")).toBeNull();
  });

  it("resolves explicit module theme state and unknown modules safely", () => {
    expect(resolveModuleThemeState(aiTemperatureModule)).toEqual({
      variant: "riso",
      source: "module_default",
      hydrated: true,
      themeId: "ai-temperature-riso",
    });
    expect(resolveModuleThemeState("unknown-module")).toEqual({
      variant: "riso",
      source: "unknown",
      hydrated: true,
      themeId: "ai-temperature-riso",
    });
  });
});
