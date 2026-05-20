import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, renameSync, readdirSync, writeFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..", "..", "..");
const exportsDir = resolve(projectRoot, "docs/design-system/brand/exports");
const publicDir = resolve(projectRoot, "apps/web/public");
const canonicalSvgPath = resolve(projectRoot, "docs/design-system/brand/anyu-mark.svg");

const INK_DARK = "#1f1a12";
const ACCENT = "#b69664";
const canonicalSvg = readFileSync(canonicalSvgPath, "utf8");
const canonicalCircles = canonicalSvg.match(/<circle[\s\S]*<\/svg>/)?.[0].replace(/<\/svg>\s*$/u, "");

if (!canonicalCircles) {
  throw new Error(`Could not extract mark geometry from ${canonicalSvgPath}`);
}

const assets = [
  { name: "line-profile-1024.png", size: 1024, markScale: 0.5, outDir: exportsDir },
  { name: "line-profile-640.png", size: 640, markScale: 0.5, outDir: exportsDir },
  { name: "app-icon-512.png", size: 512, markScale: 0.48, outDir: exportsDir },
  { name: "app-icon-192.png", size: 192, markScale: 0.48, outDir: exportsDir },
  { name: "icon-512.png", size: 512, markScale: 0.48, outDir: publicDir },
  { name: "icon-192.png", size: 192, markScale: 0.48, outDir: publicDir },
  { name: "apple-touch-icon.png", size: 180, markScale: 0.48, outDir: publicDir },
];

function buildSvg(size, markScale) {
  const markSize = size * markScale;
  const strokeInset = (size - markSize) / 2;
  const scale = markSize / 100;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="暗語 ANYU">
  <title>暗語 ANYU</title>
  <rect x="0" y="0" width="${size}" height="${size}" fill="${INK_DARK}"/>
  <g transform="translate(${strokeInset} ${strokeInset}) scale(${scale})">
    ${canonicalCircles.replaceAll('fill="currentColor"', `fill="${ACCENT}"`)}
  </g>
</svg>`;
}

function convertSvgToPng(svgPath, pngPath, size) {
  const renderDir = mkdtempSync(join(tmpdir(), "anyu-brand-render-"));
  execFileSync("qlmanage", ["-t", "-s", String(size), "-o", renderDir, svgPath], {
    stdio: "pipe",
  });
  const thumbnailName = readdirSync(renderDir).find((entry) => entry.endsWith(".png"));
  if (!thumbnailName) {
    throw new Error(`Quick Look did not produce a PNG for ${svgPath}`);
  }
  renameSync(join(renderDir, thumbnailName), pngPath);
}

mkdirSync(exportsDir, { recursive: true });
mkdirSync(publicDir, { recursive: true });

const tempDir = mkdtempSync(join(tmpdir(), "anyu-brand-"));

for (const asset of assets) {
  mkdirSync(asset.outDir, { recursive: true });
  const tempSvgPath = join(tempDir, `${asset.name}.svg`);
  const outputPath = join(asset.outDir, asset.name);
  writeFileSync(tempSvgPath, buildSvg(asset.size, asset.markScale), "utf8");
  convertSvgToPng(tempSvgPath, outputPath, asset.size);
  const fileSize = statSync(outputPath).size;
  if (fileSize <= 0) {
    throw new Error(`Generated empty asset: ${outputPath}`);
  }
}
