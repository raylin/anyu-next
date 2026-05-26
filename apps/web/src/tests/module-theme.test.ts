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
  writeManualModuleThemeVariant,
} from "@/lib/modules/module-theme";

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
  it("assigns classic and riso with a stable 50/50 threshold", () => {
    expect(assignModuleThemeVariant(0.2)).toBe("classic");
    expect(assignModuleThemeVariant(0.8)).toBe("riso");
  });

  it("persists the first A/B assignment", () => {
    const storage = new MemoryStorage();
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.9);

    try {
      const first = readModuleThemeState(storage);
      const second = readModuleThemeState(storage);

      expect(first).toEqual({ variant: "riso", source: "ab_assigned", hydrated: true });
      expect(second).toEqual(first);
      expect(storage.getItem(MODULE_THEME_VARIANT_STORAGE_KEY)).toBe("riso");
      expect(storage.getItem(MODULE_THEME_SOURCE_STORAGE_KEY)).toBe("ab_assigned");
    } finally {
      randomSpy.mockRestore();
    }
  });

  it("lets manual override win and keeps event metadata safe", () => {
    const storage = new MemoryStorage();
    const manual = writeManualModuleThemeVariant(storage, "classic");

    expect(manual).toEqual({ variant: "classic", source: "manual_override", hydrated: true });
    expect(readModuleThemeState(storage)).toEqual(manual);
    expect(getModuleThemeEventMetadata(manual)).toEqual({
      themeVariant: "classic",
      themeSource: "manual_override",
    });
  });

  it("parses safe query theme hints for fulfillment carryover", () => {
    expect(
      getModuleThemeFromSearchParams(
        new URLSearchParams("themeVariant=riso&themeSource=manual_override"),
      ),
    ).toEqual({
      variant: "riso",
      source: "manual_override",
      hydrated: true,
    });
    expect(getModuleThemeFromSearchParams(new URLSearchParams("themeVariant=bad"))).toBeNull();
  });

  it("can encode and recover a compact theme hint from unlock tokens", () => {
    expect(encodeModuleThemeInUnlockToken("token", "riso")).toBe("token.r");
    expect(encodeModuleThemeInUnlockToken("token", "classic")).toBe("token.c");
    expect(getModuleThemeFromUnlockToken("token.r")).toEqual({
      variant: "riso",
      source: "query_hint",
      hydrated: true,
    });
    expect(getModuleThemeFromUnlockToken("legacy-token")).toBeNull();
  });
});
