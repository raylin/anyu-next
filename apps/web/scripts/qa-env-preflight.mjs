#!/usr/bin/env node

import fs from "node:fs";
import { loadLocalEnv } from "./lib/load-local-env.mjs";

const MODE_ALIASES = new Map([
  ["all", "all"],
  ["fake_paid", "fake_paid"],
  ["fake-paid", "fake_paid"],
  ["fake_paid_queue", "fake_paid_queue"],
  ["fake-paid-queue", "fake_paid_queue"],
  ["sandbox_checkout", "sandbox_checkout"],
  ["sandbox-checkout", "sandbox_checkout"],
  ["sandbox_verify", "sandbox_verify"],
  ["sandbox-verify", "sandbox_verify"],
  ["result_checkout_no_card", "result_checkout_no_card"],
  ["result-checkout-no-card", "result_checkout_no_card"],
  ["no_card_result_checkout", "result_checkout_no_card"],
  ["no-card-result-checkout", "result_checkout_no_card"],
  ["recovery_link_smoke", "recovery_link_smoke"],
  ["recovery-link-smoke", "recovery_link_smoke"],
  ["recovery_link_operator_smoke", "recovery_link_smoke"],
  ["recovery-link-operator-smoke", "recovery_link_smoke"],
  ["line_recovery_smoke", "line_recovery_smoke"],
  ["line-recovery-smoke", "line_recovery_smoke"],
  ["line_recovery_message_smoke", "line_recovery_smoke"],
  ["line-recovery-message-smoke", "line_recovery_smoke"],
  ["support_ops_lookup", "support_ops_lookup"],
  ["support-ops-lookup", "support_ops_lookup"],
  ["ops_paid_result_lookup", "support_ops_lookup"],
  ["ops-paid-result-lookup", "support_ops_lookup"],
  ["manual_fallback", "manual_fallback"],
  ["manual-fallback", "manual_fallback"],
  ["vercel_env_alignment", "vercel_env_alignment"],
  ["vercel-env-alignment", "vercel_env_alignment"],
]);

const localEnv = loadLocalEnv();
const ENV_LOCAL_PATH = localEnv.envFilePath;

