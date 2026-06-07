import { inspect } from "node:util";
import { requireAdminToken } from "./auth.js";
import { BASE_URLS, CliError, assertSafePayload } from "./lookup-result.js";

type OpsEnv = "staging" | "production";
type OutputMode = "pretty" | "json";

type CliArgs = {
  command: "lookup-line-bind";
  env: OpsEnv;
  resultId: string;
  outputMode: OutputMode;
};

type LineBindDiagnosticLookupResponse = {
  ok: true;
  resultId: string;
  moduleSlug: string;
  latestCategory: string;
  latestStage: string;
  latestStatus: string;
  eventCount: number;
  latestCreatedAtPresent: boolean;
  latestCreatedAt: string | null;
  categories: Array<{
    category: string;
    count: number;
  }>;
  recommendedActions: string[];
};

type RunContext = {
  env: NodeJS.ProcessEnv;
  fetchImpl: typeof fetch;
  stdout: Pick<NodeJS.WriteStream, "write">;
  stderr: Pick<NodeJS.WriteStream, "write">;
};

function parseArgs(argv: string[]): CliArgs {
  const [command, ...rest] = argv;

  if (command !== "lookup-line-bind") {
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

    if (arg === "--result-id") {
      const value = rest[i + 1];
      i += 1;
      resultId = value || null;
      continue;
    }

    if (arg === "--base-url" || arg === "--token" || arg === "--id") {
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
    command: "lookup-line-bind",
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

function assertStringArray(value: unknown, code = "unsafe_response_shape"): asserts value is string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new CliError(code);
  }
}

function validateLineBindDiagnosticLookupResponse(value: unknown): LineBindDiagnosticLookupResponse {
  assertSafePayload(value);
  assertPlainObject(value);

  if (value["ok"] !== true) {
    throw new CliError("unsafe_response_shape");
  }

  assertString(value["resultId"]);
  assertString(value["moduleSlug"]);
  assertString(value["latestCategory"]);
  assertString(value["latestStage"]);
  assertString(value["latestStatus"]);
  assertNumber(value["eventCount"]);
  assertBoolean(value["latestCreatedAtPresent"]);
  assertNullableString(value["latestCreatedAt"]);
  assertStringArray(value["recommendedActions"]);

  const categories = value["categories"];
  if (!Array.isArray(categories)) {
    throw new CliError("unsafe_response_shape");
  }

  for (const category of categories) {
    assertPlainObject(category);
    assertString(category["category"]);
    assertNumber(category["count"]);
  }

  return value as LineBindDiagnosticLookupResponse;
}

function formatPretty(env: OpsEnv, response: LineBindDiagnosticLookupResponse) {
  return [
    "ANYU ops: LINE bind diagnostics",
    `Env: ${env}`,
    `Result ID: ${response.resultId}`,
    `Latest category: ${response.latestCategory}`,
    `Latest stage: ${response.latestStage}`,
    `Latest status: ${response.latestStatus}`,
    `Event count: ${response.eventCount}`,
    "",
    "Recommended action",
    ...(response.recommendedActions.length > 0
      ? response.recommendedActions.map((action) => `- ${action}`)
      : ["- no_action_needed"]),
  ].join("\n");
}

async function lookupLineBind(args: CliArgs, context: RunContext) {
  const token = requireAdminToken(args.env, context.env).token;
  const baseUrl = BASE_URLS[args.env];
  const url = `${baseUrl}/api/admin/line-bind-diagnostics?resultId=${encodeURIComponent(args.resultId)}`;

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
    throw new CliError("no_events_found");
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

  return validateLineBindDiagnosticLookupResponse(body);
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
    const response = await lookupLineBind(args, context);

    if (args.outputMode === "json") {
      context.stdout.write(`${JSON.stringify({ ok: true, env: args.env, diagnostics: response }, null, 2)}\n`);
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
  formatPretty,
  parseArgs,
  validateLineBindDiagnosticLookupResponse,
};
