import { relations, sql } from "drizzle-orm";
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
import type { RichPaidResult } from "@/lib/ai/product-result-schema";
import type { AiTemperatureUserContext } from "@/lib/modules/ai-temperature-context";

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

export const lineWebhookEvents = pgTable(
  "line_webhook_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    dedupeKey: text("dedupe_key").notNull(),
    eventType: text("event_type").notNull(),
    status: text("status").default("processing").notNull(),
    errorCode: text("error_code"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (table) => ({
    dedupeKeyIdx: uniqueIndex("line_webhook_events_dedupe_key_idx").on(table.dedupeKey),
    statusIdx: index("line_webhook_events_status_idx").on(table.status, table.createdAt),
  }),
);

export const lineWebhookRateLimits = pgTable(
  "line_webhook_rate_limits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    lineUserIdHash: text("line_user_id_hash").notNull(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    invalidAttemptCount: integer("invalid_attempt_count").default(1).notNull(),
    lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    lineUserIdHashIdx: uniqueIndex("line_webhook_rate_limits_user_idx").on(
      table.lineUserIdHash,
    ),
    windowIdx: index("line_webhook_rate_limits_window_idx").on(
      table.windowStart,
      table.invalidAttemptCount,
    ),
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
    userContextJson: jsonb("user_context_json").$type<AiTemperatureUserContext>(),
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
    fulfillmentCodeHash: text("fulfillment_code_hash"),
    fulfillmentToken: text("fulfillment_token"),
    fulfillmentTokenHash: text("fulfillment_token_hash"),
    fulfillmentStatus: text("fulfillment_status").default("pending").notNull(),
    fulfillmentChannel: text("fulfillment_channel"),
    lineUserId: text("line_user_id"),
    lineBoundAt: timestamp("line_bound_at", { withTimezone: true }),
    fulfilledAt: timestamp("fulfilled_at", { withTimezone: true }),
    fulfillmentExpiresAt: timestamp("fulfillment_expires_at", { withTimezone: true }),
    unlockTokenExpiresAt: timestamp("unlock_token_expires_at", { withTimezone: true }),
    deliveryAttemptCount: integer("delivery_attempt_count").default(0).notNull(),
    lastDeliveryError: text("last_delivery_error"),
    lastDeliveryAt: timestamp("last_delivery_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    resultIdIdx: index("unlock_intents_result_id_idx").on(table.resultId),
    fulfillmentCodeHashIdx: index("unlock_intents_fulfillment_code_hash_idx").on(
      table.fulfillmentCodeHash,
    ),
    fulfillmentTokenHashIdx: index("unlock_intents_fulfillment_token_hash_idx").on(
      table.fulfillmentTokenHash,
    ),
    fulfillmentStatusIdx: index("unlock_intents_fulfillment_status_idx").on(
      table.fulfillmentStatus,
      table.fulfillmentExpiresAt,
    ),
  }),
);

export const analysisPaidResults = pgTable(
  "analysis_paid_results",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    analysisResultId: uuid("analysis_result_id")
      .notNull()
      .references(() => analysisResults.id),
    moduleId: text("module_id").notNull(),
    themeSlug: text("theme_slug").notNull(),
    paidResultJson: jsonb("paid_result_json").$type<RichPaidResult>(),
    status: text("status").default("pending").notNull(),
    requestedByUnlockIntentId: uuid("requested_by_unlock_intent_id").references(() => unlockIntents.id),
    requestedReason: text("requested_reason"),
    promptVersion: text("prompt_version"),
    schemaVersion: text("schema_version"),
    model: text("model"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    failedAt: timestamp("failed_at", { withTimezone: true }),
    errorCode: text("error_code"),
    retryCount: integer("retry_count").default(0).notNull(),
    retentionExpiresAt: timestamp("retention_expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    analysisResultIdx: index("analysis_paid_results_result_idx").on(table.analysisResultId),
    unlockIntentIdx: index("analysis_paid_results_unlock_intent_idx").on(table.requestedByUnlockIntentId),
    statusIdx: index("analysis_paid_results_status_idx").on(table.status, table.createdAt),
    cacheLookupIdx: index("analysis_paid_results_lookup_idx").on(
      table.moduleId,
      table.themeSlug,
      table.status,
      table.retentionExpiresAt,
    ),
  }),
);

