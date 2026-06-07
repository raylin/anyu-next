import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { createOrUpdateEmailRecoveryContact } from "@/lib/db/payment-recovery-contacts";
import { getModuleBySlug } from "@/lib/modules/registry";
import {
  type AccessLinkSaveDiagnosticCategory,
  recordAccessLinkSaveDiagnosticEvent,
} from "@/lib/payments/access-link-save-diagnostic-events";
import { RecoveryContactConfigError } from "@/lib/payments/recovery-contact-crypto";
import { canStartNewebPayCheckoutForModule } from "@/lib/runtime-config/payment";

type RouteProps = {
  params: Promise<{
    moduleSlug: string;
    resultId: string;
  }>;
};

function buildCheckoutRedirect(request: Request, input: {
  moduleSlug: string;
  resultId: string;
  recovery: "email_saved" | "email_error";
  recoveryError?: AccessLinkSaveDiagnosticCategory;
}) {
  const url = new URL(
    `/m/${input.moduleSlug}/result/${input.resultId}/checkout`,
    request.url,
  );
  url.searchParams.set("recovery", input.recovery);
  if (input.recoveryError) {
    url.searchParams.set("recoveryError", input.recoveryError);
  }

  return NextResponse.redirect(url, 303);
}

function parseOptionalString(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function recordEmailSaveDiagnostic(input: {
  moduleSlug: string;
  resultId: string;
  category: AccessLinkSaveDiagnosticCategory;
  paymentIntentIdPresent?: boolean;
  contactSaved?: boolean;
}) {
  try {
    await recordAccessLinkSaveDiagnosticEvent({
      moduleSlug: input.moduleSlug,
      resultId: input.resultId,
      channel: "email",
      category: input.category,
      paymentIntentIdPresent: input.paymentIntentIdPresent,
      contactSaved: input.contactSaved,
      deliverable: input.contactSaved,
    });
  } catch {
    // Diagnostics must not block the user-facing save path.
  }
}

function emailErrorRedirect(request: Request, input: {
  moduleSlug: string;
  resultId: string;
  recoveryError: AccessLinkSaveDiagnosticCategory;
}) {
  return buildCheckoutRedirect(request, {
    moduleSlug: input.moduleSlug,
    resultId: input.resultId,
    recovery: "email_error",
    recoveryError: input.recoveryError,
  });
}

export async function POST(request: Request, { params }: RouteProps) {
  const { moduleSlug, resultId } = await params;
  const moduleConfig = getModuleBySlug(moduleSlug);

  if (!moduleConfig || !(await canStartNewebPayCheckoutForModule(moduleConfig)) || !isDbConfigured()) {
    if (moduleConfig && isDbConfigured()) {
      await recordEmailSaveDiagnostic({
        moduleSlug: moduleConfig.slug,
        resultId,
        category: "email_save_context_invalid",
        contactSaved: false,
      });
    }

    return buildCheckoutRedirect(request, {
      moduleSlug,
      resultId,
      recovery: "email_error",
      recoveryError: "email_save_context_invalid",
    });
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    await recordEmailSaveDiagnostic({
      moduleSlug: moduleConfig.slug,
      resultId,
      category: "email_save_context_invalid",
      contactSaved: false,
    });

    return emailErrorRedirect(request, {
      moduleSlug: moduleConfig.slug,
      resultId,
      recoveryError: "email_save_context_invalid",
    });
  }

  const email = parseOptionalString(formData.get("email"));
  const paymentIntentId = parseOptionalString(formData.get("paymentIntentId"));
  const marketingOptIn = formData.get("marketingOptIn") === "1";

  await recordEmailSaveDiagnostic({
    moduleSlug: moduleConfig.slug,
    resultId,
    category: "email_save_started",
    paymentIntentIdPresent: Boolean(paymentIntentId),
    contactSaved: false,
  });

  if (!email) {
    await recordEmailSaveDiagnostic({
      moduleSlug: moduleConfig.slug,
      resultId,
      category: "email_save_context_invalid",
      paymentIntentIdPresent: Boolean(paymentIntentId),
      contactSaved: false,
    });

    return emailErrorRedirect(request, {
      moduleSlug: moduleConfig.slug,
      resultId,
      recoveryError: "email_save_context_invalid",
    });
  }

  try {
    await createOrUpdateEmailRecoveryContact({
      moduleSlug: moduleConfig.slug,
      analysisResultId: resultId,
      paymentIntentId,
      email,
      source: "checkout_start",
      status: "pending",
      marketingOptInAt: marketingOptIn ? new Date() : null,
    });
  } catch (error) {
    const recoveryError =
      error instanceof RecoveryContactConfigError
        ? "email_save_contact_write_failed"
        : "email_save_unexpected_error";

    await recordEmailSaveDiagnostic({
      moduleSlug: moduleConfig.slug,
      resultId,
      category: recoveryError,
      paymentIntentIdPresent: Boolean(paymentIntentId),
      contactSaved: false,
    });

    if (error instanceof RecoveryContactConfigError) {
      return emailErrorRedirect(request, {
        moduleSlug: moduleConfig.slug,
        resultId,
        recoveryError,
      });
    }

    return emailErrorRedirect(request, {
      moduleSlug: moduleConfig.slug,
      resultId,
      recoveryError,
    });
  }

  await recordEmailSaveDiagnostic({
    moduleSlug: moduleConfig.slug,
    resultId,
    category: "email_save_success",
    paymentIntentIdPresent: Boolean(paymentIntentId),
    contactSaved: true,
  });

  return buildCheckoutRedirect(request, {
    moduleSlug: moduleConfig.slug,
    resultId,
    recovery: "email_saved",
  });
}
