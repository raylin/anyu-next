import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  assertSafeSummary,
  buildWaitSummary,
  parseArgs,
} from "../../scripts/module01-staging-result-wait.mjs";

describe("Module 01 staging result wait helper", () => {
  it("parses explicit inputs without env-file behavior", () => {
    expect(
      parseArgs([
        "--env",
        "staging",
        "--result-id",
        "11111111-1111-4111-8111-111111111111",
        "--timeout",
        "1000",
        "--interval",
        "50",
        "--json",
      ]),
    ).toMatchObject({
      env: "staging",
      resultId: "11111111-1111-4111-8111-111111111111",
      timeoutMs: 1000,
      intervalMs: 50,
      json: true,
    });
  });

  it("classifies completed paid result state as pass", () => {
    const summary = buildWaitSummary({
      environment: "staging",
      resultId: "11111111-1111-4111-8111-111111111111",
      attempts: 2,
      lookup: {
        ok: true,
        result: {
          paidResultStatus: "completed",
          deliveryArtifactReady: true,
        },
        payment: {
          status: "paid",
        },
        generation: {
          status: "completed",
        },
        accessLinks: {
          email: {
            contactSaved: true,
            sent: true,
            active: true,
          },
          line: {
            contactSaved: true,
            recipientSecretExists: true,
            sent: true,
            active: true,
          },
        },
      },
    });

    expect(summary).toMatchObject({
      status: "pass",
      resultIdPresent: true,
      resultIdSourceCategory: "explicit_staging_result_id",
      paidResultStatus: "completed",
      paymentStatus: "paid",
      generationStatus: "completed",
      accessLinkStatus: {
        email: {
          contactSaved: true,
          sent: true,
          active: true,
        },
        line: {
          contactSaved: true,
          recipientSecretExists: true,
          sent: true,
          active: true,
        },
      },
      sendsRealEmail: false,
      sendsRealLine: false,
      productionTouched: false,
    });
  });

  it("represents timeout and blocked states without private data", () => {
    const timeout = buildWaitSummary({
      environment: "staging",
      resultId: "11111111-1111-4111-8111-111111111111",
      status: "timeout",
      attempts: 3,
    });
    const blocked = buildWaitSummary({
      environment: "staging",
      resultId: "11111111-1111-4111-8111-111111111111",
      status: "blocked",
      blockers: ["admin_auth_failed"],
    });

    expect(timeout.status).toBe("timeout");
    expect(timeout.nextAction).toBe("inspect_admin_lookup_or_processor_state");
    expect(blocked.blockers).toEqual(["admin_auth_failed"]);
    expect(() => assertSafeSummary(timeout)).not.toThrow();
    expect(() =>
      assertSafeSummary({
        ...blocked,
        unsafe: ["pal", "unsafe_token_value"].join("_"),
      }),
    ).toThrow("module01_wait_summary_not_sanitized");
  });

  it("records only safe Admin token source metadata", () => {
    const summary = buildWaitSummary({
      environment: "staging",
      resultId: "11111111-1111-4111-8111-111111111111",
      status: "blocked",
      blockers: ["staging_admin_token_unavailable_owner_action_required"],
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

    expect(summary.adminToken).toMatchObject({
      sourceCategory: "staging_mirror",
      tokenPresent: true,
      valuesPrinted: false,
      lengthsPrinted: false,
      prefixesPrinted: false,
      suffixesPrinted: false,
      hashesPrinted: false,
      checksumsPrinted: false,
    });
    expect(JSON.stringify(summary)).not.toContain("ADMIN_API_TOKEN");
    expect(() => assertSafeSummary(summary)).not.toThrow();
  });

  it("uses the approved staging QA token resolver instead of raw shell-only token handling", () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), "scripts/module01-staging-result-wait.mjs"),
      "utf8",
    );

    expect(source).toContain("resolveAdminTokenForQa");
    expect(source).toContain("summarizeAdminTokenForQa");
    expect(source).toContain("staging_admin_token_unavailable_owner_action_required");
    expect(source).not.toContain("set_admin_api_token_in_process_env");
  });
});
