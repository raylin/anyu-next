#!/usr/bin/env node

import { fileURLToPath } from "node:url";
import path from "node:path";

const TARGETS = {
  staging: {
    baseUrl: "https://staging.anyu.tw",
    expectedEnvironment: "preview",
    expectedBranch: "staging",
    timeoutMs: 120_000,
    intervalMs: 5_000,
    notReadyCategory: "staging_freshness_not_ready",
    timeoutCategory: "staging_freshness_timeout",
  },
  production: {
    baseUrl: "https://anyu.tw",
    expectedEnvironment: "production",
    expectedBranch: "staging",
    timeoutMs: 120_000,
    intervalMs: 5_000,
    notReadyCategory: "production_freshness_not_ready",
    timeoutCategory: "production_freshness_timeout",
  },
};

function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    env: "",
    expectedCommit: "",
    timeoutMs: null,
    intervalMs: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--env") {
      options.env = next ?? "";
      index += 1;
    } else if (arg === "--expected-commit") {
      options.expectedCommit = next ?? "";
      index += 1;
    } else if (arg === "--timeout") {
      options.timeoutMs = Number(next);
      index += 1;
    } else if (arg === "--interval") {
      options.intervalMs = Number(next);
      index += 1;
    } else if (arg === "--json") {
      // JSON is the only output format; accept the flag for explicit callers.
    } else {
      throw new Error(`unknown_argument:${arg}`);
    }
  }

  return options;
}

