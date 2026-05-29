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

type InternalJobSecretSource = "INTERNAL_JOB_SECRET" | "CRON_SECRET" | null;

export function getInternalJobSecret(env: NodeJS.ProcessEnv = process.env): string | null {
  const secret = env.INTERNAL_JOB_SECRET?.trim() || env.CRON_SECRET?.trim() || null;

  return secret || null;
}

export function getInternalJobSecretSource(
  env: NodeJS.ProcessEnv = process.env,
): InternalJobSecretSource {
  if (env.INTERNAL_JOB_SECRET?.trim()) {
    return "INTERNAL_JOB_SECRET";
  }

  if (env.CRON_SECRET?.trim()) {
    return "CRON_SECRET";
  }

  return null;
}

export type InternalJobAuthDiagnostic = {
  authHeaderPresent: boolean;
  authHeaderScheme: "bearer" | "missing" | "other";
  internalJobSecretConfigured: boolean;
  internalJobSecretConfiguredSource: InternalJobSecretSource;
  bearerTokenPresent: boolean;
  authMatched: boolean;
  rejectionReason:
    | "missing_auth_header"
    | "invalid_scheme"
    | "missing_secret_config"
    | "secret_mismatch"
    | null;
};

export function diagnoseInternalJobAuthorization(
  authorizationHeader: string | null,
  env: NodeJS.ProcessEnv = process.env,
): InternalJobAuthDiagnostic {
  const secret = getInternalJobSecret(env);
  const source = getInternalJobSecretSource(env);
  const authHeaderPresent = Boolean(authorizationHeader);
  const authHeaderScheme = !authorizationHeader
    ? "missing"
    : /^Bearer\s+/iu.test(authorizationHeader)
      ? "bearer"
      : "other";
  const bearerToken = authorizationHeader?.replace(/^Bearer\s+/iu, "").trim() ?? "";
  const bearerTokenPresent = Boolean(bearerToken);
  const authMatched = Boolean(secret && bearerTokenPresent && safeCompareStrings(bearerToken, secret));

  let rejectionReason: InternalJobAuthDiagnostic["rejectionReason"] = null;

  if (!secret) {
    rejectionReason = "missing_secret_config";
  } else if (!authHeaderPresent) {
    rejectionReason = "missing_auth_header";
  } else if (authHeaderScheme !== "bearer") {
    rejectionReason = "invalid_scheme";
  } else if (!authMatched) {
    rejectionReason = "secret_mismatch";
  }

  return {
    authHeaderPresent,
    authHeaderScheme,
    internalJobSecretConfigured: Boolean(secret),
    internalJobSecretConfiguredSource: source,
    bearerTokenPresent,
    authMatched,
    rejectionReason,
  };
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
