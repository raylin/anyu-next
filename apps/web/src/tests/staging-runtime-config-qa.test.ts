import { describe, expect, it } from "vitest";

import {
  buildSummary,
  parseJsonOutput,
  valueFromConfigResponse,
} from "../../scripts/staging-runtime-config-qa.mjs";

describe("staging runtime config QA helper", () => {
  it("parses pnpm ops JSON output without requiring pretty output", () => {
    const parsed = parseJsonOutput(`prefix\n${JSON.stringify({
      ok: true,
      env: "staging",
      response: {
        config: {
          key: "payment.window.enabled",
          value: true,
        },
      },
    })}`);

    expect(parsed?.ok).toBe(true);
    expect(valueFromConfigResponse(parsed)).toBe(true);
  });

  it("builds a sanitized pass summary for expected staging runtime config values", () => {
    const summary = buildSummary(
      [
        {
          key: "payment.window.enabled",
          commandStatus: 0,
          parsed: {
            ok: true,
            response: { config: { value: true } },
          },
          stderrPresent: false,
        },
        {
          key: "payment.global.disabled",
          commandStatus: 0,
          parsed: {
            ok: true,
            response: { config: { value: false } },
          },
          stderrPresent: false,
        },
      ],
      {
        sourceCategory: "staging_mirror",
        tokenPresent: true,
      },
    );

    expect(summary).toMatchObject({
      status: "pass",
      gateStatus: "pass",
      environment: "staging",
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
    });
    expect(JSON.stringify(summary)).not.toContain("ADMIN_API_TOKEN");
  });

  it("blocks when a required config value does not match", () => {
    const summary = buildSummary(
      [
        {
          key: "payment.window.enabled",
          commandStatus: 0,
          parsed: {
            ok: true,
            response: { config: { value: false } },
          },
          stderrPresent: false,
        },
      ],
      {
        sourceCategory: "process_env",
        tokenPresent: true,
      },
    );

    expect(summary.status).toBe("blocked");
    expect(summary.checks[0]).toMatchObject({
      status: "blocked",
      valueMatchesExpected: false,
      responseSanitized: true,
    });
  });
});
