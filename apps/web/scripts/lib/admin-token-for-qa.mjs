import fs from "node:fs";
import path from "node:path";

import { findWebAppDir, parseLocalEnvContent } from "./load-local-env.mjs";

const ADMIN_TOKEN_ENV_NAME = "ADMIN_API_TOKEN";

function readEnvFileValue(envFilePath, name) {
  if (!fs.existsSync(envFilePath)) {
    return "";
  }

  const entries = parseLocalEnvContent(fs.readFileSync(envFilePath, "utf8"));
  const entry = entries.find(([entryName]) => entryName === name);

  return entry?.[1]?.trim() ?? "";
}

function resolveAdminTokenForQa(options = {}) {
  const env = options.env ?? process.env;
  const targetEnv = options.envName ?? options.targetEnv ?? "staging";
  const processToken = env.ADMIN_API_TOKEN?.trim() ?? "";

  if (processToken) {
    return {
      token: processToken,
      sourceCategory: "process_env",
      tokenPresent: true,
      valuesPrinted: false,
      lengthsPrinted: false,
      prefixesPrinted: false,
      suffixesPrinted: false,
      hashesPrinted: false,
      checksumsPrinted: false,
    };
  }

  if (targetEnv !== "staging") {
    return {
      token: "",
      sourceCategory: "missing",
      tokenPresent: false,
      valuesPrinted: false,
      lengthsPrinted: false,
      prefixesPrinted: false,
      suffixesPrinted: false,
      hashesPrinted: false,
      checksumsPrinted: false,
    };
  }

  const webAppDir = options.webAppDir ?? findWebAppDir(options.startDir);
  const envFilePath = options.envFilePath ?? path.join(webAppDir, ".env.staging");
  const mirrorToken = readEnvFileValue(envFilePath, ADMIN_TOKEN_ENV_NAME);

  return {
    token: mirrorToken,
    sourceCategory: mirrorToken ? "staging_mirror" : "missing",
    tokenPresent: Boolean(mirrorToken),
    valuesPrinted: false,
    lengthsPrinted: false,
    prefixesPrinted: false,
    suffixesPrinted: false,
    hashesPrinted: false,
    checksumsPrinted: false,
  };
}

function summarizeAdminTokenForQa(resolution) {
  return {
    sourceCategory: resolution.sourceCategory,
    tokenPresent: Boolean(resolution.tokenPresent),
    valuesPrinted: false,
    lengthsPrinted: false,
    prefixesPrinted: false,
    suffixesPrinted: false,
    hashesPrinted: false,
    checksumsPrinted: false,
  };
}

export { resolveAdminTokenForQa, summarizeAdminTokenForQa };
