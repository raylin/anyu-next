export type ContactSubmissionInput = {
  email?: string;
  lineId?: string;
  consent: boolean;
};

export type NormalizedContactSubmission = {
  email: string | null;
  lineId: string | null;
  consent: true;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactSubmission(
  input: ContactSubmissionInput,
): NormalizedContactSubmission {
  const email = input.email?.trim() || "";
  const lineId = input.lineId?.trim() || "";

  if (!input.consent) {
    throw new Error("需要勾選同意後才能送出。");
  }

  if (!email && !lineId) {
    throw new Error("請至少留下 Email 或 LINE ID。");
  }

  if (email && !EMAIL_PATTERN.test(email)) {
    throw new Error("Email 格式看起來不太對，請再檢查一次。");
  }

  return {
    email: email || null,
    lineId: lineId || null,
    consent: true,
  };
}
