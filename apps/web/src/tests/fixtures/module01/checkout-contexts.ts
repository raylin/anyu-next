export type Module01CheckoutHarnessState =
  | "desktop_locked"
  | "email_saved"
  | "mobile_locked"
  | "line_deliverable"
  | "line_contact_only";

export const MODULE01_CHECKOUT_HARNESS_STATES: Module01CheckoutHarnessState[] = [
  "desktop_locked",
  "email_saved",
  "mobile_locked",
  "line_deliverable",
  "line_contact_only",
];

export const MODULE01_CHECKOUT_EXPECTATIONS = {
  desktop_locked: {
    device: "desktop",
    paymentUnlocked: false,
    emailVisible: true,
    lineVisible: false,
  },
  email_saved: {
    device: "mobile",
    paymentUnlocked: true,
    emailVisible: true,
    lineVisible: true,
  },
  mobile_locked: {
    device: "mobile",
    paymentUnlocked: false,
    emailVisible: true,
    lineVisible: true,
  },
  line_deliverable: {
    device: "mobile",
    paymentUnlocked: true,
    emailVisible: true,
    lineVisible: true,
  },
  line_contact_only: {
    device: "mobile",
    paymentUnlocked: false,
    emailVisible: true,
    lineVisible: true,
  },
} as const satisfies Record<Module01CheckoutHarnessState, {
  device: "desktop" | "mobile";
  paymentUnlocked: boolean;
  emailVisible: boolean;
  lineVisible: boolean;
}>;

