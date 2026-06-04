#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { findWebAppDir, loadLocalEnv, parseLocalEnvContent } from "./lib/load-local-env.mjs";

const DEFAULT_PRODUCTION_BASE_URL = "https://anyu.tw";
const DEFAULT_VERCEL_SCOPE = "studioanyu-1488s-projects";

const REQUIRED_TABLES = [
  "analysis_results",
  "analysis_paid_results",
  "payment_intents",
  "entitlements",
  "generation_jobs",
  "payment_access_link_contacts",
  "paid_result_access_links",
  "payment_access_link_contact_secrets",
];

const REQUIRED_ACCESS_LINK_AUDIT_COLUMNS = [
  "provider_message_id",
  "last_send_attempt_at",
  "send_attempt_count",
  "last_failure_category",
  "last_provider_status",
];

const ENV_GROUPS = {
  paymentProvider: [
    "NEWEBPAY_MERCHANT_ID",
    "NEWEBPAY_HASH_KEY",
    "NEWEBPAY_HASH_IV",
    "NEWEBPAY_CHECKOUT_URL",
    "NEWEBPAY_NOTIFY_URL",
    "NEWEBPAY_ENVIRONMENT",
    "NEXT_PUBLIC_APP_URL",
  ],
  runtimeFlags: [
    "ENABLE_PAYMENT_RUNTIME",
    "ENABLE_NEWEBPAY_CHECKOUT",
    "ENABLE_PAID_JOB_QUEUE_TRIGGER",
    "ENABLE_PAID_GENERATION_PROCESSOR",
  ],
  checkoutSession: ["PAYMENT_CHECKOUT_SESSION_SECRET"],
  paidAccess: ["PAID_ACCESS_TOKEN_HASH_SECRET"],
  queue: ["PAID_JOB_QUEUE_PROVIDER", "PAID_JOB_QUEUE_TOPIC"],
  processor: ["ENABLE_PAID_GENERATION_PROCESSOR"],
  accessLink: [
    "PAYMENT_RECOVERY_LINK_TOKEN_SECRET",
    "PAYMENT_RECOVERY_CONTACT_HASH_SECRET",
    "PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY",
    "LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY",
  ],
  email: ["EMAIL_PROVIDER", "EMAIL_FROM", "RESEND_API_KEY"],
  line: [
    "LINE_RECOVERY_MESSAGE_PROVIDER",
    "NEXT_PUBLIC_LINE_LIFF_URL",
    "LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY",
  ],
  lineAnyOf: ["LINE_MESSAGING_CHANNEL_ACCESS_TOKEN", "LINE_CHANNEL_ACCESS_TOKEN"],
  database: ["DATABASE_URL"],
};

const CHECKOUT_DISABLED_ERRORS = new Set(["not_found", "payment_disabled"]);

class PreflightInputError extends Error {
  constructor(code, details = {}) {
    super(code);
    this.code = code;
    this.details = details;
  }
}

function parseArgs(argv, env = process.env) {
  const options = {
    mode: "dry-run",
    source: "local",
    baseUrl: env.PRODUCTION_PREFLIGHT_BASE_URL || DEFAULT_PRODUCTION_BASE_URL,
    envFile: env.PRODUCTION_PREFLIGHT_ENV_FILE || "",
    vercelScope: env.VERCEL_SCOPE || DEFAULT_VERCEL_SCOPE,
    skipNetwork: false,
    checkDb: false,
    allowDatabaseUrlFallback: env.PRODUCTION_PREFLIGHT_ALLOW_DATABASE_URL_FALLBACK === "1",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    switch (arg) {
      case "--":
        break;
      case "--mode":
        options.mode = requireValue(arg, next);
        index += 1;
        break;
      case "--source":
        options.source = requireValue(arg, next);
        index += 1;
        break;
      case "--base-url":
        options.baseUrl = requireValue(arg, next);
        index += 1;
        break;
      case "--env-file":
        options.envFile = requireValue(arg, next);
        index += 1;
        break;
      case "--vercel-scope":
        options.vercelScope = requireValue(arg, next);
        index += 1;
        break;
      case "--skip-network":
        options.skipNetwork = true;
        break;
      case "--check-db":
        options.checkDb = true;
        break;
      case "--allow-database-url-fallback":
        options.allowDatabaseUrlFallback = true;
        break;
      default:
        throw new PreflightInputError("unsupported_arg", { arg });
    }
  }

  if (!["dry-run", "smoke-ready"].includes(options.mode)) {
    throw new PreflightInputError("invalid_mode", {
      mode: options.mode,
      validModes: ["dry-run", "smoke-ready"],
    });
  }

  if (!["local", "vercel-production"].includes(options.source)) {
    throw new PreflightInputError("invalid_source", {
      source: options.source,
      validSources: ["local", "vercel-production"],
    });
  }

  return options;
}

