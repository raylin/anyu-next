import { getRuntimeConfigValue, validateRuntimeConfigIdentity } from "@/lib/runtime-config/store";
import { RuntimeConfigError } from "@/lib/runtime-config/errors";
import type { RuntimeConfigScopeType } from "@/lib/runtime-config/registry";

export type RuntimeConfigResolveInput = {
  environment: string;
  scopeType: RuntimeConfigScopeType;
  scopeKey: string;
};

async function requireValue(key: string, input: RuntimeConfigResolveInput) {
  const identity = validateRuntimeConfigIdentity({
    environment: input.environment,
    key,
    scopeType: input.scopeType,
    scopeKey: input.scopeKey,
  });
  const record = await getRuntimeConfigValue(identity);

  if (!record || !record.active) {
    throw new RuntimeConfigError("ConfigValueMissing", {
      key,
      environment: input.environment,
      scopeType: input.scopeType,
      scopeKey: input.scopeKey,
    });
  }

  return record;
}

export async function requireBoolean(key: string, input: RuntimeConfigResolveInput) {
  const record = await requireValue(key, input);

  if (record.valueType !== "boolean" || typeof record.value !== "boolean") {
    throw new RuntimeConfigError("ConfigValueTypeMismatch", {
      key,
      expected: "boolean",
      actual: record.valueType,
    });
  }

  return record.value;
}

export async function requireString(key: string, input: RuntimeConfigResolveInput) {
  const record = await requireValue(key, input);

  if (record.valueType !== "string" || typeof record.value !== "string") {
    throw new RuntimeConfigError("ConfigValueTypeMismatch", {
      key,
      expected: "string",
      actual: record.valueType,
    });
  }

  return record.value;
}

export async function requireNumber(key: string, input: RuntimeConfigResolveInput) {
  const record = await requireValue(key, input);

  if (record.valueType !== "number" || typeof record.value !== "number") {
    throw new RuntimeConfigError("ConfigValueTypeMismatch", {
      key,
      expected: "number",
      actual: record.valueType,
    });
  }

  return record.value;
}
