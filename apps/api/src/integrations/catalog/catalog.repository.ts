import type { CatalogEntry } from '@op-alpha/contracts';
import type { Prisma } from '../../generated/prisma/client.js';
export class CatalogReviewRequiredError extends Error {
  constructor() { super('Catalog content changed; review required; previous data preserved'); }
}

// JSONB may reorder object properties. Compare the material fields in a fixed order,
// excluding the collection timestamp, which does not change the printing's content.
function contentKey(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const entry = value as Record<string, unknown>;
  if (!entry.collection || typeof entry.collection !== 'object' || Array.isArray(entry.collection)) return null;
  const collection = entry.collection as Record<string, unknown>;
  return JSON.stringify([
    entry.source, entry.printingId, entry.code, entry.name, collection.id, collection.name,
    entry.language, entry.variant, entry.sourceUrl,
    ...['rarity', 'category', 'color', 'type', 'cost', 'life', 'power', 'counter', 'effect', 'trigger'].map(key => entry[key] ?? null),
  ]);
}

// Entries must already have been parsed/validated before opening the transaction.
export async function persistCatalog(tx: Prisma.TransactionClient, entries: CatalogEntry[]) {
  for (const entry of entries) {
    const identity = { catalogSource_sourcePrintingId: { catalogSource: entry.source, sourcePrintingId: entry.printingId } };
    const existing = await tx.cardVariant.findUnique({ where: identity,
      include: { card: { select: { code: true } }, set: { select: { code: true, name: true } } },
    });
    if (existing) {
      if (existing.card.code !== entry.code || existing.set?.code !== entry.collection.id
        || existing.set.name !== entry.collection.name || existing.variantName !== entry.variant
        || existing.language !== entry.language || existing.sourceUrl !== entry.sourceUrl
        || contentKey(existing.catalogData) !== contentKey(entry)) {
        throw new CatalogReviewRequiredError();
      }
      const collectedAt = new Date(entry.collectedAt);
      if (!existing.collectedAt || collectedAt > existing.collectedAt) {
        await tx.cardVariant.update({ where: { id: existing.id }, data: { collectedAt } });
      }
      // Preserve reviewed publication and canonical links, including an explicit rejection.
      continue;
    }
    const set = await tx.cardSet.upsert({ where: { code: entry.collection.id }, create: { code: entry.collection.id, name: entry.collection.name }, update: {} });
    if (set.name !== entry.collection.name) throw new CatalogReviewRequiredError();
    const card = await tx.card.upsert({ where: { code: entry.code },
      create: { code: entry.code, name: entry.name, setId: set.id, color: entry.color, rarity: entry.rarity, cardType: entry.category },
      update: {}, // Canonical card identity is stable; localized printing details live on the variant.
    });
    const data = { cardId: card.id, setId: set.id, variantName: entry.variant, language: entry.language,
      catalogData: entry, sourceUrl: entry.sourceUrl, collectedAt: new Date(entry.collectedAt),
      publicationApproved: entry.source === 'synthetic' };
    // A competing identity across collections must fail its unique constraint, not relink a printing.
    await tx.cardVariant.create({ data: { ...data, catalogSource: entry.source, sourcePrintingId: entry.printingId } });
  }
}
