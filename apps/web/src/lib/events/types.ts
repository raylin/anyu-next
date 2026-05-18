export const EVENT_NAMES = [
  "page_view",
  "input_started",
  "input_submitted",
  "analysis_completed",
  "paid_unlock_clicked",
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

const FORBIDDEN_METADATA_KEYS = ["text", "rawtext", "input", "conversation"];

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
