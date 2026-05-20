"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/anyu/Button";
import { Card } from "@/components/anyu/Card";
import { LEGAL_CONTACT_EMAIL } from "@/content/legal";
import {
  EMAIL_FALLBACK_BODY,
  EMAIL_FALLBACK_LABEL,
  LINE_PRIMARY_BODY,
  LINE_PRIMARY_CTA,
  LINE_PRIMARY_PANEL_TITLE,
  MISSING_LINE_URL_MESSAGE,
} from "@/lib/modules/ai-temperature-ui";

type ContactCapturePayload = {
  email?: string;
  lineId?: string;
  consent: boolean;
};

type ContactCaptureProps = {
  visible?: boolean;
  noticeMessage?: string;
  lineAddUrl?: string | null;
  onLineAddClick?: () => Promise<void> | void;
  onEmailFallbackOpen?: () => Promise<void> | void;
  onSubmit?: (
    payload: ContactCapturePayload,
  ) => Promise<{ ok: boolean; message: string }>;
};

export function ContactCapture({
  visible = true,
  noticeMessage,
  lineAddUrl,
  onLineAddClick,
  onEmailFallbackOpen,
  onSubmit,
}: ContactCaptureProps) {
  const [contactValue, setContactValue] = useState("");
  const [consent, setConsent] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isEmailFallbackOpen, setIsEmailFallbackOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!visible) {
    return null;
  }

  async function openEmailFallback() {
    if (!isEmailFallbackOpen) {
      await onEmailFallbackOpen?.();
    }

    setIsEmailFallbackOpen(true);
    setErrorMessage("");
    setStatusMessage("");
  }

  async function handleLinePrimaryClick() {
    if (!lineAddUrl) {
      setErrorMessage(MISSING_LINE_URL_MESSAGE);
      await openEmailFallback();
      return;
    }

    await onLineAddClick?.();

    if (typeof window !== "undefined") {
      window.location.href = lineAddUrl;
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!onSubmit) {
      setStatusMessage("這是 demo 路線，目前不會真的送出，但正式流程已預留位置。");
      setErrorMessage("");
      setIsSubmitted(true);
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const response = await onSubmit({
        email: contactValue,
        consent,
      });

      if (!response.ok) {
        setErrorMessage(response.message);
        return;
      }

      setStatusMessage(response.message);
      setContactValue("");
      setConsent(false);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="anyu-contact-card">
      <p className="anyu-kicker">目前內測中</p>
      <h2 className="anyu-section-title">
        {isSubmitted ? "收到，我們會在開放時通知你。" : LINE_PRIMARY_PANEL_TITLE}
      </h2>
      <p className="anyu-copy">
        {isSubmitted
          ? "我們會優先用你留下的方式通知完整分析開放或新測驗上線。這次不會真的收費。"
          : LINE_PRIMARY_BODY}
      </p>
      <p className="anyu-subtle-note">
        你可以隨時封鎖官方帳號，或來信 {LEGAL_CONTACT_EMAIL} 要求刪除資料。
      </p>
      {noticeMessage ? <p className="anyu-subtle-note">{noticeMessage}</p> : null}

      {isSubmitted ? null : !isEmailFallbackOpen ? (
        <div className="anyu-contact-stack">
          <Button
            type="button"
            className="anyu-button-block"
            onClick={handleLinePrimaryClick}
          >
            {LINE_PRIMARY_CTA}
          </Button>

          <button
            type="button"
            className="anyu-inline-link-button"
            onClick={() => {
              void openEmailFallback();
            }}
          >
            {EMAIL_FALLBACK_LABEL}
          </button>

          {lineAddUrl ? null : <p className="anyu-subtle-note">{MISSING_LINE_URL_MESSAGE}</p>}
        </div>
      ) : (
        <form className="anyu-contact-grid" onSubmit={handleSubmit}>
          <p className="anyu-subtle-note">{EMAIL_FALLBACK_BODY}</p>

          <label className="anyu-contact-field">
            <span className="anyu-field-label">Email</span>
            <input
              className="anyu-input"
              type="email"
              value={contactValue}
              onChange={(event) => setContactValue(event.target.value)}
              placeholder="name@example.com"
            />
          </label>

          <label className="anyu-consent-row">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            <span>我同意留下 Email，供完整分析開放通知與必要的新測驗通知使用。</span>
          </label>

          <Button type="submit" className="anyu-button-block" disabled={isSubmitting}>
            {isSubmitting ? "送出中..." : "送出 Email 通知"}
          </Button>
        </form>
      )}

      {statusMessage ? <p className="anyu-status-message">{statusMessage}</p> : null}
      {errorMessage ? (
        <p className="anyu-status-message anyu-status-message-error">{errorMessage}</p>
      ) : null}

      <p className="anyu-subtle-note">不寄電子報 · 不分享第三方 · 僅儲存必要聯絡資料</p>
    </Card>
  );
}
