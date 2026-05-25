import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { requireDb } from "@/lib/db/client";
import {
  analysisRequests,
  analysisResults,
  contactSubmissions,
  events,
  lineWebhookEvents,
  lineWebhookRateLimits,
  sessions,
  unlockIntents,
} from "@/lib/db/schema";
import type { ProductResult } from "@/lib/ai/product-result-schema";
import type { EventPayload } from "@/lib/events/types";
import type { AiTemperatureUserContext } from "@/lib/modules/ai-temperature-context";

export type AnalysisRequestStatus =
  | "created"
  | "validating"
  | "analyzing"
  | "validating_result"
  | "persisting"
  | "completed"
  | "failed"
  | "expired";

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

export async function tryCreateLineWebhookEvent(input: {
  dedupeKey: string;
  eventType: string;
}) {
  const db = requireDb();

  const [record] = await db
    .insert(lineWebhookEvents)
    .values({
      dedupeKey: input.dedupeKey,
      eventType: input.eventType,
      status: "processing",
    })
    .onConflictDoNothing({
      target: lineWebhookEvents.dedupeKey,
    })
    .returning();

  return record ? "created" : "duplicate";
}

export async function markLineWebhookEventProcessed(input: {
  dedupeKey: string;
  status: "processed" | "ignored" | "failed" | "rate_limited";
  errorCode?: string | null;
}) {
  const db = requireDb();

  const [record] = await db
    .update(lineWebhookEvents)
    .set({
      status: input.status,
      errorCode: input.errorCode ?? null,
      processedAt: new Date(),
    })
    .where(eq(lineWebhookEvents.dedupeKey, input.dedupeKey))
    .returning();

  return record ?? null;
}

export async function recordLineWebhookInvalidAttempt(input: {
  lineUserIdHash: string;
  windowStart: Date;
}) {
  const db = requireDb();
  const now = new Date();

  const [record] = await db
    .insert(lineWebhookRateLimits)
    .values({
      lineUserIdHash: input.lineUserIdHash,
      windowStart: input.windowStart,
      invalidAttemptCount: 1,
      lastAttemptAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: lineWebhookRateLimits.lineUserIdHash,
      set: {
        windowStart: input.windowStart,
        invalidAttemptCount: sql`CASE WHEN ${lineWebhookRateLimits.windowStart} = ${input.windowStart} THEN ${lineWebhookRateLimits.invalidAttemptCount} + 1 ELSE 1 END`,
        lastAttemptAt: now,
        updatedAt: now,
      },
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
  cacheKeyVersion?: string | null;
  cacheKeyHash?: string | null;
  modelStrategy?: string | null;
  primaryModel?: string | null;
  privacyFlags?: string[];
  userContextJson?: AiTemperatureUserContext | null;
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
      cacheKeyVersion: input.cacheKeyVersion ?? null,
      cacheKeyHash: input.cacheKeyHash ?? null,
      modelStrategy: input.modelStrategy ?? null,
      primaryModel: input.primaryModel ?? null,
      status: "created",
      privacyFlags: input.privacyFlags ?? [],
      userContextJson: input.userContextJson ?? null,
      retentionExpiresAt: input.retentionExpiresAt ?? null,
    })
    .returning();

  return record;
}

export async function updateAnalysisRequestState(input: {
  requestId: string;
  status: AnalysisRequestStatus;
  startedAt?: Date | null;
  completedAt?: Date | null;
  failedAt?: Date | null;
  errorCode?: string | null;
  errorCategory?: string | null;
  resultId?: string | null;
  lastHeartbeatAt?: Date | null;
}) {
  const db = requireDb();
  const values: Partial<typeof analysisRequests.$inferInsert> = {
    status: input.status,
    lastHeartbeatAt: input.lastHeartbeatAt ?? new Date(),
  };

  if (input.startedAt !== undefined) {
    values.startedAt = input.startedAt;
  }

  if (input.completedAt !== undefined) {
    values.completedAt = input.completedAt;
  }

  if (input.failedAt !== undefined) {
    values.failedAt = input.failedAt;
  }

  if (input.errorCode !== undefined) {
    values.errorCode = input.errorCode;
  }

  if (input.errorCategory !== undefined) {
    values.errorCategory = input.errorCategory;
  }

  if (input.resultId !== undefined) {
    values.resultId = input.resultId;
  }

  const [record] = await db
    .update(analysisRequests)
    .set(values)
    .where(eq(analysisRequests.id, input.requestId))
    .returning();

  return record ?? null;
}

