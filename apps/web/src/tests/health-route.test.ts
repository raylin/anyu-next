import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/health/route";
import { getBuildMarker } from "@/lib/runtime/build-marker";

const FORBIDDEN_MARKER_KEYS = [
  "DATABASE_URL",
  "ANTHROPIC_API_KEY",
  "LINE_CHANNEL_SECRET",
  "LINE_CHANNEL_ACCESS_TOKEN",
  "ANALYSIS_CACHE_HASH_SECRET",
  "RETENTION_CLEANUP_SECRET",
  "CRON_SECRET",
];

describe("health route", () => {
  it("returns service health and safe build metadata", async () => {
    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      ok: true,
      service: "anyu-next-web",
      app: "anyu-web",
      routeBundleVersion: "payment-foundation-2026-05-29",
    });
    expect(["production", "preview", "development", "unknown"]).toContain(payload.environment);
    expect(["vercel", "unknown"]).toContain(payload.deploymentProvider);
    expect(["env", "unknown"]).toContain(payload.versionSource);

    for (const forbiddenKey of FORBIDDEN_MARKER_KEYS) {
      expect(payload).not.toHaveProperty(forbiddenKey);
    }
  });

  it("normalizes Vercel build metadata from allowlisted env fields", () => {
    const marker = getBuildMarker({
      VERCEL: "1",
      VERCEL_ENV: "production",
      VERCEL_GIT_COMMIT_SHA: "4c2487a1234567890abcdef1234567890abcdef",
      VERCEL_GIT_COMMIT_REF: "staging",
      ANYU_BUILD_TIME: "2026-05-27T12:34:56.000Z",
    });

    expect(marker).toEqual({
      app: "anyu-web",
      environment: "production",
      gitCommit: "4c2487a12345",
      gitBranch: "staging",
      buildTime: "2026-05-27T12:34:56.000Z",
      deploymentProvider: "vercel",
      versionSource: "env",
      routeBundleVersion: "payment-foundation-2026-05-29",
    });
  });

  it("falls back safely when build env is missing", () => {
    const marker = getBuildMarker({});

    expect(marker).toEqual({
      app: "anyu-web",
      environment: "unknown",
      gitCommit: "unknown",
      gitBranch: "unknown",
      buildTime: "unknown",
      deploymentProvider: "unknown",
      versionSource: "unknown",
      routeBundleVersion: "payment-foundation-2026-05-29",
    });
  });

  it("does not expose invalid or secret-like env values through the marker", () => {
    const marker = getBuildMarker({
      VERCEL: "1",
      VERCEL_ENV: "production",
      VERCEL_GIT_COMMIT_SHA: "not-a-sha-with-secret-ish-value",
      VERCEL_GIT_COMMIT_REF: "main;DATABASE_URL=postgres://example",
      ANYU_BUILD_TIME: "not-a-date",
      DATABASE_URL: "postgres://should-not-appear",
      LINE_CHANNEL_SECRET: "should-not-appear",
    });

    expect(marker.gitCommit).toBe("unknown");
    expect(marker.gitBranch).toBe("unknown");
    expect(marker.buildTime).toBe("unknown");
    expect(JSON.stringify(marker)).not.toContain("should-not-appear");
    expect(JSON.stringify(marker)).not.toContain("DATABASE_URL");
  });
});