export const generationJobs = pgTable(
  "generation_jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobType: text("job_type").notNull(),
    status: text("status").default("queued").notNull(),
    priority: integer("priority").default(50).notNull(),
    moduleSlug: text("module_slug").notNull(),
    inputRefType: text("input_ref_type").notNull(),
    inputRefId: uuid("input_ref_id").notNull(),
    outputRefType: text("output_ref_type"),
    outputRefId: uuid("output_ref_id"),
    triggerSource: text("trigger_source").notNull(),
    dedupeKey: text("dedupe_key").notNull(),
    entitlementRefId: uuid("entitlement_ref_id"),
    attemptCount: integer("attempt_count").default(0).notNull(),
    maxAttempts: integer("max_attempts").default(3).notNull(),
    nextRunAt: timestamp("next_run_at", { withTimezone: true }).defaultNow().notNull(),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    lockedBy: text("locked_by"),
    lastErrorCategory: text("last_error_category"),
    lastErrorCode: text("last_error_code"),
    lastErrorAt: timestamp("last_error_at", { withTimezone: true }),
    modelProvider: text("model_provider"),
    modelName: text("model_name"),
    promptVersion: text("prompt_version"),
    schemaVersion: text("schema_version"),
    source: text("source"),
    operatorTest: boolean("operator_test").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    dedupeKeyIdx: uniqueIndex("generation_jobs_dedupe_key_idx").on(table.dedupeKey),
    statusNextRunIdx: index("generation_jobs_status_next_run_idx").on(table.status, table.nextRunAt),
    typeStatusNextRunIdx: index("generation_jobs_type_status_next_run_idx").on(
      table.jobType,
      table.status,
      table.nextRunAt,
    ),
    inputRefIdx: index("generation_jobs_input_ref_idx").on(table.inputRefType, table.inputRefId),
    outputRefIdx: index("generation_jobs_output_ref_idx").on(table.outputRefType, table.outputRefId),
    moduleCreatedIdx: index("generation_jobs_module_created_idx").on(table.moduleSlug, table.createdAt),
    triggerCreatedIdx: index("generation_jobs_trigger_created_idx").on(
      table.triggerSource,
      table.createdAt,
    ),
  }),
);

export const paymentIntents = pgTable(
  "payment_intents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    provider: text("provider").notNull(),
    providerEnvironment: text("provider_environment").default("unknown").notNull(),
    merchantOrderNo: text("merchant_order_no").notNull(),
    moduleSlug: text("module_slug").notNull(),
    analysisRequestId: uuid("analysis_request_id")
      .notNull()
      .references(() => analysisRequests.id),
    analysisResultId: uuid("analysis_result_id")
      .notNull()
      .references(() => analysisResults.id),
    unlockIntentId: uuid("unlock_intent_id").references(() => unlockIntents.id),
    amountMinor: integer("amount_minor").notNull(),
    currency: text("currency").default("TWD").notNull(),
    status: text("status").default("created").notNull(),
    providerStatus: text("provider_status"),
    providerTradeNo: text("provider_trade_no"),
    providerPaymentType: text("provider_payment_type"),
    providerResponseCode: text("provider_response_code"),
    providerMessageCategory: text("provider_message_category"),
    checkoutStartedAt: timestamp("checkout_started_at", { withTimezone: true }),
    notifyReceivedAt: timestamp("notify_received_at", { withTimezone: true }),
    returnReceivedAt: timestamp("return_received_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    failedAt: timestamp("failed_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    expiredAt: timestamp("expired_at", { withTimezone: true }),
    refundRequestedAt: timestamp("refund_requested_at", { withTimezone: true }),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    merchantOrderNoIdx: uniqueIndex("payment_intents_merchant_order_no_idx").on(
      table.merchantOrderNo,
    ),
    providerTradeIdx: index("payment_intents_provider_trade_idx").on(
      table.provider,
      table.providerTradeNo,
    ),
    resultIdx: index("payment_intents_result_idx").on(table.analysisResultId),
    statusCreatedIdx: index("payment_intents_status_created_idx").on(
      table.status,
      table.createdAt,
    ),
    moduleCreatedIdx: index("payment_intents_module_created_idx").on(
      table.moduleSlug,
      table.createdAt,
    ),
  }),
);

