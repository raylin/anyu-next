export type RuntimeConfigErrorCode =
  | "ConfigKeyNotRegistered"
  | "ConfigKeyInactive"
  | "ConfigScopeNotAllowed"
  | "ConfigValueMissing"
  | "ConfigValueTypeMismatch"
  | "ConfigValueInvalid"
  | "ConfigReasonRequired"
  | "ConfigGlobalConfirmRequired";

export class RuntimeConfigError extends Error {
  constructor(
    readonly code: RuntimeConfigErrorCode,
    readonly details: Record<string, string | number | boolean | null> = {},
  ) {
    super(code);
    this.name = "RuntimeConfigError";
  }
}

export function runtimeConfigErrorCategory(error: unknown) {
  return error instanceof RuntimeConfigError ? error.code : "RuntimeConfigError";
}
