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

export function isPaymentRuntimeEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return getBooleanEnvFlag("ENABLE_PAYMENT_RUNTIME", env);
}

export function isNewebPayCheckoutEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return getBooleanEnvFlag("ENABLE_NEWEBPAY_CHECKOUT", env);
}

export function isPaidJobQueueTriggerEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return getBooleanEnvFlag("ENABLE_PAID_JOB_QUEUE_TRIGGER", env);
}