function requireValue(arg, value) {
  if (!value || value.startsWith("--")) {
    throw new PreflightInputError("missing_arg_value", { arg });
  }

  return value.trim();
}

function readEnvFileKeys(envFile) {
  if (!envFile || !fs.existsSync(envFile)) {
    return {
      pathPresent: false,
      names: new Set(),
    };
  }

  return {
    pathPresent: true,
    names: new Set(parseLocalEnvContent(fs.readFileSync(envFile, "utf8")).map(([name]) => name)),
  };
}

function loadPreflightLocalEnv(options) {
  if (options.envFile) {
    const envFilePath = path.resolve(options.envFile);

    return {
      localEnv: loadLocalEnv({ envFilePath }),
      keySource: readEnvFileKeys(envFilePath),
    };
  }

  const webAppDir = findWebAppDir();
  const envLocalPath = path.join(webAppDir, ".env.local");
  const envPath = path.join(webAppDir, ".env");
  const envFilePath = fs.existsSync(envLocalPath) ? envLocalPath : envPath;

  return {
    localEnv: loadLocalEnv({ envFilePath }),
    keySource: readEnvFileKeys(envFilePath),
  };
}

function getLocalEnvPresence(options, env = process.env) {
  const { localEnv, keySource } = loadPreflightLocalEnv(options);
  const names = new Set([
    ...Object.keys(env).filter((name) => typeof env[name] === "string" && env[name]?.trim()),
    ...keySource.names,
  ]);

  return {
    source: "local",
    names,
    valuesAvailableForFlagChecks: true,
    localEnv: {
      pathPresent: localEnv.envFilePresent,
      valuesLoadedButNotPrinted: localEnv.loaded.length > 0,
      keyNamesOnly: true,
    },
  };
}

function parseVercelEnvNames(output) {
  const names = new Set();
  const knownNames = new Set(Object.values(ENV_GROUPS).flat());
  knownNames.add("DATABASE_URL");
  knownNames.add("INTERNAL_JOB_SECRET");
  knownNames.add("CRON_SECRET");
  knownNames.add("ENABLE_OPERATOR_FAKE_PAID_SUCCESS");
  knownNames.add("ENABLE_OPERATOR_RECOVERY_LINK_SMOKE");
  knownNames.add("ENABLE_OPERATOR_LINE_RECOVERY_SMOKE");
  knownNames.add("ENABLE_OPERATOR_EMAIL_RECOVERY_SMOKE");

  for (const rawLine of output.split(/\r?\n/u)) {
    const line = rawLine.trim();
    const [candidate] = line.split(/\s+/u);

    if (knownNames.has(candidate)) {
      names.add(candidate);
    }
  }

  return names;
}

