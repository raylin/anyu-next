import type {
  PaidResultEvidenceSummary,
  ProductResult,
  RichPaidResult,
} from "@/lib/ai/product-result-schema";

export const PAID_RESULT_MIN_TEXT_LENGTH = 900;

export const PAID_RESULT_FORBIDDEN_SUBSTRINGS = [
  "出局",
  "渣男",
  "備胎",
  "焦慮型依附",
  "創傷反應",
  "專業建議",
  "精準拿捏",
  "焦慮型",
  "創傷",
  "操控",
  "讓對方意識到你的重要性",
] as const;

export class PaidResultSemanticValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaidResultSemanticValidationError";
  }
}

export function collectPaidResultStrings(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectPaidResultStrings(item));
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap((item) => collectPaidResultStrings(item));
  }

  return [];
}

export function getPaidResultAggregateTextLength(value: RichPaidResult): number {
  return collectPaidResultStrings(value).join("").trim().length;
}

function assertNonEmptyString(value: unknown, fieldName: string) {
  if (typeof value !== "string" || value.trim().length < 4) {
    throw new PaidResultSemanticValidationError(`${fieldName} is too thin.`);
  }
}

function hasUnsafeEvidenceIdentifier(value: string) {
  return (
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/iu.test(value) ||
    /\d[\d\s-]{7,}\d/u.test(value) ||
    /https?:\/\/|www\.|line\.me|lin\.ee/iu.test(value)
  );
}

function hasLongQuotedText(value: string) {
  const matches = value.match(/[「『"“][^」』"”]{25,}[」』"”]/gu) ?? [];
  return matches.length > 0;
}

function assertEvidenceTextSafe(value: unknown, fieldName: string, maxLength: number, minLength = 4) {
  if (typeof value !== "string" || value.trim().length < minLength) {
    throw new PaidResultSemanticValidationError(`${fieldName} is too thin.`);
  }

  const text = (value as string).trim();

  if (text.length > maxLength) {
    throw new PaidResultSemanticValidationError(`${fieldName} is too long.`);
  }

  if (hasUnsafeEvidenceIdentifier(text)) {
    throw new PaidResultSemanticValidationError(`${fieldName} contains unsafe identifier-like text.`);
  }

  if (hasLongQuotedText(text)) {
    throw new PaidResultSemanticValidationError(`${fieldName} contains long quote-like text.`);
  }
}

export function validatePaidEvidenceSummarySemantics(
  evidenceSummary: PaidResultEvidenceSummary | undefined,
  options: { required?: boolean } = {},
) {
  if (!evidenceSummary) {
    if (options.required) {
      throw new PaidResultSemanticValidationError("paid_result.evidenceSummary is missing.");
    }

    return;
  }

  assertEvidenceTextSafe(evidenceSummary.title, "paid_result.evidenceSummary.title", 32);

  if (!Array.isArray(evidenceSummary.items) || evidenceSummary.items.length < 3 || evidenceSummary.items.length > 4) {
    throw new PaidResultSemanticValidationError("paid_result.evidenceSummary.items count is invalid.");
  }

  for (const [index, item] of evidenceSummary.items.entries()) {
    assertEvidenceTextSafe(item.label, `paid_result.evidenceSummary.items[${index}].label`, 12, 2);
    assertEvidenceTextSafe(item.summary, `paid_result.evidenceSummary.items[${index}].summary`, 100);
    assertEvidenceTextSafe(item.reason, `paid_result.evidenceSummary.items[${index}].reason`, 120);
  }
}

export function validatePaidResultSemantics(result: ProductResult): ProductResult {
  const paidResult = result.paid_result;

  if (!paidResult) {
    throw new PaidResultSemanticValidationError("paid_result is missing.");
  }

  const paidStrings = collectPaidResultStrings(paidResult);
  const forbiddenMatch = PAID_RESULT_FORBIDDEN_SUBSTRINGS.find((forbidden) =>
    paidStrings.some((value) => value.includes(forbidden)),
  );

  if (forbiddenMatch) {
    throw new PaidResultSemanticValidationError("paid_result contains forbidden phrasing.");
  }

  if (paidResult.possibleStates.length < 3) {
    throw new PaidResultSemanticValidationError("paid_result possibleStates is too thin.");
  }

  if (paidResult.signalDeepDive.length < 3) {
    throw new PaidResultSemanticValidationError("paid_result signalDeepDive is too thin.");
  }

  if (paidResult.replyStrategies.length < 3) {
    throw new PaidResultSemanticValidationError("paid_result replyStrategies is too thin.");
  }

  const copyableMessageCount = paidResult.replyStrategies.reduce(
    (count, strategy) => count + strategy.copyableMessages.filter((message) => message.trim()).length,
    0,
  );

  if (copyableMessageCount < 6) {
    throw new PaidResultSemanticValidationError("paid_result copyableMessages is too thin.");
  }

  for (const [index, strategy] of paidResult.replyStrategies.entries()) {
    assertNonEmptyString(strategy.label, `paid_result.replyStrategies[${index}].label`);
    assertNonEmptyString(strategy.whenToUse, `paid_result.replyStrategies[${index}].whenToUse`);
    assertNonEmptyString(strategy.whyItWorks, `paid_result.replyStrategies[${index}].whyItWorks`);
    assertNonEmptyString(strategy.tone, `paid_result.replyStrategies[${index}].tone`);
    assertNonEmptyString(strategy.possibleReaction, `paid_result.replyStrategies[${index}].possibleReaction`);
    assertNonEmptyString(strategy.followUpIfTheyReply, `paid_result.replyStrategies[${index}].followUpIfTheyReply`);
  }

  if (paidResult.next48HourPlan.length < 3 || paidResult.next48HourPlan.some((item) => item.trim().length < 8)) {
    throw new PaidResultSemanticValidationError("paid_result next48HourPlan is too thin.");
  }

  if (paidResult.avoidDoing.length < 2 || paidResult.avoidDoing.some((item) => item.trim().length < 8)) {
    throw new PaidResultSemanticValidationError("paid_result avoidDoing is too thin.");
  }

  assertNonEmptyString(paidResult.softInsight, "paid_result.softInsight");
  assertNonEmptyString(paidResult.summaryCard.headline, "paid_result.summaryCard.headline");
  assertNonEmptyString(paidResult.summaryCard.body, "paid_result.summaryCard.body");
  assertNonEmptyString(paidResult.summaryCard.nextMove, "paid_result.summaryCard.nextMove");
  validatePaidEvidenceSummarySemantics(paidResult.evidenceSummary);

  if (getPaidResultAggregateTextLength(paidResult) < PAID_RESULT_MIN_TEXT_LENGTH) {
    throw new PaidResultSemanticValidationError("paid_result aggregate value is too thin.");
  }

  return result;
}
