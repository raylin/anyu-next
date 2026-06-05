#!/usr/bin/env node

import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const REPORT_REFERENCE_PATTERN = /^AT-\d{8}-[A-Z0-9]{6}$/u;
const ALLOWED_LOOKUP_TYPES = new Set([
  "resultId",
  "paymentIntentId",
  "merchantOrderNo",
  "email",
  "recoveryLinkId",
  "reportReference",
]);
const PRODUCTION_TARGETS = new Set(["production", "prod"]);
const SUPPORT_OPS_DATABASE_URL_ENV = "SUPPORT_OPS_DATABASE_URL";
const DATABASE_URL_FALLBACK_ENV = "DATABASE_URL";
const TOKEN_LIKE_PATTERNS = [
  /pa_[A-Za-z0-9_-]{8,}/u,
  /pcs_[A-Za-z0-9_-]{8,}/u,
  /prl_[A-Za-z0-9_-]{8,}/u,
  /\/r\/[A-Za-z0-9_-]{12,}/u,
  /token_hash/iu,
  /contact_hash/iu,
  /recipient_hash/iu,
  /encrypted_recipient/iu,
  /contact_encrypted/iu,
  /line_user_hash/iu,
  /email_hash/iu,
  /provider_payload/iu,
  /raw_line/iu,
  /line_user_id/iu,
];

function record(value) {
  console.log(JSON.stringify(assertSanitizedOutput(value)));
}

function parseSupportLookupArgs(argv, env = process.env) {
  const options = {
    target: env.SUPPORT_LOOKUP_TARGET?.trim() || "staging",
    allowProductionReadonly: env.SUPPORT_LOOKUP_ALLOW_PRODUCTION_READONLY === "1",
    allowDatabaseUrlFallback: env.SUPPORT_OPS_ALLOW_DATABASE_URL_FALLBACK === "1",
    disableLocalEnv: env.SUPPORT_LOOKUP_DISABLE_LOCAL_ENV === "1",
    json: true,
  };
  const lookup = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    switch (arg) {
      case "--":
        break;
      case "--target":
        options.target = requireArgValue(arg, next);
        index += 1;
        break;
      case "--allow-production-readonly":
        options.allowProductionReadonly = true;
        break;
      case "--allow-database-url-fallback":
        options.allowDatabaseUrlFallback = true;
        break;
      case "--no-local-env":
        options.disableLocalEnv = true;
        break;
      case "--result-id":
        lookup.resultId = requireUuidArg(arg, next);
        index += 1;
        break;
      case "--payment-intent-id":
        lookup.paymentIntentId = requireUuidArg(arg, next);
        index += 1;
        break;
      case "--merchant-order-no":
        lookup.merchantOrderNo = requireArgValue(arg, next);
        index += 1;
        break;
      case "--email":
        lookup.email = requireArgValue(arg, next);
        index += 1;
        break;
      case "--recovery-link-id":
        lookup.recoveryLinkId = requireUuidArg(arg, next);
        index += 1;
        break;
      case "--report-reference":
        lookup.reportReference = requireReportReferenceArg(arg, next);
        index += 1;
        break;
      case "--json":
        options.json = true;
        break;
      default:
        throw new SupportLookupInputError("unsupported_arg", { arg });
    }
  }

  const lookupTypes = Object.keys(lookup).filter((type) => ALLOWED_LOOKUP_TYPES.has(type));

  if (lookupTypes.length !== 1) {
    throw new SupportLookupInputError("exactly_one_lookup_key_required", {
      lookupTypesProvided: lookupTypes,
    });
  }

  if (PRODUCTION_TARGETS.has(options.target.toLowerCase()) && !options.allowProductionReadonly) {
    throw new SupportLookupInputError("production_target_rejected", {
      productionReadonlyRequired: true,
    });
  }

  return {
    options,
    lookup: {
      type: lookupTypes[0],
      value: lookup[lookupTypes[0]],
    },
  };
}