function getVercelProductionEnvPresence(options) {
  const webAppDir = findWebAppDir();
  const repoRoot = path.resolve(webAppDir, "..", "..");
  const output = execFileSync(
    "vercel",
    ["env", "ls", "production", "--scope", options.vercelScope],
    {
      encoding: "utf8",
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  return {
    source: "vercel-production",
    names: parseVercelEnvNames(output),
    valuesAvailableForFlagChecks: false,
    localEnv: {
      pathPresent: false,
      valuesLoadedButNotPrinted: false,
      keyNamesOnly: true,
    },
  };
}

function missingNames(names, requiredNames) {
  return requiredNames.filter((name) => !names.has(name));
}

function envGroupStatus(names, requiredNames) {
  return {
    requiredNames,
    presentNames: requiredNames.filter((name) => names.has(name)),
    missingNames: missingNames(names, requiredNames),
  };
}

function envAnyOfStatus(names, allowedNames) {
  return {
    anyOfNames: allowedNames,
    presentNames: allowedNames.filter((name) => names.has(name)),
    missing: allowedNames.every((name) => !names.has(name)),
  };
}

function isTruthyFlag(name, env = process.env) {
  return ["1", "true", "yes", "on"].includes(env[name]?.trim().toLowerCase() ?? "");
}

function buildEnvChecklist(presence, options, env = process.env) {
  const groups = {
    paymentProvider: envGroupStatus(presence.names, ENV_GROUPS.paymentProvider),
    runtimeFlags: envGroupStatus(presence.names, ENV_GROUPS.runtimeFlags),
    checkoutSession: envGroupStatus(presence.names, ENV_GROUPS.checkoutSession),
    paidAccess: envGroupStatus(presence.names, ENV_GROUPS.paidAccess),
    queue: envGroupStatus(presence.names, ENV_GROUPS.queue),
    processor: envGroupStatus(presence.names, ENV_GROUPS.processor),
    accessLink: envGroupStatus(presence.names, ENV_GROUPS.accessLink),
    email: envGroupStatus(presence.names, ENV_GROUPS.email),
    line: {
      ...envGroupStatus(presence.names, ENV_GROUPS.line),
      channelAccessToken: envAnyOfStatus(presence.names, ENV_GROUPS.lineAnyOf),
    },
    database: envGroupStatus(presence.names, ENV_GROUPS.database),
  };
  const operatorNames = [
    "ENABLE_OPERATOR_FAKE_PAID_SUCCESS",
    "ENABLE_OPERATOR_RECOVERY_LINK_SMOKE",
    "ENABLE_OPERATOR_LINE_RECOVERY_SMOKE",
    "ENABLE_OPERATOR_EMAIL_RECOVERY_SMOKE",
  ];
  const presentOperatorNames = operatorNames.filter((name) => presence.names.has(name));
  const runtimeFlagValues =
    presence.valuesAvailableForFlagChecks
      ? {
          ENABLE_PAYMENT_RUNTIME: isTruthyFlag("ENABLE_PAYMENT_RUNTIME", env),
          ENABLE_NEWEBPAY_CHECKOUT: isTruthyFlag("ENABLE_NEWEBPAY_CHECKOUT", env),
          ENABLE_PAID_JOB_QUEUE_TRIGGER: isTruthyFlag("ENABLE_PAID_JOB_QUEUE_TRIGGER", env),
          ENABLE_PAID_GENERATION_PROCESSOR: isTruthyFlag("ENABLE_PAID_GENERATION_PROCESSOR", env),
        }
      : null;
  const runtimeFlagsUnexpected =
    options.mode === "dry-run" && runtimeFlagValues
      ? Object.entries(runtimeFlagValues)
          .filter(([, enabled]) => enabled)
          .map(([name]) => name)
      : [];

  return {
    groups,
    operatorRouteEnv: {
      presentNames: presentOperatorNames,
      expectedForProductionSmoke: "absent_or_false",
      valuesChecked: Boolean(runtimeFlagValues),
    },
    runtimeFlagValues,
    runtimeFlagsUnexpected,
  };
}

function getProductionPreflightDatabaseUrl(options, env = process.env) {
  const explicit = env.PRODUCTION_PREFLIGHT_DATABASE_URL?.trim();

  if (explicit) {
    return {
      databaseUrl: explicit,
      connectionSourceCategory: "production_preflight_database_url",
    };
  }

  if (options.allowDatabaseUrlFallback && env.DATABASE_URL?.trim()) {
    return {
      databaseUrl: env.DATABASE_URL.trim(),
      connectionSourceCategory: "database_url_explicit_fallback",
    };
  }

  return {
    databaseUrl: null,
    connectionSourceCategory: "missing",
  };
}

async function verifyDatabaseSchema(options, env = process.env) {
  if (!options.checkDb) {
    return {
      checked: false,
      ok: null,
      connectionSourceCategory: "not_requested",
      requiredTables: REQUIRED_TABLES,
      missingTables: [],
      requiredAuditColumns: REQUIRED_ACCESS_LINK_AUDIT_COLUMNS,
      missingAuditColumns: [],
    };
  }

  const resolved = getProductionPreflightDatabaseUrl(options, env);

  if (!resolved.databaseUrl) {
    return {
      checked: true,
      ok: false,
      connectionSourceCategory: resolved.connectionSourceCategory,
      requiredTables: REQUIRED_TABLES,
      missingTables: REQUIRED_TABLES,
      requiredAuditColumns: REQUIRED_ACCESS_LINK_AUDIT_COLUMNS,
      missingAuditColumns: REQUIRED_ACCESS_LINK_AUDIT_COLUMNS,
    };
  }

  const sql = neon(resolved.databaseUrl);
  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = ANY(${REQUIRED_TABLES})
  `;
  const columns = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'paid_result_access_links'
      AND column_name = ANY(${REQUIRED_ACCESS_LINK_AUDIT_COLUMNS})
  `;
  const presentTables = new Set(tables.map((row) => row.table_name));
  const presentAuditColumns = new Set(columns.map((row) => row.column_name));
  const missingTables = REQUIRED_TABLES.filter((name) => !presentTables.has(name));
  const missingAuditColumns = REQUIRED_ACCESS_LINK_AUDIT_COLUMNS.filter(
    (name) => !presentAuditColumns.has(name),
  );

  return {
    checked: true,
    ok: missingTables.length === 0 && missingAuditColumns.length === 0,
    connectionSourceCategory: resolved.connectionSourceCategory,
    requiredTables: REQUIRED_TABLES,
    missingTables,
    requiredAuditColumns: REQUIRED_ACCESS_LINK_AUDIT_COLUMNS,
    missingAuditColumns,
  };
}

async function fetchJson(input, init) {
  const response = await fetch(input, init);
  let json = null;

  try {
    json = await response.clone().json();
  } catch {
    json = null;
  }

  return {
    status: response.status,
    ok: response.ok,
    error: json && typeof json === "object" && "error" in json ? json.error : null,
  };
}

async function verifyProductionSafety(options) {
  if (options.skipNetwork) {
    return {
      checked: false,
      ok: null,
      baseUrl: options.baseUrl,
    };
  }

  const baseUrl = options.baseUrl.replace(/\/+$/u, "");
  const [health, home, refund, legal, checkout, fakePaid, notify, returnPage] =
    await Promise.all([
      fetchJson(`${baseUrl}/api/health`),
      fetchJson(`${baseUrl}/`),
      fetchJson(`${baseUrl}/refund`),
      fetchJson(`${baseUrl}/legal`),
      fetchJson(`${baseUrl}/api/modules/ambiguous-temperature/checkout/newebpay`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ resultId: "00000000-0000-4000-8000-000000000000" }),
      }),
      fetchJson(`${baseUrl}/api/operator/fake-paid-success`, { method: "POST" }),
      fetchJson(`${baseUrl}/api/payments/newebpay/notify`, { method: "GET" }),
      fetchJson(`${baseUrl}/payment/newebpay/return`),
    ]);
  const checkoutDisabled = CHECKOUT_DISABLED_ERRORS.has(String(checkout.error));
  const fakePaidClosed = fakePaid.status === 404 || fakePaid.status === 403;
  const publicPagesLive = home.status === 200 && refund.status === 200 && legal.status === 200;

  return {
    checked: true,
    ok: publicPagesLive && checkoutDisabled && fakePaidClosed,
    baseUrl,
    health: {
      status: health.status,
      ok: health.ok,
      environment:
        health.ok && health.error === null ? "production_health_reachable" : "unknown",
    },
    publicPages: {
      home: home.status,
      refund: refund.status,
      legal: legal.status,
      ok: publicPagesLive,
    },
    disabledRoutes: {
      checkout: {
        status: checkout.status,
        error: checkout.error,
        failClosed: checkoutDisabled,
      },
      fakePaid: {
        status: fakePaid.status,
        failClosed: fakePaidClosed,
      },
    },
    routeReachability: {
      notifyUrlGetStatus: notify.status,
      returnUrlStatus: returnPage.status,
    },
  };
}

