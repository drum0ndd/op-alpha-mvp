import { CatalogEntrySchema, type CatalogEntry } from '@op-alpha/contracts';
// Our synthetic interchange format, NOT an asserted Bandai HTML structure.
// A live HTML parser must be implemented against an authorized captured page.
export function parseCatalogFixture(text: string): CatalogEntry[] {
  if (Buffer.byteLength(text) > 2 * 1024 * 1024) throw new Error('Catalog payload too large');
  const data: unknown = JSON.parse(text);
  if (!Array.isArray(data) || data.length === 0 || data.length > 2000) throw new Error('Empty or changed catalog structure');
  const entries = data.map(item => CatalogEntrySchema.parse(item));
  const ids = new Set(entries.map(e => `${e.source}:${e.printingId}`));
  if (ids.size !== entries.length) throw new Error('Duplicate source printing identifier');
  return entries;
}
