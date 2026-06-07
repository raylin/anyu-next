import { inspect } from "node:util";
import { requireAdminToken } from "./auth.js";
import { CliError } from "./cli-error.js";

type OpsEnv = "staging" | "production";

type OutputMode = "pretty" | "json";

type CliArgs = {
  command: "lookup-result";
  env: OpsEnv;
  resultId: string;
  outputMode: OutputMode;
};

type AdminLookupResponse = {
  ok: true;
  result: {
    resultId: string;
    moduleSlug: string;
    moduleLabel?: string;
    freeResultExists: boolean;
    paidResultExists: boolean;
    paidResultStatus: string | null;
    deliveryArtifactReady: boolean;
  };
  payment: {
    paymentIntentExists: boolean;
    status: string | null;
    provider: string | null;
    paidAtPresent: boolean;
    merchantOrderNoPresent: boolean;
  };
  entitlement: {
    exists: boolean;
    status: string | null;
    active: boolean;
  };
  generation: {
    jobExists: boolean;
    status: string | null;
    failureCategory: string | null;
    jobCreatedAtPresent?: boolean;
    jobStartedAtPresent?: boolean;
    jobCompletedAtPresent?: boolean;
    jobUpdatedAtPresent?: boolean;
    paidResultCompletedAtPresent?: boolean;
    attemptCount?: number | null;
    maxAttempts?: number | null;
    lastErrorAtPresent?: boolean;
    queueStateCategory?: string;
    recommendedAction?: string;
    latency?: {
      enqueueLatencyMs: number | null;
      queueWaitMs: number | null;
      processorPickupLatencyMs: number | null;
      processingDurationMs: number | null;
      totalPaidReadyMs: number | null;
      deliveryReadyMs: number | null;
      queueStuckThresholdMs: number;
    };
  };
  accessLinks: {
    email: AccessLinkChannelSummary;
    line: AccessLinkChannelSummary;
  };
  diagnosis: string[];
  recommendedActions: string[];
};

type AccessLinkChannelSummary = {
  contactSaved: boolean;
  recipientSecretExists?: boolean;
  deliverable?: boolean;
  latestContactStatus?: string | null;
  latestSaveCategory?: string | null;
  latestSaveStatus?: string | null;
  saveAttemptCount?: number;
  sent: boolean;
  active: boolean;
  used: boolean;
  revoked: boolean;
  expired: boolean;
  sendAttemptCount: number;
  lastProviderStatus: string | null;
  lastFailureCategory: string | null;
  providerMessageIdPresent: boolean;
};

type RunContext = {
  env: NodeJS.ProcessEnv;
  fetchImpl: typeof fetch;
  stdout: Pick<NodeJS.WriteStream, "write">;
  stderr: Pick<NodeJS.WriteStream, "write">;
};

const BASE_URLS: Record<OpsEnv, string> = {
  staging: "https://staging.anyu.tw",
  production: "https://anyu.tw",
};

const FORBIDDEN_KEY_PARTS = [
  "lineuserid",
  "lineuser",
  "encryptedrecipient",
  "recipienthash",
  "contacthash",
  "tokenhash",
  "rawtoken",
  "recoverytoken",
  "accesstoken",
  "accessurl",
  "tokenizedurl",
  "sourcetext",
  "rawinput",
  "providerpayload",
  "tradeinfo",
  "tradesha",
  "provider_message_id",
  "providermessageid",
  "merchantorderno",
] as const;

const FORBIDDEN_EXACT_KEYS = ["rawemail", "emailaddress", "recipientemail"] as const;

const FORBIDDEN_VALUE_PATTERNS = [
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/iu,
  /\b(?:pal|prl|pa|pcs)_[A-Za-z0-9_-]{8,}\b/u,
  /\/r\/[A-Za-z0-9_-]{12,}/u,
  /\bTradeInfo\b/iu,
  /\bTradeSha\b/iu,
] as const;

function normalizeKey(key: string) {
  return key.replace(/[^a-z0-9]/giu, "").toLowerCase();
}