function classifyReadiness(input) {
  const { envChecklist, dbSchema, productionSafety } = input;
  const groups = envChecklist.groups;

  if (groups.paymentProvider.missingNames.length > 0) {
    return "blocked_missing_payment_env";
  }

  if (groups.checkoutSession.missingNames.length > 0) {
    return "blocked_missing_checkout_session_secret";
  }

  if (groups.paidAccess.missingNames.length > 0) {
    return "blocked_missing_paid_access_secret";
  }

  if (groups.queue.missingNames.length > 0) {
    return "blocked_missing_queue_env";
  }

  if (groups.processor.missingNames.length > 0) {
    return "blocked_missing_processor_env";
  }

  if (groups.accessLink.missingNames.length > 0) {
    return "blocked_missing_access_link_env";
  }

  if (groups.email.missingNames.length > 0) {
    return "blocked_missing_email_env";
  }

  if (groups.line.missingNames.length > 0 || groups.line.channelAccessToken.missing) {
    return "blocked_missing_line_env";
  }

  if (dbSchema.checked && dbSchema.ok === false) {
    return "blocked_db_schema";
  }

  if (envChecklist.runtimeFlagsUnexpected.length > 0) {
    return "blocked_runtime_flags_not_expected";
  }

  if (productionSafety.checked && productionSafety.ok === false) {
    return "blocked_runtime_flags_not_expected";
  }

  return "pass_ready_for_controlled_smoke";
}

