export const MODULE01_LINE_LIFF_FIXTURES = {
  deliverable: {
    contactSaved: true,
    recipientSecretExists: true,
    deliverable: true,
    diagnosis: [],
  },
  contactOnly: {
    contactSaved: true,
    recipientSecretExists: false,
    deliverable: false,
    diagnosis: ["line_bind_incomplete", "line_recipient_secret_missing"],
  },
  notBound: {
    contactSaved: false,
    recipientSecretExists: false,
    deliverable: false,
    diagnosis: ["line_not_saved"],
  },
} as const;

