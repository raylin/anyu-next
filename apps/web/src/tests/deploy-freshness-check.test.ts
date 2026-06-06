import { describe, expect, it } from "vitest";

import {
  checkDeployFreshness,
  classifyHealth,
  commitMatches,
  hasUsableCommit,
  parseArgs,
} from "../../scripts/deploy-freshness-check.mjs";

function response(input: {
  status?: number;
  environment?: string;
  gitBranch?: string;
  gitCommit?: string;
}) {
  return {
    ok: (input.status ?? 200) >= 200 && (input.status ?? 200) < 300,
    httpStatus: input.status ?? 200,
    json: {
      environment: input.environment ?? "preview",
      gitBranch: input.gitBranch ?? "staging",
      gitCommit: input.gitCommit ?? "abcdef123456",
    },
  };
}

describe("deploy freshness check", () => {
  it("accepts pnpm forwarded argument separator", () => {
    expect(
      parseArgs(["--", "--env", "staging", "--expected-commit", "abcdef1"]),
    ).toMatchObject({
      env: "staging",
      expectedCommit: "abcdef1",
    });
  });

  it("matches full and short commit identifiers without exposing values", () => {
    expect(hasUsableCommit("abcdef1")).toBe(true);
    expect(hasUsableCommit("unknown")).toBe(false);
    expect(commitMatches("abcdef123456", "abcdef1")).toBe(true);
    expect(commitMatches("abcdef1", "abcdef123456")).toBe(true);
    expect(commitMatches("1111111", "2222222")).toBe(false);
  });

  it("classifies pass, not-ready, target mismatch, and unknown metadata", () => {
    const target = {
      expectedEnvironment: "preview",
      expectedBranch: "staging",
      notReadyCategory: "staging_freshness_not_ready",
    };

    expect(
      classifyHealth({
        target,
        expectedCommit: "abcdef1",
        health: response({ gitCommit: "abcdef123456" }),
      }),
    ).toMatchObject({
      ready: true,
      category: "pass",
      deployedCommit: "abcdef123456",
    });
    expect(
      classifyHealth({
        target,
        expectedCommit: "2222222",
        health: response({ gitCommit: "abcdef123456" }),
      }),
    ).toMatchObject({
      ready: false,
      category: "staging_freshness_not_ready",
    });
    expect(
      classifyHealth({
        target,
        expectedCommit: "abcdef1",
        health: response({ environment: "production", gitCommit: "abcdef123456" }),
      }),
    ).toMatchObject({
      ready: false,
      category: "deploy_target_mismatch",
    });
    expect(
      classifyHealth({
        target,
        expectedCommit: "abcdef1",
        health: response({ gitCommit: "unknown" }),
      }),
    ).toMatchObject({
      ready: false,
      category: "commit_metadata_unknown",
    });
  });

  it("passes when health serves the expected commit", async () => {
    const result = await checkDeployFreshness({
      env: "staging",
      expectedCommit: "abcdef1",
      timeoutMs: 0,
      intervalMs: 1,
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            environment: "preview",
            gitBranch: "staging",
            gitCommit: "abcdef123456",
          }),
          { status: 200 },
        ),
    });

    expect(result).toMatchObject({
      status: "pass",
      freshnessStatus: "pass",
      targetDeployCommit: "abcdef1",
      deployedCommitAtGateStart: "abcdef123456",
      deployedCommitAtGateEnd: "abcdef123456",
      mixedDeploymentDetected: false,
      valuesPrinted: false,
      hashesPrinted: false,
    });
  });

  it("blocks on timeout when the expected commit is not live", async () => {
    const result = await checkDeployFreshness({
      env: "staging",
      expectedCommit: "2222222",
      timeoutMs: 0,
      intervalMs: 1,
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            environment: "preview",
            gitBranch: "staging",
            gitCommit: "abcdef123456",
          }),
          { status: 200 },
        ),
    });

    expect(result).toMatchObject({
      status: "blocked",
      freshnessStatus: "blocked",
      category: "staging_freshness_timeout",
      deployedCommitAtGateStart: "abcdef123456",
      deployedCommitAtGateEnd: "abcdef123456",
      lastObservedCategory: "staging_freshness_not_ready",
    });
  });

  it("blocks distinctly when commit metadata is unknown", async () => {
    const result = await checkDeployFreshness({
      env: "staging",
      expectedCommit: "abcdef1",
      timeoutMs: 0,
      intervalMs: 1,
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            environment: "preview",
            gitBranch: "staging",
            gitCommit: "unknown",
          }),
          { status: 200 },
        ),
    });

    expect(result).toMatchObject({
      status: "blocked",
      freshnessStatus: "blocked",
      category: "commit_metadata_unknown",
      deployedCommitAtGateEnd: "unknown",
    });
  });
});
