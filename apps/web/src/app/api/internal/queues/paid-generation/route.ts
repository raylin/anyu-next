import { QueueClient } from "@vercel/queue";
import { processPaidJobQueueMessage } from "@/lib/payments/paid-job-queue-consumer";

export const runtime = "nodejs";
export const maxDuration = 90;

const queue = new QueueClient({ region: process.env.VERCEL_REGION || "iad1" });

export const POST = queue.handleCallback(async (message) => {
  const result = await processPaidJobQueueMessage({ message });

  if (!result.ok) {
    throw new Error(result.category);
  }
});
