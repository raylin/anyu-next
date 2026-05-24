import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AiTemperatureLanding } from "@/components/modules/ai-temperature/AiTemperatureLanding";
import {
  getModuleMetadataDescription,
  getModuleMetadataTitle,
} from "@/lib/modules/ai-temperature-ui";
import { getModuleBySlug } from "@/lib/modules/registry";

type ModulePageProps = {
  params: Promise<{
    moduleSlug: string;
  }>;
};

export async function generateMetadata({ params }: ModulePageProps): Promise<Metadata> {
  const { moduleSlug } = await params;
  const moduleConfig = getModuleBySlug(moduleSlug);

  if (!moduleConfig) {
    return {};
  }

  const title = getModuleMetadataTitle(moduleConfig);
  const description = getModuleMetadataDescription(moduleConfig);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

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
