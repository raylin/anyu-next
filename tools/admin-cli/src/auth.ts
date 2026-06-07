import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { CliError } from "./cli-error.js";

type OpsEnv = "staging" | "production";
type OutputMode = "pretty" | "json";
type AuthCommand = "status" | "set-token" | "logout" | "help";

type CredentialsFile = {
  version: 1;
  profiles: Partial<Record<OpsEnv, { adminApiToken?: string }>>;
};

type CliArgs = {
  command: "auth";
  subcommand: AuthCommand;
  env?: OpsEnv;
  outputMode: OutputMode;
};

type RunContext = {
  env: NodeJS.ProcessEnv;
  stdin?: NodeJS.ReadStream | NodeJS.ReadableStream;
  stdout: Pick<NodeJS.WriteStream, "write">;
  stderr: Pick<NodeJS.WriteStream, "write">;
};

function credentialsPath(env: NodeJS.ProcessEnv = process.env) {
  return env["ANYU_OPS_CREDENTIALS_PATH"]?.trim() || path.join(os.homedir(), ".anyu", "credentials.json");
}

function emptyCredentials(): CredentialsFile {
  return {
    version: 1,
    profiles: {},
  };
}

function assertCredentialFileShape(value: unknown): asserts value is CredentialsFile {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new CliError("credentials_file_invalid");
  }

  const record = value as Record<string, unknown>;
  if (record["version"] !== 1 || !record["profiles"] || typeof record["profiles"] !== "object" || Array.isArray(record["profiles"])) {
    throw new CliError("credentials_file_invalid");
  }

  for (const envName of ["staging", "production"] as const) {
    const profile = (record["profiles"] as Record<string, unknown>)[envName];
    if (profile === undefined) continue;
    if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
      throw new CliError("credentials_file_invalid");
    }
    const token = (profile as Record<string, unknown>)["adminApiToken"];
    if (token !== undefined && typeof token !== "string") {
      throw new CliError("credentials_file_invalid");
    }
  }
}

function readCredentials(env: NodeJS.ProcessEnv = process.env): CredentialsFile {
  const filePath = credentialsPath(env);

  if (!fs.existsSync(filePath)) {
    return emptyCredentials();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    throw new CliError("credentials_file_invalid");
  }

  assertCredentialFileShape(parsed);
  return parsed;
}

function writeCredentials(credentials: CredentialsFile, env: NodeJS.ProcessEnv = process.env) {
  const filePath = credentialsPath(env);
  const dir = path.dirname(filePath);

  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  try {
    fs.chmodSync(dir, 0o700);
  } catch {
    // Some filesystems ignore chmod. Do not expose any filesystem metadata.
  }
  fs.writeFileSync(filePath, `${JSON.stringify(credentials, null, 2)}\n`, { mode: 0o600 });
  try {
    fs.chmodSync(filePath, 0o600);
  } catch {
    // Some platforms do not support chmod.
  }
}

function resolveAdminToken(opsEnv: OpsEnv, env: NodeJS.ProcessEnv = process.env) {
  const processToken = env["ADMIN_API_TOKEN"]?.trim() ?? "";

  if (processToken) {
    return {
      token: processToken,
      sourceCategory: "process_env" as const,
      tokenPresent: true,
    };
  }

  const credentials = readCredentials(env);
  const fileToken = credentials.profiles[opsEnv]?.adminApiToken?.trim() ?? "";

  if (fileToken) {
    return {
      token: fileToken,
      sourceCategory: "credentials_file" as const,
      tokenPresent: true,
    };
  }

  return {
    token: "",
    sourceCategory: "missing" as const,
    tokenPresent: false,
  };
}

function requireAdminToken(opsEnv: OpsEnv, env: NodeJS.ProcessEnv = process.env) {
  const resolution = resolveAdminToken(opsEnv, env);

  if (!resolution.token) {
    throw new CliError("admin_token_missing");
  }

  return resolution;
}

function authSummary(opsEnv: OpsEnv, env: NodeJS.ProcessEnv = process.env) {
  const resolution = resolveAdminToken(opsEnv, env);

  return {
    env: opsEnv,
    tokenAvailable: resolution.tokenPresent,
    tokenSourceCategory: resolution.sourceCategory,
    valuesPrinted: false,
    lengthsPrinted: false,
    prefixesPrinted: false,
    suffixesPrinted: false,
    hashesPrinted: false,
    checksumsPrinted: false,
  };
}

function helpText() {
  return [
    "ANYU ops auth",
    "",
    "Usage",
    "  pnpm ops auth <command> --env <staging|production>",
    "",
    "Commands",
    "  status          Show local token availability and source category",
    "  set-token       Prompt for a token and store it in ~/.anyu/credentials.json",
    "  logout          Remove the stored token for one environment",
    "",
    "Examples",
    "  pnpm ops auth status --env production",
    "  pnpm ops auth set-token --env staging",
    "  pnpm ops auth set-token --env production",
    "  pnpm ops auth logout --env production",
    "",
    "Safety notes",
    "  ADMIN_API_TOKEN in process env overrides the credentials file.",
    "  Normal pnpm ops commands do not read apps/web/.env.staging or apps/web/.env.production.",
    "  --token and token positional arguments are intentionally unsupported.",
    "  Token values, lengths, prefixes, suffixes, hashes, and checksums are never printed.",
  ].join("\n");
}

