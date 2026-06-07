#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { loadModule01ValidAnalyzeFixture } from "./lib/module01-smoke-fixture.mjs";

const MODULE = "ai-temperature";
const OUTPUT_DIR = ".qa";
const OUTPUT_PATH = path.join(OUTPUT_DIR, "module01-mock-flow-summary.json");
const TARGETED_TESTS = [
  "src/tests/admin-paid-result-lookup.test.ts",
  "src/tests/admin-paid-result-lookup-route.test.ts",
  "src/tests/admin-line-bind-diagnostics-route.test.ts",
  "src/tests/newebpay-checkout-start-page.test.tsx",
  "src/tests/payment-recovery-email-route.test.ts",
  "src/tests/result-checkout-no-card-qa.test.ts",
  "src/tests/line-recovery-bind-route.test.ts",
  "src/tests/line-recovery-bind-diagnostics-route.test.ts",
  "src/tests/line-bind-diagnostic-events.test.ts",
  "src/tests/payment-recovery-contact-secrets.test.ts",
  "src/tests/email-recovery-link.test.ts",
  "src/tests/line-recovery-link.test.ts",
  "src/tests/line-recovery-bind-diagnostics.test.ts",
  "src/tests/paid-result-recovery-links.test.ts",
  "src/tests/paid-generation-service.test.ts",
  "src/tests/paid-generation-processor.test.ts",
  "src/tests/operator-fake-paid-success.test.ts",
  "src/tests/operator-fake-paid-success-route.test.ts",
];
const SCENARIOS = [
  {
    id: "email_happy_path",
    validates: [
      "email_save_route",
      "email_access_link_template",
      "email_access_link_send_helper",
      "paid_ready_email_auto_send",
    ],
    tests: ["src/tests/payment-recovery-email-route.test.ts", "src/tests/email-recovery-link.test.ts"],
  },
  {
    id: "email_save_to_mock_paid_access_link",
    validates: [
      "pre_payment_email_save_success",
      "checkout_unlock_after_email_save",
      "mock_paid_transition_uses_saved_email_contact",
      "paid_access_link_ready",
      "r_link_resolves_completed_paid_result",
      "no_real_email",
    ],
    tests: [
      "src/tests/payment-recovery-email-route.test.ts",
      "src/tests/result-checkout-no-card-qa.test.ts",
      "src/tests/operator-fake-paid-success.test.ts",
      "src/tests/operator-fake-paid-success-route.test.ts",
      "src/tests/paid-result-recovery-links.test.ts",
    ],
  },
  {
    id: "line_happy_path_with_recipient_secret",
    validates: [
      "verified_liff_bind",
      "recipient_secret_write",
      "line_access_link_send_helper",
      "deliverable_line_summary",
    ],
    tests: [
      "src/tests/line-recovery-bind-route.test.ts",
      "src/tests/payment-recovery-contact-secrets.test.ts",
      "src/tests/line-recovery-link.test.ts",
      "src/tests/admin-paid-result-lookup.test.ts",
    ],
  },
  {
    id: "line_liff_bind_success",
    validates: [
      "liff_state_valid",
      "id_token_present",
      "bind_api_success_category",
      "server_bind_success_event_recorded",
      "no_private_diagnostic_output",
    ],
    tests: [
      "src/tests/line-recovery-bind-diagnostics.test.ts",
      "src/tests/line-recovery-bind-route.test.ts",
      "src/tests/line-bind-diagnostic-events.test.ts",
    ],
  },
  {
    id: "line_liff_missing_state",
    validates: [
      "missing_liff_state_category",
      "email_fallback_available",
      "no_private_diagnostic_output",
    ],
    tests: ["src/tests/line-recovery-bind-diagnostics.test.ts"],
  },
  {
    id: "line_liff_missing_id_token",
    validates: [
      "id_token_missing_after_login_category",
      "client_diagnostic_event_recorded",
      "line_retry_or_email_fallback",
      "no_id_token_output",
    ],
    tests: [
      "src/tests/line-recovery-bind-diagnostics.test.ts",
      "src/tests/line-recovery-bind-diagnostics-route.test.ts",
      "src/tests/line-bind-diagnostic-events.test.ts",
    ],
  },
  {
    id: "line_bind_recipient_secret_failure",
    validates: [
      "recipient_secret_failure_category",
      "server_recipient_secret_failure_event_recorded",
      "line_bind_failure_safe_message",
      "no_raw_line_identity_output",
    ],
    tests: [
      "src/tests/line-recovery-bind-diagnostics.test.ts",
      "src/tests/line-recovery-bind-route.test.ts",
      "src/tests/line-bind-diagnostic-events.test.ts",
    ],
  },
  {
    id: "line_bind_admin_diagnostics_summary",
    validates: [
      "admin_api_auth_first",
      "admin_api_sanitized_line_bind_summary",
      "ops_cli_line_bind_lookup_path",
    ],
    tests: [
      "src/tests/admin-line-bind-diagnostics-route.test.ts",
      "src/tests/line-bind-diagnostic-events.test.ts",
    ],
  },
  {
    id: "line_email_fallback_after_bind_failure",
    validates: [
      "bind_failure_allows_email_fallback",
      "line_retry_available",
      "payment_not_unlocked_by_failed_line_bind",
    ],
    tests: [
      "src/tests/line-recovery-bind-diagnostics.test.ts",
      "src/tests/newebpay-checkout-start-page.test.tsx",
    ],
  },
  {
    id: "line_partial_bind_without_recipient_secret",
    validates: [
      "contact_only_not_deliverable",
      "contact_only_does_not_unlock_checkout",
      "recipient_secret_missing_diagnosis",
    ],
    tests: [
      "src/tests/line-recovery-bind-route.test.ts",
      "src/tests/newebpay-checkout-start-page.test.tsx",
      "src/tests/admin-paid-result-lookup.test.ts",
    ],
  },
  {
    id: "email_fallback_after_line_incomplete",
    validates: [
      "mobile_email_fallback_available",
      "line_incomplete_keeps_payment_locked",
      "email_saved_state_unlocks_payment",
    ],
    tests: ["src/tests/newebpay-checkout-start-page.test.tsx"],
  },
  {
    id: "paid_generation_to_admin_ready_summary",
    validates: [
      "mock_payment_truth_equivalent",
      "paid_generation_processor_completion",
      "paid_result_ready_admin_summary",
    ],
    tests: [
      "src/tests/paid-generation-service.test.ts",
      "src/tests/paid-generation-processor.test.ts",
      "src/tests/admin-paid-result-lookup-route.test.ts",
    ],
  },
];
const TOKEN_LIKE_PATTERNS = [
  /pa_[A-Za-z0-9_-]{8,}/u,
  /pcs_[A-Za-z0-9_-]{8,}/u,
  /pal_[A-Za-z0-9_-]{8,}/u,
  /prl_[A-Za-z0-9_-]{8,}/u,
  /\/r\/[A-Za-z0-9_-]{12,}/u,
  /token_hash/iu,
  /contact_hash/iu,
  /recipient_hash/iu,
  /encrypted_recipient/iu,
  /provider_payload/iu,
  /tradeinfo/iu,
  /tradesha/iu,
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/iu,
];

