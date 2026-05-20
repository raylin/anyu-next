import type { ChangeEventHandler, FormEventHandler, RefObject } from "react";
import { Button } from "@/components/anyu/Button";
import { Card } from "@/components/anyu/Card";
import { PrivacyHelper } from "@/components/anyu/PrivacyHelper";
import { SituationChips } from "@/components/anyu/SituationChips";
import type { AnalyzeInputGuidance } from "@/lib/modules/ai-temperature-ui";

type InputCardProps = {
  chips: readonly string[];
  selectedChip: string;
  inputValue: string;
  onChipSelect: (chip: string) => void;
  onInputChange: ChangeEventHandler<HTMLTextAreaElement>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
  loadingRef?: RefObject<HTMLDivElement | null>;
  ctaLabel: string;
  ctaDisabled: boolean;
  isLoading?: boolean;
  errorMessage?: string;
  inputGuidance?: AnalyzeInputGuidance;
  statusMessage?: string;
  statusDetail?: string;
};

export function InputCard({
  chips,
  selectedChip,
  inputValue,
  onChipSelect,
  onInputChange,
  onSubmit,
  textareaRef,
  loadingRef,
  ctaLabel,
  ctaDisabled,
  isLoading = false,
  errorMessage,
  inputGuidance,
  statusMessage,
  statusDetail,
}: InputCardProps) {
  return (
    <Card className="anyu-input-card">
      <form className="anyu-form-grid" onSubmit={onSubmit}>
        <div className="anyu-card-head">
          <p className="anyu-kicker">{"// 貼一段對話 · 或用自己的話描述"}</p>
        </div>

        <label className="anyu-field-group" htmlFor="anyu-input-text">
          <span className="anyu-field-label">情境描述</span>
          <textarea
            id="anyu-input-text"
            className="anyu-textarea anyu-textarea-lg"
            placeholder="例如：我昨天約他週末見面，他已讀後沒回，但晚上還在發限動。"
            rows={7}
            ref={textareaRef}
            value={inputValue}
            onChange={onInputChange}
          />
        </label>

        {inputGuidance ? (
          <div
            className={`anyu-guidance-card anyu-guidance-${inputGuidance.state}`}
            aria-live="polite"
          >
            <div className="anyu-guidance-head">
              <span className="anyu-guidance-label">{inputGuidance.label}</span>
              {inputGuidance.showMaxCounter ? (
                <span className="anyu-guidance-meta">{inputValue.trim().length} / 4000</span>
              ) : null}
            </div>
            <p className="anyu-guidance-copy">{inputGuidance.detail}</p>
            <div className="anyu-guidance-indicator" aria-hidden="true">
              <span
                className={`anyu-guidance-dot ${["too_short", "can_analyze", "ideal", "long", "too_long"].includes(inputGuidance.state) ? "anyu-guidance-dot-active" : ""}`}
              />
              <span
                className={`anyu-guidance-dot ${["can_analyze", "ideal", "long", "too_long"].includes(inputGuidance.state) ? "anyu-guidance-dot-active" : ""}`}
              />
              <span
                className={`anyu-guidance-dot ${["ideal", "long", "too_long"].includes(inputGuidance.state) ? "anyu-guidance-dot-active" : ""}`}
              />
              <span
                className={`anyu-guidance-dot ${["long", "too_long"].includes(inputGuidance.state) ? "anyu-guidance-dot-active" : ""}`}
              />
            </div>
          </div>
        ) : null}

        <PrivacyHelper />

        <div className="anyu-field-group">
          <div className="anyu-field-stack">
            <span className="anyu-field-label">情境 · 可選</span>
          </div>
          <SituationChips
            chips={chips}
            selectedChip={selectedChip}
            onSelect={onChipSelect}
          />
        </div>

        <Button type="submit" disabled={ctaDisabled} className="anyu-button-block">
          {ctaLabel}
        </Button>

        <p className="anyu-small-note">免費 · 結果可截圖分享</p>
        <p className="anyu-subtle-note">不寄電子報 · 不分享第三方</p>
        {statusMessage ? (
          <div
            ref={loadingRef}
            tabIndex={-1}
            role="status"
            aria-live="polite"
            className={["anyu-status-panel", isLoading ? "anyu-status-panel-loading" : ""].filter(Boolean).join(" ")}
          >
            <div className="anyu-loading-head">
              <span className="anyu-loading-moon" aria-hidden="true" />
              <div className="anyu-status-copy">
                <p className="anyu-loading-title">{statusMessage}</p>
                {statusDetail ? <p className="anyu-loading-detail">{statusDetail}</p> : null}
              </div>
            </div>
            <div className="anyu-loading-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p className="anyu-loading-hint">請稍候片刻</p>
            <div className="anyu-loading-tip">
              <span className="anyu-loading-tip-kicker">{"// reminder"}</span>
              <p className="anyu-loading-tip-copy">這不是判決，是給你一個多看一眼的角度。</p>
            </div>
          </div>
        ) : null}
        {errorMessage ? (
          <p className="anyu-status-message anyu-status-message-error">{errorMessage}</p>
        ) : null}
      </form>
    </Card>
  );
}
