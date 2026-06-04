import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  assertSanitizedPreflightOutput,
  buildEnvChecklist,
  classifyReadiness,
  parseArgs,
  parseVercelEnvNames,
  readVercelProjectLink,
} from "../../scripts/production-payment-runtime-preflight.mjs";

const ALL_REQUIRED_NAMES = [
  "NEWEBPAY_MERCHANT_ID",
  "NEWEBPAY_HASH_KEY",
  "NEWEBPAY_HASH_IV",
  "NEWEBPAY_CHECKOUT_URL",
  "NEWEBPAY_NOTIFY_URL",
  "NEWEBPAY_ENVIRONMENT",
  "NEXT_PUBLIC_APP_URL",
  "ENABLE_PAYMENT_RUNTIME",
  "ENABLE_NEWEBPAY_CHECKOUT",
  "ENABLE_PAID_JOB_QUEUE_TRIGGER",
  "ENABLE_PAID_GENERATION_PROCESSOR",
  "PAYMENT_CHECKOUT_SESSION_SECRET",
  "PAID_ACCESS_TOKEN_HASH_SECRET",
  "PAID_JOB_QUEUE_PROVIDER",
  "PAID_JOB_QUEUE_TOPIC",
  "PAYMENT_RECOVERY_LINK_TOKEN_SECRET",
  "PAYMENT_RECOVERY_CONTACT_HASH_SECRET",
  "PAYMENT_RECOVERY_CONTACT_ENCRYPTION_KEY",
  "LINE_RECOVERY_RECIPIENT_ENCRYPTION_KEY",
  "EMAIL_PROVIDER",
  "EMAIL_FROM",
  "RESEND_API_KEY",
  "LINE_RECOVERY_MESSAGE_PROVIDER",
  "NEXT_PUBLIC_LINE_LIFF_URL",
  "LINE_CHANNEL_ACCESS_TOKEN",
  "DATABASE_URL",
];

function presence(names: string[]) {
  return {
    source: "local" as const,
    names: new Set(names),
    valuesAvailableForFlagChecks: true,
    localEnv: {
      pathPresent: true,
      valuesLoadedButNotPrinted: true,
      keyNamesOnly: true,
    },
  };
}

function classifyFromNames(names: string[], env: NodeJS.ProcessEnv = {}) {
  const envChecklist = buildEnvChecklist(
    presence(names),
    { mode: "dry-run" },
    env,
  );

  return classifyReadiness({
    envChecklist,
    dbSchema: {
      checked: true,
      ok: true,
      missingTables: [],
      missingAuditColumns: [],
    },
    productionSafety: {
      checked: true,
      ok: true,
    },
    projectLinking: {
      checked: true,
      ok: true,
    },
  });
}