export const entitlements = pgTable(
  "entitlements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    entitlementType: text("entitlement_type").notNull(),
    source: text("source").notNull(),
    status: text("status").default("active").notNull(),
    moduleSlug: text("module_slug").notNull(),
    analysisRequestId: uuid("analysis_request_id")
      .notNull()
      .references(() => analysisRequests.id),
    analysisResultId: uuid("analysis_result_id")
      .notNull()
      .references(() => analysisResults.id),
    paymentIntentId: uuid("payment_intent_id").references(() => paymentIntents.id),
    unlockIntentId: uuid("unlock_intent_id").references(() => unlockIntents.id),
    generationJobId: uuid("generation_job_id").references(() => generationJobs.id),
    lineUserRef: text("line_user_ref"),
    paidAccessTokenHash: text("paid_access_token_hash"),
    paidAccessTokenExpiresAt: timestamp("paid_access_token_expires_at", {
      withTimezone: true,
    }),
    paidAccessTokenLastUsedAt: timestamp("paid_access_token_last_used_at", {
      withTimezone: true,
    }),
    paidAccessTokenLastRotatedAt: timestamp("paid_access_token_last_rotated_at", {
      withTimezone: true,
    }),
    remainingUses: integer("remaining_uses"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    activatedAt: timestamp("activated_at", { withTimezone: true }),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    paidAccessTokenHashIdx: uniqueIndex("entitlements_paid_access_token_hash_idx")
      .on(table.paidAccessTokenHash)
      .where(sql`${table.paidAccessTokenHash} IS NOT NULL`),
    paymentIntentUniqueIdx: uniqueIndex("entitlements_payment_intent_unique_idx")
      .on(table.paymentIntentId)
      .where(sql`${table.paymentIntentId} IS NOT NULL`),
    resultIdx: index("entitlements_result_idx").on(table.analysisResultId),
    moduleStatusIdx: index("entitlements_module_status_idx").on(
      table.moduleSlug,
      table.status,
    ),
    expiresAtIdx: index("entitlements_expires_at_idx").on(table.expiresAt),
  }),
);

export const paymentAccessLinkContacts = pgTable(
  "payment_access_link_contacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    moduleSlug: text("module_slug").notNull(),
    analysisResultId: uuid("analysis_result_id")
      .notNull()
      .references(() => analysisResults.id),
    paymentIntentId: uuid("payment_intent_id").references(() => paymentIntents.id),
    entitlementId: uuid("entitlement_id").references(() => entitlements.id),
    contactType: text("contact_type").notNull(),
    contactHash: text("contact_hash").notNull(),
    contactEncrypted: text("contact_encrypted"),
    lineUserHash: text("line_user_hash"),
    emailHash: text("email_hash"),
    transactionalConsentAt: timestamp("transactional_consent_at", {
      withTimezone: true,
    }).notNull(),
    marketingOptInAt: timestamp("marketing_opt_in_at", { withTimezone: true }),
    source: text("source").notNull(),
    status: text("status").default("pending").notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    resultIdx: index("payment_access_link_contacts_result_idx").on(table.analysisResultId),
    paymentIntentIdx: index("payment_access_link_contacts_payment_intent_idx").on(
      table.paymentIntentId,
    ),
    entitlementIdx: index("payment_access_link_contacts_entitlement_idx").on(table.entitlementId),
    contactLookupIdx: index("payment_access_link_contacts_contact_lookup_idx").on(
      table.contactType,
      table.contactHash,
    ),
    resultContactActiveIdx: uniqueIndex(
      "payment_access_link_contacts_result_contact_active_idx",
    )
      .on(table.analysisResultId, table.contactType, table.contactHash)
      .where(sql`${table.status} <> 'revoked'`),
    paymentContactActiveIdx: uniqueIndex(
      "payment_access_link_contacts_payment_contact_active_idx",
    )
      .on(table.paymentIntentId, table.contactType, table.contactHash)
      .where(sql`${table.paymentIntentId} IS NOT NULL AND ${table.status} <> 'revoked'`),
  }),
);
export const paymentRecoveryContacts = paymentAccessLinkContacts;

