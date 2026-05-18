"use client";

import type { EventName, EventPayload } from "@/lib/events/types";
import type { ProductModuleConfig } from "@/lib/modules/types";

type SafeClientEventInput = {
  eventName: EventName;
  moduleConfig: ProductModuleConfig;
  anonymousSessionId: string;
  situationType?: string | null;
  scoreBucket?: string | null;
  metadata?: Record<string, unknown>;
};

export function buildClientEventPayload(
  input: SafeClientEventInput,
): EventPayload {
  return {
    eventName: input.eventName,
    moduleId: input.moduleConfig.moduleId,
    themeSlug: input.moduleConfig.slug,
    experimentId: input.moduleConfig.experimentId,
    visualVariant: "B",
    promptVersion: input.moduleConfig.promptVersion,
    schemaVersion: input.moduleConfig.schemaVersion,
    situationType: input.situationType ?? null,
    scoreBucket: input.scoreBucket ?? null,
    anonymousSessionId: input.anonymousSessionId,
    metadata: input.metadata ?? {},
  };
}

export async function trackClientEvent(
  input: SafeClientEventInput,
): Promise<void> {
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildClientEventPayload(input)),
    });
  } catch {
    // Launch-readiness analytics should never crash the UI.
  }
}
