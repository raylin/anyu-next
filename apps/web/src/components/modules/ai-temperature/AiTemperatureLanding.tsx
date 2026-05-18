"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { InputCard } from "@/components/anyu/InputCard";
import { Wordmark } from "@/components/anyu/Wordmark";
import {
  getAnalyzeButtonLabel,
  getModuleLabel,
  isAnalyzeInputReady,
} from "@/lib/modules/ai-temperature-ui";
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
  const titleParts = moduleConfig.title.split("，");

  function handleInputChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setInputValue(event.target.value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAnalyzeInputReady(inputValue)) {
      return;
    }

    router.push(`/m/${moduleConfig.slug}/result/demo`);
  }

  const ctaLabel = getAnalyzeButtonLabel(inputValue);
  const ctaDisabled = !isAnalyzeInputReady(inputValue);

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
      />
    </section>
  );
}
