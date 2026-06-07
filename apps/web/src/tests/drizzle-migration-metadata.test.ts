import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const drizzleDir = resolve(process.cwd(), "drizzle");

describe("drizzle migration metadata", () => {
  it("journals every checked-in SQL migration", () => {
    const sqlTags = readdirSync(drizzleDir)
      .filter((fileName) => /^\d{4}_.+\.sql$/u.test(fileName))
      .map((fileName) => fileName.replace(/\.sql$/u, ""))
      .sort();
    const journal = JSON.parse(readFileSync(resolve(drizzleDir, "meta", "_journal.json"), "utf8")) as {
      entries: Array<{ tag: string }>;
    };
    const journalTags = journal.entries.map((entry) => entry.tag).sort();

    expect(journalTags).toEqual(sqlTags);
  });

  it("documents runtime config schema and delivery-key deactivation", () => {
    const runtimeConfigMigration = readFileSync(
      resolve(drizzleDir, "0014_runtime_config.sql"),
      "utf8",
    );
    const deliveryDeactivationMigration = readFileSync(
      resolve(drizzleDir, "0015_deactivate_unwired_delivery_runtime_config.sql"),
      "utf8",
    );

    expect(runtimeConfigMigration).toContain('CREATE TABLE IF NOT EXISTS "runtime_config_values"');
    expect(runtimeConfigMigration).toContain('CREATE TABLE IF NOT EXISTS "runtime_config_events"');
    expect(runtimeConfigMigration).toContain("payment.window.enabled");
    expect(runtimeConfigMigration).not.toContain("delivery.line.enabled");
    expect(deliveryDeactivationMigration).toContain("delivery.line.enabled");
    expect(deliveryDeactivationMigration).toContain("delivery.email.enabled");
    expect(deliveryDeactivationMigration).toContain('"active" = false');
  });
});
