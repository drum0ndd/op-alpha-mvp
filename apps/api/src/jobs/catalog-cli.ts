import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { FixtureProvider } from '../integrations/catalog/fixture.provider.js';
import { BandaiProvider } from '../integrations/catalog/bandai.provider.js';
import { syncCollection } from './catalog-sync.js';
config({ path: ['.env', '../../.env'], quiet: true });
async function main() {
  const args = process.argv.slice(2).filter(x => x !== '--');
  const option = (name: string) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
  const scheduled = args.includes('--scheduled');
  if (scheduled && process.env.CATALOG_SYNC_ENABLED !== 'true') { console.log('Scheduled catalog sync disabled'); return; }
  const providerName = option('--provider') ?? 'synthetic';
  if (!['synthetic', 'bandai'].includes(providerName)) throw new Error('Unknown provider');
  const provider = providerName === 'bandai' ? new BandaiProvider() : new FixtureProvider(option('--file') ?? 'fixtures/catalog.synthetic.json');
  const collections = (option('--collection') ?? process.env.CATALOG_COLLECTIONS ?? 'SYNTH-DEMO').split(',').filter(Boolean);
  const concurrency = Number(process.env.CATALOG_CONCURRENCY ?? 1);
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 2) throw new Error('CATALOG_CONCURRENCY must be 1 or 2');
  const dryRun = !args.includes('--write');
  // No DB access in dry-run, including logs/cache/locks. Real provider fails closed before DB access.
  if (providerName === 'bandai') await provider.fetchCollection(collections[0]);
  const connectionString = process.env.DATABASE_URL;
  if (!dryRun && (!connectionString || !['localhost', '127.0.0.1', '[::1]'].includes(new URL(connectionString).hostname))) throw new Error('CLI writes require a local database');
  const prisma = dryRun ? undefined : new PrismaClient({ adapter: new PrismaPg({ connectionString, connectionTimeoutMillis: 5000 }) });
  try {
    // Each collection is atomic. A failed/blocked source stops the next batch.
    for (let i = 0; i < collections.length; i += concurrency) {
      const results = await Promise.allSettled(collections.slice(i, i + concurrency).map(c => syncCollection(provider, c, dryRun, prisma)));
      for (const result of results) { if (result.status === 'rejected') throw result.reason; console.log(result.value); }
    }
  } finally { await prisma?.$disconnect(); }
}
main().catch(() => { console.error('Catalog sync failed. Check configuration, authorization and run records; no records deleted.'); process.exitCode = 1; });
