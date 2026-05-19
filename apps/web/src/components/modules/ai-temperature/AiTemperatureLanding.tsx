"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { InputCard } from "@/components/anyu/InputCard";
import { Wordmark } from "@/components/anyu/Wordmark";
import { trackClientEvent } from "@/lib/events/client";
import {
  getAnalyzeLoadingMessage,
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
  const [loadingStep, setLoadingStep] = useState(0);
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

  useEffect(() => {
    if (!isSubmitting) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setLoadingStep((currentStep) => currentStep + 1);
    }, 4200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isSubmitting]);

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
    setLoadingStep(0);

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
  const statusMessage = isSubmitting ? getAnalyzeLoadingMessage(loadingStep) : "";

  return (
    <section className="anyu-module-page">
      <header className="anyu-topbar anyu-topbar-landing">
        <p className="anyu-topbar-tag">{moduleConfig.family}</p>
        <Wordmark className="anyu-wordmark-quiet" />
      </header>

      <section className="anyu-hero-block anyu-hero-block-landing" aria-labelledby="anyu-hero-title">
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
          <p className="anyu-topbar-subline anyu-brand-byline">by 暗語 ANYU</p>
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
