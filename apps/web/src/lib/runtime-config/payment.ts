import { getRuntimeConfigEnvironment } from "@/lib/runtime-config/environment";
import { runtimeConfigErrorCategory } from "@/lib/runtime-config/errors";
import { requireBoolean } from "@/lib/runtime-config/resolver";
import type { ProductModuleConfig } from "@/lib/modules/types";

export type PaymentRuntimeState = {
  ok: boolean;
  environment: string;
  moduleScopeKey: string;
  paymentGlobalDisabled: boolean | null;
  paymentWindowEnabled: boolean | null;
  category: "checkout_available" | "payment_global_disabled" | "payment_window_closed" | "runtime_config_error";
  errorCategory: string | null;
};

export async function getPaymentRuntimeStateForModule(moduleConfig: ProductModuleConfig): Promise<PaymentRuntimeState> {
  const environment = getRuntimeConfigEnvironment();
  const moduleScopeKey = moduleConfig.moduleId;

  try {
    const paymentGlobalDisabled = await requireBoolean("payment.global.disabled", {
      environment,
      scopeType: "global",
      scopeKey: "global",
    });
    const paymentWindowEnabled = await requireBoolean("payment.window.enabled", {
      environment,
      scopeType: "module",
      scopeKey: moduleScopeKey,
    });

    if (paymentGlobalDisabled) {
      return {
        ok: false,
        environment,
        moduleScopeKey,
        paymentGlobalDisabled,
        paymentWindowEnabled,
        category: "payment_global_disabled",
        errorCategory: null,
      };
    }

    if (!paymentWindowEnabled) {
      return {
        ok: false,
        environment,
        moduleScopeKey,
        paymentGlobalDisabled,
        paymentWindowEnabled,
        category: "payment_window_closed",
        errorCategory: null,
      };
    }

    return {
      ok: true,
      environment,
      moduleScopeKey,
      paymentGlobalDisabled,
      paymentWindowEnabled,
      category: "checkout_available",
      errorCategory: null,
    };
  } catch (error) {
    return {
      ok: false,
      environment,
      moduleScopeKey,
      paymentGlobalDisabled: null,
      paymentWindowEnabled: null,
      category: "runtime_config_error",
      errorCategory: runtimeConfigErrorCategory(error),
    };
  }
}

export async function canStartNewebPayCheckoutForModule(moduleConfig: ProductModuleConfig) {
  const state = await getPaymentRuntimeStateForModule(moduleConfig);

  return state.ok;
}