function assertSanitizedPreflightOutput(value) {
  const serialized = JSON.stringify(value);
  const forbidden = [
    /pa_[A-Za-z0-9_-]{8,}/u,
    /pcs_[A-Za-z0-9_-]{8,}/u,
    /pal_[A-Za-z0-9_-]{8,}/u,
    /prl_[A-Za-z0-9_-]{8,}/u,
    /Bearer\s+[A-Za-z0-9._-]+/iu,
    /postgres(?:ql)?:\/\/[^"\\\s]+/iu,
    /sk_[A-Za-z0-9_-]+/u,
  ];

  for (const pattern of forbidden) {
    if (pattern.test(serialized)) {
      throw new Error("preflight_output_not_sanitized");
    }
  }

  return value;
}

async function runProductionPaymentRuntimePreflight(argv = process.argv.slice(2), env = process.env) {
  const options = parseArgs(argv, env);
  const presence =
    options.source === "vercel-production"
      ? getVercelProductionEnvPresence(options)
      : getLocalEnvPresence(options, env);
  const envChecklist = buildEnvChecklist(presence, options, env);
  const [dbSchema, productionSafety] = await Promise.all([
    verifyDatabaseSchema(options, env),
    verifyProductionSafety(options),
  ]);
  const readiness = classifyReadiness({ envChecklist, dbSchema, productionSafety });
  const ok = readiness === "pass_ready_for_controlled_smoke";

  return assertSanitizedPreflightOutput({
    ok,
    checkedAt: new Date().toISOString(),
    mode: options.mode,
    source: options.source,
    readiness,
    redaction: {
      valuesPrinted: false,
      lengthsPrinted: false,
      prefixesPrinted: false,
      suffixesPrinted: false,
      hashesPrinted: false,
      checksumsPrinted: false,
      providerPayloadsPrinted: false,
    },
    envSource: {
      source: presence.source,
      valuesAvailableForFlagChecks: presence.valuesAvailableForFlagChecks,
      localEnv: presence.localEnv,
    },
    envChecklist,
    dbSchema,
    productionSafety,
  });
}

function printJson(value) {
  console.log(JSON.stringify(value, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const result = await runProductionPaymentRuntimePreflight();

    printJson(result);

    if (!result.ok) {
      process.exitCode = 2;
    }
  } catch (error) {
    printJson({
      ok: false,
      error: error instanceof PreflightInputError ? error.code : "preflight_failed",
      details: error instanceof PreflightInputError ? error.details : {},
      redaction: {
        valuesPrinted: false,
        lengthsPrinted: false,
        prefixesPrinted: false,
        suffixesPrinted: false,
        hashesPrinted: false,
        checksumsPrinted: false,
      },
    });
    process.exitCode = 2;
  }
}

export {
  ENV_GROUPS,
  PreflightInputError,
  assertSanitizedPreflightOutput,
  buildEnvChecklist,
  classifyReadiness,
  parseArgs,
  parseVercelEnvNames,
  runProductionPaymentRuntimePreflight,
};