export const paidResultAccessLinks = pgTable(
  "paid_result_access_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    moduleSlug: text("module_slug").notNull(),
    analysisResultId: uuid("analysis_result_id")
      .notNull()
      .references(() => analysisResults.id),
    paymentIntentId: uuid("payment_intent_id").references(() => paymentIntents.id),
    entitlementId: uuid("entitlement_id")
      .notNull()
      .references(() => entitlements.id),
    recoveryContactId: uuid("recovery_contact_id").references(() => paymentAccessLinkContacts.id),
    tokenHash: text("token_hash").notNull(),
    purpose: text("purpose").notNull(),
    channel: text("channel").notNull(),
    status: text("status").default("created").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    providerMessageId: text("provider_message_id"),
    lastSendAttemptAt: timestamp("last_send_attempt_at", { withTimezone: true }),
    sendAttemptCount: integer("send_attempt_count").default(0).notNull(),
    lastFailureCategory: text("last_failure_category"),
    lastProviderStatus: text("last_provider_status"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tokenHashIdx: uniqueIndex("paid_result_access_links_token_hash_idx").on(
      table.tokenHash,
    ),
    entitlementIdx: index("paid_result_access_links_entitlement_idx").on(
      table.entitlementId,
    ),
    contactIdx: index("paid_result_access_links_contact_idx").on(
      table.recoveryContactId,
    ),
    resultModuleIdx: index("paid_result_access_links_result_module_idx").on(
      table.analysisResultId,
      table.moduleSlug,
    ),
    activeLookupIdx: index("paid_result_access_links_active_lookup_idx").on(
      table.status,
      table.expiresAt,
    ),
  }),
);
export const paidResultRecoveryLinks = paidResultAccessLinks;

export const paymentAccessLinkContactSecrets = pgTable(
  "payment_access_link_contact_secrets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recoveryContactId: uuid("recovery_contact_id")
      .notNull()
      .references(() => paymentAccessLinkContacts.id),
    channel: text("channel").notNull(),
    purpose: text("purpose").notNull(),
    recipientHash: text("recipient_hash").notNull(),
    encryptedRecipient: text("encrypted_recipient").notNull(),
    keyVersion: text("key_version").default("v1").notNull(),
    status: text("status").default("active").notNull(),
    failureCategory: text("failure_category"),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    recoveryContactIdx: index("payment_access_link_contact_secrets_contact_idx").on(
      table.recoveryContactId,
    ),
    recipientLookupIdx: index("payment_access_link_contact_secrets_recipient_lookup_idx").on(
      table.channel,
      table.purpose,
      table.recipientHash,
    ),
    activeContactSecretIdx: uniqueIndex(
      "payment_access_link_contact_secrets_active_contact_idx",
    )
      .on(table.recoveryContactId, table.channel, table.purpose)
      .where(sql`${table.status} = 'active'`),
  }),
);
export const paymentRecoveryContactSecrets = paymentAccessLinkContactSecrets;

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

export const runtimeConfigValues = pgTable(
  "runtime_config_values",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    environment: text("environment").notNull(),
    key: text("key").notNull(),
    scopeType: text("scope_type").notNull(),
    scopeKey: text("scope_key").notNull(),
    valueType: text("value_type").notNull(),
    valueJson: jsonb("value_json").$type<boolean | string | number>().notNull(),
    active: boolean("active").default(true).notNull(),
    reason: text("reason").notNull(),
    updatedBy: text("updated_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    identityIdx: uniqueIndex("runtime_config_values_identity_idx").on(
      table.environment,
      table.key,
      table.scopeType,
      table.scopeKey,
    ),
    environmentIdx: index("runtime_config_values_environment_idx").on(table.environment),
    keyScopeIdx: index("runtime_config_values_key_scope_idx").on(
      table.key,
      table.scopeType,
      table.scopeKey,
    ),
  }),
);

export const runtimeConfigEvents = pgTable(
  "runtime_config_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    environment: text("environment").notNull(),
    key: text("key").notNull(),
    scopeType: text("scope_type").notNull(),
    scopeKey: text("scope_key").notNull(),
    action: text("action").notNull(),
    valueBeforeJson: jsonb("value_before_json").$type<boolean | string | number | null>(),
    valueAfterJson: jsonb("value_after_json").$type<boolean | string | number | null>(),
    reason: text("reason").notNull(),
    actor: text("actor").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    identityCreatedIdx: index("runtime_config_events_identity_created_idx").on(
      table.environment,
      table.key,
      table.scopeType,
      table.scopeKey,
      table.createdAt,
    ),
    actionIdx: index("runtime_config_events_action_idx").on(table.action, table.createdAt),
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
  paidResults: many(analysisPaidResults),
  unlockIntents: many(unlockIntents),
  paymentIntents: many(paymentIntents),
  entitlements: many(entitlements),
  paymentAccessLinkContacts: many(paymentAccessLinkContacts),
  paidResultAccessLinks: many(paidResultAccessLinks),
  contactSubmissions: many(contactSubmissions),
}));

