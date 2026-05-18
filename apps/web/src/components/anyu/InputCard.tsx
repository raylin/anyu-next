import type { ChangeEventHandler, FormEventHandler } from "react";
import { Button } from "@/components/anyu/Button";
import { Card } from "@/components/anyu/Card";
import { PrivacyHelper } from "@/components/anyu/PrivacyHelper";
import { SituationChips } from "@/components/anyu/SituationChips";

type InputCardProps = {
  chips: readonly string[];
  selectedChip: string;
  inputValue: string;
  onChipSelect: (chip: string) => void;
  onInputChange: ChangeEventHandler<HTMLTextAreaElement>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  ctaLabel: string;
  ctaDisabled: boolean;
  errorMessage?: string;
  statusMessage?: string;
};

export function InputCard({
  chips,
  selectedChip,
  inputValue,
  onChipSelect,
  onInputChange,
  onSubmit,
  ctaLabel,
  ctaDisabled,
  errorMessage,
  statusMessage,
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
            value={inputValue}
            onChange={onInputChange}
          />
        </label>

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

        <p className="anyu-small-note">免費 · 約 8 秒 · 結果可截圖分享</p>
        <p className="anyu-subtle-note">不寄電子報 · 不分享第三方</p>
        {statusMessage ? <p className="anyu-status-message">{statusMessage}</p> : null}
        {errorMessage ? (
          <p className="anyu-status-message anyu-status-message-error">{errorMessage}</p>
        ) : null}
      </form>
    </Card>
  );
}
