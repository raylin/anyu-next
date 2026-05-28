import { describe, expect, it } from "vitest";
import { isPaidGenerationJobsEnabled } from "@/lib/runtime/feature-flags";

describe("runtime feature flags", () => {
  it("keeps paid generation jobs disabled by default", () => {
    expect(isPaidGenerationJobsEnabled({} as NodeJS.ProcessEnv)).toBe(false);
  });

  it("enables paid generation jobs only for explicit truthy values", () => {
    expect(isPaidGenerationJobsEnabled({ ENABLE_PAID_GENERATION_JOBS: "true" } as NodeJS.ProcessEnv)).toBe(
      true,
    );
    expect(isPaidGenerationJobsEnabled({ ENABLE_PAID_GENERATION_JOBS: "1" } as NodeJS.ProcessEnv)).toBe(
      true,
    );
    expect(isPaidGenerationJobsEnabled({ ENABLE_PAID_GENERATION_JOBS: "false" } as NodeJS.ProcessEnv)).toBe(
      false,
    );
  });
});
