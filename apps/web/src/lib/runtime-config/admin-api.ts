import { RuntimeConfigError } from "@/lib/runtime-config/errors";
import {
  getRuntimeConfigDefinition,
  isRuntimeConfigScopeType,
  listRuntimeConfigDefinitions,
  type RuntimeConfigScopeType,
} from "@/lib/runtime-config/registry";
import {
  getRuntimeConfigValue,
  listRuntimeConfigHistory,
  listRuntimeConfigValues,
  setRuntimeConfigValue,
  unsetRuntimeConfigValue,
  type RuntimeConfigPrimitive,
  type RuntimeConfigRecord,
} from "@/lib/runtime-config/store";

export function runtimeConfigJsonError(status: number, error: string) {
  return Response.json({ ok: false, error }, { status });
}

export function mapRuntimeConfigError(error: unknown) {
  if (!(error instanceof RuntimeConfigError)) {
    return { status: 500, code: "runtime_config_failed" };
  }

  const codeByError = {
    ConfigKeyNotRegistered: "config_key_not_registered",
    ConfigKeyInactive: "config_key_inactive",
    ConfigScopeNotAllowed: "config_scope_not_allowed",
    ConfigValueMissing: "config_value_missing",
    ConfigValueTypeMismatch: "config_value_type_mismatch",
    ConfigValueInvalid: "config_value_invalid",
    ConfigReasonRequired: "reason_required",
    ConfigGlobalConfirmRequired: "global_confirm_required",
  } as const satisfies Record<typeof error.code, string>;

  const status =
    error.code === "ConfigValueMissing" ? 404 :
    error.code === "ConfigReasonRequired" || error.code === "ConfigGlobalConfirmRequired" ? 400 :
    422;

  return { status, code: codeByError[error.code] };
}

export function parseRuntimeConfigScopeFromUrl(url: URL) {
  const key = url.searchParams.get("key")?.trim() ?? "";
  const rawScopeType = url.searchParams.get("scopeType")?.trim() ?? "";
  const rawScopeKey = url.searchParams.get("scopeKey")?.trim() ?? "";
  const environment = url.searchParams.get("environment")?.trim() ?? "production";

  if (!key) {
    throw new RuntimeConfigError("ConfigKeyNotRegistered", { key: "" });
  }

  if (!isRuntimeConfigScopeType(rawScopeType)) {
    throw new RuntimeConfigError("ConfigScopeNotAllowed", { scopeType: rawScopeType });
  }

  return {
    environment,
    key,
    scopeType: rawScopeType,
    scopeKey: rawScopeType === "global" ? "global" : rawScopeKey,
  };
}

export function serializeRuntimeConfigRecord(record: RuntimeConfigRecord | null) {
  if (!record) {
    return null;
  }

  const definition = getRuntimeConfigDefinition(record.key);

  return {
    key: record.key,
    environment: record.environment,
    scopeType: record.scopeType,
    scopeKey: record.scopeKey,
    value: record.value,
    valueType: record.valueType,
    active: record.active,
    source: record.active ? "explicit" : "inactive",
    updatedAtPresent: Boolean(record.updatedAt),
    reasonPresent: Boolean(record.reason?.trim()),
    riskLevel: definition?.riskLevel ?? "medium",
    recommendedActions: record.active ? [] : ["set_runtime_config_value"],
  };
}

export function serializeRuntimeConfigDefinition() {
  return listRuntimeConfigDefinitions().map((definition) => ({
    key: definition.key,
    description: definition.description,
    valueType: definition.valueType,
    allowedScopes: definition.allowedScopes,
    moduleAllowlist: definition.moduleAllowlist ?? [],
    active: definition.active,
    critical: definition.critical,
    owner: definition.owner,
    riskLevel: definition.riskLevel,
    requiresReason: definition.requiresReason,
    globalWriteRequiresConfirm: definition.globalWriteRequiresConfirm,
    notes: definition.notes,
    createdAt: definition.createdAt,
    deprecatedAt: definition.deprecatedAt ?? null,
    replacementKey: definition.replacementKey ?? null,
  }));
}

