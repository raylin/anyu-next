import { inspect } from "node:util";
import { BASE_URLS, CliError, assertSafePayload } from "./lookup-result.js";

type OpsEnv = "staging" | "production";
type ScopeType = "global" | "module";
type OutputMode = "pretty" | "json";
type ConfigCommand = "registry" | "list" | "get" | "set" | "unset" | "history" | "help";

type CliArgs = {
  command: "config";
  subcommand: ConfigCommand;
  env?: OpsEnv;
  key?: string;
  value?: string;
  scopeType?: ScopeType;
  scopeKey?: string;
  reason?: string;
  confirmGlobalImpact: boolean;
  outputMode: OutputMode;
};

type RunContext = {
  env: NodeJS.ProcessEnv;
  fetchImpl: typeof fetch;
  stdout: Pick<NodeJS.WriteStream, "write">;
  stderr: Pick<NodeJS.WriteStream, "write">;
};

function helpText() {
  return [
    "ANYU ops config",
    "",
    "Usage",
    "  pnpm ops config <command> --env <staging|production> [options]",
    "",
    "Commands",
    "  registry                  List registered runtime config keys",
    "  list                      List active/stored runtime config values",
    "  get <key>                 Read one scoped runtime config value",
    "  set <key> <value>         Set one scoped runtime config value",
    "  unset <key>               Deactivate one scoped runtime config value",
    "  history <key>             Read scoped runtime config history",
    "",
    "Scope",
    "  --module <moduleSlug>     Use module scope, for example ai-temperature",
    "  --global                  Use global scope",
    "  Scope is required for get/set/unset/history.",
    "",
    "Examples",
    "  pnpm ops config registry --env production",
    "  pnpm ops config list --env production",
    "  pnpm ops config get --env production payment.window.enabled --module ai-temperature",
    "  pnpm ops config set --env production payment.window.enabled true --module ai-temperature --reason \"controlled production smoke\"",
    "  pnpm ops config set --env production payment.global.disabled true --global --reason \"emergency payment shutdown\" --confirm-global-impact",
    "  pnpm ops config set --env production payment.window.enabled false --module ai-temperature --reason \"smoke complete\"",
    "  pnpm ops config history --env production payment.window.enabled --module ai-temperature",
    "",
    "Safety notes",
    "  Runtime config is not for secrets, provider credentials, tokens, DB URLs, or crypto keys.",
    "  Unknown keys are rejected by the registry-first Admin API.",
    "  Global writes require --confirm-global-impact.",
    "  Values are sent only to Admin API; this CLI does not access DB, Vercel, Neon, or app env mirror files.",
    "",
    "Environment/auth notes",
    "  ADMIN_API_TOKEN must be present in the shell/process environment.",
    "  --base-url and --token flags are intentionally unsupported.",
  ].join("\n");
}

function parseArgs(argv: string[]): CliArgs {
  const [command, subcommandRaw, ...rest] = argv;

  if (command !== "config") {
    throw new CliError(command ? "unknown_command" : "command_required");
  }

  const subcommand = (subcommandRaw ?? "help") as ConfigCommand;
  if (!["registry", "list", "get", "set", "unset", "history", "help"].includes(subcommand)) {
    throw new CliError("unknown_config_command");
  }

  const args: CliArgs = {
    command: "config",
    subcommand,
    confirmGlobalImpact: false,
    outputMode: "pretty",
  };
  const positionals: string[] = [];

  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];

    if (arg === "--json") {
      args.outputMode = "json";
      continue;
    }

    if (arg === "--env") {
      const value = rest[i + 1];
      i += 1;
      if (value !== "staging" && value !== "production") {
        throw new CliError("env_invalid");
      }
      args.env = value;
      continue;
    }

    if (arg === "--module") {
      const value = rest[i + 1];
      i += 1;
      if (!value || value.startsWith("--")) {
        throw new CliError("scope_required");
      }
      args.scopeType = "module";
      args.scopeKey = value;
      continue;
    }

    if (arg === "--global") {
      args.scopeType = "global";
      args.scopeKey = "global";
      continue;
    }

    if (arg === "--reason") {
      const value = rest[i + 1];
      i += 1;
      if (!value || value.startsWith("--")) {
        throw new CliError("reason_required");
      }
      args.reason = value;
      continue;
    }

    if (arg === "--confirm-global-impact") {
      args.confirmGlobalImpact = true;
      continue;
    }

    if (arg === "--base-url" || arg === "--token") {
      throw new CliError("unsupported_option");
    }

    if (arg.startsWith("--")) {
      throw new CliError("unsupported_option");
    }

    positionals.push(arg);
  }

  if (subcommand !== "help" && !args.env) {
    throw new CliError("env_required");
  }

  if (["get", "set", "unset", "history"].includes(subcommand) && !args.scopeType) {
    throw new CliError("scope_required");
  }

  if (["get", "set", "unset", "history"].includes(subcommand)) {
    args.key = positionals[0];
    if (!args.key) {
      throw new CliError("config_key_required");
    }
  }

  if (subcommand === "set") {
    args.value = positionals[1];
    if (args.value === undefined) {
      throw new CliError("config_value_required");
    }
    if (!args.reason?.trim()) {
      throw new CliError("reason_required");
    }
  }

  if (subcommand === "unset" && !args.reason?.trim()) {
    throw new CliError("reason_required");
  }

  if (positionals.length > (subcommand === "set" ? 2 : ["get", "unset", "history"].includes(subcommand) ? 1 : 0)) {
    throw new CliError("unexpected_argument");
  }

  if (args.scopeType === "global" && (subcommand === "set" || subcommand === "unset") && !args.confirmGlobalImpact) {
    throw new CliError("global_confirm_required");
  }

  return args;
}