const MODE_DEFINITIONS = {
  fake_paid: {
    command: "corepack pnpm run qa:fake-paid",
    requiredShell: ["OPERATOR_TEST_SECRET", "INTERNAL_JOB_SECRET"],
    optionalShell: ["QA_FAKE_PAID_INPUT_SUFFIX", "QA_FAKE_PAID_PROCESSOR_MODE"],
    previewStaging: [
      "ENABLE_OPERATOR_FAKE_PAID_SUCCESS",
      "OPERATOR_TEST_SECRET",
      "INTERNAL_JOB_SECRET",
      "ENABLE_PAID_GENERATION_PROCESSOR",
      "PAID_ACCESS_TOKEN_HASH_SECRET",
      "PAYMENT_CHECKOUT_SESSION_SECRET",
    ],
    mustMatchPreviewStaging: ["OPERATOR_TEST_SECRET", "INTERNAL_JOB_SECRET"],
    neverProduction: ["ENABLE_OPERATOR_FAKE_PAID_SUCCESS", "OPERATOR_TEST_SECRET"],
    missingBehavior: "blocks before authorized fake-paid or stops before manual processor fallback",
  },
  fake_paid_queue: {
    command: "QA_FAKE_PAID_PROCESSOR_MODE=queue corepack pnpm run qa:fake-paid",
    requiredShell: ["OPERATOR_TEST_SECRET"],
    optionalShell: ["QA_FAKE_PAID_INPUT_SUFFIX", "QA_FAKE_PAID_PROCESSOR_MODE"],
    previewStaging: [
      "ENABLE_OPERATOR_FAKE_PAID_SUCCESS",
      "OPERATOR_TEST_SECRET",
      "ENABLE_PAID_JOB_QUEUE_TRIGGER",
      "PAID_JOB_QUEUE_PROVIDER",
      "PAID_JOB_QUEUE_TOPIC",
      "ENABLE_PAID_GENERATION_PROCESSOR",
      "PAID_ACCESS_TOKEN_HASH_SECRET",
      "PAYMENT_CHECKOUT_SESSION_SECRET",
    ],
    mustMatchPreviewStaging: ["OPERATOR_TEST_SECRET"],
    neverProduction: [
      "ENABLE_OPERATOR_FAKE_PAID_SUCCESS",
      "OPERATOR_TEST_SECRET",
      "ENABLE_PAID_JOB_QUEUE_TRIGGER",
    ],
    missingBehavior: "blocks before authorized fake-paid or completes without queue enqueue evidence",
  },
  sandbox_checkout: {
    command: "corepack pnpm run qa:newebpay:sandbox -- create-checkout",
    requiredShell: ["OPERATOR_TEST_SECRET"],
    optionalShell: ["QA_NEWEBPAY_BASE_URL", "QA_NEWEBPAY_INPUT_SUFFIX", "QA_NEWEBPAY_STATE_FILE"],
    previewStaging: [
      "OPERATOR_TEST_SECRET",
      "ENABLE_NEWEBPAY_CHECKOUT",
      "NEWEBPAY_MERCHANT_ID",
      "NEWEBPAY_HASH_KEY",
      "NEWEBPAY_HASH_IV",
      "NEWEBPAY_CHECKOUT_URL",
      "NEWEBPAY_NOTIFY_URL",
      "NEWEBPAY_ENVIRONMENT",
      "NEXT_PUBLIC_APP_URL",
      "PAYMENT_CHECKOUT_SESSION_SECRET",
      "PAID_ACCESS_TOKEN_HASH_SECRET",
      "ENABLE_PAID_JOB_QUEUE_TRIGGER",
      "PAID_JOB_QUEUE_PROVIDER",
      "PAID_JOB_QUEUE_TOPIC",
    ],
    mustMatchPreviewStaging: ["OPERATOR_TEST_SECRET"],
    neverProduction: ["OPERATOR_TEST_SECRET"],
    missingBehavior: "blocks before checkout creation and does not write a provider form",
  },
  sandbox_verify: {
    command: "corepack pnpm run qa:newebpay:sandbox -- verify-after-payment",
    requiredShell: [],
    optionalShell: ["QA_NEWEBPAY_BASE_URL", "QA_NEWEBPAY_STATE_FILE"],
    previewStaging: [
      "NEWEBPAY_MERCHANT_ID",
      "NEWEBPAY_HASH_KEY",
      "NEWEBPAY_HASH_IV",
      "NEWEBPAY_CHECKOUT_URL",
      "NEWEBPAY_NOTIFY_URL",
      "NEWEBPAY_ENVIRONMENT",
      "NEXT_PUBLIC_APP_URL",
      "ENABLE_PAID_JOB_QUEUE_TRIGGER",
      "PAID_JOB_QUEUE_PROVIDER",
      "PAID_JOB_QUEUE_TOPIC",
    ],
    mustMatchPreviewStaging: [],
    neverProduction: [],
    missingBehavior: "requires the prior state file under /private/tmp; env absence does not print secrets",
  },
  result_checkout_no_card: {
    command: "corepack pnpm run qa:result-checkout:no-card",
    requiredShell: ["OPERATOR_TEST_SECRET"],
    optionalShell: [
      "INTERNAL_JOB_SECRET",
      "QA_NO_CARD_BASE_URL",
      "QA_NO_CARD_DISABLE_LOCAL_ENV",
      "QA_NO_CARD_INPUT_SUFFIX",
      "QA_NO_CARD_PROCESSOR_MODE",
    ],
    previewStaging: [
      "ENABLE_OPERATOR_FAKE_PAID_SUCCESS",
      "OPERATOR_TEST_SECRET",
      "ENABLE_NEWEBPAY_CHECKOUT",
      "PAYMENT_CHECKOUT_SESSION_SECRET",
      "PAID_ACCESS_TOKEN_HASH_SECRET",
      "ENABLE_PAID_JOB_QUEUE_TRIGGER",
      "PAID_JOB_QUEUE_PROVIDER",
      "PAID_JOB_QUEUE_TOPIC",
      "ENABLE_PAID_GENERATION_PROCESSOR",
    ],
    mustMatchPreviewStaging: ["OPERATOR_TEST_SECRET"],
    neverProduction: [
      "ENABLE_OPERATOR_FAKE_PAID_SUCCESS",
      "OPERATOR_TEST_SECRET",
      "ENABLE_NEWEBPAY_CHECKOUT",
      "ENABLE_PAID_JOB_QUEUE_TRIGGER",
    ],
    missingBehavior: "blocks before result-page checkout no-card QA and never falls back to browser-visible fake payment",
  },
  recovery_link_smoke: {
    command: "corepack pnpm run qa:recovery-link:smoke",
    requiredShell: ["OPERATOR_TEST_SECRET"],
    optionalShell: [
      "DATABASE_URL",
      "PAYMENT_RECOVERY_LINK_TOKEN_SECRET",
      "INTERNAL_JOB_SECRET",
      "QA_RECOVERY_LINK_BASE_URL",
      "QA_RECOVERY_LINK_DISABLE_LOCAL_ENV",
      "QA_RECOVERY_LINK_INPUT_SUFFIX",
      "QA_RECOVERY_LINK_MODE",
      "QA_RECOVERY_LINK_PROCESSOR_MODE",
    ],
    previewStaging: [
      "ENABLE_OPERATOR_FAKE_PAID_SUCCESS",
      "ENABLE_OPERATOR_RECOVERY_LINK_SMOKE",
      "OPERATOR_TEST_SECRET",
      "ENABLE_NEWEBPAY_CHECKOUT",
      "PAYMENT_CHECKOUT_SESSION_SECRET",
      "PAID_ACCESS_TOKEN_HASH_SECRET",
      "ENABLE_PAID_JOB_QUEUE_TRIGGER",
      "PAID_JOB_QUEUE_PROVIDER",
      "PAID_JOB_QUEUE_TOPIC",
      "ENABLE_PAID_GENERATION_PROCESSOR",
      "PAYMENT_RECOVERY_LINK_TOKEN_SECRET",
    ],
    mustMatchPreviewStaging: ["OPERATOR_TEST_SECRET"],
    neverProduction: [
      "ENABLE_OPERATOR_FAKE_PAID_SUCCESS",
      "ENABLE_OPERATOR_RECOVERY_LINK_SMOKE",
      "OPERATOR_TEST_SECRET",
      "ENABLE_NEWEBPAY_CHECKOUT",
      "ENABLE_PAID_JOB_QUEUE_TRIGGER",
      "PAYMENT_RECOVERY_LINK_TOKEN_SECRET",
    ],
    missingBehavior: "runtime mode only needs OPERATOR_TEST_SECRET locally; local-db mode additionally needs DATABASE_URL and PAYMENT_RECOVERY_LINK_TOKEN_SECRET",
  },
  line_recovery_smoke: {
    command: "corepack pnpm run qa:line-recovery:smoke",
    requiredShell: ["OPERATOR_TEST_SECRET"],
    optionalShell: ["QA_LINE_RECOVERY_BASE_URL", "QA_LINE_RECOVERY_DISABLE_LOCAL_ENV"],
    previewStaging: [
      "ENABLE_OPERATOR_LINE_RECOVERY_SMOKE",
      "OPERATOR_TEST_SECRET",
      "LINE_RECOVERY_MESSAGE_PROVIDER",
      "LINE_MESSAGING_CHANNEL_ACCESS_TOKEN",
      "LINE_CHANNEL_ACCESS_TOKEN",
      "LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY",
      "PAYMENT_RECOVERY_CONTACT_HASH_SECRET",
      "PAYMENT_RECOVERY_LINK_TOKEN_SECRET",
      "NEXT_PUBLIC_APP_URL",
      "ENABLE_OPERATOR_FAKE_PAID_SUCCESS",
      "ENABLE_PAID_GENERATION_PROCESSOR",
    ],
    mustMatchPreviewStaging: ["OPERATOR_TEST_SECRET"],
    neverProduction: [
      "ENABLE_OPERATOR_LINE_RECOVERY_SMOKE",
      "OPERATOR_TEST_SECRET",
      "LINE_RECOVERY_MESSAGE_PROVIDER",
      "LINE_MESSAGING_CHANNEL_ACCESS_TOKEN",
      "LINE_CHANNEL_ACCESS_TOKEN",
      "LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY",
      "PAYMENT_RECOVERY_LINK_TOKEN_SECRET",
      "ENABLE_OPERATOR_FAKE_PAID_SUCCESS",
    ],
    missingBehavior: "blocks real LINE recovery message smoke or safely returns provider/config unavailable without printing LINE recipient data",
  },
  support_ops_lookup: {
    command: "corepack pnpm run ops:paid-result:lookup -- --result-id <id>",
    requiredShell: ["SUPPORT_OPS_DATABASE_URL"],
    optionalShell: [
      "PAYMENT_RECOVERY_CONTACT_HASH_SECRET",
      "SUPPORT_LOOKUP_TARGET",
      "SUPPORT_LOOKUP_ALLOW_PRODUCTION_READONLY",
      "SUPPORT_LOOKUP_DISABLE_LOCAL_ENV",
      "SUPPORT_OPS_ALLOW_DATABASE_URL_FALLBACK",
    ],
    previewStaging: [
      "DATABASE_URL",
      "PAYMENT_RECOVERY_CONTACT_HASH_SECRET",
    ],
    mustMatchPreviewStaging: ["SUPPORT_OPS_DATABASE_URL"],
    neverProduction: [
      "SUPPORT_OPS_DATABASE_URL",
      "SUPPORT_OPS_ALLOW_DATABASE_URL_FALLBACK",
      "PAYMENT_RECOVERY_CONTACT_HASH_SECRET",
    ],
    missingBehavior: "blocks local support lookup before any DB query; DATABASE_URL fallback requires explicit SUPPORT_OPS_ALLOW_DATABASE_URL_FALLBACK=1 or --allow-database-url-fallback",
  },
  manual_fallback: {
    command: "manual processor path used by qa:fake-paid default mode",
    requiredShell: ["INTERNAL_JOB_SECRET"],
    optionalShell: [],
    previewStaging: ["INTERNAL_JOB_SECRET", "ENABLE_PAID_GENERATION_PROCESSOR"],
    mustMatchPreviewStaging: ["INTERNAL_JOB_SECRET"],
    neverProduction: [],
    missingBehavior: "fake-paid QA stops after delivery artifact/idempotency checks with partial result",
  },
  vercel_env_alignment: {
    command: "safe preflight only; no Vercel env mutation",
    requiredShell: ["VERCEL_TOKEN"],
    optionalShell: [],
    requiredEnvLocalKeys: [
      "OPERATOR_TEST_SECRET",
      "INTERNAL_JOB_SECRET",
      "NEWEBPAY_MERCHANT_ID",
      "NEWEBPAY_HASH_KEY",
      "NEWEBPAY_HASH_IV",
    ],
    previewStaging: [
      "OPERATOR_TEST_SECRET",
      "INTERNAL_JOB_SECRET",
      "NEWEBPAY_MERCHANT_ID",
      "NEWEBPAY_HASH_KEY",
      "NEWEBPAY_HASH_IV",
      "NEWEBPAY_CHECKOUT_URL",
      "NEWEBPAY_NOTIFY_URL",
      "NEWEBPAY_ENVIRONMENT",
      "NEXT_PUBLIC_APP_URL",
    ],
    mustMatchPreviewStaging: [
      "OPERATOR_TEST_SECRET",
      "INTERNAL_JOB_SECRET",
      "NEWEBPAY_MERCHANT_ID",
      "NEWEBPAY_HASH_KEY",
      "NEWEBPAY_HASH_IV",
    ],
    neverProduction: [
      "OPERATOR_TEST_SECRET",
      "NEWEBPAY_MERCHANT_ID",
      "NEWEBPAY_HASH_KEY",
      "NEWEBPAY_HASH_IV",
    ],
    missingBehavior: "blocks alignment workflow; use secure local source or owner UI, not chat",
  },
};

