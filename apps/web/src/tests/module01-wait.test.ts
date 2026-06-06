import { describe, expect, it } from "vitest";

import {
  normalizePositiveInteger,
  waitForCondition,
} from "../../scripts/lib/module01-wait.mjs";

describe("Module 01 shared wait helper", () => {
  it("normalizes positive integer inputs", () => {
    expect(normalizePositiveInteger(3.8, 1)).toBe(3);
    expect(normalizePositiveInteger(0, 5)).toBe(5);
    expect(normalizePositiveInteger(Number.NaN, 5)).toBe(5);
  });

  it("returns pass when a polled condition becomes ready", async () => {
    const attempts: number[] = [];
    const result = await waitForCondition({
      maxAttempts: 3,
      intervalMs: 1,
      poll: async (attempt) => {
        attempts.push(attempt);
        return { status: attempt === 2 ? "completed" : "processing" };
      },
      isReady: (pollResult) => pollResult.status === "completed",
      isWaiting: (pollResult) => pollResult.status === "processing",
    });

    expect(result).toMatchObject({
      status: "pass",
      attempts: 2,
      lastResult: {
        status: "completed",
      },
    });
    expect(attempts).toEqual([1, 2]);
  });

  it("returns blocked for terminal non-waiting states and timeout for long waits", async () => {
    const blocked = await waitForCondition({
      maxAttempts: 3,
      intervalMs: 1,
      poll: async () => ({ status: "failed" }),
      isReady: (pollResult) => pollResult.status === "completed",
      isWaiting: (pollResult) => pollResult.status === "processing",
    });
    const timeout = await waitForCondition({
      maxAttempts: 2,
      intervalMs: 1,
      poll: async () => ({ status: "processing" }),
      isReady: (pollResult) => pollResult.status === "completed",
      isWaiting: (pollResult) => pollResult.status === "processing",
    });

    expect(blocked.status).toBe("blocked");
    expect(blocked.attempts).toBe(1);
    expect(timeout.status).toBe("timeout");
    expect(timeout.attempts).toBe(2);
  });
});
