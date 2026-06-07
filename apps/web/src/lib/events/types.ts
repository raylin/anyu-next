export const EVENT_NAMES = [
  "page_view",
  "input_started",
  "theme_switch_clicked",
  "analysis_started",
  "analysis_failed",
  "input_submitted",
  "analysis_completed",
  "paid_unlock_clicked",
  "paid_generation_started",
  "paid_generation_completed",
  "paid_generation_failed",
  "unlocked_result_view",
  "line_add_clicked",
  "fulfillment_liff_opened",
  "fulfillment_liff_bound",
  "fulfillment_code_shown",
  "fulfillment_code_matched",
  "fulfillment_link_delivered",
  "fulfillment_failed",
  "line_webhook_received",
  "line_bind_diagnostic",
  "access_link_save_diagnostic",
  "email_fallback_opened",
  "contact_submitted",
  "share_card_clicked",
  "error_seen",
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

export type EventPayload = {
  eventName: EventName;
  moduleId: string;
  themeSlug: string;
  experimentId: string;
  visualVariant: string;
  promptVersion: string;
  schemaVersion: string;
  situationType?: string | null;
  scoreBucket?: string | null;
  anonymousSessionId?: string | null;
  metadata?: Record<string, unknown>;
};

const FORBIDDEN_METADATA_KEYS = [
  "text",
  "rawtext",
  "input",
  "conversation",
  "email",
  "line_message_text",
  "displayname",
  "display_name",
  "line_user_id",
  "lineuserid",
  "userid",
  "user_id",
  "message_text",
  "short_code",
  "fulfillment_code",
  "unlock_token",
  "url",
  "provider_output",
  "database_url",
  "line_channel_secret",
  "line_channel_access_token",
  "analysis_cache_hash_secret",
  "retention_cleanup_secret",
  "secret",
  "token",
];

export function isAllowedEventName(value: string): value is EventName {
  return EVENT_NAMES.includes(value as EventName);
}

export function hasForbiddenEventMetadata(metadata: unknown): boolean {
  if (!metadata || typeof metadata !== "object") {
    return false;
  }

  for (const [key, value] of Object.entries(metadata)) {
    const normalizedKey = key.toLowerCase();

    if (FORBIDDEN_METADATA_KEYS.includes(normalizedKey)) {
      return true;
    }

    if (value && typeof value === "object" && hasForbiddenEventMetadata(value)) {
      return true;
    }
  }

  return false;
}
