"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { InputCard } from "@/components/anyu/InputCard";
import { LegalFooter } from "@/components/anyu/LegalFooter";
import { Wordmark } from "@/components/anyu/Wordmark";
import { trackClientEvent } from "@/lib/events/client";
import {
  ANALYZE_REQUEST_TIMEOUT_MS,
  getAnalyzeLoadingMessage,
  getAnalyzeLoadingSubtitle,
  getClientAnonymousSessionId,
  getAnalyzeErrorMessage,
  getAnalyzeInputGuidance,
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
  const [loadingElapsedMs, setLoadingElapsedMs] = useState(0);
  const hasTrackedInputStarted = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
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

    const startedAt = Date.now();
    const intervalId = window.setInterval(() => {
      setLoadingElapsedMs(Date.now() - startedAt);
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isSubmitting]);

  useEffect(() => {
    if (!isSubmitting) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      loadingRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      loadingRef.current?.focus({ preventScroll: true });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
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

    textareaRef.current?.blur();
    setIsSubmitting(true);
    setErrorMessage("");
    setLoadingElapsedMs(0);

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
      const abortController = new AbortController();
      const timeoutId = window.setTimeout(() => {
        abortController.abort();
      }, ANALYZE_REQUEST_TIMEOUT_MS);
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
          signal: abortController.signal,
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
      } finally {
        window.clearTimeout(timeoutId);
      }
    } catch (error) {
      const normalizedReason =
        error instanceof DOMException && error.name === "AbortError"
          ? "request_timeout"
          : "network_or_runtime_error";

      setErrorMessage(getAnalyzeErrorMessage(normalizedReason));
      void trackClientEvent({
        eventName: "analysis_failed",
        moduleConfig,
        anonymousSessionId,
        situationType: selectedChip,
        metadata: {
          reason: normalizedReason,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const ctaLabel = isSubmitting ? "分析中..." : getAnalyzeButtonLabel(inputValue);
  const ctaDisabled = isSubmitting || !isAnalyzeInputReady(inputValue);
  const inputGuidance = getAnalyzeInputGuidance(inputValue);
  const statusMessage = isSubmitting ? getAnalyzeLoadingMessage(loadingElapsedMs) : "";
  const statusDetail = isSubmitting ? getAnalyzeLoadingSubtitle(loadingElapsedMs) : "";

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
        </div>
      </section>

      <InputCard
        chips={moduleConfig.chips}
        selectedChip={selectedChip}
        inputValue={inputValue}
        onChipSelect={setSelectedChip}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        textareaRef={textareaRef}
        loadingRef={loadingRef}
        ctaLabel={ctaLabel}
        ctaDisabled={ctaDisabled}
        isLoading={isSubmitting}
        errorMessage={errorMessage}
        inputGuidance={inputGuidance}
        statusMessage={statusMessage}
        statusDetail={statusDetail}
      />

      <LegalFooter />
    </section>
  );
}
