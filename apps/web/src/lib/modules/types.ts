export type ProductModuleConfig = {
  moduleId: string;
  slug: string;
  family: string;
  brand: string;
  title: string;
  subtitle: string;
  chips: readonly string[];
  visualModule: string;
  promptVersion: string;
  schemaVersion: string;
  price: string;
  experimentId: string;
};
