import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SCRIPT_PATH = path.join(APP_ROOT, "scripts/paid-generation-benchmark-qa.mjs");

describe("paid generation benchmark QA command", () => {
  it("emits sanitized bounded mock benchmark JSON", () => {
    const output = execFileSync(
      process.execPath,
      [SCRIPT_PATH, "--", "--mode", "mock", "--jobs", "3", "--concurrency", "2", "--json"],
      { cwd: APP_ROOT, encoding: "utf8" },
    );
    const summary = JSON.parse(output);

    expect(summary).toMatchObject({
      ok: true,
      command: "qa:paid-generation:benchmark",
      mode: "mock",
      baselineKind: "mock_synthetic_processor_contract",
      automaticDrainVerified: false,
      noRealPayment: true,
      noRealEmail: true,
      noRealLine: true,
      productionTouched: false,
      jobCount: 3,
      concurrency: 2,
      maxJobs: 5,
      failures: 0,
      stuckJobs: 0,
    });
    expect(summary.metrics.totalPaidReadyMs.p95).toBeGreaterThan(0);
    expect(output).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/iu);
    expect(output).not.toMatch(/\b(?:pal|prl|pa|pcs)_[A-Za-z0-9_-]{8,}\b/u);
    expect(output).not.toContain("TradeInfo");
    expect(output).not.toContain("TradeSha");
  });

  it("enforces max job safety cap", () => {
    expect(() =>
      execFileSync(process.execPath, [SCRIPT_PATH, "--mode", "mock", "--jobs", "6", "--json"], {
        cwd: APP_ROOT,
        encoding: "utf8",
        stdio: "pipe",
      }),
    ).toThrow();
  });
});
