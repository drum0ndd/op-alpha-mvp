import { readFile } from 'node:fs/promises';
import type { CatalogProvider } from './catalog-provider.js';
import { parseCatalogFixture } from './parser.js';
export class FixtureProvider implements CatalogProvider {
  readonly id = 'synthetic' as const;
  constructor(private readonly path: string) {}
  async fetchCollection(collection: string) {
    const entries = parseCatalogFixture(await readFile(this.path, 'utf8'));
    if (entries.some(e => e.source !== 'synthetic')) throw new Error('Manual fixtures must be synthetic; external content review pending');
    const selected = entries.filter(e => e.collection.id === collection);
    if (!selected.length) throw new Error('Collection absent or empty');
    return { entries: selected };
  }
}
