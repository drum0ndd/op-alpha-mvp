import type { CatalogEntry } from '@op-alpha/contracts';
export type CatalogCache = { etag?: string | null; lastModified?: string | null; entries: CatalogEntry[] };
export type CatalogBatch = CatalogCache & { notModified?: boolean };
export interface CatalogProvider {
  readonly id: 'synthetic' | 'bandai';
  fetchCollection(collection: string, cache?: CatalogCache): Promise<CatalogBatch>;
}