function normalizeCommit(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function hasUsableCommit(value) {
  return /^[0-9a-f]{7,40}$/u.test(normalizeCommit(value));
}

function commitMatches(actual, expected) {
  const actualCommit = normalizeCommit(actual);
  const expectedCommit = normalizeCommit(expected);

  if (!hasUsableCommit(actualCommit) || !hasUsableCommit(expectedCommit)) {
    return false;
  }

  return actualCommit.startsWith(expectedCommit) || expectedCommit.startsWith(actualCommit);
}

async function sleep(ms) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchHealth(baseUrl, fetchImpl = fetch) {
  const response = await fetchImpl(`${baseUrl}/api/health`, {
    cache: "no-store",
    headers: {
      accept: "application/json",
    },
  });
  const text = await response.text();
  let json = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  return {
    httpStatus: response.status,
    ok: response.ok,
    json,
  };
}

function classifyHealth(input) {
  const {
    target,
    expectedCommit,
    health,
  } = input;
  const deployedCommit = normalizeCommit(health.json?.gitCommit ?? "");
  const environment = health.json?.environment ?? null;
  const branch = health.json?.gitBranch ?? null;

  if (!health.ok || health.httpStatus !== 200) {
    return {
      ready: false,
      category: "health_unreachable",
      deployedCommit,
      environment,
      branch,
    };
  }

  if (environment !== target.expectedEnvironment || branch !== target.expectedBranch) {
    return {
      ready: false,
      category: "deploy_target_mismatch",
      deployedCommit,
      environment,
      branch,
    };
  }

  if (!hasUsableCommit(deployedCommit)) {
    return {
      ready: false,
      category: "commit_metadata_unknown",
      deployedCommit,
      environment,
      branch,
    };
  }

  if (!commitMatches(deployedCommit, expectedCommit)) {
    return {
      ready: false,
      category: target.notReadyCategory,
      deployedCommit,
      environment,
      branch,
    };
  }

  return {
    ready: true,
    category: "pass",
    deployedCommit,
    environment,
    branch,
  };
}

async function checkDeployFreshness(input) {
  const env = input.env;
  const target = TARGETS[env];

  if (!target) {
    return {
      status: "blocked",
      freshnessStatus: "blocked",
      category: "invalid_env",
      env,
      targetDeployCommit: input.expectedCommit ?? null,
      deployedCommitAtGateStart: null,
      deployedCommitAtGateEnd: null,
      mixedDeploymentDetected: false,
    };
  }

  const expectedCommit = normalizeCommit(input.expectedCommit);

  if (!hasUsableCommit(expectedCommit)) {
    return {
      status: "blocked",
      freshnessStatus: "blocked",
      category: "expected_commit_missing_or_invalid",
      env,
      targetDeployCommit: expectedCommit || null,
      deployedCommitAtGateStart: null,
      deployedCommitAtGateEnd: null,
      mixedDeploymentDetected: false,
    };
  }

  const timeoutMs = Number.isFinite(input.timeoutMs) && input.timeoutMs >= 0
    ? input.timeoutMs
    : target.timeoutMs;
  const intervalMs = Number.isFinite(input.intervalMs) && input.intervalMs > 0
    ? input.intervalMs
    : target.intervalMs;
  const startedAtMs = Date.now();
  const attempts = [];
  let deployedCommitAtGateStart = null;
  let lastClassification = null;

  do {
    let classification;

    try {
      const health = await fetchHealth(target.baseUrl, input.fetchImpl ?? fetch);
      classification = classifyHealth({ target, expectedCommit, health });
    } catch {
      classification = {
        ready: false,
        category: "health_unreachable",
        deployedCommit: null,
        environment: null,
        branch: null,
      };
    }

    if (deployedCommitAtGateStart === null) {
      deployedCommitAtGateStart = classification.deployedCommit || null;
    }

    attempts.push({
      category: classification.category,
      deployedCommitPresent: Boolean(classification.deployedCommit),
      environment: classification.environment,
      branch: classification.branch,
    });
    lastClassification = classification;

    if (classification.ready) {
      return {
        status: "pass",
        freshnessStatus: "pass",
        category: "pass",
        env,
        targetDeployCommit: expectedCommit,
        deployedCommitAtGateStart,
        deployedCommitAtGateEnd: classification.deployedCommit,
        mixedDeploymentDetected:
          Boolean(deployedCommitAtGateStart) &&
          deployedCommitAtGateStart !== classification.deployedCommit,
        attempts: attempts.length,
        valuesPrinted: false,
        lengthsPrinted: false,
        prefixesPrinted: false,
        suffixesPrinted: false,
        hashesPrinted: false,
        checksumsPrinted: false,
      };
    }

    if (Date.now() - startedAtMs >= timeoutMs) {
      break;
    }

    await sleep(Math.min(intervalMs, Math.max(0, timeoutMs - (Date.now() - startedAtMs))));
  } while (Date.now() - startedAtMs <= timeoutMs);

  const category =
    lastClassification?.category === "commit_metadata_unknown"
      ? "commit_metadata_unknown"
      : target.timeoutCategory;

  return {
    status: "blocked",
    freshnessStatus: "blocked",
    category,
    env,
    targetDeployCommit: expectedCommit,
    deployedCommitAtGateStart,
    deployedCommitAtGateEnd: lastClassification?.deployedCommit || null,
    mixedDeploymentDetected:
      Boolean(deployedCommitAtGateStart && lastClassification?.deployedCommit) &&
      deployedCommitAtGateStart !== lastClassification.deployedCommit,
    attempts: attempts.length,
    lastObservedCategory: lastClassification?.category ?? "unknown",
    valuesPrinted: false,
    lengthsPrinted: false,
    prefixesPrinted: false,
    suffixesPrinted: false,
    hashesPrinted: false,
    checksumsPrinted: false,
  };
}

async function main() {
  let options;

  try {
    options = parseArgs();
  } catch (error) {
    console.error(JSON.stringify({
      step: "deploy_freshness_error",
      status: "blocked",
      category: error?.message ?? "invalid_args",
    }));
    process.exitCode = 2;
    return;
  }

  const result = await checkDeployFreshness(options);
  console.log(JSON.stringify({ step: "deploy_freshness_summary", ...result }));

  if (result.status !== "pass") {
    process.exitCode = 1;
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  main().catch((error) => {
    console.error(JSON.stringify({
      step: "deploy_freshness_error",
      status: "blocked",
      category: error?.message ?? "unknown",
    }));
    process.exitCode = 1;
  });
}

export {
  checkDeployFreshness,
  classifyHealth,
  commitMatches,
  hasUsableCommit,
  normalizeCommit,
  parseArgs,
};

