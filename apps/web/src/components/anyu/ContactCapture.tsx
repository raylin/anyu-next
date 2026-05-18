import { Card } from "@/components/anyu/Card";

type ContactCaptureProps = {
  visible?: boolean;
};

export function ContactCapture({ visible = true }: ContactCaptureProps) {
  if (!visible) {
    return null;
  }

  return (
    <Card className="anyu-contact-card">
      <p className="anyu-kicker">目前內測中</p>
      <h2 className="anyu-section-title">這次不會真的收費。</h2>
      <p className="anyu-copy">留下 LINE 或 Email，我們會送你一次完整分析。</p>

      <div className="anyu-contact-grid" aria-label="聯絡方式占位區">
        <div className="anyu-contact-field">
          <span className="anyu-field-label">聯絡方式</span>
          <div className="anyu-contact-placeholder">LINE / Email</div>
        </div>
        <div className="anyu-contact-field">
          <span className="anyu-field-label">聯絡資訊</span>
          <div className="anyu-contact-placeholder">UI placeholder only</div>
        </div>
      </div>

      <p className="anyu-subtle-note">不寄電子報 · 不分享第三方 · 送出流程尚未接 API</p>
    </Card>
  );
}
