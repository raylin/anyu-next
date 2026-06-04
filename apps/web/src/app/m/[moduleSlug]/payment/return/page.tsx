import { NewebPayReturnExperience } from "@/components/payments/NewebPayReturnExperience";
import { classifyNewebPayBrowserReturnSignal } from "@/lib/payments/newebpay/return-signal";

type ReturnPageProps = {
  params: Promise<{
    moduleSlug: string;
  }>;
  searchParams: Promise<{
    merchantOrderNo?: string;
    checkoutToken?: string;
    Status?: string | string[];
    Message?: string | string[];
    RespondCode?: string | string[];
  }>;
};

export default async function NewebPayReturnPage({ params, searchParams }: ReturnPageProps) {
  const { moduleSlug } = await params;
  const query = await searchParams;
  const { checkoutToken } = query;

  return NewebPayReturnExperience({
    moduleSlugHint: moduleSlug,
    checkoutToken,
    browserReturnSignal: classifyNewebPayBrowserReturnSignal(query),
  });
}
