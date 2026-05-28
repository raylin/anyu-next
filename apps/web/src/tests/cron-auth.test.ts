import { describe, expect, it } from "vitest";
import { getCronSecret, isCronAuthorized } from "@/lib/runtime/cron-auth";

describe("cron authorization", () => {
  it("uses CRON_SECRET only", () => {
    expect(
      getCronSecret({
        CRON_SECRET: "cron-secret",
        INTERNAL_JOB_SECRET: "internal-secret",
      } as NodeJS.ProcessEnv),
    ).toBe("cron-secret");
    expect(
      getCronSecret({
        INTERNAL_JOB_SECRET: "internal-secret",
      } as NodeJS.ProcessEnv),
    ).toBeNull();
  });

  it("requires an exact bearer token match", () => {
    const env = { CRON_SECRET: "configured-secret" } as NodeJS.ProcessEnv;

    expect(isCronAuthorized("Bearer configured-secret", env)).toBe(true);
    expect(isCronAuthorized("Bearer wrong-secret", env)).toBe(false);
    expect(isCronAuthorized("configured-secret", env)).toBe(false);
    expect(isCronAuthorized(null, env)).toBe(false);
  });
});