function requireAdminToken(env: NodeJS.ProcessEnv) {
  const token = env["ADMIN_API_TOKEN"];

  if (!token) {
    throw new CliError("admin_token_missing");
  }

  return token;
}

function parseConfigValue(value: string) {
  if (value === "true") return true;
  if (value === "false") return false;
  const numberValue = Number(value);
  if (value.trim() !== "" && Number.isFinite(numberValue) && String(numberValue) === value) {
    return numberValue;
  }
  return value;
}

function scopedQuery(args: CliArgs) {
  const params = new URLSearchParams();
  params.set("environment", args.env ?? "production");
  if (args.key) params.set("key", args.key);
  if (args.scopeType) params.set("scopeType", args.scopeType);
  if (args.scopeKey) params.set("scopeKey", args.scopeKey);
  return params.toString();
}

async function requestAdmin(args: CliArgs, context: RunContext) {
  if (args.subcommand === "help") {
    return { help: helpText() };
  }

  const token = requireAdminToken(context.env);
  const baseUrl = BASE_URLS[args.env as OpsEnv];
  let path = "/api/admin/runtime-config/registry";
  let init: RequestInit = {
    method: "GET",
    headers: { "x-admin-api-token": token, accept: "application/json" },
  };

  if (args.subcommand === "list") {
    path = `/api/admin/runtime-config/values?environment=${encodeURIComponent(args.env as string)}`;
  } else if (args.subcommand === "get") {
    path = `/api/admin/runtime-config/get?${scopedQuery(args)}`;
  } else if (args.subcommand === "history") {
    path = `/api/admin/runtime-config/history?${scopedQuery(args)}`;
  } else if (args.subcommand === "set") {
    path = "/api/admin/runtime-config/set";
    init = {
      method: "POST",
      headers: {
        "x-admin-api-token": token,
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        environment: args.env,
        key: args.key,
        scopeType: args.scopeType,
        scopeKey: args.scopeKey,
        value: parseConfigValue(args.value ?? ""),
        reason: args.reason,
        confirmGlobalImpact: args.confirmGlobalImpact,
        actor: "pnpm-ops",
      }),
    };
  } else if (args.subcommand === "unset") {
    path = "/api/admin/runtime-config/unset";
    init = {
      method: "POST",
      headers: {
        "x-admin-api-token": token,
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        environment: args.env,
        key: args.key,
        scopeType: args.scopeType,
        scopeKey: args.scopeKey,
        reason: args.reason,
        confirmGlobalImpact: args.confirmGlobalImpact,
        actor: "pnpm-ops",
      }),
    };
  }

  let response: Response;

  try {
    response = await context.fetchImpl(`${baseUrl}${path}`, init);
  } catch {
    throw new CliError("api_unreachable");
  }

  if (response.status === 401) {
    throw new CliError("admin_auth_failed");
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new CliError("server_lookup_failed");
  }

  assertSafePayload(body);

  if (!response.ok) {
    const error = body && typeof body === "object" && "error" in body ? String(body.error) : "server_lookup_failed";
    throw new CliError(error);
  }

  return body;
}

function formatPretty(args: CliArgs, response: unknown) {
  if (args.subcommand === "help") {
    return `${(response as { help: string }).help}\n`;
  }

  const lines = [
    "ANYU ops: runtime config",
    `Env: ${args.env}`,
    `Command: ${args.subcommand}`,
  ];

  if (args.key) lines.push(`Key: ${args.key}`);
  if (args.scopeType) lines.push(`Scope: ${args.scopeType}:${args.scopeKey}`);

  if (response && typeof response === "object") {
    const data = response as Record<string, unknown>;
    if (Array.isArray(data["registry"])) lines.push(`Registry keys: ${data["registry"].length}`);
    if (Array.isArray(data["values"])) lines.push(`Values: ${data["values"].length}`);
    if (Array.isArray(data["history"])) lines.push(`History events: ${data["history"].length}`);
    if (data["config"] && typeof data["config"] === "object") {
      const config = data["config"] as Record<string, unknown>;
      lines.push(`Value active: ${config["active"] === true ? "yes" : "no"}`);
      lines.push(`Value type: ${String(config["valueType"] ?? "unknown")}`);
      lines.push(`Risk: ${String(config["riskLevel"] ?? "unknown")}`);
    }
  }

  return `${lines.join("\n")}\n`;
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
    const response = await requestAdmin(args, context);

    if (args.outputMode === "json") {
      context.stdout.write(`${JSON.stringify({ ok: true, env: args.env, response }, null, 2)}\n`);
    } else {
      context.stdout.write(formatPretty(args, response));
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

export { helpText, parseArgs };
