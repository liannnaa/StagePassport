export type CatalogType = 'venue';

export type CatalogOption = {
  id: string;
  type: CatalogType;
  label: string;
  value: string;
  metadataJson?: string;
  normalizedKey: string;
};