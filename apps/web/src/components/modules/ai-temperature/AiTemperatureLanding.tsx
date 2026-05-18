"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { InputCard } from "@/components/anyu/InputCard";
import { Wordmark } from "@/components/anyu/Wordmark";
import { trackClientEvent } from "@/lib/events/client";
import {
  getClientAnonymousSessionId,
  getAnalyzeErrorMessage,
  getAnalyzeButtonLabel,
  getModuleLabel,
  isAnalyzeInputReady,
} from "@/lib/modules/ai-temperature-ui";
import type { AnalyzeResponse } from "@/lib/ai/types";
import type { ProductModuleConfig } from "@/lib/modules/types";

type AiTemperatureLandingProps = {
  moduleConfig: ProductModuleConfig;
};

export function AiTemperatureLanding({
  moduleConfig,
}: AiTemperatureLandingProps) {
  const router = useRouter();
  const [selectedChip, setSelectedChip] = useState(moduleConfig.chips[0] ?? "");
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const hasTrackedInputStarted = useRef(false);
  const titleParts = moduleConfig.title.split("，");

  useEffect(() => {
    const anonymousSessionId = getClientAnonymousSessionId();

    void trackClientEvent({
      eventName: "page_view",
      moduleConfig,
      anonymousSessionId,
      metadata: {
        pageType: "landing",
      },
    });
  }, [moduleConfig]);

  function handleInputChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const nextValue = event.target.value;
    setInputValue(nextValue);

    if (!hasTrackedInputStarted.current && nextValue.trim().length > 0) {
      hasTrackedInputStarted.current = true;

      void trackClientEvent({
        eventName: "input_started",
        moduleConfig,
        anonymousSessionId: getClientAnonymousSessionId(),
        situationType: selectedChip,
      });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAnalyzeInputReady(inputValue) || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setStatusMessage("分析中...");

    const anonymousSessionId = getClientAnonymousSessionId();

    void trackClientEvent({
      eventName: "analysis_started",
      moduleConfig,
      anonymousSessionId,
      situationType: selectedChip,
      metadata: {
        inputCharCount: inputValue.trim().length,
      },
    });

    try {
      const response = await fetch(`/api/modules/${moduleConfig.slug}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputValue,
          situation: selectedChip,
          anonymousSessionId,
        }),
      });

      const data = (await response.json()) as AnalyzeResponse;

      if (!response.ok || !data.ok) {
        const normalizedError = data.ok ? "config_error" : data.error;
        const friendlyMessage = getAnalyzeErrorMessage(normalizedError);

        setErrorMessage(friendlyMessage);
        setStatusMessage("");
        void trackClientEvent({
          eventName: "analysis_failed",
          moduleConfig,
          anonymousSessionId,
          situationType: selectedChip,
          metadata: {
            reason: normalizedError,
          },
        });
        return;
      }

      router.push(data.redirectTo);
    } catch {
      setErrorMessage(getAnalyzeErrorMessage("analyze_failed"));
      setStatusMessage("");
      void trackClientEvent({
        eventName: "analysis_failed",
        moduleConfig,
        anonymousSessionId,
        situationType: selectedChip,
        metadata: {
          reason: "network_or_runtime_error",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const ctaLabel = isSubmitting ? "分析中..." : getAnalyzeButtonLabel(inputValue);
  const ctaDisabled = isSubmitting || !isAnalyzeInputReady(inputValue);

  return (
    <section className="anyu-module-page">
      <header className="anyu-topbar">
        <div className="anyu-topbar-brand">
          <Wordmark />
          <p className="anyu-topbar-subline">讀懂關係裡那些沒說出口的訊號</p>
        </div>
        <p className="anyu-topbar-tag">{moduleConfig.family}</p>
      </header>

      <section className="anyu-hero-block" aria-labelledby="anyu-hero-title">
        <p className="anyu-kicker">{getModuleLabel(moduleConfig)}</p>
        <div className="anyu-hero-copy">
          <div className="anyu-hero-glow" aria-hidden="true" />
          <h1 id="anyu-hero-title" className="anyu-hero-title">
            {titleParts.length > 1 ? (
              <>
                {titleParts[0]}，
                <br />
                {titleParts.slice(1).join("，")}
              </>
            ) : (
              moduleConfig.title
            )}
          </h1>
          <p className="anyu-copy">{moduleConfig.subtitle}</p>
        </div>
      </section>

      <InputCard
        chips={moduleConfig.chips}
        selectedChip={selectedChip}
        inputValue={inputValue}
        onChipSelect={setSelectedChip}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        ctaLabel={ctaLabel}
        ctaDisabled={ctaDisabled}
        errorMessage={errorMessage}
        statusMessage={statusMessage}
      />
    </section>
  );
}
