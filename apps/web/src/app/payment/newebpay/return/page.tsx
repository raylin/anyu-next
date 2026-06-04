import { NewebPayReturnExperience } from "@/components/payments/NewebPayReturnExperience";

type ReturnPageProps = {
  searchParams: Promise<{
    merchantOrderNo?: string;
    checkoutToken?: string;
  }>;
};

export default async function UnifiedNewebPayReturnPage({ searchParams }: ReturnPageProps) {
  const { checkoutToken } = await searchParams;

  return NewebPayReturnExperience({ checkoutToken });
}
