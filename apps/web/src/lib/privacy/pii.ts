export type RedactionFlag = "email" | "phone" | "handle";

type RedactionResult = {
  redactedText: string;
  flags: RedactionFlag[];
};

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_PATTERNS = [
  /\b09\d{8}\b/g,
  /\b\+886[-\s]?9\d{8}\b/g,
];
const HANDLE_PATTERNS = [
  /line\s*id\s*[:：]?\s*[A-Z0-9._-]+/gi,
  /(?:^|\s)@[A-Z0-9._-]{2,}/gi,
];

function pushFlag(flags: RedactionFlag[], flag: RedactionFlag) {
  if (!flags.includes(flag)) {
    flags.push(flag);
  }
}

export function redactUserInput(input: string): RedactionResult {
  const flags: RedactionFlag[] = [];
  let redactedText = input;

  redactedText = redactedText.replace(EMAIL_PATTERN, () => {
    pushFlag(flags, "email");
    return "[email]";
  });

  for (const pattern of PHONE_PATTERNS) {
    redactedText = redactedText.replace(pattern, () => {
      pushFlag(flags, "phone");
      return "[phone]";
    });
  }

  for (const pattern of HANDLE_PATTERNS) {
    redactedText = redactedText.replace(pattern, (matched) => {
      pushFlag(flags, "handle");
      return matched.startsWith(" ") ? " [handle]" : "[handle]";
    });
  }

  return { redactedText, flags };
}

export function redactPii(input: string): string {
  return redactUserInput(input).redactedText;
}