function buildMockFlowSummary(input) {
  const status = input.exitStatus === 0 ? "pass" : "blocked";
  const fixture = loadModule01ValidAnalyzeFixture();
  const scenarios = Object.fromEntries(
    SCENARIOS.map((scenario) => [
      scenario.id,
      {
        status,
        validates: scenario.validates,
        tests: scenario.tests,
        mutatesData: false,
        sendsRealEmail: false,
        sendsRealLine: false,
        productionTouched: false,
      },
    ]),
  );

  return {
    module: MODULE,
    environment: "local",
    command: "qa:module01:mock-flow",
    status,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    fixtureName: fixture.fixtureName,
    fixtureSource: "src/tests/fixtures/module01/valid-analyze-request.json",
    scenarios,
    checks: Object.fromEntries(SCENARIOS.map((scenario) => [scenario.id, status])),
    targetedTests: TARGETED_TESTS,
    blockers: status === "pass" ? [] : ["module01_mock_flow_tests_failed"],
    warnings: [
      "no_real_newebpay",
      "no_real_email",
      "no_real_line",
      "no_vercel_runtime",
      "first_slice_mock_flow_foundation",
    ],
    sendsRealEmail: false,
    sendsRealLine: false,
    mutatesData: false,
    productionTouched: false,
    nextRequiredAction: status === "pass" ? "use_for_backend_flow_regression" : "fix_mock_flow_tests",
  };
}

function assertSafeSummary(summary) {
  const serialized = JSON.stringify(summary);

  for (const pattern of TOKEN_LIKE_PATTERNS) {
    if (pattern.test(serialized)) {
      throw new Error("module01_mock_flow_summary_not_sanitized");
    }
  }

  return summary;
}

function writeSummary(summary, outputPath = path.resolve(process.cwd(), OUTPUT_PATH)) {
  const safeSummary = assertSafeSummary(summary);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(safeSummary, null, 2)}\n`);
  return outputPath;
}

function main() {
  const result = spawnSync("corepack", ["pnpm", "exec", "vitest", "run", ...TARGETED_TESTS], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      MODULE01_MOCK_FLOW_QA: "1",
    },
    stdio: "inherit",
  });
  const summary = buildMockFlowSummary({ exitStatus: result.status ?? 1 });
  const outputPath = writeSummary(summary);

  console.log(JSON.stringify({ step: "module01_mock_flow_summary", outputPath, ...summary }));
  process.exitCode = summary.status === "pass" ? 0 : 1;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main();
}

export { SCENARIOS, TARGETED_TESTS, assertSafeSummary, buildMockFlowSummary, writeSummary };
