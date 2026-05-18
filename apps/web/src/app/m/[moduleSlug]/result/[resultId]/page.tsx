import { notFound } from "next/navigation";
import { Card } from "@/components/anyu/Card";
import { getModuleBySlug } from "@/lib/modules/registry";

type ResultPageProps = {
  params: Promise<{
    moduleSlug: string;
    resultId: string;
  }>;
};

export default async function ResultPage({ params }: ResultPageProps) {
  const { moduleSlug, resultId } = await params;
  const moduleConfig = getModuleBySlug(moduleSlug);

  if (!moduleConfig) {
    notFound();
  }

  return (
    <main className="anyu-shell">
      <Card>
        <span className="anyu-kicker">Result placeholder</span>
        <h1 className="anyu-title">{moduleConfig.family}</h1>
        <p className="anyu-copy">Design system shell only.</p>
        <p className="anyu-meta">Result ID: {resultId}</p>
      </Card>
    </main>
  );
}
