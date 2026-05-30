function safeCompareStrings(providedValue: string, expectedValue: string): boolean {
  if (providedValue.length !== expectedValue.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < expectedValue.length; index += 1) {
    mismatch |= providedValue.charCodeAt(index) ^ expectedValue.charCodeAt(index);
  }

  return mismatch === 0;
}

export function getInternalJobSecret(env: NodeJS.ProcessEnv = process.env): string | null {
  const secret = env.INTERNAL_JOB_SECRET?.trim() || env.CRON_SECRET?.trim() || null;

  return secret || null;
}

export function isInternalJobAuthorized(
  authorizationHeader: string | null,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const secret = getInternalJobSecret(env);

  if (!secret || !authorizationHeader) {
    return false;
  }

  const token = authorizationHeader.replace(/^Bearer\s+/i, "").trim();
  return safeCompareStrings(token, secret);
}
