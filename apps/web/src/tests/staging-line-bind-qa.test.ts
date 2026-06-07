import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildSummary,
  parseArgs,
  parseJsonOutput,
} from "../../scripts/staging-line-bind-lookup-qa.mjs";

describe("staging LINE bind QA helpers", () => {
  it("registers focused prepare and lookup package scripts", () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf8"),
    );

    expect(packageJson.scripts["qa:module01:staging-line-bind:prepare"]).toBe(
      "node scripts/staging-line-bind-prepare-qa.mjs",
    );
    expect(packageJson.scripts["qa:module01:staging-line-bind:lookup"]).toBe(
      "node scripts/staging-line-bind-lookup-qa.mjs",
    );
  });

  it("keeps prepare helper focused on result creation and mobile checkout readiness", () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), "scripts/staging-line-bind-prepare-qa.mjs"),
      "utf8",
    );

    expect(source).toContain("REQUEST_OUTPUT_FILE");
    expect(source).toContain("recoveryLineFirstMobilePresent");
    expect(source).toContain("lineBeforeEmail");
    expect(source).not.toContain("fakePaidSuccess");
    expect(source).not.toContain("saveEmailRecoveryContact");
  });

  it("parses lookup args and JSON output", () => {
    expect(parseArgs(["--result-id", "11111111-1111-4111-8111-111111111111", "--json"])).toEqual({
      resultId: "11111111-1111-4111-8111-111111111111",
      json: true,
    });
    expect(parseJsonOutput(`prefix\n${JSON.stringify({ ok: true, value: 1 })}`)).toEqual({
      ok: true,
      value: 1,
    });
  });

  it("summarizes successful LINE bind state without private fields", () => {
    const summary = buildSummary({
      resultId: "11111111-1111-4111-8111-111111111111",
      tokenResolution: {
        sourceCategory: "staging_mirror",
        tokenPresent: true,
      },
      lineBindResult: {
        status: 0,
        parsed: {
          ok: true,
          diagnostics: {
            latestCategory: "bind_api_success",
            latestStage: "server",
            latestStatus: "succeeded",
            eventCount: 3,
            recommendedActions: [],
          },
        },
      },
      lookupResult: {
        status: 0,
        parsed: {
          ok: true,
          lookup: {
            accessLinks: {
              line: {
                contactSaved: true,
                recipientSecretExists: true,
                deliverable: true,
                latestContactStatus: "active",
                latestSaveCategory: "line_bind_success",
                latestSaveStatus: "succeeded",
              },
            },
            diagnosis: [],
          },
        },
      },
    });

    expect(summary).toMatchObject({
      status: "pass",
      gateStatus: "pass",
      adminToken: {
        sourceCategory: "staging_mirror",
        tokenPresent: true,
        valuesPrinted: false,
        lengthsPrinted: false,
        prefixesPrinted: false,
        suffixesPrinted: false,
        hashesPrinted: false,
        checksumsPrinted: false,
      },
      lookupResult: {
        lineContactSaved: true,
        recipientSecretExists: true,
        deliverable: true,
      },
    });
    expect(JSON.stringify(summary)).not.toContain("lineUserId");
    expect(JSON.stringify(summary)).not.toContain("idToken");
  });

  it("blocks when LINE contact is not deliverable", () => {
    const summary = buildSummary({
      resultId: "11111111-1111-4111-8111-111111111111",
      tokenResolution: {
        sourceCategory: "process_env",
        tokenPresent: true,
      },
      lineBindResult: {
        status: 0,
        parsed: {
          ok: true,
          diagnostics: {
            latestCategory: "bind_api_recipient_secret_failed",
            latestStage: "server",
            latestStatus: "failed",
            eventCount: 2,
            recommendedActions: ["retry_line_bind"],
          },
        },
      },
      lookupResult: {
        status: 0,
        parsed: {
          ok: true,
          lookup: {
            accessLinks: {
              line: {
                contactSaved: true,
                recipientSecretExists: false,
                deliverable: false,
              },
            },
            diagnosis: ["line_recipient_secret_missing"],
          },
        },
      },
    });

    expect(summary.status).toBe("blocked");
    expect(summary.blockers).toContain("line_bind_diagnostics_not_success");
    expect(summary.blockers).toContain("line_contact_not_deliverable");
  });
});