class SupportLookupInputError extends Error {
  constructor(code, details = {}) {
    super(code);
    this.code = code;
    this.details = details;
  }
}

function requireArgValue(arg, value) {
  if (!value || value.startsWith("--")) {
    throw new SupportLookupInputError("missing_arg_value", { arg });
  }

  return value.trim();
}

function requireUuidArg(arg, value) {
  const parsed = requireArgValue(arg, value);

  if (!UUID_PATTERN.test(parsed)) {
    throw new SupportLookupInputError("invalid_uuid", { arg });
  }

  return parsed;
}

function requireReportReferenceArg(arg, value) {
  const parsed = requireArgValue(arg, value).toUpperCase();

  if (!REPORT_REFERENCE_PATTERN.test(parsed)) {
    throw new SupportLookupInputError("invalid_report_reference", { arg });
  }

  return parsed;
}

function normalizeRecoveryEmail(email) {
  return email.trim().toLowerCase();
}

function hashRecoveryEmail(email, env = process.env) {
  const secret = env.PAYMENT_RECOVERY_CONTACT_HASH_SECRET?.trim();

  if (!secret) {
    throw new SupportLookupInputError("payment_recovery_contact_hash_secret_missing");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(`payment_recovery_contact:v1:email:${normalizeRecoveryEmail(email)}`)
    .digest("hex");
}

function maskEmail(email) {
  const normalized = normalizeRecoveryEmail(email);
  const [localPart = "", domain = ""] = normalized.split("@");
  const [domainName = "", ...suffixParts] = domain.split(".");
  const suffix = suffixParts.length > 0 ? `.${suffixParts.join(".")}` : "";
  const maskedLocal = `${localPart[0] ?? "*"}***`;
  const maskedDomain = domainName ? `${domainName[0] ?? "*"}***` : "***";

  return `${maskedLocal}@${maskedDomain}${suffix}`;
}

function isExpired(expiresAt, now = new Date()) {
  return Boolean(expiresAt) && new Date(expiresAt).getTime() <= now.getTime();
}

function isActiveAccessLink(link, now = new Date()) {
  if (!link || link.revokedAt || link.status === "revoked" || link.status === "failed") {
    return false;
  }

  if (isExpired(link.expiresAt, now)) {
    return false;
  }

  return Boolean(link.sentAt || link.usedAt || link.status === "sent" || link.status === "used");
}

function summarizeAccessLinks(links, now = new Date()) {
  const initial = {
    latestActiveLinkExists: false,
    totalCount: links.length,
    expiredCount: 0,
    revokedCount: 0,
    failedCount: 0,
    channels: {},
  };

  for (const link of links) {
    const channel = link.channel ?? "unknown";
    const active = isActiveAccessLink(link, now);
    const expired = isExpired(link.expiresAt, now);
    const revoked = Boolean(link.revokedAt || link.status === "revoked");
    const failed = link.status === "failed";

    initial.latestActiveLinkExists ||= active;
    initial.expiredCount += expired ? 1 : 0;
    initial.revokedCount += revoked ? 1 : 0;
    initial.failedCount += failed ? 1 : 0;
    initial.channels[channel] ??= {
      count: 0,
      activeLinkExists: false,
      latestStatus: null,
      latestSentAt: null,
      latestUsedAt: null,
      latestExpiresAt: null,
      sendAttemptCount: 0,
      lastProviderStatus: null,
      lastFailureCategory: null,
      providerMessageIdPresent: false,
    };

    const summary = initial.channels[channel];
    summary.count += 1;
    summary.activeLinkExists ||= active;

    if (summary.count === 1) {
      summary.latestStatus = link.status ?? null;
      summary.latestSentAt = link.sentAt ?? null;
      summary.latestUsedAt = link.usedAt ?? null;
      summary.latestExpiresAt = link.expiresAt ?? null;
      summary.lastProviderStatus = link.lastProviderStatus ?? null;
      summary.lastFailureCategory = link.lastFailureCategory ?? null;
    }

    summary.sendAttemptCount += Number(link.sendAttemptCount ?? 0);
    summary.providerMessageIdPresent ||= Boolean(link.providerMessageIdPresent);
  }

  return initial;
}

function summarizeContacts(contacts, secretRows = [], lookupContext = {}) {
  const emailContacts = contacts.filter((contact) => contact.contactType === "email");
  const lineContacts = contacts.filter((contact) => contact.contactType === "line");
  const activeLineSecrets = new Set(
    secretRows
      .filter((secret) => secret.channel === "line" && secret.status === "active")
      .map((secret) => secret.recoveryContactId),
  );

  return {
    emailSaved: emailContacts.length > 0,
    emailContactCount: emailContacts.length,
    maskedEmail:
      lookupContext.type === "email" && typeof lookupContext.value === "string"
        ? maskEmail(lookupContext.value)
        : null,
    emailLatestStatus: emailContacts[0]?.status ?? null,
    emailLatestSource: emailContacts[0]?.source ?? null,
    emailTransactionalConsentAt: emailContacts[0]?.transactionalConsentAt ?? null,
    lineSaved: lineContacts.length > 0,
    lineContactCount: lineContacts.length,
    lineLatestStatus: lineContacts[0]?.status ?? null,
    lineLatestSource: lineContacts[0]?.source ?? null,
    lineTransactionalConsentAt: lineContacts[0]?.transactionalConsentAt ?? null,
    lineRecipientSecretActive: lineContacts.some((contact) => activeLineSecrets.has(contact.id)),
  };
}

function buildSupportDiagnosis(summary) {
  const diagnosis = new Set();
  const actions = new Set();
  const paymentStatus = summary.payment.latestStatus;
  const entitlementStatus = summary.entitlement.latestStatus;
  const generationStatus = summary.generation.latestStatus;
  const paidResultStatus = summary.paidResult.latestStatus;
  const contacts = summary.contacts;
  const links = summary.accessLinks;

  if (!summary.payment.found) {
    diagnosis.add("payment_not_found");
    actions.add("ask_user_for_order_reference");
  } else if (["created", "pending", "processing"].includes(paymentStatus)) {
    diagnosis.add("payment_waiting");
    actions.add("ask_user_for_order_reference");
  }

  if (summary.payment.duplicatePaymentPossible) {
    diagnosis.add("duplicate_payment_possible");
    actions.add("escalate_refund_review");
  }

  if (["refund_pending", "refunded", "cancelled"].includes(paymentStatus) || entitlementStatus === "refunded") {
    diagnosis.add("refund_review_needed");
    actions.add("escalate_refund_review");
  }

  if (summary.payment.found && ["paid", "completed", "captured", "success"].includes(paymentStatus) && !summary.entitlement.found) {
    diagnosis.add("entitlement_missing");
    actions.add("escalate_refund_review");
  }

  if (["queued", "running", "processing", "pending"].includes(generationStatus) || ["pending", "processing"].includes(paidResultStatus)) {
    diagnosis.add("paid_processing");
    actions.add("retry_processor_if_safe");
  }

  if (["failed", "error"].includes(generationStatus) || ["failed", "error"].includes(paidResultStatus)) {
    diagnosis.add("paid_failed");
    actions.add("escalate_refund_review");
  }

  if (
    ["active", "consumed"].includes(entitlementStatus) &&
    (paidResultStatus === "completed" || generationStatus === "completed")
  ) {
    diagnosis.add("paid_result_ready");
  }

  if (links.latestActiveLinkExists) {
    diagnosis.add("access_link_sent");
    actions.add("ask_user_to_use_saved_view_link");
  } else if (links.failedCount > 0) {
    diagnosis.add("access_link_failed");
    actions.add("create_support_resend_link_future_gated_flow");
  } else if (contacts.emailSaved || contacts.lineSaved) {
    diagnosis.add("access_link_missing");
    actions.add("create_support_resend_link_future_gated_flow");
  }

  if (contacts.emailSaved && !links.channels.email?.activeLinkExists) {
    diagnosis.add("email_saved_no_send");
    actions.add("ask_user_to_check_spam");
  }

  if (contacts.lineSaved && !links.channels.line?.activeLinkExists) {
    diagnosis.add("line_saved_no_send");
    actions.add("ask_user_to_unblock_line_official_account");
  }

  if (!contacts.emailSaved && !contacts.lineSaved) {
    diagnosis.add("no_saved_contact");
    actions.add("ask_user_for_order_reference");
  }

  if (diagnosis.size === 0) {
    diagnosis.add("unknown");
    actions.add("escalate_refund_review");
  }

  return {
    diagnosis: Array.from(diagnosis),
    recommendedActions: Array.from(actions),
  };
}

function assertSanitizedOutput(value) {
  const serialized = JSON.stringify(value);
  const unsafePattern = TOKEN_LIKE_PATTERNS.find((pattern) => pattern.test(serialized));

  if (unsafePattern) {
    throw new Error(`unsafe_support_lookup_output_detected:${unsafePattern.source}`);
  }

  return value;
}

function safeErrorResponse(error) {
  const code = error instanceof SupportLookupInputError ? error.code : "support_lookup_failed";

  return assertSanitizedOutput({
    ok: false,
    category: code,
    details: error instanceof SupportLookupInputError ? error.details : {},
    valuesPrinted: false,
  });
}

async function getSqlClient(env = process.env, options = {}) {
  const resolved = await resolveSupportOpsDatabaseUrl(env, options);

  if (!resolved.databaseUrl) {
    throw new SupportLookupInputError(resolved.errorCategory ?? "blocked_missing_db_url", {
      requiredEnv: SUPPORT_OPS_DATABASE_URL_ENV,
      fallbackEnv: DATABASE_URL_FALLBACK_ENV,
      fallbackPolicy: "DATABASE_URL_allowed_only_after_clean_access_link_schema_probe",
      connectionSourceCategory: resolved.connectionSourceCategory,
    });
  }

  return {
    sql: neon(resolved.databaseUrl),
    connectionSourceCategory: resolved.connectionSourceCategory,
  };
}

async function verifyDatabaseUrlCleanAccessLinkSchema(databaseUrl, schemaProbe = probeCleanAccessLinkSchema) {
  if (!databaseUrl?.trim()) {
    return {
      ok: false,
      category: "database_url_missing",
      accessLinkTablesPresent: false,
      oldRecoveryTablesAbsent: false,
      valuesPrinted: false,
    };
  }

  return schemaProbe(databaseUrl);
}

async function probeCleanAccessLinkSchema(databaseUrl) {
  const sql = neon(databaseUrl);
  const rows = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in (
        'payment_access_link_contacts',
        'paid_result_access_links',
        'payment_access_link_contact_secrets',
        'payment_recovery_contacts',
        'paid_result_recovery_links',
        'payment_recovery_contact_secrets'
      )
  `;
  const names = new Set(rows.map((row) => row.table_name));
  const accessLinkTablesPresent =
    names.has("payment_access_link_contacts") &&
    names.has("paid_result_access_links") &&
    names.has("payment_access_link_contact_secrets");
  const oldRecoveryTablesAbsent =
    !names.has("payment_recovery_contacts") &&
    !names.has("paid_result_recovery_links") &&
    !names.has("payment_recovery_contact_secrets");

  return {
    ok: accessLinkTablesPresent && oldRecoveryTablesAbsent,
    category:
      accessLinkTablesPresent && oldRecoveryTablesAbsent
        ? "database_url_schema_verified"
        : "database_url_schema_mismatch",
    accessLinkTablesPresent,
    oldRecoveryTablesAbsent,
    valuesPrinted: false,
  };
}

async function resolveSupportOpsDatabaseUrl(env = process.env, options = {}) {
  const supportOpsDatabaseUrl = env[SUPPORT_OPS_DATABASE_URL_ENV]?.trim();

  if (supportOpsDatabaseUrl) {
    return {
      databaseUrl: supportOpsDatabaseUrl,
      connectionSourceCategory: "support_ops_database_url",
    };
  }

  const fallbackDatabaseUrl = env[DATABASE_URL_FALLBACK_ENV]?.trim();

  if (!fallbackDatabaseUrl) {
    return {
      databaseUrl: null,
      connectionSourceCategory: "missing",
      errorCategory: "blocked_missing_db_url",
    };
  }

  const schema = await verifyDatabaseUrlCleanAccessLinkSchema(
    fallbackDatabaseUrl,
    options.schemaProbe,
  ).catch(() => ({
    ok: false,
    category: "database_url_schema_probe_failed",
    accessLinkTablesPresent: false,
    oldRecoveryTablesAbsent: false,
    valuesPrinted: false,
  }));

  if (schema.ok) {
    return {
      databaseUrl: fallbackDatabaseUrl,
      connectionSourceCategory: "database_url_schema_verified",
      schema,
    };
  }

  return {
    databaseUrl: null,
    connectionSourceCategory: "blocked_database_url_schema_mismatch",
    errorCategory: "blocked_database_url_schema_mismatch",
    schema,
  };
}

async function resolveLookup(sql, lookup, env = process.env) {
  if (lookup.type === "reportReference") {
    throw new SupportLookupInputError("report_reference_not_mapped", {
      recommendedLookup: "merchantOrderNo_or_resultId",
    });
  }

  if (lookup.type === "resultId") {
    return { analysisResultId: lookup.value, lookupSource: "resultId" };
  }

  if (lookup.type === "paymentIntentId") {
    const [payment] = await sql`
      select analysis_result_id
      from payment_intents
      where id = ${lookup.value}
      limit 1
    `;
    return { analysisResultId: payment?.analysis_result_id ?? null, lookupSource: "paymentIntentId" };
  }

  if (lookup.type === "merchantOrderNo") {
    const [payment] = await sql`
      select analysis_result_id
      from payment_intents
      where merchant_order_no = ${lookup.value}
      limit 1
    `;
    return { analysisResultId: payment?.analysis_result_id ?? null, lookupSource: "merchantOrderNo" };
  }

  if (lookup.type === "email") {
    const emailHash = hashRecoveryEmail(lookup.value, env);
    const [contact] = await sql`
      select analysis_result_id
      from payment_access_link_contacts
      where contact_type = 'email'
        and contact_hash = ${emailHash}
        and status <> 'revoked'
      order by created_at desc
      limit 1
    `;
    return { analysisResultId: contact?.analysis_result_id ?? null, lookupSource: "emailHash" };
  }

  if (lookup.type === "recoveryLinkId") {
    const [link] = await sql`
      select analysis_result_id
      from paid_result_access_links
      where id = ${lookup.value}
      limit 1
    `;
    return { analysisResultId: link?.analysis_result_id ?? null, lookupSource: "recoveryLinkId" };
  }

  throw new SupportLookupInputError("unsupported_lookup_type");
}

async function fetchSupportRows(sql, analysisResultId) {
  const [payments, entitlements, generationJobs, paidResults, contacts, links] =
    await Promise.all([
      sql`
        select
          provider,
          provider_environment,
          module_slug,
          amount_minor,
          currency,
          status,
          provider_status,
          provider_message_category,
          checkout_started_at,
          notify_received_at,
          return_received_at,
          paid_at,
          failed_at,
          cancelled_at,
          refund_requested_at,
          refunded_at,
          expires_at,
          created_at,
          updated_at
        from payment_intents
        where analysis_result_id = ${analysisResultId}
        order by created_at desc
        limit 10
      `,
      sql`
        select
          status,
          module_slug,
          generation_job_id is not null as generation_job_present,
          expires_at,
          activated_at,
          consumed_at,
          revoked_at,
          refunded_at,
          created_at,
          updated_at
        from entitlements
        where analysis_result_id = ${analysisResultId}
        order by created_at desc
        limit 10
      `,
      sql`
        select
          job_type,
          status,
          module_slug,
          input_ref_type,
          output_ref_type,
          attempt_count,
          max_attempts,
          last_error_category,
          last_error_code,
          operator_test,
          created_at,
          updated_at
        from generation_jobs
        where input_ref_id = ${analysisResultId}
           or output_ref_id = ${analysisResultId}
        order by created_at desc
        limit 10
      `,
      sql`
        select
          module_id,
          theme_slug,
          status,
          completed_at,
          failed_at,
          error_code,
          retry_count,
          retention_expires_at,
          created_at,
          updated_at
        from analysis_paid_results
        where analysis_result_id = ${analysisResultId}
        order by created_at desc
        limit 10
      `,
      sql`
        select
          id,
          contact_type,
          source,
          status,
          transactional_consent_at,
          marketing_opt_in_at,
          payment_intent_id is not null as linked_payment,
          entitlement_id is not null as linked_entitlement,
          created_at,
          updated_at
        from payment_access_link_contacts
        where analysis_result_id = ${analysisResultId}
        order by created_at desc
        limit 20
      `,
      sql`
        select
          channel,
          status,
          expires_at,
          used_at,
          revoked_at,
          sent_at,
          last_send_attempt_at,
          send_attempt_count,
          last_failure_category,
          last_provider_status,
          provider_message_id is not null as provider_message_id_present,
          created_at,
          updated_at
        from paid_result_access_links
        where analysis_result_id = ${analysisResultId}
        order by created_at desc
        limit 30
      `,
    ]);

  const lineContactIds = contacts
    .filter((contact) => contact.contact_type === "line")
    .map((contact) => contact.id);
  const secretRows = [];

  for (const contactId of lineContactIds) {
    const rows = await sql`
      select recovery_contact_id, channel, purpose, status, key_version, last_used_at, revoked_at
      from payment_access_link_contact_secrets
      where recovery_contact_id = ${contactId}
      order by created_at desc
      limit 3
    `;
    secretRows.push(...rows);
  }

  return {
    payments: mapPaymentRows(payments),
    entitlements: mapEntitlementRows(entitlements),
    generationJobs: mapGenerationJobRows(generationJobs),
    paidResults: mapPaidResultRows(paidResults),
    contacts: mapContactRows(contacts),
    links: mapRecoveryLinkRows(links),
    secretRows: mapSecretRows(secretRows),
  };
}

function mapPaymentRows(rows) {
  return rows.map((row) => ({
    provider: row.provider,
    providerEnvironment: row.provider_environment,
    moduleSlug: row.module_slug,
    amountMinor: row.amount_minor,
    currency: row.currency,
    status: row.status,
    providerStatus: row.provider_status,
    providerMessageCategory: row.provider_message_category,
    checkoutStartedAt: row.checkout_started_at,
    notifyReceivedAt: row.notify_received_at,
    returnReceivedAt: row.return_received_at,
    paidAt: row.paid_at,
    failedAt: row.failed_at,
    cancelledAt: row.cancelled_at,
    refundRequestedAt: row.refund_requested_at,
    refundedAt: row.refunded_at,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

function mapEntitlementRows(rows) {
  return rows.map((row) => ({
    status: row.status,
    moduleSlug: row.module_slug,
    generationJobPresent: row.generation_job_present,
    expiresAt: row.expires_at,
    activatedAt: row.activated_at,
    consumedAt: row.consumed_at,
    revokedAt: row.revoked_at,
    refundedAt: row.refunded_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

function mapGenerationJobRows(rows) {
  return rows.map((row) => ({
    jobType: row.job_type,
    status: row.status,
    moduleSlug: row.module_slug,
    inputRefType: row.input_ref_type,
    outputRefType: row.output_ref_type,
    attemptCount: row.attempt_count,
    maxAttempts: row.max_attempts,
    lastErrorCategory: row.last_error_category,
    lastErrorCode: row.last_error_code,
    operatorTest: row.operator_test,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

function mapPaidResultRows(rows) {
  return rows.map((row) => ({
    moduleId: row.module_id,
    themeSlug: row.theme_slug,
    status: row.status,
    completedAt: row.completed_at,
    failedAt: row.failed_at,
    errorCode: row.error_code,
    retryCount: row.retry_count,
    retentionExpiresAt: row.retention_expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

function mapContactRows(rows) {
  return rows.map((row) => ({
    id: row.id,
    contactType: row.contact_type,
    source: row.source,
    status: row.status,
    transactionalConsentAt: row.transactional_consent_at,
    marketingOptInAt: row.marketing_opt_in_at,
    linkedPayment: row.linked_payment,
    linkedEntitlement: row.linked_entitlement,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

function mapRecoveryLinkRows(rows) {
  return rows.map((row) => ({
    channel: row.channel,
    status: row.status,
    expiresAt: row.expires_at,
    usedAt: row.used_at,
    revokedAt: row.revoked_at,
    sentAt: row.sent_at,
    lastSendAttemptAt: row.last_send_attempt_at,
    sendAttemptCount: row.send_attempt_count,
    lastFailureCategory: row.last_failure_category,
    lastProviderStatus: row.last_provider_status,
    providerMessageIdPresent: row.provider_message_id_present,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

function mapSecretRows(rows) {
  return rows.map((row) => ({
    recoveryContactId: row.recovery_contact_id,
    channel: row.channel,
    purpose: row.purpose,
    status: row.status,
    keyVersion: row.key_version,
    lastUsedAt: row.last_used_at,
    revokedAt: row.revoked_at,
  }));
}

function buildSummary(rows, lookup) {
  const payment = rows.payments[0] ?? null;
  const entitlement = rows.entitlements[0] ?? null;
  const generationJob = rows.generationJobs[0] ?? null;
  const paidResult = rows.paidResults[0] ?? null;
  const contacts = summarizeContacts(rows.contacts, rows.secretRows, lookup);
  const accessLinks = summarizeAccessLinks(rows.links);
  const summary = {
    payment: {
      found: rows.payments.length > 0,
      count: rows.payments.length,
      duplicatePaymentPossible: rows.payments.length > 1,
      latestStatus: payment?.status ?? null,
      provider: payment?.provider ?? null,
      providerEnvironment: payment?.providerEnvironment ?? null,
      providerStatus: payment?.providerStatus ?? null,
      providerMessageCategory: payment?.providerMessageCategory ?? null,
      amountMinor: payment?.amountMinor ?? null,
      currency: payment?.currency ?? null,
      checkoutStartedAt: payment?.checkoutStartedAt ?? null,
      notifyReceivedAt: payment?.notifyReceivedAt ?? null,
      returnReceivedAt: payment?.returnReceivedAt ?? null,
      paidAt: payment?.paidAt ?? null,
      failedAt: payment?.failedAt ?? null,
      cancelledAt: payment?.cancelledAt ?? null,
      refundRequestedAt: payment?.refundRequestedAt ?? null,
      refundedAt: payment?.refundedAt ?? null,
      expiresAt: payment?.expiresAt ?? null,
    },
    entitlement: {
      found: rows.entitlements.length > 0,
      count: rows.entitlements.length,
      latestStatus: entitlement?.status ?? null,
      generationJobPresent: entitlement?.generationJobPresent ?? null,
      expiresAt: entitlement?.expiresAt ?? null,
      activatedAt: entitlement?.activatedAt ?? null,
      consumedAt: entitlement?.consumedAt ?? null,
      revokedAt: entitlement?.revokedAt ?? null,
      refundedAt: entitlement?.refundedAt ?? null,
    },
    generation: {
      found: rows.generationJobs.length > 0,
      count: rows.generationJobs.length,
      latestStatus: generationJob?.status ?? null,
      latestJobType: generationJob?.jobType ?? null,
      attemptCount: generationJob?.attemptCount ?? null,
      maxAttempts: generationJob?.maxAttempts ?? null,
      lastErrorCategory: generationJob?.lastErrorCategory ?? null,
      lastErrorCode: generationJob?.lastErrorCode ?? null,
      operatorTest: generationJob?.operatorTest ?? null,
    },
    paidResult: {
      found: rows.paidResults.length > 0,
      count: rows.paidResults.length,
      latestStatus: paidResult?.status ?? null,
      completedAt: paidResult?.completedAt ?? null,
      failedAt: paidResult?.failedAt ?? null,
      errorCode: paidResult?.errorCode ?? null,
      retryCount: paidResult?.retryCount ?? null,
      retentionExpiresAt: paidResult?.retentionExpiresAt ?? null,
    },
    contacts,
    accessLinks,
  };

  return {
    ...summary,
    ...buildSupportDiagnosis(summary),
  };
}

async function lookupPaidResultSupport(input, env = process.env) {
  const { sql, connectionSourceCategory } = await getSqlClient(env);
  const resolved = await resolveLookup(sql, input.lookup, env);

  if (!resolved.analysisResultId) {
    const summary = {
      payment: { found: false, count: 0, duplicatePaymentPossible: false, latestStatus: null },
      entitlement: { found: false, count: 0, latestStatus: null },
      generation: { found: false, count: 0, latestStatus: null },
      paidResult: { found: false, count: 0, latestStatus: null },
      contacts: {
        emailSaved: false,
        emailContactCount: 0,
        maskedEmail: input.lookup.type === "email" ? maskEmail(input.lookup.value) : null,
        lineSaved: false,
        lineContactCount: 0,
        lineRecipientSecretActive: false,
      },
      accessLinks: summarizeAccessLinks([]),
    };

    return {
      ok: true,
      target: input.options.target,
      lookup: {
        type: input.lookup.type,
        valueRedacted: true,
        resolved: false,
        source: resolved.lookupSource,
      },
      connectionSourceCategory,
      found: false,
      summary: {
        ...summary,
        ...buildSupportDiagnosis(summary),
      },
      redaction: buildRedactionSummary(),
    };
  }

  const rows = await fetchSupportRows(sql, resolved.analysisResultId);
  const summary = buildSummary(rows, input.lookup);

  return assertSanitizedOutput({
    ok: true,
    target: input.options.target,
    lookup: {
      type: input.lookup.type,
      valueRedacted: true,
      resolved: true,
      source: resolved.lookupSource,
    },
    connectionSourceCategory,
    found: true,
    summary,
    redaction: buildRedactionSummary(),
  });
}

function buildRedactionSummary() {
  return {
    rawEmailPrinted: false,
    rawLineUserIdPrinted: false,
    encryptedRecipientPrinted: false,
    tokenPrinted: false,
    tokenHashPrinted: false,
    providerPayloadPrinted: false,
    sourceTextPrinted: false,
    providerMessageIdValuePrinted: false,
  };
}

async function main() {
  try {
    const parsedBeforeEnv = parseSupportLookupArgs(process.argv.slice(2), process.env);

    if (!parsedBeforeEnv.options.disableLocalEnv) {
      throw new SupportLookupInputError("legacy_local_env_autoload_removed", {
        reason:
          "Direct DB support lookup no longer reads apps/web env mirror files. Provide process env explicitly or migrate to Admin API lookup.",
      });
    }

    const parsed = parseSupportLookupArgs(process.argv.slice(2), process.env);
    const result = await lookupPaidResultSupport(parsed, process.env);
    record(result);
  } catch (error) {
    record(safeErrorResponse(error));
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}

export {
  SupportLookupInputError,
  assertSanitizedOutput,
  buildSupportDiagnosis,
  hashRecoveryEmail,
  isActiveAccessLink,
  lookupPaidResultSupport,
  maskEmail,
  parseSupportLookupArgs,
  resolveSupportOpsDatabaseUrl,
  verifyDatabaseUrlCleanAccessLinkSchema,
  summarizeAccessLinks,
  summarizeContacts,
};
