import { hashFulfillmentSecret } from "@/lib/line/fulfillment";
import type { LineWebhookEvent } from "@/lib/line/webhook";

export const LINE_WEBHOOK_RATE_WINDOW_MS = 10 * 60 * 1000;
export const LINE_WEBHOOK_INVALID_ATTEMPT_LIMIT = 5;

export function buildLineWebhookDedupeKey(event: LineWebhookEvent): string {
  if (event.webhookEventId?.trim()) {
    return `event:${event.webhookEventId.trim()}`;
  }

  const stableParts = [
    event.type,
    String(event.timestamp ?? ""),
    event.replyToken ? hashFulfillmentSecret(event.replyToken) : "",
  ];

  return `derived:${hashFulfillmentSecret(stableParts.join(":"))}`;
}

export function getLineWebhookRateWindowStart(now = new Date()) {
  return new Date(Math.floor(now.getTime() / LINE_WEBHOOK_RATE_WINDOW_MS) * LINE_WEBHOOK_RATE_WINDOW_MS);
}

export function isLineWebhookRateLimited(input: {
  invalidAttemptCount: number;
  limit?: number;
}) {
  return input.invalidAttemptCount > (input.limit ?? LINE_WEBHOOK_INVALID_ATTEMPT_LIMIT);
}
