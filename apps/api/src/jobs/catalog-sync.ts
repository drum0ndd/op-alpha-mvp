import { CatalogEntrySchema, type CatalogEntry } from '@op-alpha/contracts';
import { createHash } from 'node:crypto';
import type { PrismaClient } from '../generated/prisma/client.js';
import type { CatalogProvider, CatalogCache } from '../integrations/catalog/catalog-provider.js';
import { CatalogReviewRequiredError, persistCatalog } from '../integrations/catalog/catalog.repository.js';
type SavedCache = { etag: string | null; lastModified: string | null; entries: unknown; updatedAt: Date };
function cacheVersion(cache: SavedCache | null) {
  return cache ? createHash('sha256').update(JSON.stringify([
    cache.updatedAt.toISOString(), cache.etag, cache.lastModified, cache.entries,
  ])).digest('hex') : null;
}
export class StaleCatalogRunError extends Error {
  constructor() { super('STALE_CATALOG_RUN'); }
}
export function validatedBatch(entries: CatalogEntry[], provider: string, collection: string) {
  if (!entries.length || entries.length > 2000) throw new Error('Empty or changed catalog; previous data preserved');
  const parsed = entries.map(e => CatalogEntrySchema.parse(e));
  if (parsed.some(e => e.source !== provider || e.collection.id !== collection)) throw new Error('Catalog provenance mismatch');
  if (new Set(parsed.map(e => e.printingId)).size !== parsed.length) throw new Error('Duplicate printing identifier');
  return parsed;
}
export async function syncCollection(provider: CatalogProvider, collection: string, dryRun: boolean, prisma?: PrismaClient) {
  const start = Date.now();
  if (dryRun) {
    const batch = await provider.fetchCollection(collection);
    return { status: 'dry-run', count: validatedBatch(batch.entries, provider.id, collection).length, durationMs: Date.now() - start };
  }
  if (!prisma) throw new Error('Database required for import');
  const run = await prisma.catalogSyncRun.create({ data: { provider: provider.id, collection, status: 'RUNNING' } });
  try {
    const key = `${provider.id}:${collection}`;
    const saved = await prisma.catalogCache.findUnique({ where: { key } });
    const expectedVersion = cacheVersion(saved);
    const cache: CatalogCache | undefined = saved ? { etag: saved.etag, lastModified: saved.lastModified,
      entries: validatedBatch(saved.entries as unknown as CatalogEntry[], provider.id, collection) } : undefined;
    // Transport, retries and parsing never hold a database transaction/connection open.
    const batch = await provider.fetchCollection(collection, cache);
    if (batch.notModified && !cache) throw new Error('304 without validated cache');
    const entries = validatedBatch(batch.notModified ? cache!.entries : batch.entries, provider.id, collection);
    const count = await prisma.$transaction(async tx => {
      const lock = await tx.$queryRaw<{ locked: boolean }[]>`SELECT pg_try_advisory_xact_lock(71432, hashtext(${key})) AS locked`;
      if (!lock[0]?.locked) throw new Error('OVERLAPPING_RUN');
      const current = await tx.catalogCache.findUnique({ where: { key } });
      if (cacheVersion(current) !== expectedVersion) throw new StaleCatalogRunError();
      if (!batch.notModified) await persistCatalog(tx, entries);
      // Monotonic revisions distinguish overlapping fetches, including identical/304 payloads.
      const updatedAt = new Date(Math.max(Date.now(), (current?.updatedAt.getTime() ?? 0) + 1));
      const data = { entries, updatedAt,
        etag: batch.notModified ? saved!.etag : batch.etag ?? null,
        lastModified: batch.notModified ? saved!.lastModified : batch.lastModified ?? null,
      };
      await tx.catalogCache.upsert({ where: { key }, create: { key, ...data }, update: data });
      await tx.catalogSyncRun.update({ where: { id: run.id }, data: { status: 'SUCCESS', count: entries.length, finishedAt: new Date(), durationMs: Date.now() - start } });
      return entries.length;
    }, { timeout: 120000, maxWait: 5000 });
    return { status: 'success', count, durationMs: Date.now() - start };
  } catch (error) {
    const overlap = error instanceof Error && error.message === 'OVERLAPPING_RUN';
    const stale = error instanceof StaleCatalogRunError;
    const review = error instanceof CatalogReviewRequiredError;
    await prisma.catalogSyncRun.update({ where: { id: run.id }, data: { status: overlap || stale ? 'SKIPPED' : 'FAILED',
      failure: overlap ? 'overlap' : stale ? 'stale_cache' : review ? 'review_required' : 'Import failed; previous data preserved',
      finishedAt: new Date(), durationMs: Date.now() - start } });
    throw error;
  }
}
