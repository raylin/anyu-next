import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  assertSanitizedPreflightOutput,
  buildEnvChecklist,
  classifyReadiness,
  getLocalEnvPresence,
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
  "ENABLE_PAID_JOB_QUEUE_TRIGGER",
  "ENABLE_PAID_GENERATION_PROCESSOR",
  "INTERNAL_JOB_SECRET",
  "CRON_SECRET",
  "PAYMENT_CHECKOUT_SESSION_SECRET",
  "PAID_ACCESS_TOKEN_HASH_SECRET",
  "PAID_JOB_QUEUE_PROVIDER",
  "PAID_JOB_QUEUE_TOPIC",
  "ANTHROPIC_API_KEY",
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

function presenceWithValues(values: Record<string, string>) {
  return {
    source: "local" as const,
    names: new Set(Object.keys(values)),
    valueSource: new Map(Object.entries(values)),
    valuesAvailableForFlagChecks: true,
    localEnv: {
      pathPresent: true,
      valuesLoadedButNotPrinted: true,
      keyNamesOnly: true,
    },
  };
}

function safeValues(overrides: Record<string, string> = {}) {
  return Object.fromEntries(
    ALL_REQUIRED_NAMES.map((name) => [name, `${name.toLowerCase()}-configured`]).concat(
      Object.entries(overrides),
    ),
  );
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
    expect(
      classifyFromNames(ALL_REQUIRED_NAMES.filter((name) => name !== "INTERNAL_JOB_SECRET")),
    ).toBe("blocked_missing_processor_env");
    expect(
      classifyFromNames(ALL_REQUIRED_NAMES.filter((name) => name !== "CRON_SECRET")),
    ).toBe("blocked_missing_processor_env");
  });

  it("detects missing AI provider env needed by paid generation", () => {
    expect(
      classifyFromNames(
        ALL_REQUIRED_NAMES.filter(
          (name) => name !== "ANTHROPIC_API_KEY" && name !== "OPENAI_API_KEY",
        ),
      ),
    ).toBe("blocked_missing_ai_provider_env");
  });

  it("blocks empty local mirror secrets before controlled smoke readiness", () => {
    const envChecklist = buildEnvChecklist(
      presenceWithValues(safeValues({ CRON_SECRET: "   " })),
      { mode: "dry-run" },
      {},
    );

    expect(envChecklist.localMirrorShape.category).toBe("empty_local_mirror_secret");
    expect(envChecklist.localMirrorShape.emptyNames).toEqual(["CRON_SECRET"]);
    expect(
      classifyReadiness({
        envChecklist,
        dbSchema: { checked: true, ok: true, missingTables: [], missingAuditColumns: [] },
        productionSafety: { checked: true, ok: true },
        projectLinking: { checked: true, ok: true },
      }),
    ).toBe("blocked_empty_local_mirror_secret");
  });

  it("blocks placeholder local mirror secrets", () => {
    const envChecklist = buildEnvChecklist(
      presenceWithValues(safeValues({ INTERNAL_JOB_SECRET: "CHANGE_ME" })),
      { mode: "dry-run" },
      {},
    );

    expect(envChecklist.localMirrorShape.category).toBe("placeholder_local_mirror_secret");
    expect(envChecklist.localMirrorShape.placeholderNames).toEqual(["INTERNAL_JOB_SECRET"]);
    expect(
      classifyReadiness({
        envChecklist,
        dbSchema: { checked: true, ok: true, missingTables: [], missingAuditColumns: [] },
        productionSafety: { checked: true, ok: true },
        projectLinking: { checked: true, ok: true },
      }),
    ).toBe("blocked_placeholder_local_mirror_secret");
  });

  it("reports Vercel host value shape as unverified instead of passing it", () => {
    const envChecklist = buildEnvChecklist(
      {
        source: "vercel-production" as const,
        names: new Set(ALL_REQUIRED_NAMES),
        valueSource: new Map(Object.entries(safeValues())),
        valuesAvailableForFlagChecks: false,
        localEnv: { pathPresent: false, valuesLoadedButNotPrinted: false, keyNamesOnly: true },
      },
      { mode: "dry-run" },
      {},
    );

    expect(envChecklist.hostValueShape.category).toBe("host_value_shape_unverified");
    expect(envChecklist.hostValueShape.hostValueShapeUnverifiedNames).toContain("CRON_SECRET");
    expect(envChecklist.localMirrorShape.category).toBe("pass_mirror_shape");
  });

  it("detects missing Email and LINE provider env", () => {
    expect(classifyFromNames(ALL_REQUIRED_NAMES.filter((name) => name !== "RESEND_API_KEY"))).toBe(
      "blocked_missing_email_env",
    );
    expect(
      classifyFromNames(ALL_REQUIRED_NAMES.filter((name) => name !== "LINE_CHANNEL_ACCESS_TOKEN")),
    ).toBe("blocked_missing_line_env");
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

  it("blocks canonical Vercel project and alias mismatch categories", () => {
    const envChecklist = buildEnvChecklist(
      presenceWithValues(safeValues()),
      { mode: "dry-run" },
      {},
    );

    expect(
      classifyReadiness({
        envChecklist,
        dbSchema: { checked: true, ok: true, missingTables: [], missingAuditColumns: [] },
        productionSafety: { checked: true, ok: true },
        projectLinking: {
          checked: true,
          ok: false,
          rootProjectNameMismatch: true,
          aliasTarget: { checked: true, ok: false, category: "alias_target_mismatch" },
        },
      }),
    ).toBe("blocked_project_link_mismatch");
  });

  it("parses Vercel production env names without values", () => {
    const names = parseVercelEnvNames(`
      Retrieving project…
      ENABLE_PAID_GENERATION_PROCESSOR         Encrypted           Production
      PAYMENT_CHECKOUT_SESSION_SECRET           Encrypted           Production
      PAID_ACCESS_TOKEN_HASH_SECRET             Encrypted           Production
      RESEND_API_KEY                            Encrypted           Production
    `);

    expect(names.has("ENABLE_PAID_GENERATION_PROCESSOR")).toBe(true);
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

  it("uses explicit .env.production for local production mirror checks", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "anyu-production-env-"));
    const envProductionPath = path.join(dir, ".env.production");
    const envLegacyPath = path.join(dir, ".env");

    try {
      fs.writeFileSync(envProductionPath, "PAYMENT_CHECKOUT_SESSION_SECRET=from-production\n");
      fs.writeFileSync(envLegacyPath, "DATABASE_URL=deprecated\n");

      const localPresence = getLocalEnvPresence(
        {
          source: "local",
          mode: "dry-run",
          envFile: envProductionPath,
        },
        {},
      );

      expect(localPresence.names.has("PAYMENT_CHECKOUT_SESSION_SECRET")).toBe(true);
      expect(localPresence.names.has("DATABASE_URL")).toBe(false);
      expect(localPresence.localEnv.expectedFileName).toBe(".env.production");
    } finally {
      fs.rmSync(dir, { force: true, recursive: true });
    }
  });
});
