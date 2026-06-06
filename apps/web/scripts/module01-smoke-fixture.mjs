#!/usr/bin/env node

import path from "node:path";
import { writeModule01SmokeFixtureArtifacts } from "./lib/module01-smoke-fixture.mjs";

function parseArgs(argv) {
  const parsed = {
    outputDir: ".qa",
    suffix: "",
    json: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--json") {
      parsed.json = true;
    } else if (arg === "--output-dir") {
      parsed.outputDir = argv[index + 1] ?? parsed.outputDir;
      index += 1;
    } else if (arg === "--suffix") {
      parsed.suffix = argv[index + 1] ?? "";
      index += 1;
    } else if (arg !== "--") {
      throw new Error(`unknown_argument:${arg}`);
    }
  }

  return parsed;
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const result = writeModule01SmokeFixtureArtifacts({
      outputDir: args.outputDir,
      suffix: args.suffix,
    });
    const output = {
      ...result.summary,
      requestArtifact: path.relative(process.cwd(), result.requestPath),
      summaryArtifact: path.relative(process.cwd(), result.summaryPath),
      requestTextPrinted: false,
    };

    console.log(JSON.stringify(output, null, args.json ? 2 : 0));
    process.exitCode = output.status === "pass" ? 0 : 1;
  } catch (error) {
    console.error(
      JSON.stringify({
        module: "ai-temperature",
        command: "qa:module01:smoke-fixture",
        status: "blocked",
        error: error instanceof Error ? error.message : "unknown_error",
        requestTextPrinted: false,
      }),
    );
    process.exitCode = 1;
  }
}

main();
