export type RuntimeEnvironment = "production" | "preview" | "development" | "unknown";
export type DeploymentProvider = "vercel" | "unknown";
export type VersionSource = "env" | "unknown";

export const ROUTE_BUNDLE_VERSION = "payment-foundation-2026-05-29";

export type BuildMarker = {
  app: "anyu-web";
  environment: RuntimeEnvironment;
  gitCommit: string;
  gitBranch: string;
  buildTime: string;
  deploymentProvider: DeploymentProvider;
  versionSource: VersionSource;
  routeBundleVersion: typeof ROUTE_BUNDLE_VERSION;
};

type BuildMarkerEnv = Record<string, string | undefined>;

const UNKNOWN = "unknown";
const SAFE_GIT_SHA_PATTERN = /^[a-f0-9]{7,40}$/iu;
const SAFE_GIT_REF_PATTERN = /^[A-Za-z0-9._/-]{1,120}$/u;

function normalizeEnvironment(vercelEnv?: string, nodeEnv?: string): RuntimeEnvironment {
  const normalizedVercelEnv = vercelEnv?.trim();

  if (
    normalizedVercelEnv === "production" ||
    normalizedVercelEnv === "preview" ||
    normalizedVercelEnv === "development"
  ) {
    return normalizedVercelEnv;
  }

  return nodeEnv?.trim() === "development" ? "development" : "unknown";
}

function normalizeGitCommit(value?: string): string {
  const trimmedValue = value?.trim() ?? "";

  if (!SAFE_GIT_SHA_PATTERN.test(trimmedValue)) {
    return UNKNOWN;
  }

  return trimmedValue.slice(0, 12);
}

function normalizeGitBranch(value?: string): string {
  const trimmedValue = value?.trim() ?? "";

  if (!SAFE_GIT_REF_PATTERN.test(trimmedValue)) {
    return UNKNOWN;
  }

  return trimmedValue;
}

function normalizeBuildTime(value?: string): string {
  const trimmedValue = value?.trim() ?? "";

  if (!trimmedValue) {
    return UNKNOWN;
  }

  const parsedValue = new Date(trimmedValue);

  if (Number.isNaN(parsedValue.valueOf())) {
    return UNKNOWN;
  }

  return parsedValue.toISOString();
}

export function getBuildMarker(env: BuildMarkerEnv = process.env): BuildMarker {
  const environment = normalizeEnvironment(env.VERCEL_ENV, env.NODE_ENV);
  const gitCommit = normalizeGitCommit(env.VERCEL_GIT_COMMIT_SHA);
  const gitBranch = normalizeGitBranch(env.VERCEL_GIT_COMMIT_REF);
  const buildTime = normalizeBuildTime(env.ANYU_BUILD_TIME);
  const deploymentProvider: DeploymentProvider = env.VERCEL === "1" ? "vercel" : "unknown";
  const versionSource: VersionSource =
    gitCommit !== UNKNOWN ||
    gitBranch !== UNKNOWN ||
    buildTime !== UNKNOWN ||
    environment !== "unknown" ||
    deploymentProvider !== "unknown"
      ? "env"
      : "unknown";

  return {
    app: "anyu-web",
    environment,
    gitCommit,
    gitBranch,
    buildTime,
    deploymentProvider,
    versionSource,
    routeBundleVersion: ROUTE_BUNDLE_VERSION,
  };
}
