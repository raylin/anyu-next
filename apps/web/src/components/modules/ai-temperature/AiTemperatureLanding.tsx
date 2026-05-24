"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { InputCard } from "@/components/anyu/InputCard";
import { LegalFooter } from "@/components/anyu/LegalFooter";
import { Wordmark } from "@/components/anyu/Wordmark";
import { trackClientEvent } from "@/lib/events/client";
import {
  AI_TEMPERATURE_CONTEXT_GROUPS,
  compactUserContext,
  type AiTemperatureContextKey,
  type AiTemperatureUserContext,
} from "@/lib/modules/ai-temperature-context";
import {
  ANALYZE_POLL_INTERVAL_MS,
  ANALYZE_POLL_TIMEOUT_MS,
  ANALYZE_RECOVERY_STORAGE_KEY,
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
import type {
  AnalyzeRequestStatusResponse,
  AnalyzeResponse,
  ApiErrorResponse,
} from "@/lib/ai/types";
import type { ProductModuleConfig } from "@/lib/modules/types";

type AiTemperatureLandingProps = {
  moduleConfig: ProductModuleConfig;
};

type AnalyzeRecoveryState = {
  moduleSlug: string;
  requestId?: string;
  resultId?: string;
  pollUrl?: string;
  createdAt: number;
};

function readAnalyzeRecoveryState(moduleSlug: string): AnalyzeRecoveryState | null {
  try {
    const rawValue = window.localStorage.getItem(ANALYZE_RECOVERY_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as Partial<AnalyzeRecoveryState>;

    if (parsed.moduleSlug !== moduleSlug || !parsed.createdAt) {
      return null;
    }

    return {
      moduleSlug: parsed.moduleSlug,
      requestId: parsed.requestId,
      resultId: parsed.resultId,
      pollUrl: parsed.pollUrl,
      createdAt: parsed.createdAt,
    };
  } catch {
    window.localStorage.removeItem(ANALYZE_RECOVERY_STORAGE_KEY);
    return null;
  }
}

function writeAnalyzeRecoveryState(state: AnalyzeRecoveryState) {
  window.localStorage.setItem(ANALYZE_RECOVERY_STORAGE_KEY, JSON.stringify(state));
}

function clearAnalyzeRecoveryState() {
  window.localStorage.removeItem(ANALYZE_RECOVERY_STORAGE_KEY);
}

export function AiTemperatureLanding({
  moduleConfig,
}: AiTemperatureLandingProps) {
  const router = useRouter();
  const [selectedChip] = useState(moduleConfig.chips[moduleConfig.chips.length - 1] ?? "");
  const [userContext, setUserContext] = useState<AiTemperatureUserContext>({});
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingElapsedMs, setLoadingElapsedMs] = useState(0);
  const hasTrackedInputStarted = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const pollTimeoutRef = useRef<number | null>(null);

  const pollAnalyzeRequest = useCallback(async (pollUrl: string): Promise<void> => {
    const startedAt = Date.now();

    while (Date.now() - startedAt <= ANALYZE_POLL_TIMEOUT_MS) {
      const response = await fetch(pollUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });
      const data = (await response.json()) as AnalyzeRequestStatusResponse | ApiErrorResponse;

      if (!response.ok || !data.ok) {
        clearAnalyzeRecoveryState();
        setErrorMessage(getAnalyzeErrorMessage("provider_error"));
        setIsSubmitting(false);
        return;
      }

      if (data.status === "completed") {
        writeAnalyzeRecoveryState({
          moduleSlug: moduleConfig.slug,
          resultId: data.resultId,
          createdAt: Date.now(),
        });
        clearAnalyzeRecoveryState();
        router.push(data.redirectTo);
        return;
      }

      if (data.status === "failed" || data.status === "expired") {
        clearAnalyzeRecoveryState();
        setErrorMessage(data.message || getAnalyzeErrorMessage(data.errorCode));
        setIsSubmitting(false);
        return;
      }

      await new Promise<void>((resolve) => {
        pollTimeoutRef.current = window.setTimeout(resolve, ANALYZE_POLL_INTERVAL_MS);
      });
    }

    clearAnalyzeRecoveryState();
    setErrorMessage(getAnalyzeErrorMessage("request_timeout"));
    setIsSubmitting(false);
  }, [moduleConfig.slug, router]);

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
    const recoveryState = readAnalyzeRecoveryState(moduleConfig.slug);

    if (!recoveryState) {
      return;
    }

    if (recoveryState.resultId) {
      clearAnalyzeRecoveryState();
      router.push(`/m/${moduleConfig.slug}/result/${recoveryState.resultId}`);
      return;
    }

    if (recoveryState.requestId && Date.now() - recoveryState.createdAt <= ANALYZE_POLL_TIMEOUT_MS) {
      const timeoutId = window.setTimeout(() => {
        setIsSubmitting(true);
        setErrorMessage("");
        void pollAnalyzeRequest(
          recoveryState.pollUrl ??
            `/api/modules/${moduleConfig.slug}/analyze/requests/${recoveryState.requestId}`,
        );
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    clearAnalyzeRecoveryState();
  }, [moduleConfig.slug, pollAnalyzeRequest, router]);

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
    return () => {
      if (pollTimeoutRef.current) {
        window.clearTimeout(pollTimeoutRef.current);
      }
    };
  }, []);

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

  function handleContextSelect(key: AiTemperatureContextKey, value: string) {
    setUserContext((current) => compactUserContext({
      ...current,
      [key]: value,
    }));
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
    const compactedContext = compactUserContext(userContext);
    const contextFieldCount = Object.keys(compactedContext).length;

    void trackClientEvent({
      eventName: "analysis_started",
      moduleConfig,
      anonymousSessionId,
      situationType: selectedChip,
      metadata: {
        inputCharCount: inputValue.trim().length,
        userContextProvided: contextFieldCount > 0,
        userContextFieldCount: contextFieldCount,
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
            userContext: compactedContext,
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
              userContextProvided: contextFieldCount > 0,
              userContextFieldCount: contextFieldCount,
            },
          });
          return;
        }

        if (data.status === "processing") {
          writeAnalyzeRecoveryState({
            moduleSlug: moduleConfig.slug,
            requestId: data.requestId,
            pollUrl: data.pollUrl,
            createdAt: Date.now(),
          });
          await pollAnalyzeRequest(data.pollUrl);
          return;
        }

        writeAnalyzeRecoveryState({
          moduleSlug: moduleConfig.slug,
          requestId: data.requestId,
          resultId: data.resultId,
          createdAt: Date.now(),
        });
        clearAnalyzeRecoveryState();
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
          userContextProvided: contextFieldCount > 0,
          userContextFieldCount: contextFieldCount,
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
        <span aria-hidden="true" />
        <Wordmark className="anyu-wordmark-quiet" showMark />
      </header>

      <section className="anyu-hero-block anyu-hero-block-landing" aria-labelledby="anyu-hero-title">
        <p className="anyu-kicker t-label-dim">{getModuleLabel(moduleConfig)}</p>
        <div className="anyu-hero-copy">
          <div className="anyu-hero-glow" aria-hidden="true" />
          <h1 id="anyu-hero-title" className="anyu-hero-title">
            {moduleConfig.title}
          </h1>
          <p className="anyu-copy">{moduleConfig.subtitle}</p>
        </div>
      </section>

      <InputCard
        inputValue={inputValue}
        contextGroups={AI_TEMPERATURE_CONTEXT_GROUPS}
        selectedContext={userContext}
        onContextSelect={handleContextSelect}
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