function parseArgs(argv: string[]): CliArgs {
  const [command, subcommandRaw, ...rest] = argv;

  if (command !== "auth") {
    throw new CliError(command ? "unknown_command" : "command_required");
  }

  const subcommand = (
    subcommandRaw === "--help" || subcommandRaw === "-h" ? "help" : subcommandRaw ?? "help"
  ) as AuthCommand;
  if (!["status", "set-token", "logout", "help"].includes(subcommand)) {
    throw new CliError("unknown_auth_command");
  }

  const args: CliArgs = {
    command: "auth",
    subcommand,
    outputMode: "pretty",
  };
  const positionals: string[] = [];

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];

    if (arg === "--json") {
      args.outputMode = "json";
      continue;
    }

    if (arg === "--env") {
      const value = rest[index + 1];
      index += 1;
      if (value !== "staging" && value !== "production") {
        throw new CliError("env_invalid");
      }
      args.env = value;
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

  if (positionals.length > 0) {
    throw new CliError("unexpected_argument");
  }

  return args;
}

async function readTokenFromStdin(context: RunContext) {
  const stdin = context.stdin ?? process.stdin;
  const chunks: Buffer[] = [];

  if ("isTTY" in stdin && stdin.isTTY && typeof stdin.setRawMode === "function") {
    context.stderr.write("Admin API token: ");
    return new Promise<string>((resolve) => {
      let token = "";
      const onData = (chunk: Buffer) => {
        const text = chunk.toString("utf8");
        if (text === "\r" || text === "\n" || text === "\r\n") {
          stdin.off("data", onData);
          stdin.setRawMode(false);
          stdin.pause();
          context.stderr.write("\n");
          resolve(token.trim());
          return;
        }
        if (text === "\u0003") {
          stdin.off("data", onData);
          stdin.setRawMode(false);
          stdin.pause();
          context.stderr.write("\n");
          resolve("");
          return;
        }
        token += text;
      };

      stdin.setRawMode(true);
      stdin.resume();
      stdin.on("data", onData);
    });
  }

  for await (const chunk of stdin as AsyncIterable<Buffer | string>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8").trim();
}

function formatStatus(summary: ReturnType<typeof authSummary>) {
  return [
    "ANYU ops auth",
    `Env: ${summary.env}`,
    `Token available: ${summary.tokenAvailable ? "yes" : "no"}`,
    `Token source: ${summary.tokenSourceCategory}`,
  ].join("\n") + "\n";
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

    if (args.subcommand === "help") {
      context.stdout.write(`${helpText()}\n`);
      return 0;
    }

    const opsEnv = args.env as OpsEnv;

    if (args.subcommand === "status") {
      const summary = authSummary(opsEnv, context.env);
      if (args.outputMode === "json") {
        context.stdout.write(`${JSON.stringify({ ok: true, auth: summary }, null, 2)}\n`);
      } else {
        context.stdout.write(formatStatus(summary));
      }
      return 0;
    }

    if (args.subcommand === "set-token") {
      const token = await readTokenFromStdin(context);
      if (!token) {
        throw new CliError("admin_token_missing");
      }
      const credentials = readCredentials(context.env);
      credentials.profiles[opsEnv] = {
        ...(credentials.profiles[opsEnv] ?? {}),
        adminApiToken: token,
      };
      writeCredentials(credentials, context.env);
      const summary = authSummary(opsEnv, context.env);
      if (args.outputMode === "json") {
        context.stdout.write(`${JSON.stringify({ ok: true, auth: summary }, null, 2)}\n`);
      } else {
        context.stdout.write(formatStatus(summary));
      }
      return 0;
    }

    if (args.subcommand === "logout") {
      const credentials = readCredentials(context.env);
      if (credentials.profiles[opsEnv]) {
        delete credentials.profiles[opsEnv]?.adminApiToken;
      }
      writeCredentials(credentials, context.env);
      const summary = authSummary(opsEnv, context.env);
      if (args.outputMode === "json") {
        context.stdout.write(`${JSON.stringify({ ok: true, auth: summary }, null, 2)}\n`);
      } else {
        context.stdout.write(formatStatus(summary));
      }
      return 0;
    }

    throw new CliError("unknown_auth_command");
  } catch (error) {
    context.stderr.write(formatError(error, outputMode));
    return error instanceof CliError ? error.exitCode : 1;
  }
}

export async function main(argv: string[], context: RunContext) {
  return run(argv, context);
}

export {
  authSummary,
  credentialsPath,
  helpText,
  parseArgs,
  readCredentials,
  requireAdminToken,
  resolveAdminToken,
  writeCredentials,
};
