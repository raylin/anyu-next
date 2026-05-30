export type NewebPayConfig =
  | {
      ok: true;
      merchantId: string;
      hashKey: string;
      hashIv: string;
      checkoutUrl: string;
      returnUrlBase: string;
      notifyUrl: string;
      providerEnvironment: "production" | "staging" | "sandbox" | "unknown";
    }
  | {
      ok: false;
      error: "invalid_newebpay_config" | "missing_newebpay_config";
      missing: string[];
    };

function readEnv(name: string, env: NodeJS.ProcessEnv) {
  return env[name]?.trim() ?? "";
}

export function getNewebPayConfig(env: NodeJS.ProcessEnv = process.env): NewebPayConfig {
  const merchantId = readEnv("NEWEBPAY_MERCHANT_ID", env);
  const hashKey = readEnv("NEWEBPAY_HASH_KEY", env);
  const hashIv = readEnv("NEWEBPAY_HASH_IV", env);
  const checkoutUrl = readEnv("NEWEBPAY_CHECKOUT_URL", env);
  const appUrl = readEnv("NEXT_PUBLIC_APP_URL", env);
  const notifyUrl = readEnv("NEWEBPAY_NOTIFY_URL", env);
  const missing = [
    ["NEWEBPAY_MERCHANT_ID", merchantId],
    ["NEWEBPAY_HASH_KEY", hashKey],
    ["NEWEBPAY_HASH_IV", hashIv],
    ["NEWEBPAY_CHECKOUT_URL", checkoutUrl],
    ["NEXT_PUBLIC_APP_URL", appUrl],
    ["NEWEBPAY_NOTIFY_URL", notifyUrl],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    return { ok: false, error: "missing_newebpay_config", missing };
  }

  if (hashKey.length !== 32 || hashIv.length !== 16) {
    return {
      ok: false,
      error: "invalid_newebpay_config",
      missing: ["NEWEBPAY_HASH_KEY_OR_IV_LENGTH"],
    };
  }

  return {
    ok: true,
    merchantId,
    hashKey,
    hashIv,
    checkoutUrl,
    returnUrlBase: appUrl.replace(/\/+$/u, ""),
    notifyUrl,
    providerEnvironment:
      env.NEWEBPAY_ENVIRONMENT === "production" ||
      env.NEWEBPAY_ENVIRONMENT === "staging" ||
      env.NEWEBPAY_ENVIRONMENT === "sandbox"
        ? env.NEWEBPAY_ENVIRONMENT
        : "unknown",
  };
}
