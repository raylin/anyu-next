import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

type VercelConfig = {
  crons?: Array<{
    path?: string;
    schedule?: string;
  }>;
};

describe("vercel cron config", () => {
  it("keeps paid generation cron on the approved route and cadence", () => {
    const config = JSON.parse(
      readFileSync(join(process.cwd(), "vercel.json"), "utf8"),
    ) as VercelConfig;

    expect(config.crons).toEqual(
      expect.arrayContaining([
        {
          path: "/api/cron/paid-generation",
          schedule: "*/5 * * * *",
        },
      ]),
    );
  });
});
