import { and, eq } from "drizzle-orm";
import { requireDb } from "@/lib/db/client";
import {
  analysisRequests,
  analysisResults,
  contactSubmissions,
  events,
  sessions,
  unlockIntents,
} from "@/lib/db/schema";
import type { ProductResult } from "@/lib/ai/product-result-schema";
import type { EventPayload } from "@/lib/events/types";

export async function ensureSession(anonymousSessionId?: string | null) {
  if (!anonymousSessionId?.trim()) {
    return;
  }

  const db = requireDb();

  await db
    .insert(sessions)
    .values({ anonymousSessionId: anonymousSessionId.trim() })
    .onConflictDoNothing();
}

export async function insertEvent(payload: EventPayload) {
  const db = requireDb();

  await ensureSession(payload.anonymousSessionId);

  const [record] = await db
    .insert(events)
    .values({
      eventName: payload.eventName,
      moduleId: payload.moduleId,
      themeSlug: payload.themeSlug,
      experimentId: payload.experimentId,
      visualVariant: payload.visualVariant,
      promptVersion: payload.promptVersion,
      schemaVersion: payload.schemaVersion,
      situationType: payload.situationType ?? null,
      scoreBucket: payload.scoreBucket ?? null,
      anonymousSessionId: payload.anonymousSessionId ?? null,
      metadataJson: payload.metadata ?? null,
    })
    .returning();

  return record;
}

export async function createAnalysisRequestRecord(input: {
  moduleId: string;
  themeSlug: string;
  experimentId: string;
  promptVersion: string;
  schemaVersion: string;
  anonymousSessionId?: string | null;
  situationType?: string | null;
  inputCharCount: number;
  rawInputRedacted?: string | null;
  privacyFlags?: string[];
  retentionExpiresAt?: Date | null;
}) {
  const db = requireDb();

  await ensureSession(input.anonymousSessionId);

  const [record] = await db
    .insert(analysisRequests)
    .values({
      moduleId: input.moduleId,
      themeSlug: input.themeSlug,
      experimentId: input.experimentId,
      promptVersion: input.promptVersion,
      schemaVersion: input.schemaVersion,
      anonymousSessionId: input.anonymousSessionId ?? null,
      situationType: input.situationType ?? null,
      inputCharCount: input.inputCharCount,
      rawInputRedacted: input.rawInputRedacted ?? null,
      privacyFlags: input.privacyFlags ?? [],
      retentionExpiresAt: input.retentionExpiresAt ?? null,
    })
    .returning();

  return record;
}

export async function createAnalysisResultRecord(input: {
  requestId: string;
  moduleId: string;
  themeSlug: string;
  experimentId: string;
  visualVariant: string;
  promptVersion: string;
  schemaVersion: string;
  score?: number | null;
  scoreBucket?: string | null;
  stateLabel?: string | null;
  normalizedResultJson: ProductResult;
  provider?: string | null;
  providerModel?: string | null;
  providerRawJson?: unknown;
  retentionExpiresAt?: Date | null;
}) {
  const db = requireDb();

  const [record] = await db
    .insert(analysisResults)
    .values({
      requestId: input.requestId,
      moduleId: input.moduleId,
      themeSlug: input.themeSlug,
      experimentId: input.experimentId,
      visualVariant: input.visualVariant,
      promptVersion: input.promptVersion,
      schemaVersion: input.schemaVersion,
      score: input.score ?? null,
      scoreBucket: input.scoreBucket ?? null,
      stateLabel: input.stateLabel ?? null,
      normalizedResultJson: input.normalizedResultJson,
      provider: input.provider ?? null,
      providerModel: input.providerModel ?? null,
      providerRawJson: input.providerRawJson ?? null,
      retentionExpiresAt: input.retentionExpiresAt ?? null,
    })
    .returning();

  return record;
}

export async function getAnalysisResultRecordById(
  id: string,
  moduleId: string,
  themeSlug: string,
) {
  const db = requireDb();

  const [record] = await db
    .select()
    .from(analysisResults)
    .where(
      and(
        eq(analysisResults.id, id),
        eq(analysisResults.moduleId, moduleId),
        eq(analysisResults.themeSlug, themeSlug),
      ),
    );

  return record ?? null;
}

export async function createUnlockIntentRecord(input: {
  resultId: string;
  moduleId: string;
  themeSlug: string;
  anonymousSessionId?: string | null;
}) {
  const db = requireDb();

  await ensureSession(input.anonymousSessionId);

  const [record] = await db
    .insert(unlockIntents)
    .values({
      resultId: input.resultId,
      moduleId: input.moduleId,
      themeSlug: input.themeSlug,
      anonymousSessionId: input.anonymousSessionId ?? null,
    })
    .returning();

  return record;
}

export async function createContactSubmissionRecord(input: {
  resultId?: string | null;
  unlockIntentId?: string | null;
  moduleId: string;
  themeSlug: string;
  anonymousSessionId?: string | null;
  email?: string | null;
  lineId?: string | null;
  consent: boolean;
}) {
  const db = requireDb();

  await ensureSession(input.anonymousSessionId);

  const [record] = await db
    .insert(contactSubmissions)
    .values({
      resultId: input.resultId ?? null,
      unlockIntentId: input.unlockIntentId ?? null,
      moduleId: input.moduleId,
      themeSlug: input.themeSlug,
      anonymousSessionId: input.anonymousSessionId ?? null,
      email: input.email ?? null,
      lineId: input.lineId ?? null,
      consent: input.consent,
    })
    .returning();

  return record;
}