describe("production payment runtime preflight", () => {
  it("registers the package command", () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf8"),
    );

    expect(packageJson.scripts["qa:production:payment-preflight"]).toBe(
      "node scripts/production-payment-runtime-preflight.mjs",
    );
  });

  it("parses dry-run and smoke-ready modes without enabling runtime", () => {
    expect(parseArgs(["--mode", "dry-run"]).mode).toBe("dry-run");
    expect(parseArgs(["--mode", "smoke-ready"]).mode).toBe("smoke-ready");
    expect(() => parseArgs(["--mode", "enable-runtime"])).toThrow("invalid_mode");
  });

  it("detects the missing checkout session secret that blocked smoke v0", () => {
    expect(
      classifyFromNames(ALL_REQUIRED_NAMES.filter((name) => name !== "PAYMENT_CHECKOUT_SESSION_SECRET")),
    ).toBe("blocked_missing_checkout_session_secret");
  });

  it("detects missing paid access token secret", () => {
    expect(
      classifyFromNames(ALL_REQUIRED_NAMES.filter((name) => name !== "PAID_ACCESS_TOKEN_HASH_SECRET")),
    ).toBe("blocked_missing_paid_access_secret");
  });

  it("detects missing queue and processor env", () => {
    expect(
      classifyFromNames(ALL_REQUIRED_NAMES.filter((name) => name !== "PAID_JOB_QUEUE_TOPIC")),
    ).toBe("blocked_missing_queue_env");
    expect(
      classifyFromNames(ALL_REQUIRED_NAMES.filter((name) => name !== "ENABLE_PAID_GENERATION_PROCESSOR")),
    ).toBe("blocked_missing_processor_env");
  });

  it("detects missing Email and LINE provider env", () => {
    expect(classifyFromNames(ALL_REQUIRED_NAMES.filter((name) => name !== "RESEND_API_KEY"))).toBe(
      "blocked_missing_email_env",
    );
    expect(
      classifyFromNames(ALL_REQUIRED_NAMES.filter((name) => name !== "LINE_CHANNEL_ACCESS_TOKEN")),
    ).toBe("blocked_missing_line_env");
  });

  it("blocks dry-run mode when local runtime flags are already enabled", () => {
    expect(
      classifyFromNames(ALL_REQUIRED_NAMES, {
        ENABLE_PAYMENT_RUNTIME: "true",
      } as NodeJS.ProcessEnv),
    ).toBe("blocked_runtime_flags_not_expected");
  });

  it("blocks when root and app Vercel project links are mismatched", () => {
    const envChecklist = buildEnvChecklist(
      presence(ALL_REQUIRED_NAMES),
      { mode: "dry-run" },
      {},
    );

    expect(
      classifyReadiness({
        envChecklist,
        dbSchema: {
          checked: true,
          ok: true,
          missingTables: [],
          missingAuditColumns: [],
        },
        productionSafety: {
          checked: true,
          ok: true,
        },
        projectLinking: {
          checked: true,
          ok: false,
        },
      }),
    ).toBe("blocked_project_link_mismatch");
  });

  it("parses Vercel production env names without values", () => {
    const names = parseVercelEnvNames(`
      Retrieving project…
      ENABLE_PAYMENT_RUNTIME                    Encrypted           Production
      PAYMENT_CHECKOUT_SESSION_SECRET           Encrypted           Production
      PAID_ACCESS_TOKEN_HASH_SECRET             Encrypted           Production
      RESEND_API_KEY                            Encrypted           Production
    `);

    expect(names.has("ENABLE_PAYMENT_RUNTIME")).toBe(true);
    expect(names.has("PAYMENT_CHECKOUT_SESSION_SECRET")).toBe(true);
    expect(names.has("PAID_ACCESS_TOKEN_HASH_SECRET")).toBe(true);
    expect(names.has("RESEND_API_KEY")).toBe(true);
    expect([...names]).not.toContain("Encrypted");
  });

  it("keeps output sanitized", () => {
    expect(() =>
      assertSanitizedPreflightOutput({
        ok: true,
        requiredNames: ["PAYMENT_CHECKOUT_SESSION_SECRET"],
      }),
    ).not.toThrow();

    expect(() =>
      assertSanitizedPreflightOutput({
        bad: ["postgres", "://user:pass@example.invalid/db"].join(""),
      }),
    ).toThrow("preflight_output_not_sanitized");
    expect(() =>
      assertSanitizedPreflightOutput({
        bad: ["pc", "s_abcdefghijklmnopqrstuvwxyz1234567890"].join(""),
      }),
    ).toThrow("preflight_output_not_sanitized");
  });

  it("reads Vercel project link metadata without env values", () => {
    const fixturePath = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), "vercel-link-")),
      "project.json",
    );

    fs.writeFileSync(
      fixturePath,
      JSON.stringify({
        orgId: "team_safe",
        projectId: "prj_safe",
        projectName: "anyu-next",
        settings: {
          rootDirectory: "apps/web",
        },
      }),
    );

    expect(readVercelProjectLink(fixturePath)).toMatchObject({
      pathPresent: true,
      orgId: "team_safe",
      projectId: "prj_safe",
      projectName: "anyu-next",
      rootDirectory: "apps/web",
    });
  });
});
