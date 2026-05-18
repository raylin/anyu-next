const PII_PATTERNS = [
  /\b09\d{8}\b/g,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
];

export function redactPii(input: string): string {
  return PII_PATTERNS.reduce(
    (sanitized, pattern) => sanitized.replace(pattern, "[redacted]"),
    input,
  );
}
