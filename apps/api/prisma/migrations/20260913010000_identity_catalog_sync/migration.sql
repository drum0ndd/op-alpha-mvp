-- Retain legacy type as compatibility metadata; it grants no permissions.
ALTER TABLE "User" ADD COLUMN "preferredLens" "Lens" NOT NULL DEFAULT 'COLLECTOR';
UPDATE "User" SET "preferredLens" = 'INVESTOR' WHERE "type" = 'investidor';
INSERT INTO "UserLens" ("id", "userId", "lens", "weight", "isPrimary")
SELECT md5(u."id" || ':' || l.lens::text), u."id", l.lens, 0.5, false
FROM "User" u CROSS JOIN (VALUES ('COLLECTOR'::"Lens"), ('INVESTOR'::"Lens")) l(lens)
ON CONFLICT ("userId", "lens") DO NOTHING;
CREATE TABLE "Session" (
  "tokenHash" TEXT PRIMARY KEY, "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "expiresAt" TIMESTAMP(3) NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "Session_userId_expiresAt_idx" ON "Session"("userId", "expiresAt");
ALTER TYPE "PriceKind" ADD VALUE 'OFFER_STATISTIC';
ALTER TABLE "CardVariant" ADD COLUMN "catalogSource" TEXT, ADD COLUMN "sourcePrintingId" TEXT,
  ADD COLUMN "sourceUrl" TEXT, ADD COLUMN "collectedAt" TIMESTAMP(3), ADD COLUMN "catalogData" JSONB,
  ADD COLUMN "publicationApproved" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "setId" TEXT REFERENCES "CardSet"("id");
-- Reprints may have the same code/name/language. Replace only the index, never rows.
DROP INDEX "CardVariant_cardId_variantName_language_key";
CREATE INDEX "CardVariant_cardId_variantName_language_idx" ON "CardVariant"("cardId", "variantName", "language");
CREATE UNIQUE INDEX "CardVariant_catalogSource_sourcePrintingId_key" ON "CardVariant"("catalogSource", "sourcePrintingId");
CREATE TABLE "CatalogSyncRun" (
 "id" TEXT PRIMARY KEY, "provider" TEXT NOT NULL, "collection" TEXT NOT NULL,
 "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "finishedAt" TIMESTAMP(3),
 "durationMs" INTEGER, "status" TEXT NOT NULL, "count" INTEGER NOT NULL DEFAULT 0, "failure" TEXT
);
CREATE INDEX "CatalogSyncRun_provider_collection_startedAt_idx" ON "CatalogSyncRun"("provider", "collection", "startedAt");
CREATE TABLE "CatalogCache" (
 "key" TEXT PRIMARY KEY, "etag" TEXT, "lastModified" TEXT, "entries" JSONB NOT NULL, "updatedAt" TIMESTAMP(3) NOT NULL
);
