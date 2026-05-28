const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

function getBooleanEnvFlag(name: string, env: NodeJS.ProcessEnv = process.env): boolean {
  const value = env[name]?.trim().toLowerCase();

  return value ? TRUE_VALUES.has(value) : false;
}

export function isPaidGenerationJobsEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return getBooleanEnvFlag("ENABLE_PAID_GENERATION_JOBS", env);
}
