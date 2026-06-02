import {
  createLineRecoveryBindStateToken,
  type LineRecoveryBindSource,
} from "@/lib/line/recovery-bind-state";

export type LineRecoveryBindHrefResult =
  | {
      ok: true;
      href: string;
    }
  | {
      ok: false;
      error: "config_missing" | "state_invalid";
    };

export function createLineRecoveryBindHref(input: {
  moduleSlug: string;
  resultId: string;
  paymentIntentId?: string | null;
  entitlementId?: string | null;
  source: LineRecoveryBindSource;
  returnPath: string;
  marketingOptIn?: boolean;
  env?: NodeJS.ProcessEnv;
}): LineRecoveryBindHrefResult {
  const state = createLineRecoveryBindStateToken(input);

  if (!state.ok) {
    return state;
  }

  const searchParams = new URLSearchParams({
    state: state.token,
    returnPath: input.returnPath,
  });

  return {
    ok: true,
    href: `/line/recovery/bind?${searchParams.toString()}`,
  };
}
