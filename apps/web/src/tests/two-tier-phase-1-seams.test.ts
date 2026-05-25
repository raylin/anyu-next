import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { aiTemperatureDemoProductResult } from "@/lib/modules/demo-result";
import {
  adaptLegacyProductResult,
  combineFreeAndPaidForLegacyDisplay,
  extractFreeResult,
  extractPaidResult,
} from "@/lib/modules/result-adapters";

describe("two-tier phase 1 seams", () => {
  it("adds the additive migration for paid result storage and user context", () => {
    const migration = readFileSync(
      resolve(process.cwd(), "drizzle/0005_two_tier_phase_1.sql"),
      "utf8",
    );

    expect(migration).toContain('ALTER TABLE "analysis_requests" ADD COLUMN "user_context_json" jsonb');
    expect(migration).toContain('CREATE TABLE "analysis_paid_results"');
    expect(migration).toContain('"paid_result_json" jsonb');
    expect(migration).toContain('"retention_expires_at" timestamp with time zone');
  });

  it("keeps schema types aligned with the phase 1 storage seam", () => {
    const schema = readFileSync(
      resolve(process.cwd(), "src/lib/db/schema.ts"),
      "utf8",
    );

    expect(schema).toContain('userContextJson: jsonb("user_context_json")');
    expect(schema).toContain('export const analysisPaidResults = pgTable(');
    expect(schema).toContain('paidResultJson: jsonb("paid_result_json")');
    expect(schema).toContain('requestedByUnlockIntentId: uuid("requested_by_unlock_intent_id")');
  });

  it("splits and recombines the current full product result without changing display shape", () => {
    const freeResult = extractFreeResult(aiTemperatureDemoProductResult);
    const paidResult = extractPaidResult(aiTemperatureDemoProductResult);
    const adapted = adaptLegacyProductResult(aiTemperatureDemoProductResult);

    expect(freeResult).not.toHaveProperty("paid_result");
    expect(paidResult).toEqual(aiTemperatureDemoProductResult.paid_result);
    expect(adapted.freeResult).toEqual(freeResult);
    expect(adapted.paidResult).toEqual(paidResult);
    expect(
      combineFreeAndPaidForLegacyDisplay(freeResult, aiTemperatureDemoProductResult.paid_result),
    ).toEqual(aiTemperatureDemoProductResult);
  });

  it("keeps paid result repository helpers available for future lifecycle wiring", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/lib/db/paid-results.ts"),
      "utf8",
    );

    expect(source).toContain("createPaidResultRecord");
    expect(source).toContain("createCompletedPaidResultShadowRecord");
    expect(source).toContain("getPaidResultForAnalysisResult");
    expect(source).toContain("markPaidResultProcessing");
    expect(source).toContain("markPaidResultCompleted");
    expect(source).toContain("markPaidResultFailed");
  });
});
