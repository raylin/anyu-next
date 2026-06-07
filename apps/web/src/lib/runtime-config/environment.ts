export type RuntimeConfigEnvironment = "production" | "staging" | "local";

export function getRuntimeConfigEnvironment(env: NodeJS.ProcessEnv = process.env): RuntimeConfigEnvironment {
  if (env.RUNTIME_CONFIG_ENVIRONMENT === "production" || env.RUNTIME_CONFIG_ENVIRONMENT === "staging") {
    return env.RUNTIME_CONFIG_ENVIRONMENT;
  }

  if (env.VERCEL_ENV === "production") {
    return "production";
  }

  if (env.VERCEL_ENV === "preview" && env.VERCEL_GIT_COMMIT_REF === "staging") {
    return "staging";
  }

  if (env.NEXT_PUBLIC_APP_URL?.includes("anyu.tw") && !env.NEXT_PUBLIC_APP_URL.includes("staging")) {
    return "production";
  }

  if (env.NEXT_PUBLIC_APP_URL?.includes("staging.anyu.tw")) {
    return "staging";
  }

  return "local";
}