export const unlockIntentRelations = relations(unlockIntents, ({ one, many }) => ({
  result: one(analysisResults, {
    fields: [unlockIntents.resultId],
    references: [analysisResults.id],
  }),
  paidResults: many(analysisPaidResults),
  paymentIntents: many(paymentIntents),
  entitlements: many(entitlements),
  paymentAccessLinkContacts: many(paymentAccessLinkContacts),
  paidResultAccessLinks: many(paidResultAccessLinks),
  contactSubmissions: many(contactSubmissions),
}));

export const analysisPaidResultRelations = relations(analysisPaidResults, ({ one }) => ({
  result: one(analysisResults, {
    fields: [analysisPaidResults.analysisResultId],
    references: [analysisResults.id],
  }),
  requestedByUnlockIntent: one(unlockIntents, {
    fields: [analysisPaidResults.requestedByUnlockIntentId],
    references: [unlockIntents.id],
  }),
}));

export const paymentIntentRelations = relations(paymentIntents, ({ one, many }) => ({
  request: one(analysisRequests, {
    fields: [paymentIntents.analysisRequestId],
    references: [analysisRequests.id],
  }),
  result: one(analysisResults, {
    fields: [paymentIntents.analysisResultId],
    references: [analysisResults.id],
  }),
  unlockIntent: one(unlockIntents, {
    fields: [paymentIntents.unlockIntentId],
    references: [unlockIntents.id],
  }),
  entitlements: many(entitlements),
  paymentAccessLinkContacts: many(paymentAccessLinkContacts),
  paidResultAccessLinks: many(paidResultAccessLinks),
}));

export const entitlementRelations = relations(entitlements, ({ one, many }) => ({
  request: one(analysisRequests, {
    fields: [entitlements.analysisRequestId],
    references: [analysisRequests.id],
  }),
  result: one(analysisResults, {
    fields: [entitlements.analysisResultId],
    references: [analysisResults.id],
  }),
  paymentIntent: one(paymentIntents, {
    fields: [entitlements.paymentIntentId],
    references: [paymentIntents.id],
  }),
  unlockIntent: one(unlockIntents, {
    fields: [entitlements.unlockIntentId],
    references: [unlockIntents.id],
  }),
  generationJob: one(generationJobs, {
    fields: [entitlements.generationJobId],
    references: [generationJobs.id],
  }),
  paymentAccessLinkContacts: many(paymentAccessLinkContacts),
  paidResultAccessLinks: many(paidResultAccessLinks),
}));

export const paymentAccessLinkContactRelations = relations(
  paymentAccessLinkContacts,
  ({ one, many }) => ({
    result: one(analysisResults, {
      fields: [paymentAccessLinkContacts.analysisResultId],
      references: [analysisResults.id],
    }),
    paymentIntent: one(paymentIntents, {
      fields: [paymentAccessLinkContacts.paymentIntentId],
      references: [paymentIntents.id],
    }),
    entitlement: one(entitlements, {
      fields: [paymentAccessLinkContacts.entitlementId],
      references: [entitlements.id],
    }),
    paidResultAccessLinks: many(paidResultAccessLinks),
    paymentAccessLinkContactSecrets: many(paymentAccessLinkContactSecrets),
  }),
);

export const paymentAccessLinkContactSecretRelations = relations(
  paymentAccessLinkContactSecrets,
  ({ one }) => ({
    accessLinkContact: one(paymentAccessLinkContacts, {
      fields: [paymentAccessLinkContactSecrets.recoveryContactId],
      references: [paymentAccessLinkContacts.id],
    }),
  }),
);

export const paidResultAccessLinkRelations = relations(
  paidResultAccessLinks,
  ({ one }) => ({
    result: one(analysisResults, {
      fields: [paidResultAccessLinks.analysisResultId],
      references: [analysisResults.id],
    }),
    paymentIntent: one(paymentIntents, {
      fields: [paidResultAccessLinks.paymentIntentId],
      references: [paymentIntents.id],
    }),
    entitlement: one(entitlements, {
      fields: [paidResultAccessLinks.entitlementId],
      references: [entitlements.id],
    }),
    accessLinkContact: one(paymentAccessLinkContacts, {
      fields: [paidResultAccessLinks.recoveryContactId],
      references: [paymentAccessLinkContacts.id],
    }),
  }),
);

export const paymentRecoveryContactRelations = paymentAccessLinkContactRelations;
export const paymentRecoveryContactSecretRelations =
  paymentAccessLinkContactSecretRelations;
export const paidResultRecoveryLinkRelations = paidResultAccessLinkRelations;

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