export async function getAnalysisRequestStatusRecord(input: {
  requestId: string;
  moduleId: string;
  themeSlug: string;
}) {
  const db = requireDb();

  const [record] = await db
    .select({
      request: analysisRequests,
      result: analysisResults,
    })
    .from(analysisRequests)
    .leftJoin(analysisResults, eq(analysisResults.requestId, analysisRequests.id))
    .where(
      and(
        eq(analysisRequests.id, input.requestId),
        eq(analysisRequests.moduleId, input.moduleId),
        eq(analysisRequests.themeSlug, input.themeSlug),
        isNull(analysisRequests.deletedAt),
      ),
    )
    .limit(1);

  return record ?? null;
}

export async function getCachedAnalysisResult(input: {
  moduleId: string;
  themeSlug: string;
  cacheKeyVersion: string;
  cacheKeyHash: string;
  now?: Date;
}) {
  const db = requireDb();
  const currentTime = input.now ?? new Date();

  const [record] = await db
    .select({
      request: analysisRequests,
      result: analysisResults,
    })
    .from(analysisRequests)
    .innerJoin(analysisResults, eq(analysisResults.requestId, analysisRequests.id))
    .where(
      and(
        eq(analysisRequests.moduleId, input.moduleId),
        eq(analysisRequests.themeSlug, input.themeSlug),
        eq(analysisRequests.cacheKeyVersion, input.cacheKeyVersion),
        eq(analysisRequests.cacheKeyHash, input.cacheKeyHash),
        isNull(analysisRequests.deletedAt),
        gt(analysisRequests.retentionExpiresAt, currentTime),
        gt(analysisResults.retentionExpiresAt, currentTime),
      ),
    )
    .orderBy(desc(analysisResults.createdAt))
    .limit(1);

  return record ?? null;
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
  fulfillmentCodeHash?: string | null;
  fulfillmentToken?: string | null;
  fulfillmentTokenHash?: string | null;
  fulfillmentExpiresAt?: Date | null;
  unlockTokenExpiresAt?: Date | null;
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
      fulfillmentCodeHash: input.fulfillmentCodeHash ?? null,
      fulfillmentToken: input.fulfillmentToken ?? null,
      fulfillmentTokenHash: input.fulfillmentTokenHash ?? null,
      fulfillmentStatus: "pending",
      fulfillmentExpiresAt: input.fulfillmentExpiresAt ?? null,
      unlockTokenExpiresAt: input.unlockTokenExpiresAt ?? null,
    })
    .returning();

  return record;
}

export async function getUnlockIntentByTokenHash(tokenHash: string) {
  const db = requireDb();

  const [record] = await db
    .select({
      unlockIntent: unlockIntents,
      result: analysisResults,
    })
    .from(unlockIntents)
    .innerJoin(analysisResults, eq(analysisResults.id, unlockIntents.resultId))
    .where(eq(unlockIntents.fulfillmentTokenHash, tokenHash))
    .limit(1);

  return record ?? null;
}

export async function getUnlockIntentByCodeHash(codeHash: string) {
  const db = requireDb();

  const [record] = await db
    .select({
      unlockIntent: unlockIntents,
      result: analysisResults,
    })
    .from(unlockIntents)
    .innerJoin(analysisResults, eq(analysisResults.id, unlockIntents.resultId))
    .where(eq(unlockIntents.fulfillmentCodeHash, codeHash))
    .orderBy(desc(unlockIntents.createdAt))
    .limit(1);

  return record ?? null;
}

export async function bindUnlockIntentToLine(input: {
  unlockIntentId: string;
  lineUserId: string;
  channel: "liff" | "line_code";
  delivered?: boolean;
  lastDeliveryError?: string | null;
}) {
  const db = requireDb();
  const now = new Date();

  const [record] = await db
    .update(unlockIntents)
    .set({
      lineUserId: input.lineUserId,
      fulfillmentChannel: input.channel,
      fulfillmentStatus: input.delivered ? "delivered" : "bound",
      lineBoundAt: now,
      fulfilledAt: input.delivered ? now : null,
      lastDeliveryAt: input.delivered ? now : null,
      lastDeliveryError: input.lastDeliveryError ?? null,
    })
    .where(eq(unlockIntents.id, input.unlockIntentId))
    .returning();

  return record ?? null;
}

export async function markUnlockIntentDeliveryAttempt(input: {
  unlockIntentId: string;
  status: "delivered" | "failed";
  error?: string | null;
}) {
  const db = requireDb();
  const now = new Date();

  const [record] = await db
    .update(unlockIntents)
    .set({
      fulfillmentStatus: input.status,
      fulfilledAt: input.status === "delivered" ? now : null,
      lastDeliveryAt: now,
      lastDeliveryError: input.error ?? null,
      deliveryAttemptCount: sql`${unlockIntents.deliveryAttemptCount} + 1`,
    })
    .where(eq(unlockIntents.id, input.unlockIntentId))
    .returning();

  return record ?? null;
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