export async function getRuntimeConfigAdminValue(url: URL) {
  const scope = parseRuntimeConfigScopeFromUrl(url);
  const record = await getRuntimeConfigValue(scope);

  if (!record) {
    throw new RuntimeConfigError("ConfigValueMissing", scope);
  }

  return serializeRuntimeConfigRecord(record);
}

export async function listRuntimeConfigAdminValues(url: URL) {
  const environment = url.searchParams.get("environment")?.trim() ?? "production";
  const records = await listRuntimeConfigValues({ environment });

  return records
    .filter((record) => getRuntimeConfigDefinition(record.key)?.active === true)
    .map(serializeRuntimeConfigRecord);
}

export async function getRuntimeConfigAdminHistory(url: URL) {
  const scope = parseRuntimeConfigScopeFromUrl(url);
  const rows = await listRuntimeConfigHistory({ ...scope, limit: 50 });

  return rows.map((row) => ({
    environment: row.environment,
    key: row.key,
    scopeType: row.scopeType as RuntimeConfigScopeType,
    scopeKey: row.scopeKey,
    action: row.action,
    valueBefore: row.valueBeforeJson as RuntimeConfigPrimitive | null,
    valueAfter: row.valueAfterJson as RuntimeConfigPrimitive | null,
    reasonPresent: Boolean(row.reason?.trim()),
    actorPresent: Boolean(row.actor?.trim()),
    createdAtPresent: Boolean(row.createdAt),
  }));
}

export async function setRuntimeConfigAdminValue(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new RuntimeConfigError("ConfigValueInvalid");
  }

  const input = body as {
    environment?: unknown;
    key?: unknown;
    scopeType?: unknown;
    scopeKey?: unknown;
    value?: unknown;
    reason?: unknown;
    actor?: unknown;
    confirmGlobalImpact?: unknown;
  };

  const key = typeof input.key === "string" ? input.key : "";
  const definition = getRuntimeConfigDefinition(key);
  if (!definition) {
    throw new RuntimeConfigError("ConfigKeyNotRegistered", { key });
  }

  const record = await setRuntimeConfigValue({
    environment: typeof input.environment === "string" ? input.environment : "production",
    key,
    scopeType: typeof input.scopeType === "string" ? input.scopeType : "",
    scopeKey: typeof input.scopeKey === "string" ? input.scopeKey : "",
    value: input.value as RuntimeConfigPrimitive,
    valueType: definition.valueType,
    reason: typeof input.reason === "string" ? input.reason : "",
    actor: typeof input.actor === "string" && input.actor.trim() ? input.actor.trim() : "admin-api",
    confirmGlobalImpact: input.confirmGlobalImpact === true,
  });

  return serializeRuntimeConfigRecord(record);
}

export async function unsetRuntimeConfigAdminValue(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new RuntimeConfigError("ConfigValueInvalid");
  }

  const input = body as {
    environment?: unknown;
    key?: unknown;
    scopeType?: unknown;
    scopeKey?: unknown;
    reason?: unknown;
    actor?: unknown;
    confirmGlobalImpact?: unknown;
  };

  const record = await unsetRuntimeConfigValue({
    environment: typeof input.environment === "string" ? input.environment : "production",
    key: typeof input.key === "string" ? input.key : "",
    scopeType: typeof input.scopeType === "string" ? input.scopeType : "",
    scopeKey: typeof input.scopeKey === "string" ? input.scopeKey : "",
    reason: typeof input.reason === "string" ? input.reason : "",
    actor: typeof input.actor === "string" && input.actor.trim() ? input.actor.trim() : "admin-api",
    confirmGlobalImpact: input.confirmGlobalImpact === true,
  });

  return serializeRuntimeConfigRecord(record);
}
