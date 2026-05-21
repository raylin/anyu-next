import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { ProductResult } from "@/lib/ai/product-result-schema";

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    anonymousSessionId: text("anonymous_session_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    anonymousSessionIdIdx: uniqueIndex("sessions_anonymous_session_id_idx").on(
      table.anonymousSessionId,
    ),
  }),
);

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventName: text("event_name").notNull(),
    moduleId: text("module_id").notNull(),
    themeSlug: text("theme_slug").notNull(),
    experimentId: text("experiment_id").notNull(),
    visualVariant: text("visual_variant").notNull(),
    promptVersion: text("prompt_version").notNull(),
    schemaVersion: text("schema_version").notNull(),
    situationType: text("situation_type"),
    scoreBucket: text("score_bucket"),
    anonymousSessionId: text("anonymous_session_id"),
    metadataJson: jsonb("metadata_json"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    eventNameIdx: index("events_event_name_idx").on(table.eventName),
    moduleThemeIdx: index("events_module_theme_idx").on(table.moduleId, table.themeSlug),
  }),
);

export const analysisRequests = pgTable(
  "analysis_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    moduleId: text("module_id").notNull(),
    themeSlug: text("theme_slug").notNull(),
    experimentId: text("experiment_id").notNull(),
    promptVersion: text("prompt_version").notNull(),
    schemaVersion: text("schema_version").notNull(),
    anonymousSessionId: text("anonymous_session_id"),
    situationType: text("situation_type"),
    inputCharCount: integer("input_char_count").notNull(),
    rawInputRedacted: text("raw_input_redacted"),
    cacheKeyVersion: text("cache_key_version"),
    cacheKeyHash: text("cache_key_hash"),
    modelStrategy: text("model_strategy"),
    primaryModel: text("primary_model"),
    status: text("status").default("created").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    failedAt: timestamp("failed_at", { withTimezone: true }),
    errorCode: text("error_code"),
    errorCategory: text("error_category"),
    resultId: uuid("result_id"),
    lastHeartbeatAt: timestamp("last_heartbeat_at", { withTimezone: true }),
    privacyFlags: jsonb("privacy_flags").$type<string[]>().default([]).notNull(),
    retentionExpiresAt: timestamp("retention_expires_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    requestModuleIdx: index("analysis_requests_module_idx").on(table.moduleId, table.themeSlug),
    cacheLookupIdx: index("analysis_requests_cache_idx").on(
      table.moduleId,
      table.themeSlug,
      table.cacheKeyVersion,
      table.cacheKeyHash,
    ),
    requestStatusIdx: index("analysis_requests_status_idx").on(table.status, table.createdAt),
  }),
);

export const analysisResults = pgTable(
  "analysis_results",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requestId: uuid("request_id")
      .notNull()
      .references(() => analysisRequests.id),
    moduleId: text("module_id").notNull(),
    themeSlug: text("theme_slug").notNull(),
    experimentId: text("experiment_id").notNull(),
    visualVariant: text("visual_variant").notNull(),
    promptVersion: text("prompt_version").notNull(),
    schemaVersion: text("schema_version").notNull(),
    score: integer("score"),
    scoreBucket: text("score_bucket"),
    stateLabel: text("state_label"),
    normalizedResultJson: jsonb("normalized_result_json")
      .$type<ProductResult>()
      .notNull(),
    provider: text("provider"),
    providerModel: text("provider_model"),
    providerRawJson: jsonb("provider_raw_json"),
    retentionExpiresAt: timestamp("retention_expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    requestIdIdx: uniqueIndex("analysis_results_request_id_idx").on(table.requestId),
    resultModuleIdx: index("analysis_results_module_idx").on(table.moduleId, table.themeSlug),
  }),
);

export const unlockIntents = pgTable(
  "unlock_intents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    resultId: uuid("result_id")
      .notNull()
      .references(() => analysisResults.id),
    moduleId: text("module_id").notNull(),
    themeSlug: text("theme_slug").notNull(),
    anonymousSessionId: text("anonymous_session_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    resultIdIdx: index("unlock_intents_result_id_idx").on(table.resultId),
  }),
);

export const contactSubmissions = pgTable(
  "contact_submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    resultId: uuid("result_id").references(() => analysisResults.id),
    unlockIntentId: uuid("unlock_intent_id").references(() => unlockIntents.id),
    moduleId: text("module_id").notNull(),
    themeSlug: text("theme_slug").notNull(),
    anonymousSessionId: text("anonymous_session_id"),
    email: text("email"),
    lineId: text("line_id"),
    consent: boolean("consent").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    resultContactIdx: index("contact_submissions_result_idx").on(table.resultId),
    unlockContactIdx: index("contact_submissions_unlock_idx").on(table.unlockIntentId),
  }),
);

export const analysisRequestRelations = relations(analysisRequests, ({ one }) => ({
  result: one(analysisResults, {
    fields: [analysisRequests.id],
    references: [analysisResults.requestId],
  }),
}));

export const analysisResultRelations = relations(analysisResults, ({ one, many }) => ({
  request: one(analysisRequests, {
    fields: [analysisResults.requestId],
    references: [analysisRequests.id],
  }),
  unlockIntents: many(unlockIntents),
  contactSubmissions: many(contactSubmissions),
}));

export const unlockIntentRelations = relations(unlockIntents, ({ one, many }) => ({
  result: one(analysisResults, {
    fields: [unlockIntents.resultId],
    references: [analysisResults.id],
  }),
  contactSubmissions: many(contactSubmissions),
}));

export const contactSubmissionRelations = relations(contactSubmissions, ({ one }) => ({
  result: one(analysisResults, {
    fields: [contactSubmissions.resultId],
    references: [analysisResults.id],
  }),
  unlockIntent: one(unlockIntents, {
    fields: [contactSubmissions.unlockIntentId],
    references: [unlockIntents.id],
  }),
}));
