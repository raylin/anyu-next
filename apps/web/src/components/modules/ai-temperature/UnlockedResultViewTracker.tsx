"use client";

import { useEffect, useRef } from "react";
import { trackClientEvent } from "@/lib/events/client";
import type { ModuleThemeSource, ModuleThemeVariant } from "@/lib/modules/module-theme";
import type { ProductModuleConfig } from "@/lib/modules/types";

export type UnlockedPaidResultSource = "provider" | "fallback" | "legacy" | "unknown";

type UnlockedResultViewTrackerProps = {
  moduleConfig: ProductModuleConfig;
  anonymousSessionId?: string | null;
  scoreBucket?: string | null;
  themeVariant?: ModuleThemeVariant | "unknown" | null;
  themeSource?: ModuleThemeSource | "local_storage" | "default" | "unknown" | null;
  themeCarryoverSource?: string | null;
  paidResultSource: UnlockedPaidResultSource;
  resultAgeBucket?: string | null;
  operatorTest?: boolean;
};

export function buildUnlockedResultViewMetadata(input: {
  moduleSlug: string;
  themeVariant?: ModuleThemeVariant | "unknown" | null;
  themeSource?: ModuleThemeSource | "local_storage" | "default" | "unknown" | null;
  themeCarryoverSource?: string | null;
  paidResultSource: UnlockedPaidResultSource;
  resultAgeBucket?: string | null;
  operatorTest?: boolean;
}) {
  return {
    moduleSlug: input.moduleSlug,
    themeVariant: input.themeVariant ?? "unknown",
    themeSource: input.themeSource ?? "unknown",
    ...(input.themeCarryoverSource ? { themeCarryoverSource: input.themeCarryoverSource } : {}),
    paidResultSource: input.paidResultSource,
    paidStatus: "completed",
    ...(input.resultAgeBucket ? { resultAgeBucket: input.resultAgeBucket } : {}),
    ...(input.operatorTest === true ? { operatorTest: true } : {}),
  };
}

export function UnlockedResultViewTracker({
  moduleConfig,
  anonymousSessionId,
  scoreBucket,
  themeVariant,
  themeSource,
  themeCarryoverSource,
  paidResultSource,
  resultAgeBucket,
  operatorTest,
}: UnlockedResultViewTrackerProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) {
      return;
    }

    hasTracked.current = true;
    void trackClientEvent({
      eventName: "unlocked_result_view",
      moduleConfig,
      anonymousSessionId,
      scoreBucket,
      metadata: buildUnlockedResultViewMetadata({
        moduleSlug: moduleConfig.slug,
        themeVariant,
        themeSource,
        themeCarryoverSource,
        paidResultSource,
        resultAgeBucket,
        operatorTest,
      }),
    });
  }, [
    anonymousSessionId,
    moduleConfig,
    operatorTest,
    paidResultSource,
    resultAgeBucket,
    scoreBucket,
    themeCarryoverSource,
    themeSource,
    themeVariant,
  ]);

  return null;
}
