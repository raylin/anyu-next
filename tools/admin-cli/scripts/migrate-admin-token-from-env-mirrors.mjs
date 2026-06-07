#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ADMIN_TOKEN_KEY = "ADMIN_API_TOKEN";
const OPS_ENVS = ["staging", "production"];

function defaultRepoRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
}

function credentialsPath(env = process.env) {
  return env.ANYU_OPS_CREDENTIALS_PATH?.trim() || path.join(os.homedir(), ".anyu", "credentials.json");
}

function parseArgs(argv) {
  const args = {
    confirmed: false,
    json: false,
    repoRoot: defaultRepoRoot(),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--confirm-owner-approved") {
      args.confirmed = true;
      continue;
    }

    if (arg === "--json") {
      args.json = true;
      continue;
    }

    if (arg === "--repo-root") {
      const value = argv[index + 1];
      index += 1;
      if (!value) {
        throw new Error("repo_root_required");
      }
      args.repoRoot = path.resolve(value);
      continue;
    }

    throw new Error("unsupported_option");
  }

  return args;
}

function unquoteEnvValue(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function readAdminTokenFromMirror(filePath) {
  if (!fs.existsSync(filePath)) {
    return { found: false, category: "mirror_missing" };
  }

  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/u)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex < 0) continue;
    const name = trimmed.slice(0, equalsIndex).trim();
    if (name !== ADMIN_TOKEN_KEY) continue;
    const token = unquoteEnvValue(trimmed.slice(equalsIndex + 1));
    if (!token) {
      return { found: false, category: "token_empty" };
    }
    return { found: true, token, category: "token_present" };
  }

  return { found: false, category: "token_missing" };
}

function readCredentials(filePath) {
  if (!fs.existsSync(filePath)) {
    return { version: 1, profiles: {} };
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("credentials_file_invalid");
    }
    if (parsed.version !== 1 || !parsed.profiles || typeof parsed.profiles !== "object") {
      throw new Error("credentials_file_invalid");
    }
    return parsed;
  } catch {
    throw new Error("credentials_file_invalid");
  }
}

function writeCredentials(filePath, credentials) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  try {
    fs.chmodSync(dir, 0o700);
  } catch {
    // Platform may not support chmod. Do not report filesystem metadata beyond status category.
  }
  fs.writeFileSync(filePath, `${JSON.stringify(credentials, null, 2)}\n`, { mode: 0o600 });
  try {
    fs.chmodSync(filePath, 0o600);
  } catch {
    // Platform may not support chmod.
  }
}

function permissionStatus(filePath) {
  try {
    const mode = fs.statSync(filePath).mode & 0o777;
    return mode === 0o600 ? "chmod_600" : "permission_not_600";
  } catch {
    return "permission_unknown";
  }
}

function migrateAdminTokens({ repoRoot = defaultRepoRoot(), env = process.env } = {}) {
  const sources = {
    staging: path.join(repoRoot, "apps/web/.env.staging"),
    production: path.join(repoRoot, "apps/web/.env.production"),
  };
  const destination = credentialsPath(env);
  const sourceResults = {};
  let copiedCount = 0;

  const credentials = readCredentials(destination);
  credentials.version = 1;
  credentials.profiles = credentials.profiles && typeof credentials.profiles === "object" ? credentials.profiles : {};

  for (const opsEnv of OPS_ENVS) {
    const result = readAdminTokenFromMirror(sources[opsEnv]);
    if (result.found) {
      credentials.profiles[opsEnv] = {
        ...(credentials.profiles[opsEnv] ?? {}),
        adminApiToken: result.token,
      };
      copiedCount += 1;
    }
    sourceResults[opsEnv] = {
      tokenCopied: result.found,
      category: result.found ? "token_copied" : `${opsEnv}_token_missing`,
      sourceCategory: `${opsEnv}_env_mirror`,
    };
  }

  if (copiedCount === 0) {
    return {
      ok: false,
      error: "admin_tokens_missing",
      destinationPath: destination,
      profiles: sourceResults,
      permissionStatus: "not_written",
      valuesPrinted: false,
      lengthsPrinted: false,
      prefixesPrinted: false,
      suffixesPrinted: false,
      hashesPrinted: false,
      checksumsPrinted: false,
    };
  }

  writeCredentials(destination, credentials);

  return {
    ok: true,
    destinationPath: destination,
    profiles: sourceResults,
    permissionStatus: permissionStatus(destination),
    valuesPrinted: false,
    lengthsPrinted: false,
    prefixesPrinted: false,
    suffixesPrinted: false,
    hashesPrinted: false,
    checksumsPrinted: false,
  };
}

function formatPretty(result) {
  const staging = result.profiles.staging;
  const production = result.profiles.production;
  return [
    "ANYU one-time ops credential migration",
    `Destination: ${result.destinationPath}`,
    `Staging token copied: ${staging.tokenCopied ? "yes" : "no"}`,
    `Staging category: ${staging.category}`,
    `Production token copied: ${production.tokenCopied ? "yes" : "no"}`,
    `Production category: ${production.category}`,
    `Permission status: ${result.permissionStatus}`,
  ].join("\n") + "\n";
}

async function main(argv = process.argv.slice(2), io = { stdout: process.stdout, stderr: process.stderr, env: process.env }) {
  let json = argv.includes("--json");
  try {
    const args = parseArgs(argv);
    json = args.json;
    if (!args.confirmed) {
      throw new Error("owner_confirmation_required");
    }

    const result = migrateAdminTokens({ repoRoot: args.repoRoot, env: io.env });
    if (json) {
      io.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    } else {
      io.stdout.write(formatPretty(result));
    }
    return result.ok ? 0 : 1;
  } catch (error) {
    const code = error instanceof Error ? error.message : "unknown_error";
    if (json) {
      io.stderr.write(`${JSON.stringify({ ok: false, error: code })}\n`);
    } else {
      io.stderr.write(`ANYU migration error: ${code}\n`);
    }
    return 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = await main();
}

export {
  credentialsPath,
  formatPretty,
  main,
  migrateAdminTokens,
  parseArgs,
  readAdminTokenFromMirror,
};
