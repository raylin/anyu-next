import { MODULE01_ACCESS_LINK_STATES } from "./access-link-states";

export function createModule01AdminReadySummaryFixture() {
  return {
    module: "ai-temperature",
    payment: { status: "paid", provider: "newebpay" },
    entitlement: { status: "active" },
    generation: { status: "completed" },
    paidResult: { status: "completed" },
    accessLinks: {
      email: MODULE01_ACCESS_LINK_STATES.emailReady,
      line: MODULE01_ACCESS_LINK_STATES.lineReady,
    },
    diagnosis: ["paid_result_ready"],
    recommendedActions: ["ask_user_open_email_or_line_view_link"],
  };
}

export function createModule01AdminPartialLineBindSummaryFixture() {
  return {
    module: "ai-temperature",
    payment: { status: "pending", provider: "newebpay" },
    entitlement: { status: "none" },
    generation: { status: "not_started" },
    paidResult: { status: "not_started" },
    accessLinks: {
      email: { contactSaved: false, sent: false, active: false, deliverable: false },
      line: MODULE01_ACCESS_LINK_STATES.lineIncomplete,
    },
    diagnosis: ["line_bind_incomplete", "line_recipient_secret_missing"],
    recommendedActions: ["retry_line_bind_or_use_email"],
  };
}

