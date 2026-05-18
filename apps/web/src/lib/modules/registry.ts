import { moduleConfigs } from "@/content/modules";
import type { ProductModuleConfig } from "@/lib/modules/types";

export function getModuleBySlug(slug: string): ProductModuleConfig | undefined {
  return moduleConfigs.find((moduleConfig) => moduleConfig.slug === slug);
}

export function listModules(): readonly ProductModuleConfig[] {
  return moduleConfigs;
}