function parseArgs(argv: string[]): CliArgs {
  const [command, ...rest] = argv;

  if (command !== "lookup-result") {
    throw new CliError(command ? "unknown_command" : "command_required");
  }

  let env: OpsEnv | null = null;
  let resultId: string | null = null;
  let outputMode: OutputMode = "pretty";

  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];

    if (arg === "--json") {
      outputMode = "json";
      continue;
    }

    if (arg === "--env") {
      const value = rest[i + 1];
      i += 1;

      if (value !== "staging" && value !== "production") {
        throw new CliError("env_invalid");
      }

      env = value;
      continue;
    }

    if (arg === "--id") {
      const value = rest[i + 1];
      i += 1;
      resultId = value || null;
      continue;
    }

    if (arg === "--base-url" || arg === "--token") {
      throw new CliError("unsupported_option");
    }

    if (arg.startsWith("--")) {
      throw new CliError("unsupported_option");
    }

    throw new CliError("unexpected_argument");
  }

  if (!env) {
    throw new CliError("env_required");
  }

  if (!resultId) {
    throw new CliError("result_id_missing");
  }

  return {
    command: "lookup-result",
    env,
    resultId,
    outputMode,
  };
}

function assertPlainObject(value: unknown, code = "unsafe_response_shape"): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new CliError(code);
  }
}

function assertString(value: unknown, code = "unsafe_response_shape"): asserts value is string {
  if (typeof value !== "string") {
    throw new CliError(code);
  }
}

function assertBoolean(value: unknown, code = "unsafe_response_shape"): asserts value is boolean {
  if (typeof value !== "boolean") {
    throw new CliError(code);
  }
}

function assertNullableString(value: unknown, code = "unsafe_response_shape"): asserts value is string | null {
  if (value !== null && typeof value !== "string") {
    throw new CliError(code);
  }
}

function assertNumber(value: unknown, code = "unsafe_response_shape"): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new CliError(code);
  }
}

function assertNullableNumber(value: unknown, code = "unsafe_response_shape"): asserts value is number | null {
  if (value !== null && (typeof value !== "number" || !Number.isFinite(value))) {
    throw new CliError(code);
  }
}

function assertStringArray(value: unknown, code = "unsafe_response_shape"): asserts value is string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new CliError(code);
  }
}

function assertSafePayload(value: unknown, path: string[] = []): void {
  if (typeof value === "string") {
    for (const pattern of FORBIDDEN_VALUE_PATTERNS) {
      if (pattern.test(value)) {
        throw new CliError("unsafe_response_shape");
      }
    }
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => assertSafePayload(item, [...path, String(index)]));
    return;
  }

  for (const [key, item] of Object.entries(value)) {
    const normalized = normalizeKey(key);
    const allowedPresenceBoolean =
      (normalized === "providermessageidpresent" || normalized === "merchantordernopresent") &&
      typeof item === "boolean";

    if (
      !allowedPresenceBoolean &&
      (FORBIDDEN_EXACT_KEYS.includes(normalized as (typeof FORBIDDEN_EXACT_KEYS)[number]) ||
        FORBIDDEN_KEY_PARTS.some((part) => normalized.includes(part)))
    ) {
      throw new CliError("unsafe_response_shape");
    }

    assertSafePayload(item, [...path, key]);
  }
}

function validateAccessLinkChannel(value: unknown): AccessLinkChannelSummary {
  assertPlainObject(value);
  assertBoolean(value["contactSaved"]);
  assertBoolean(value["sent"]);
  assertBoolean(value["active"]);
  assertBoolean(value["used"]);
  assertBoolean(value["revoked"]);
  assertBoolean(value["expired"]);
  assertNumber(value["sendAttemptCount"]);
  assertNullableString(value["lastProviderStatus"]);
  assertNullableString(value["lastFailureCategory"]);
  assertBoolean(value["providerMessageIdPresent"]);

  if (value["recipientSecretExists"] !== undefined) {
    assertBoolean(value["recipientSecretExists"]);
  }

  if (value["deliverable"] !== undefined) {
    assertBoolean(value["deliverable"]);
  }

  if (value["latestContactStatus"] !== undefined) {
    assertNullableString(value["latestContactStatus"]);
  }

  if (value["latestSaveCategory"] !== undefined) {
    assertNullableString(value["latestSaveCategory"]);
  }

  if (value["latestSaveStatus"] !== undefined) {
    assertNullableString(value["latestSaveStatus"]);
  }

  if (value["saveAttemptCount"] !== undefined) {
    assertNumber(value["saveAttemptCount"]);
  }

  return value as AccessLinkChannelSummary;
}

