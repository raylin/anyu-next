import { NewebPayReturnExperience } from "@/components/payments/NewebPayReturnExperience";

type ReturnPageProps = {
  params: Promise<{
    moduleSlug: string;
  }>;
  searchParams: Promise<{
    merchantOrderNo?: string;
    checkoutToken?: string;
  }>;
};

export default async function NewebPayReturnPage({ params, searchParams }: ReturnPageProps) {
  const { moduleSlug } = await params;
  const { checkoutToken } = await searchParams;

  return NewebPayReturnExperience({ moduleSlugHint: moduleSlug, checkoutToken });
}
