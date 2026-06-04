import { NewebPayReturnExperience } from "@/components/payments/NewebPayReturnExperience";
import { classifyNewebPayBrowserReturnSignal } from "@/lib/payments/newebpay/return-signal";

type ReturnPageProps = {
  searchParams: Promise<{
    merchantOrderNo?: string;
    checkoutToken?: string;
    Status?: string | string[];
    Message?: string | string[];
    RespondCode?: string | string[];
  }>;
};

export default async function UnifiedNewebPayReturnPage({ searchParams }: ReturnPageProps) {
  const params = await searchParams;
  const { checkoutToken } = params;

  return NewebPayReturnExperience({
    checkoutToken,
    browserReturnSignal: classifyNewebPayBrowserReturnSignal(params),
  });
}
