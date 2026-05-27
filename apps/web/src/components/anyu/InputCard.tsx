"use client";

import { useState, type ChangeEventHandler, type FormEventHandler, type RefObject } from "react";
import { AnyuMark } from "@/components/anyu/AnyuMark";
import { Button } from "@/components/anyu/Button";
import { Card } from "@/components/anyu/Card";
import { PrivacyHelper } from "@/components/anyu/PrivacyHelper";
import { SituationChips } from "@/components/anyu/SituationChips";
import { uiNotices } from "@/content/legal";
import type {
  AiTemperatureContextGroup,
  AiTemperatureContextKey,
  AiTemperatureUserContext,
} from "@/lib/modules/ai-temperature-context";
import type { AnalyzeInputGuidance } from "@/lib/modules/ai-temperature-ui";

type InputCardProps = {
  inputValue: string;
  contextGroups?: readonly AiTemperatureContextGroup[];
  selectedContext?: AiTemperatureUserContext;
  onContextSelect?: (key: AiTemperatureContextKey, value: string) => void;
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
  inputValue,
  contextGroups = [],
  selectedContext = {},
  onContextSelect,
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
  const [contextExpanded, setContextExpanded] = useState(true);
  const hasSelectedContext = Object.values(selectedContext).some(Boolean);
  const showContextBody = contextExpanded || hasSelectedContext;

  return (
    <Card className="anyu-input-card">
      <form className="anyu-form-grid" onSubmit={onSubmit}>
        <div className="anyu-card-head">
          <p className="anyu-kicker t-label-dim">{"// 貼一段對話 · 或用自己的話描述"}</p>
        </div>

        <label className="anyu-field-group" htmlFor="anyu-input-text">
          <span className="anyu-field-label">情境描述</span>
          <textarea
            id="anyu-input-text"
            className="anyu-textarea anyu-textarea-lg"
            placeholder="例如：我們上週末見面聊得很好，他說下次可以再約。但這幾天回訊變慢，常隔半天才回，卻還是會看限動、偶爾傳生活小事。我不知道他是真的忙，還是熱度在變低。"
            rows={7}
            ref={textareaRef}
            value={inputValue}
            onChange={onInputChange}
          />
        </label>

        {inputGuidance ? (
          <div
            className={`anyu-guidance-card anyu-guidance-soft anyu-guidance-${inputGuidance.state}`}
            aria-live="polite"
          >
            <div className="anyu-guidance-head">
              <span className="anyu-guidance-label">{inputGuidance.label}</span>
              {inputGuidance.counterText ? (
                <span className="anyu-guidance-meta">{inputGuidance.counterText}</span>
              ) : null}
            </div>
            <p className="anyu-guidance-copy">{inputGuidance.detail}</p>
            <div className="anyu-guidance-indicator" aria-hidden="true">
              <span
                className={`anyu-guidance-dot ${["too_short", "almost_ready", "can_analyze", "ideal", "rich", "long", "too_long"].includes(inputGuidance.state) ? "anyu-guidance-dot-active" : ""}`}
              />
              <span
                className={`anyu-guidance-dot ${["almost_ready", "can_analyze", "ideal", "rich", "long", "too_long"].includes(inputGuidance.state) ? "anyu-guidance-dot-active" : ""}`}
              />
              <span
                className={`anyu-guidance-dot ${["can_analyze", "ideal", "rich", "long", "too_long"].includes(inputGuidance.state) ? "anyu-guidance-dot-active" : ""}`}
              />
              <span
                className={`anyu-guidance-dot ${["ideal", "rich", "long", "too_long"].includes(inputGuidance.state) ? "anyu-guidance-dot-active" : ""}`}
              />
              <span
                className={`anyu-guidance-dot ${["rich", "long", "too_long"].includes(inputGuidance.state) ? "anyu-guidance-dot-active" : ""}`}
              />
            </div>
          </div>
        ) : null}

        <PrivacyHelper />

        {contextGroups.length > 0 ? (
          <div className="anyu-field-group">
            <div className="anyu-field-stack">
              <button
                type="button"
                className="anyu-context-toggle"
                aria-expanded={showContextBody}
                onClick={() => setContextExpanded((current) => !current)}
              >
                讓結果更貼近你（選填）
              </button>
              <p className="anyu-subtle-note">
                這些只會當作分析偏好，不會取代你貼上的互動內容。
              </p>
            </div>
            {showContextBody ? (
              <div className="anyu-form-grid">
                {contextGroups.map((group) => (
                  <div key={group.key} className="anyu-field-stack">
                    <span className="anyu-field-label">{group.label}</span>
                    <SituationChips
                      chips={group.options}
                      selectedChip={selectedContext[group.key]}
                      onSelect={(value) => onContextSelect?.(group.key, value)}
                      ariaLabel={group.label}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="anyu-input-privacy-inline">
          <span className="anyu-input-privacy-inline-rule" aria-hidden="true" />
          <p>你貼上的內容只用於產生這次結果；系統會依保留規則自動清理分析資料。</p>
        </div>

        <Button
          type="submit"
          disabled={ctaDisabled}
          className={[
            "anyu-button-block",
            ctaDisabled ? "anyu-button-soft-disabled" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {ctaLabel}
        </Button>

        <p className="anyu-subtle-note">{uiNotices.ctaConsent}</p>
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
              <span className="anyu-loading-mark" aria-hidden="true">
                <AnyuMark size={26} animated decorative />
              </span>
              <div className="anyu-status-copy">
                <p className="anyu-loading-title">{statusMessage}</p>
                {statusDetail ? <p className="anyu-loading-detail">{statusDetail}</p> : null}
              </div>
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
