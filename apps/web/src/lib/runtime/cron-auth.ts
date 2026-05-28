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

export function getCronSecret(env: NodeJS.ProcessEnv = process.env): string | null {
  const secret = env.CRON_SECRET?.trim() || null;

  return secret || null;
}

export function isCronAuthorized(
  authorizationHeader: string | null,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const secret = getCronSecret(env);

  if (!secret || !authorizationHeader) {
    return false;
  }

  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return false;
  }

  const token = match[1]?.trim() ?? "";
  return safeCompareStrings(token, secret);
}
