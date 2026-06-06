export const MODULE01_ACCESS_LINK_STATES = {
  emailReady: {
    channel: "email",
    contactSaved: true,
    sent: true,
    active: true,
    deliverable: true,
  },
  lineReady: {
    channel: "line",
    contactSaved: true,
    recipientSecretExists: true,
    sent: true,
    active: true,
    deliverable: true,
  },
  lineIncomplete: {
    channel: "line",
    contactSaved: true,
    recipientSecretExists: false,
    sent: false,
    active: false,
    deliverable: false,
  },
} as const;

