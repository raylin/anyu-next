import fs from "node:fs";
import Ajv2020 from "ajv/dist/2020";
import type { AnySchema, ErrorObject } from "ajv";
import { getProductSchemaPath } from "@/lib/ai/repo-paths";
import type { ProductResult } from "@/lib/ai/product-result-schema";

const ajv = new Ajv2020({ allErrors: true, strict: false });

let cachedSchemaText: string | null = null;
let cachedValidator:
  | ReturnType<typeof ajv.compile<ProductResult>>
  | null = null;

function loadSchemaJson(): AnySchema {
  if (!cachedSchemaText) {
    cachedSchemaText = fs.readFileSync(getProductSchemaPath(), "utf-8");
  }

  return JSON.parse(cachedSchemaText) as AnySchema;
}

function getValidator() {
  if (!cachedValidator) {
    cachedValidator = ajv.compile<ProductResult>(loadSchemaJson());
  }

  return cachedValidator;
}

function stripMarkdownFences(text: string): string {
  const trimmed = text.trim();

  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  return trimmed
    .replace(/^```(?:json)?\s*/u, "")
    .replace(/\s*```$/u, "")
    .trim();
}

function buildValidationErrorMessage(
  errors: ErrorObject[] | null | undefined,
): string {
  if (!errors || errors.length === 0) {
    return "Product result failed schema validation.";
  }

  return errors
    .map((error) => `${error.instancePath || "$"} ${error.message ?? "is invalid"}`)
    .join("; ");
}

export function validateProductResultObject(value: unknown): ProductResult {
  const validator = getValidator();

  if (!validator(value)) {
    throw new Error(buildValidationErrorMessage(validator.errors));
  }

  return value as ProductResult;
}

export function validateProductResultText(text: string): ProductResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(stripMarkdownFences(text));
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Model output was not valid JSON: ${error.message}`
        : "Model output was not valid JSON.",
    );
  }

  return validateProductResultObject(parsed);
}
