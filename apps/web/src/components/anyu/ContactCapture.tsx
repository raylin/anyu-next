"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/anyu/Button";
import { Card } from "@/components/anyu/Card";

type ContactCapturePayload = {
  email?: string;
  lineId?: string;
  consent: boolean;
};

type ContactCaptureProps = {
  visible?: boolean;
  noticeMessage?: string;
  onSubmit?: (
    payload: ContactCapturePayload,
  ) => Promise<{ ok: boolean; message: string }>;
};

export function ContactCapture({
  visible = true,
  noticeMessage,
  onSubmit,
}: ContactCaptureProps) {
  const [contactType, setContactType] = useState<"line" | "email">("line");
  const [contactValue, setContactValue] = useState("");
  const [consent, setConsent] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!visible) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!onSubmit) {
      setStatusMessage("這是 demo 路線，目前不會真的送出。");
      setErrorMessage("");
      setIsSubmitted(true);
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const response = await onSubmit({
        email: contactType === "email" ? contactValue : undefined,
        lineId: contactType === "line" ? contactValue : undefined,
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
        {isSubmitted ? "收到，完整分析會補送給你。" : "這次不會真的收費。"}
      </h2>
      <p className="anyu-copy">
        {isSubmitted
          ? "我們會用你留下的方式送出一次完整分析。這次不會真的收費。"
          : "留下 LINE 或 Email，我們會送你一次完整分析。"}
      </p>
      {noticeMessage ? <p className="anyu-subtle-note">{noticeMessage}</p> : null}

      {isSubmitted ? null : (
        <form className="anyu-contact-grid" onSubmit={handleSubmit}>
          <label className="anyu-contact-field">
            <span className="anyu-field-label">聯絡方式</span>
            <select
              className="anyu-select"
              value={contactType}
              onChange={(event) =>
                setContactType(event.target.value === "email" ? "email" : "line")
              }
            >
              <option value="line">LINE</option>
              <option value="email">Email</option>
            </select>
          </label>

          <label className="anyu-contact-field">
            <span className="anyu-field-label">
              {contactType === "email" ? "Email" : "LINE ID"}
            </span>
            <input
              className="anyu-input"
              type={contactType === "email" ? "email" : "text"}
              value={contactValue}
              onChange={(event) => setContactValue(event.target.value)}
              placeholder={
                contactType === "email" ? "name@example.com" : "@your_line_id"
              }
            />
          </label>

          <label className="anyu-consent-row">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            <span>我同意留下聯絡方式，供內測完整分析回傳使用。</span>
          </label>

          <Button type="submit" className="anyu-button-block" disabled={isSubmitting}>
            {isSubmitting ? "送出中..." : "送出 · 等我們的完整分析"}
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