function parseMode() {
  const rawMode = process.argv.slice(2).find((argument) => argument !== "--") ?? "all";
  const normalized = MODE_ALIASES.get(rawMode.trim());

  if (!normalized) {
    const validModes = [...new Set(MODE_ALIASES.values())].sort();
    printJson({
      ok: false,
      mode: rawMode,
      error: "invalid_mode",
      validModes,
    });
    process.exit(2);
  }

  return normalized;
}

function parseEnvLocalKeys() {
  if (!fs.existsSync(ENV_LOCAL_PATH)) {
    return {
      envLocalPathPresent: false,
      keys: new Set(),
    };
  }

  const content = fs.readFileSync(ENV_LOCAL_PATH, "utf8");
  const keys = new Set();

  for (const line of content.split(/\r?\n/u)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/u);

    if (match) {
      keys.add(match[1]);
    }
  }

  return {
    envLocalPathPresent: true,
    keys,
  };
}

function envPresence(name) {
  const value = process.env[name];

  return typeof value === "string" && value.trim().length > 0;
}

function summarizeMode(mode, definition, envLocal) {
  const requiredShell = definition.requiredShell ?? [];
  const optionalShell = definition.optionalShell ?? [];
  const requiredEnvLocalKeys = definition.requiredEnvLocalKeys ?? [];
  const missingShell = requiredShell.filter((name) => !envPresence(name));
  const missingEnvLocalKeys = requiredEnvLocalKeys.filter((name) => !envLocal.keys.has(name));
  const optionalShellPresent = optionalShell.filter(envPresence);
  const optionalShellMissing = optionalShell.filter((name) => !envPresence(name));

  return {
    mode,
    ok: missingShell.length === 0 && missingEnvLocalKeys.length === 0,
    command: definition.command,
    shell: {
      requiredPresent: requiredShell.filter(envPresence),
      requiredMissing: missingShell,
      optionalPresent: optionalShellPresent,
      optionalMissing: optionalShellMissing,
    },
    envLocal: {
      pathPresent: envLocal.envLocalPathPresent,
      requiredKeysPresent: requiredEnvLocalKeys.filter((name) => envLocal.keys.has(name)),
      requiredKeysMissing: missingEnvLocalKeys,
    },
    previewStaging: {
      expectedNames: definition.previewStaging ?? [],
      mustMatchLocalShellNames: definition.mustMatchPreviewStaging ?? [],
      note: "Preview(staging) branch-scoped values override general Preview values.",
    },
    production: {
      shouldNotContainNames: definition.neverProduction ?? [],
      note: "Do not put sandbox credentials or operator-only QA secrets in Production.",
    },
    missingBehavior: definition.missingBehavior,
  };
}

function printJson(value) {
  console.log(JSON.stringify(value, null, 2));
}

const mode = parseMode();
const envLocal = parseEnvLocalKeys();
const selectedModes =
  mode === "all"
    ? Object.keys(MODE_DEFINITIONS)
    : [mode];
const summaries = selectedModes.map((selectedMode) =>
  summarizeMode(selectedMode, MODE_DEFINITIONS[selectedMode], envLocal),
);
const ok = summaries.every((summary) => summary.ok);

printJson({
  ok,
  checkedAt: new Date().toISOString(),
  redaction: {
    valuesPrinted: false,
    lengthsPrinted: false,
    prefixesPrinted: false,
    suffixesPrinted: false,
    hashesPrinted: false,
  },
  cwd: process.cwd(),
  envLocal: {
    pathPresent: envLocal.envLocalPathPresent,
    valuesLoadedButNotPrinted: localEnv.loaded.length > 0,
    exportedEnvTakesPrecedence: true,
    keyNamesOnly: true,
  },
  modes: summaries,
});

if (!ok) {
  process.exitCode = 2;
}
