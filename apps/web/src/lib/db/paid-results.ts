import { and, desc, eq, sql } from "drizzle-orm";
import type { RichPaidResult } from "@/lib/ai/product-result-schema";
import { requireDb } from "@/lib/db/client";
import { analysisPaidResults } from "@/lib/db/schema";

export type PaidResultStatus = "pending" | "processing" | "completed" | "failed" | "expired";

export async function createPaidResultRecord(input: {
  analysisResultId: string;
  moduleId: string;
  themeSlug: string;
  paidResultJson?: RichPaidResult | null;
  status?: PaidResultStatus;
  requestedByUnlockIntentId?: string | null;
  requestedReason?: string | null;
  promptVersion?: string | null;
  schemaVersion?: string | null;
  model?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  failedAt?: Date | null;
  errorCode?: string | null;
  retryCount?: number;
  retentionExpiresAt?: Date | null;
}) {
  const db = requireDb();
  const now = new Date();

  const [record] = await db
    .insert(analysisPaidResults)
    .values({
      analysisResultId: input.analysisResultId,
      moduleId: input.moduleId,
      themeSlug: input.themeSlug,
      paidResultJson: input.paidResultJson ?? null,
      status: input.status ?? "pending",
      requestedByUnlockIntentId: input.requestedByUnlockIntentId ?? null,
      requestedReason: input.requestedReason ?? null,
      promptVersion: input.promptVersion ?? null,
      schemaVersion: input.schemaVersion ?? null,
      model: input.model ?? null,
      startedAt: input.startedAt ?? null,
      completedAt: input.completedAt ?? null,
      failedAt: input.failedAt ?? null,
      errorCode: input.errorCode ?? null,
      retryCount: input.retryCount ?? 0,
      retentionExpiresAt: input.retentionExpiresAt ?? null,
      updatedAt: now,
    })
    .returning();

  return record;
}

export async function createCompletedPaidResultShadowRecord(input: {
  analysisResultId: string;
  moduleId: string;
  themeSlug: string;
  paidResultJson: RichPaidResult;
  promptVersion: string;
  schemaVersion: string;
  model?: string | null;
  retentionExpiresAt?: Date | null;
}) {
  const now = new Date();

  return createPaidResultRecord({
    ...input,
    status: "completed",
    requestedReason: "shadow_current_analyze",
    startedAt: now,
    completedAt: now,
  });
}

export async function getPaidResultForAnalysisResult(input: {
  analysisResultId: string;
  status?: PaidResultStatus;
  promptVersion?: string;
  schemaVersion?: string;
}) {
  const db = requireDb();

  const [record] = await db
    .select()
    .from(analysisPaidResults)
    .where(
      and(
        eq(analysisPaidResults.analysisResultId, input.analysisResultId),
        input.status ? eq(analysisPaidResults.status, input.status) : undefined,
        input.promptVersion ? eq(analysisPaidResults.promptVersion, input.promptVersion) : undefined,
        input.schemaVersion ? eq(analysisPaidResults.schemaVersion, input.schemaVersion) : undefined,
      ),
    )
    .orderBy(desc(analysisPaidResults.createdAt))
    .limit(1);

  return record ?? null;
}

export async function markPaidResultProcessing(input: {
  paidResultId: string;
  startedAt?: Date;
  requestedByUnlockIntentId?: string | null;
  promptVersion?: string | null;
  schemaVersion?: string | null;
}) {
  const db = requireDb();
  const now = new Date();

  const [record] = await db
    .update(analysisPaidResults)
    .set({
      status: "processing",
      startedAt: input.startedAt ?? now,
      requestedByUnlockIntentId: input.requestedByUnlockIntentId ?? undefined,
      promptVersion: input.promptVersion ?? undefined,
      schemaVersion: input.schemaVersion ?? undefined,
      failedAt: null,
      errorCode: null,
      updatedAt: now,
    })
    .where(eq(analysisPaidResults.id, input.paidResultId))
    .returning();

  return record ?? null;
}

export async function markPaidResultCompleted(input: {
  paidResultId: string;
  paidResultJson: RichPaidResult;
  model?: string | null;
  completedAt?: Date;
}) {
  const db = requireDb();
  const now = new Date();

  const [record] = await db
    .update(analysisPaidResults)
    .set({
      status: "completed",
      paidResultJson: input.paidResultJson,
      model: input.model ?? null,
      completedAt: input.completedAt ?? now,
      failedAt: null,
      errorCode: null,
      updatedAt: now,
    })
    .where(eq(analysisPaidResults.id, input.paidResultId))
    .returning();

  return record ?? null;
}

export async function markPaidResultFailed(input: {
  paidResultId: string;
  errorCode: string;
  failedAt?: Date;
}) {
  const db = requireDb();
  const now = new Date();

  const [record] = await db
    .update(analysisPaidResults)
    .set({
      status: "failed",
      failedAt: input.failedAt ?? now,
      errorCode: input.errorCode,
      retryCount: sql`${analysisPaidResults.retryCount} + 1`,
      updatedAt: now,
    })
    .where(eq(analysisPaidResults.id, input.paidResultId))
    .returning();

  return record ?? null;
}