function validateAdminLookupResponse(value: unknown): AdminLookupResponse {
  assertSafePayload(value);
  assertPlainObject(value);

  if (value["ok"] !== true) {
    throw new CliError("unsafe_response_shape");
  }

  const result = value["result"];
  assertPlainObject(result);
  assertString(result["resultId"]);
  assertString(result["moduleSlug"]);
  if (result["moduleLabel"] !== undefined) {
    assertString(result["moduleLabel"]);
  }
  assertBoolean(result["freeResultExists"]);
  assertBoolean(result["paidResultExists"]);
  assertNullableString(result["paidResultStatus"]);
  assertBoolean(result["deliveryArtifactReady"]);

  const payment = value["payment"];
  assertPlainObject(payment);
  assertBoolean(payment["paymentIntentExists"]);
  assertNullableString(payment["status"]);
  assertNullableString(payment["provider"]);
  assertBoolean(payment["paidAtPresent"]);
  assertBoolean(payment["merchantOrderNoPresent"]);

  const entitlement = value["entitlement"];
  assertPlainObject(entitlement);
  assertBoolean(entitlement["exists"]);
  assertNullableString(entitlement["status"]);
  assertBoolean(entitlement["active"]);

  const generation = value["generation"];
  assertPlainObject(generation);
  assertBoolean(generation["jobExists"]);
  assertNullableString(generation["status"]);
  assertNullableString(generation["failureCategory"]);
  if (generation["jobCreatedAtPresent"] !== undefined) assertBoolean(generation["jobCreatedAtPresent"]);
  if (generation["jobStartedAtPresent"] !== undefined) assertBoolean(generation["jobStartedAtPresent"]);
  if (generation["jobCompletedAtPresent"] !== undefined) assertBoolean(generation["jobCompletedAtPresent"]);
  if (generation["jobUpdatedAtPresent"] !== undefined) assertBoolean(generation["jobUpdatedAtPresent"]);
  if (generation["paidResultCompletedAtPresent"] !== undefined) {
    assertBoolean(generation["paidResultCompletedAtPresent"]);
  }
  if (generation["attemptCount"] !== undefined) assertNullableNumber(generation["attemptCount"]);
  if (generation["maxAttempts"] !== undefined) assertNullableNumber(generation["maxAttempts"]);
  if (generation["lastErrorAtPresent"] !== undefined) assertBoolean(generation["lastErrorAtPresent"]);
  if (generation["queueStateCategory"] !== undefined) assertString(generation["queueStateCategory"]);
  if (generation["recommendedAction"] !== undefined) assertString(generation["recommendedAction"]);
  if (generation["latency"] !== undefined) {
    const latency = generation["latency"];
    assertPlainObject(latency);
    assertNullableNumber(latency["enqueueLatencyMs"]);
    assertNullableNumber(latency["queueWaitMs"]);
    assertNullableNumber(latency["processorPickupLatencyMs"]);
    assertNullableNumber(latency["processingDurationMs"]);
    assertNullableNumber(latency["totalPaidReadyMs"]);
    assertNullableNumber(latency["deliveryReadyMs"]);
    assertNumber(latency["queueStuckThresholdMs"]);
  }

  const accessLinks = value["accessLinks"];
  assertPlainObject(accessLinks);
  validateAccessLinkChannel(accessLinks["email"]);
  validateAccessLinkChannel(accessLinks["line"]);

  assertStringArray(value["diagnosis"]);
  assertStringArray(value["recommendedActions"]);

  return value as AdminLookupResponse;
}

function formatChannel(summary: AccessLinkChannelSummary) {
  const states = [];

  if (summary.contactSaved) states.push("saved");
  if (summary.recipientSecretExists) states.push("recipient-secret");
  if (summary.deliverable === false && summary.contactSaved) states.push("not-deliverable");
  if (summary.sent) states.push("sent");
  if (summary.active) states.push("active");
  if (summary.used) states.push("used");
  if (summary.revoked) states.push("revoked");
  if (summary.expired) states.push("expired");
  if (summary.lastFailureCategory) states.push(`failed:${summary.lastFailureCategory}`);
  if (summary.latestSaveCategory) states.push(`save:${summary.latestSaveCategory}`);

  return states.length > 0 ? states.join(", ") : "not saved";
}

function formatMs(value: number | null | undefined) {
  return typeof value === "number" ? `${value}` : "unknown";
}

