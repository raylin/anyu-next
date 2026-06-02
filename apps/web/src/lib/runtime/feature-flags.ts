const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

function getBooleanEnvFlag(name: string, env: NodeJS.ProcessEnv = process.env): boolean {
  const value = env[name]?.trim().toLowerCase();

  return value ? TRUE_VALUES.has(value) : false;
}

export function isPaidGenerationJobsEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return getBooleanEnvFlag("ENABLE_PAID_GENERATION_JOBS", env);
}

export function isPaidGenerationProcessorEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return getBooleanEnvFlag("ENABLE_PAID_GENERATION_PROCESSOR", env);
}

export function isOperatorFakePaidSuccessEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return getBooleanEnvFlag("ENABLE_OPERATOR_FAKE_PAID_SUCCESS", env);
}

export function isOperatorRecoveryLinkSmokeEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return (
    env.VERCEL_ENV === "preview" &&
    env.VERCEL_GIT_COMMIT_REF === "staging" &&
    getBooleanEnvFlag("ENABLE_OPERATOR_RECOVERY_LINK_SMOKE", env)
  );
}

export function isOperatorEmailRecoverySmokeEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return (
    env.VERCEL_ENV === "preview" &&
    env.VERCEL_GIT_COMMIT_REF === "staging" &&
    getBooleanEnvFlag("ENABLE_OPERATOR_EMAIL_RECOVERY_SMOKE", env)
  );
}

export function isPaymentRuntimeEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return getBooleanEnvFlag("ENABLE_PAYMENT_RUNTIME", env);
}

export function isNewebPayCheckoutEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return getBooleanEnvFlag("ENABLE_NEWEBPAY_CHECKOUT", env);
}

export function isStagingOperatorCheckoutStartEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return (
    env.VERCEL_ENV === "preview" &&
    env.VERCEL_GIT_COMMIT_REF === "staging" &&
    isNewebPayCheckoutEnabled(env) &&
    Boolean(env.OPERATOR_TEST_SECRET?.trim())
  );
}

export function canStartNewebPayCheckoutFromResult(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return (
    isNewebPayCheckoutEnabled(env) &&
    (isPaymentRuntimeEnabled(env) || isStagingOperatorCheckoutStartEnabled(env))
  );
}

export function isPaidJobQueueTriggerEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return getBooleanEnvFlag("ENABLE_PAID_JOB_QUEUE_TRIGGER", env);
}
