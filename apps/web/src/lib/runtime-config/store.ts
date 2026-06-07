import { and, desc, eq } from "drizzle-orm";
import { requireDb, type AppDatabase } from "@/lib/db/client";
import { runtimeConfigEvents, runtimeConfigValues } from "@/lib/db/schema";
import {
  getRuntimeConfigDefinition,
  isRuntimeConfigScopeType,
  type RuntimeConfigScopeType,
  type RuntimeConfigValueType,
} from "@/lib/runtime-config/registry";
import { RuntimeConfigError } from "@/lib/runtime-config/errors";

export type RuntimeConfigPrimitive = boolean | string | number;
export type RuntimeConfigAction = "set" | "unset" | "deactivate" | "reactivate";

export type RuntimeConfigIdentity = {
  environment: string;
  key: string;
  scopeType: RuntimeConfigScopeType;
  scopeKey: string;
};

export type RuntimeConfigIdentityInput = {
  environment: string;
  key: string;
  scopeType: string;
  scopeKey?: string | null;
};

export type RuntimeConfigRecord = RuntimeConfigIdentity & {
  valueType: RuntimeConfigValueType;
  value: RuntimeConfigPrimitive;
  active: boolean;
  reason: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

function normalizeScopeKey(scopeType: RuntimeConfigScopeType, scopeKey?: string | null) {
  if (scopeType === "global") {
    return "global";
  }

  const normalized = scopeKey?.trim();
  if (!normalized) {
    throw new RuntimeConfigError("ConfigScopeNotAllowed", { scopeType, scopeKey: null });
  }

  return normalized;
}

export function validateRuntimeConfigIdentity(input: {
  environment: string;
  key: string;
  scopeType: string;
  scopeKey?: string | null;
}) {
  const definition = getRuntimeConfigDefinition(input.key);

  if (!definition) {
    throw new RuntimeConfigError("ConfigKeyNotRegistered", { key: input.key });
  }

  if (!definition.active) {
    throw new RuntimeConfigError("ConfigKeyInactive", { key: input.key });
  }

  if (!isRuntimeConfigScopeType(input.scopeType)) {
    throw new RuntimeConfigError("ConfigScopeNotAllowed", { key: input.key, scopeType: input.scopeType });
  }

  if (!definition.allowedScopes.includes(input.scopeType)) {
    throw new RuntimeConfigError("ConfigScopeNotAllowed", { key: input.key, scopeType: input.scopeType });
  }

  const scopeKey = normalizeScopeKey(input.scopeType, input.scopeKey);

  if (
    input.scopeType === "module" &&
    definition.moduleAllowlist &&
    !definition.moduleAllowlist.includes(scopeKey)
  ) {
    throw new RuntimeConfigError("ConfigScopeNotAllowed", { key: input.key, scopeType: input.scopeType, scopeKey });
  }

  return {
    environment: input.environment,
    key: definition.key,
    scopeType: input.scopeType,
    scopeKey,
    definition,
  };
}

export function validateRuntimeConfigValue(input: {
  key: string;
  value: unknown;
  valueType: RuntimeConfigValueType;
}): RuntimeConfigPrimitive {
  const definition = getRuntimeConfigDefinition(input.key);

  if (!definition) {
    throw new RuntimeConfigError("ConfigKeyNotRegistered", { key: input.key });
  }

  if (definition.valueType !== input.valueType) {
    throw new RuntimeConfigError("ConfigValueTypeMismatch", {
      key: input.key,
      expected: definition.valueType,
      actual: input.valueType,
    });
  }

  if (input.valueType === "boolean") {
    if (typeof input.value !== "boolean") {
      throw new RuntimeConfigError("ConfigValueTypeMismatch", { key: input.key, expected: "boolean" });
    }
    return input.value;
  }

  if (input.valueType === "string") {
    if (typeof input.value !== "string") {
      throw new RuntimeConfigError("ConfigValueTypeMismatch", { key: input.key, expected: "string" });
    }

    if (definition.allowedValues && !definition.allowedValues.includes(input.value)) {
      throw new RuntimeConfigError("ConfigValueInvalid", { key: input.key });
    }

    return input.value;
  }

  if (typeof input.value !== "number" || !Number.isFinite(input.value)) {
    throw new RuntimeConfigError("ConfigValueTypeMismatch", { key: input.key, expected: "number" });
  }

  if (typeof definition.min === "number" && input.value < definition.min) {
    throw new RuntimeConfigError("ConfigValueInvalid", { key: input.key });
  }

  if (typeof definition.max === "number" && input.value > definition.max) {
    throw new RuntimeConfigError("ConfigValueInvalid", { key: input.key });
  }

  return input.value;
}

function mapRuntimeConfigRow(row: typeof runtimeConfigValues.$inferSelect): RuntimeConfigRecord {
  return {
    environment: row.environment,
    key: row.key,
    scopeType: row.scopeType as RuntimeConfigScopeType,
    scopeKey: row.scopeKey,
    valueType: row.valueType as RuntimeConfigValueType,
    value: row.valueJson as RuntimeConfigPrimitive,
    active: row.active,
    reason: row.reason,
    updatedBy: row.updatedBy,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getRuntimeConfigValue(
  identityInput: RuntimeConfigIdentityInput,
  options: { db?: AppDatabase } = {},
) {
  const identity = validateRuntimeConfigIdentity(identityInput);
  const db = options.db ?? requireDb();
  const [row] = await db
    .select()
    .from(runtimeConfigValues)
    .where(
      and(
        eq(runtimeConfigValues.environment, identity.environment),
        eq(runtimeConfigValues.key, identity.key),
        eq(runtimeConfigValues.scopeType, identity.scopeType),
        eq(runtimeConfigValues.scopeKey, identity.scopeKey),
      ),
    )
    .limit(1);

  return row ? mapRuntimeConfigRow(row) : null;
}

export async function listRuntimeConfigValues(input: {
  environment: string;
  db?: AppDatabase;
}) {
  const db = input.db ?? requireDb();
  const rows = await db
    .select()
    .from(runtimeConfigValues)
    .where(eq(runtimeConfigValues.environment, input.environment));

  return rows.map(mapRuntimeConfigRow);
}

export async function setRuntimeConfigValue(input: RuntimeConfigIdentityInput & {
  value: RuntimeConfigPrimitive;
  valueType?: RuntimeConfigValueType;
  reason: string;
  actor: string;
  confirmGlobalImpact?: boolean;
  db?: AppDatabase;
}) {
  const identity = validateRuntimeConfigIdentity(input);
  const reason = input.reason.trim();

  if (identity.definition.requiresReason && !reason) {
    throw new RuntimeConfigError("ConfigReasonRequired", { key: identity.key });
  }

  if (
    identity.scopeType === "global" &&
    identity.definition.globalWriteRequiresConfirm &&
    input.confirmGlobalImpact !== true
  ) {
    throw new RuntimeConfigError("ConfigGlobalConfirmRequired", { key: identity.key });
  }

  const valueType = input.valueType ?? identity.definition.valueType;
  const value = validateRuntimeConfigValue({
    key: identity.key,
    value: input.value,
    valueType,
  });
  const db = input.db ?? requireDb();
  const previous = await getRuntimeConfigValue(identity, { db });
  const now = new Date();
  const [row] = await db
    .insert(runtimeConfigValues)
    .values({
      environment: identity.environment,
      key: identity.key,
      scopeType: identity.scopeType,
      scopeKey: identity.scopeKey,
      valueType,
      valueJson: value,
      active: true,
      reason,
      updatedBy: input.actor,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [
        runtimeConfigValues.environment,
        runtimeConfigValues.key,
        runtimeConfigValues.scopeType,
        runtimeConfigValues.scopeKey,
      ],
      set: {
        valueType,
        valueJson: value,
        active: true,
        reason,
        updatedBy: input.actor,
        updatedAt: now,
      },
    })
    .returning();

  await db.insert(runtimeConfigEvents).values({
    environment: identity.environment,
    key: identity.key,
    scopeType: identity.scopeType,
    scopeKey: identity.scopeKey,
    action: previous?.active === false ? "reactivate" : "set",
    valueBeforeJson: previous?.value ?? null,
    valueAfterJson: value,
    reason,
    actor: input.actor,
  });

  return mapRuntimeConfigRow(row);
}

export async function unsetRuntimeConfigValue(input: RuntimeConfigIdentityInput & {
  reason: string;
  actor: string;
  confirmGlobalImpact?: boolean;
  db?: AppDatabase;
}) {
  const identity = validateRuntimeConfigIdentity(input);
  const reason = input.reason.trim();

  if (identity.definition.requiresReason && !reason) {
    throw new RuntimeConfigError("ConfigReasonRequired", { key: identity.key });
  }

  if (
    identity.scopeType === "global" &&
    identity.definition.globalWriteRequiresConfirm &&
    input.confirmGlobalImpact !== true
  ) {
    throw new RuntimeConfigError("ConfigGlobalConfirmRequired", { key: identity.key });
  }

  const db = input.db ?? requireDb();
  const previous = await getRuntimeConfigValue(identity, { db });
  const [row] = await db
    .update(runtimeConfigValues)
    .set({
      active: false,
      reason,
      updatedBy: input.actor,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(runtimeConfigValues.environment, identity.environment),
        eq(runtimeConfigValues.key, identity.key),
        eq(runtimeConfigValues.scopeType, identity.scopeType),
        eq(runtimeConfigValues.scopeKey, identity.scopeKey),
      ),
    )
    .returning();

  await db.insert(runtimeConfigEvents).values({
    environment: identity.environment,
    key: identity.key,
    scopeType: identity.scopeType,
    scopeKey: identity.scopeKey,
    action: "unset",
    valueBeforeJson: previous?.value ?? null,
    valueAfterJson: null,
    reason,
    actor: input.actor,
  });

  return row ? mapRuntimeConfigRow(row) : null;
}

export async function listRuntimeConfigHistory(input: RuntimeConfigIdentityInput & {
  limit?: number;
  db?: AppDatabase;
}) {
  const identity = validateRuntimeConfigIdentity(input);
  const db = input.db ?? requireDb();
  const rows = await db
    .select()
    .from(runtimeConfigEvents)
    .where(
      and(
        eq(runtimeConfigEvents.environment, identity.environment),
        eq(runtimeConfigEvents.key, identity.key),
        eq(runtimeConfigEvents.scopeType, identity.scopeType),
        eq(runtimeConfigEvents.scopeKey, identity.scopeKey),
      ),
    )
    .orderBy(desc(runtimeConfigEvents.createdAt))
    .limit(input.limit ?? 20);

  return rows;
}