function formatPretty(env: OpsEnv, response: AdminLookupResponse) {
  return [
    "ANYU ops: paid result lookup",
    `Env: ${env}`,
    `Result: ${response.result.paidResultStatus ?? (response.result.paidResultExists ? "present" : "missing")}`,
    `Diagnosis: ${response.diagnosis.length > 0 ? response.diagnosis.join(", ") : "none"}`,
    "",
    "Payment",
    `- Status: ${response.payment.status ?? "not_started"}`,
    `- Provider: ${response.payment.provider ?? "none"}`,
    `- Merchant order present: ${response.payment.merchantOrderNoPresent ? "yes" : "no"}`,
    "",
    "Entitlement",
    `- Status: ${response.entitlement.status ?? "missing"}`,
    `- Active: ${response.entitlement.active ? "yes" : "no"}`,
    "",
    "Generation",
    `- Status: ${response.generation.status ?? "missing"}`,
    `- Failure category: ${response.generation.failureCategory ?? "none"}`,
    `- Queue state: ${response.generation.queueStateCategory ?? "unknown"}`,
    `- Recommended action: ${response.generation.recommendedAction ?? "support_review_required"}`,
    `- Job created at present: ${response.generation.jobCreatedAtPresent ? "yes" : "no"}`,
    `- Job started at present: ${response.generation.jobStartedAtPresent ? "yes" : "no"}`,
    `- Job completed at present: ${response.generation.jobCompletedAtPresent ? "yes" : "no"}`,
    `- Paid result completed at present: ${response.generation.paidResultCompletedAtPresent ? "yes" : "no"}`,
    `- Attempt count: ${response.generation.attemptCount ?? "unknown"}`,
    `- Queue wait ms: ${formatMs(response.generation.latency?.queueWaitMs)}`,
    `- Processing duration ms: ${formatMs(response.generation.latency?.processingDurationMs)}`,
    `- Total paid ready ms: ${formatMs(response.generation.latency?.totalPaidReadyMs)}`,
    "",
    "Paid result",
    `- Exists: ${response.result.paidResultExists ? "yes" : "no"}`,
    `- Delivery artifact ready: ${response.result.deliveryArtifactReady ? "yes" : "no"}`,
    "",
    "Access links",
    `- Email: ${formatChannel(response.accessLinks.email)}`,
    `- LINE: ${formatChannel(response.accessLinks.line)}`,
    "",
    "Recommended action",
    ...(response.recommendedActions.length > 0
      ? response.recommendedActions.map((action) => `- ${action}`)
      : ["- no_action_needed"]),
  ].join("\n");
}

async function lookupResult(args: CliArgs, context: RunContext) {
  const token = requireAdminToken(args.env, context.env).token;
  const baseUrl = BASE_URLS[args.env];
  const url = `${baseUrl}/api/admin/paid-results/${encodeURIComponent(args.resultId)}`;

  let response: Response;

  try {
    response = await context.fetchImpl(url, {
      method: "GET",
      headers: {
        "x-admin-api-token": token,
        accept: "application/json",
      },
    });
  } catch {
    throw new CliError("api_unreachable");
  }

  if (response.status === 401) {
    throw new CliError("admin_auth_failed");
  }

  if (response.status === 404) {
    throw new CliError("result_not_found");
  }

  if (!response.ok) {
    throw new CliError("server_lookup_failed");
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw new CliError("server_lookup_failed");
  }

  return validateAdminLookupResponse(body);
}

function formatError(error: unknown, outputMode: OutputMode) {
  const code = error instanceof CliError ? error.code : "unknown";

  if (outputMode === "json") {
    return `${JSON.stringify({ ok: false, error: code })}\n`;
  }

  return `ANYU ops error: ${code}\n`;
}

async function run(argv: string[], context: RunContext) {
  let outputMode: OutputMode = argv.includes("--json") ? "json" : "pretty";

  try {
    const args = parseArgs(argv);
    outputMode = args.outputMode;
    const response = await lookupResult(args, context);

    if (args.outputMode === "json") {
      context.stdout.write(`${JSON.stringify({ ok: true, env: args.env, lookup: response }, null, 2)}\n`);
    } else {
      context.stdout.write(`${formatPretty(args.env, response)}\n`);
    }

    return 0;
  } catch (error) {
    context.stderr.write(formatError(error, outputMode));

    if (!(error instanceof CliError) && process.env["DEBUG_ADMIN_CLI"] === "1") {
      context.stderr.write(`${inspect(error)}\n`);
    }

    return error instanceof CliError ? error.exitCode : 1;
  }
}

export async function main(argv: string[], context: RunContext) {
  return run(argv, context);
}

export {
  BASE_URLS,
  CliError,
  assertSafePayload,
  formatPretty,
  parseArgs,
  validateAdminLookupResponse,
};
