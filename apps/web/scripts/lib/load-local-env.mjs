import fs from "node:fs";
import path from "node:path";

function findWebAppDir(startDir = process.cwd()) {
  let current = path.resolve(startDir);

  while (true) {
    const directPackagePath = path.join(current, "package.json");
    const nestedWebPackagePath = path.join(current, "apps", "web", "package.json");

    if (fs.existsSync(directPackagePath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(directPackagePath, "utf8"));

        if (packageJson?.name === "anyu-next-web") {
          return current;
        }
      } catch {
        // Keep walking; this helper must not block scripts because of unrelated package JSON issues.
      }
    }

    if (fs.existsSync(nestedWebPackagePath)) {
      return path.join(current, "apps", "web");
    }

    const parent = path.dirname(current);

    if (parent === current) {
      return path.resolve(startDir);
    }

    current = parent;
  }
}

function parseLocalEnvContent(content) {
  const entries = [];

  for (const line of content.split(/\r?\n/u)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/u);

    if (!match) {
      continue;
    }

    const [, name, rawValue] = match;
    let value = rawValue.trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    } else {
      const commentIndex = value.search(/\s#/u);

      if (commentIndex >= 0) {
        value = value.slice(0, commentIndex).trimEnd();
      }
    }

    entries.push([name, value]);
  }

  return entries;
}

const DEFAULT_STAGING_ENV_FILE_NAME = ".env.staging";
const DEPRECATED_STAGING_ENV_FILE_NAME = ".env.local";

function loadLocalEnv(options = {}) {
  const webAppDir = options.webAppDir ?? findWebAppDir(options.startDir);
  const envFilePath =
    options.envFilePath ?? path.join(webAppDir, DEFAULT_STAGING_ENV_FILE_NAME);
  const loaded = [];
  const skippedExisting = [];
  const deprecatedEnvLocalPath = path.join(webAppDir, DEPRECATED_STAGING_ENV_FILE_NAME);

  if (!fs.existsSync(envFilePath)) {
    return {
      loaded,
      skippedExisting,
      envFilePath,
      envFilePresent: false,
      deprecatedEnvLocalPresent: fs.existsSync(deprecatedEnvLocalPath),
      defaultEnvFileName: DEFAULT_STAGING_ENV_FILE_NAME,
    };
  }

  const entries = parseLocalEnvContent(fs.readFileSync(envFilePath, "utf8"));

  for (const [name, value] of entries) {
    if (Object.prototype.hasOwnProperty.call(process.env, name)) {
      skippedExisting.push(name);
      continue;
    }

    process.env[name] = value;
    loaded.push(name);
  }

  return {
    loaded,
    skippedExisting,
    envFilePath,
    envFilePresent: true,
    deprecatedEnvLocalPresent: fs.existsSync(deprecatedEnvLocalPath),
    defaultEnvFileName: DEFAULT_STAGING_ENV_FILE_NAME,
  };
}

export {
  DEFAULT_STAGING_ENV_FILE_NAME,
  findWebAppDir,
  loadLocalEnv,
  parseLocalEnvContent,
};
