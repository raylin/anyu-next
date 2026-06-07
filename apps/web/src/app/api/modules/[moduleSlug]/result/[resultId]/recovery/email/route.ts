import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { createOrUpdateEmailRecoveryContact } from "@/lib/db/payment-recovery-contacts";
import { getModuleBySlug } from "@/lib/modules/registry";
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
}) {
  const url = new URL(
    `/m/${input.moduleSlug}/result/${input.resultId}/checkout`,
    request.url,
  );
  url.searchParams.set("recovery", input.recovery);

  return NextResponse.redirect(url, 303);
}

function parseOptionalString(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function POST(request: Request, { params }: RouteProps) {
  const { moduleSlug, resultId } = await params;
  const moduleConfig = getModuleBySlug(moduleSlug);

  if (!moduleConfig || !(await canStartNewebPayCheckoutForModule(moduleConfig)) || !isDbConfigured()) {
    return buildCheckoutRedirect(request, {
      moduleSlug,
      resultId,
      recovery: "email_error",
    });
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return buildCheckoutRedirect(request, {
      moduleSlug,
      resultId,
      recovery: "email_error",
    });
  }

  const email = parseOptionalString(formData.get("email"));
  const paymentIntentId = parseOptionalString(formData.get("paymentIntentId"));
  const marketingOptIn = formData.get("marketingOptIn") === "1";

  if (!email) {
    return buildCheckoutRedirect(request, {
      moduleSlug,
      resultId,
      recovery: "email_error",
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
    if (error instanceof RecoveryContactConfigError) {
      return buildCheckoutRedirect(request, {
        moduleSlug: moduleConfig.slug,
        resultId,
        recovery: "email_error",
      });
    }

    return buildCheckoutRedirect(request, {
      moduleSlug: moduleConfig.slug,
      resultId,
      recovery: "email_error",
    });
  }

  return buildCheckoutRedirect(request, {
    moduleSlug: moduleConfig.slug,
    resultId,
    recovery: "email_saved",
  });
}
