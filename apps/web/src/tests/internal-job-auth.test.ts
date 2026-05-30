import { describe, expect, it } from "vitest";
import { getInternalJobSecret, isInternalJobAuthorized } from "@/lib/runtime/internal-job-auth";

describe("internal job authorization", () => {
  it("prefers a dedicated internal job secret and falls back to cron secret", () => {
    expect(
      getInternalJobSecret({
        INTERNAL_JOB_SECRET: "internal-secret",
        CRON_SECRET: "cron-secret",
      } as NodeJS.ProcessEnv),
    ).toBe("internal-secret");
    expect(getInternalJobSecret({ CRON_SECRET: "cron-secret" } as NodeJS.ProcessEnv)).toBe(
      "cron-secret",
    );
  });

  it("requires an exact bearer token match", () => {
    const env = { INTERNAL_JOB_SECRET: "configured-secret" } as NodeJS.ProcessEnv;

    expect(isInternalJobAuthorized("Bearer configured-secret", env)).toBe(true);
    expect(isInternalJobAuthorized("Bearer wrong-secret", env)).toBe(false);
    expect(isInternalJobAuthorized(null, env)).toBe(false);
  });
});
