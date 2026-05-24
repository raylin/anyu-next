import fs from "node:fs";
import Ajv2020 from "ajv/dist/2020";
import type { AnySchema, ErrorObject } from "ajv";
import { getProductSchemaPathForVersion } from "@/lib/ai/repo-paths";
import type { ProductResult } from "@/lib/ai/product-result-schema";

const ajv = new Ajv2020({ allErrors: true, strict: false });

const cachedSchemaTextByVersion = new Map<string, string>();
const cachedValidatorByVersion = new Map<string, ReturnType<typeof ajv.compile<ProductResult>>>();

function loadSchemaJson(schemaVersion: string): AnySchema {
  if (!cachedSchemaTextByVersion.has(schemaVersion)) {
    cachedSchemaTextByVersion.set(
      schemaVersion,
      fs.readFileSync(getProductSchemaPathForVersion(schemaVersion), "utf-8"),
    );
  }

  return JSON.parse(cachedSchemaTextByVersion.get(schemaVersion) ?? "{}") as AnySchema;
}

function getValidator(schemaVersion: string) {
  if (!cachedValidatorByVersion.has(schemaVersion)) {
    cachedValidatorByVersion.set(
      schemaVersion,
      ajv.compile<ProductResult>(loadSchemaJson(schemaVersion)),
    );
  }

  const validator = cachedValidatorByVersion.get(schemaVersion);

  if (!validator) {
    throw new Error(`Product schema validator was not initialized for ${schemaVersion}.`);
  }

  return validator;
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

export function validateProductResultObject(
  value: unknown,
  schemaVersion = "product_result_schema_v1",
): ProductResult {
  const validator = getValidator(schemaVersion);

  if (!validator(value)) {
    throw new Error(buildValidationErrorMessage(validator.errors));
  }

  return value as ProductResult;
}

export function validateProductResultText(
  text: string,
  schemaVersion = "product_result_schema_v1",
): ProductResult {
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

  return validateProductResultObject(parsed, schemaVersion);
}
