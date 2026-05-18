import { notFound } from "next/navigation";
import { AiTemperatureResult } from "@/components/modules/ai-temperature/AiTemperatureResult";
import { getAiTemperatureDemoResult } from "@/lib/modules/ai-temperature-ui";
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

  if (!moduleConfig || resultId !== "demo") {
    notFound();
  }

  return (
    <main className="anyu-shell">
      <AiTemperatureResult
        moduleConfig={moduleConfig}
        result={getAiTemperatureDemoResult()}
      />
    </main>
  );
}
