import { notFound } from "next/navigation";
import { AiTemperatureLanding } from "@/components/modules/ai-temperature/AiTemperatureLanding";
import { getModuleBySlug } from "@/lib/modules/registry";

type ModulePageProps = {
  params: Promise<{
    moduleSlug: string;
  }>;
};

export default async function ModulePage({ params }: ModulePageProps) {
  const { moduleSlug } = await params;
  const moduleConfig = getModuleBySlug(moduleSlug);

  if (!moduleConfig) {
    notFound();
  }

  return (
    <main className="anyu-shell">
      <AiTemperatureLanding moduleConfig={moduleConfig} />
    </main>
  );
}
