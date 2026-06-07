export type RuntimeConfigValueType = "boolean" | "string" | "number";
export type RuntimeConfigScopeType = "global" | "module";
export type RuntimeConfigOwner = "product" | "ops" | "engineering";
export type RuntimeConfigRiskLevel = "low" | "medium" | "high";

export type RuntimeConfigKey =
  | "payment.window.enabled"
  | "payment.global.disabled"
  | "delivery.line.enabled"
  | "delivery.email.enabled";

export type RuntimeConfigDefinition = {
  key: RuntimeConfigKey;
  description: string;
  valueType: RuntimeConfigValueType;
  allowedScopes: readonly RuntimeConfigScopeType[];
  moduleAllowlist?: readonly string[];
  active: boolean;
  critical: boolean;
  owner: RuntimeConfigOwner;
  riskLevel: RuntimeConfigRiskLevel;
  allowedValues?: readonly string[];
  min?: number;
  max?: number;
  requiresReason: boolean;
  globalWriteRequiresConfirm: boolean;
  notes: string;
  createdAt: string;
  deprecatedAt?: string;
  replacementKey?: RuntimeConfigKey;
};

export const RUNTIME_CONFIG_REGISTRY = [
  {
    key: "payment.window.enabled",
    description: "Allows the scoped module to enter the paid checkout flow.",
    valueType: "boolean",
    allowedScopes: ["module"],
    moduleAllowlist: ["ai-temperature"],
    active: true,
    critical: true,
    owner: "ops",
    riskLevel: "high",
    requiresReason: true,
    globalWriteRequiresConfirm: false,
    notes: "Primary runtime window for controlled Module 01 payment smoke.",
    createdAt: "2026-06-07",
  },
  {
    key: "payment.global.disabled",
    description: "Global emergency kill switch for payment.",
    valueType: "boolean",
    allowedScopes: ["global"],
    active: true,
    critical: true,
    owner: "ops",
    riskLevel: "high",
    requiresReason: true,
    globalWriteRequiresConfirm: true,
    notes: "When true, payment must fail closed even if module windows are enabled.",
    createdAt: "2026-06-07",
  },
  {
    key: "delivery.line.enabled",
    description: "Allows LINE access-link delivery for an explicitly read scope.",
    valueType: "boolean",
    allowedScopes: ["global", "module"],
    moduleAllowlist: ["ai-temperature"],
    active: true,
    critical: true,
    owner: "ops",
    riskLevel: "medium",
    requiresReason: true,
    globalWriteRequiresConfirm: true,
    notes: "Resolver does not merge global and module values; services must read scopes explicitly.",
    createdAt: "2026-06-07",
  },
  {
    key: "delivery.email.enabled",
    description: "Allows Email access-link delivery for an explicitly read scope.",
    valueType: "boolean",
    allowedScopes: ["global", "module"],
    moduleAllowlist: ["ai-temperature"],
    active: true,
    critical: true,
    owner: "ops",
    riskLevel: "medium",
    requiresReason: true,
    globalWriteRequiresConfirm: true,
    notes: "Resolver does not merge global and module values; services must read scopes explicitly.",
    createdAt: "2026-06-07",
  },
] as const satisfies readonly RuntimeConfigDefinition[];

const SECRET_LOOKING_PATTERN =
  /(?:secret|token|password|credential|api[_-]?key|hash|(?:^|[._-])iv(?:$|[._-])|database[_-]?url|connection|string)/iu;

export function listRuntimeConfigDefinitions(): readonly RuntimeConfigDefinition[] {
  return RUNTIME_CONFIG_REGISTRY;
}

export function getRuntimeConfigDefinition(key: string): RuntimeConfigDefinition | null {
  return RUNTIME_CONFIG_REGISTRY.find((definition) => definition.key === key) ?? null;
}

export function isRuntimeConfigKey(key: string): key is RuntimeConfigKey {
  return Boolean(getRuntimeConfigDefinition(key));
}

export function isRuntimeConfigScopeType(value: unknown): value is RuntimeConfigScopeType {
  return value === "global" || value === "module";
}

export function assertRuntimeConfigRegistryIsValid() {
  const keys = new Set<string>();

  for (const definition of RUNTIME_CONFIG_REGISTRY) {
    const allowedScopes = definition.allowedScopes as readonly RuntimeConfigScopeType[];

    if (keys.has(definition.key)) {
      throw new Error(`runtime_config_duplicate_key:${definition.key}`);
    }
    keys.add(definition.key);

    if (definition.active && !definition.description.trim()) {
      throw new Error(`runtime_config_description_missing:${definition.key}`);
    }

    if (SECRET_LOOKING_PATTERN.test(definition.key)) {
      throw new Error(`runtime_config_secret_like_key:${definition.key}`);
    }

    for (const scope of allowedScopes) {
      if (!isRuntimeConfigScopeType(scope)) {
        throw new Error(`runtime_config_allowed_scope_invalid:${definition.key}`);
      }
    }

    if (definition.riskLevel === "high" && !definition.requiresReason) {
      throw new Error(`runtime_config_reason_required_missing:${definition.key}`);
    }

    if (allowedScopes.includes("global") && !definition.globalWriteRequiresConfirm) {
      throw new Error(`runtime_config_global_confirm_missing:${definition.key}`);
    }
  }
}
