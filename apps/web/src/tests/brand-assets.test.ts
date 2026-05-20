import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("brand asset exports", () => {
  const projectRoot = process.cwd();
  const exportPaths = [
    "../../docs/design-system/brand/exports/line-profile-1024.png",
    "../../docs/design-system/brand/exports/line-profile-640.png",
    "../../docs/design-system/brand/exports/app-icon-512.png",
    "../../docs/design-system/brand/exports/app-icon-192.png",
  ];
  const publicPaths = [
    "public/favicon.svg",
    "public/icon-512.png",
    "public/icon-192.png",
    "public/apple-touch-icon.png",
    "public/manifest.webmanifest",
  ];

  it("keeps the exported brand assets present and non-empty", () => {
    for (const relativePath of exportPaths) {
      const fullPath = resolve(projectRoot, relativePath);
      expect(existsSync(fullPath)).toBe(true);
      expect(statSync(fullPath).size).toBeGreaterThan(0);
    }
  });

  it("keeps the public icon assets present and non-empty", () => {
    for (const relativePath of publicPaths) {
      const fullPath = resolve(projectRoot, relativePath);
      expect(existsSync(fullPath)).toBe(true);
      expect(statSync(fullPath).size).toBeGreaterThan(0);
    }
  });

  it("references the generated icons in the web manifest", () => {
    const manifest = readFileSync(resolve(projectRoot, "public/manifest.webmanifest"), "utf8");

    expect(manifest).toContain('"/icon-192.png"');
    expect(manifest).toContain('"/icon-512.png"');
    expect(manifest).toContain('"theme_color": "#1f1a12"');
  });
});
