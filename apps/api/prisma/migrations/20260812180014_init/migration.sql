-- CreateEnum
CREATE TYPE "Lens" AS ENUM ('COLLECTOR', 'INVESTOR', 'PLAYER');

-- CreateEnum
CREATE TYPE "CardLanguage" AS ENUM ('EN', 'JP', 'PT');

-- CreateEnum
CREATE TYPE "CardCondition" AS ENUM ('NM', 'LP', 'MP', 'HP', 'DMG');

-- CreateEnum
CREATE TYPE "PriceKind" AS ENUM ('LISTING', 'SOLD', 'FLOOR', 'MARKET');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('OFFICIAL', 'MARKETPLACE', 'META', 'COMMUNITY', 'MANUAL');

-- CreateEnum
CREATE TYPE "RecommendationAction" AS ENUM ('BUY', 'BUY_BELOW', 'HOLD', 'SELL', 'AVOID', 'SPECULATIVE');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "LiquidityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "TrendDirection" AS ENUM ('DOWN', 'STABLE', 'UP');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lens" "Lens" NOT NULL,
    "weight" DECIMAL(4,3) NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserLens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardSet" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3),

    CONSTRAINT "CardSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "cardType" TEXT,
    "rarity" TEXT,
    "setId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardVariant" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "externalKey" TEXT,
    "variantName" TEXT NOT NULL,
    "language" "CardLanguage" NOT NULL,
    "imageUrl" TEXT,
    "artType" TEXT,

    CONSTRAINT "CardVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataSource" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SourceType" NOT NULL,
    "baseUrl" TEXT,
    "isAuthorized" BOOLEAN NOT NULL DEFAULT false,
    "reliabilityPct" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricePoint" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "condition" "CardCondition" NOT NULL,
    "kind" "PriceKind" NOT NULL,
    "region" TEXT,
    "sampleSize" INTEGER,
    "sourceRef" TEXT,

    CONSTRAINT "PricePoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Holding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "condition" "CardCondition" NOT NULL,
    "acquisitionAt" TIMESTAMP(3),
    "acquisitionPrice" DECIMAL(12,2),
    "acquisitionCurrency" VARCHAR(3),

    CONSTRAINT "Holding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchlistItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "targetPrice" DECIMAL(12,2),
    "currency" VARCHAR(3),
    "reason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "WatchlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deck" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "leaderCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "winRate" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeckCard" (
    "id" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "DeckCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "lens" "Lens" NOT NULL,
    "action" "RecommendationAction" NOT NULL,
    "alphaScore" INTEGER NOT NULL,
    "fairPrice" DECIMAL(12,2),
    "currency" VARCHAR(3),
    "risk" "RiskLevel" NOT NULL,
    "liquidity" "LiquidityLevel" NOT NULL,
    "trend" "TrendDirection" NOT NULL,
    "confidence" INTEGER NOT NULL,
    "rationale" TEXT NOT NULL,
    "engineVersion" TEXT NOT NULL,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationEvidence" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "factor" TEXT NOT NULL,
    "value" DECIMAL(10,3) NOT NULL,
    "weight" DECIMAL(6,3) NOT NULL,
    "explanation" TEXT NOT NULL,

    CONSTRAINT "RecommendationEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserLens_userId_isPrimary_idx" ON "UserLens"("userId", "isPrimary");

-- CreateIndex
CREATE UNIQUE INDEX "UserLens_userId_lens_key" ON "UserLens"("userId", "lens");

-- CreateIndex
CREATE UNIQUE INDEX "CardSet_code_key" ON "CardSet"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Card_code_key" ON "Card"("code");

-- CreateIndex
CREATE INDEX "Card_name_idx" ON "Card"("name");

-- CreateIndex
CREATE INDEX "Card_setId_rarity_idx" ON "Card"("setId", "rarity");

-- CreateIndex
CREATE UNIQUE INDEX "CardVariant_externalKey_key" ON "CardVariant"("externalKey");

-- CreateIndex
CREATE INDEX "CardVariant_cardId_language_idx" ON "CardVariant"("cardId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "CardVariant_cardId_variantName_language_key" ON "CardVariant"("cardId", "variantName", "language");

-- CreateIndex
CREATE UNIQUE INDEX "DataSource_key_key" ON "DataSource"("key");

-- CreateIndex
CREATE INDEX "PricePoint_variantId_observedAt_idx" ON "PricePoint"("variantId", "observedAt" DESC);

-- CreateIndex
CREATE INDEX "PricePoint_sourceId_observedAt_idx" ON "PricePoint"("sourceId", "observedAt" DESC);

-- CreateIndex
CREATE INDEX "PricePoint_currency_region_idx" ON "PricePoint"("currency", "region");

-- CreateIndex
CREATE INDEX "Holding_userId_variantId_idx" ON "Holding"("userId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "WatchlistItem_userId_variantId_key" ON "WatchlistItem"("userId", "variantId");

-- CreateIndex
CREATE INDEX "Deck_userId_isActive_idx" ON "Deck"("userId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "DeckCard_deckId_cardId_key" ON "DeckCard"("deckId", "cardId");

-- CreateIndex
CREATE INDEX "Recommendation_lens_createdAt_idx" ON "Recommendation"("lens", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Recommendation_variantId_lens_createdAt_idx" ON "Recommendation"("variantId", "lens", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Alert_userId_readAt_createdAt_idx" ON "Alert"("userId", "readAt", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "UserLens" ADD CONSTRAINT "UserLens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_setId_fkey" FOREIGN KEY ("setId") REFERENCES "CardSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardVariant" ADD CONSTRAINT "CardVariant_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricePoint" ADD CONSTRAINT "PricePoint_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "CardVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricePoint" ADD CONSTRAINT "PricePoint_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holding" ADD CONSTRAINT "Holding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holding" ADD CONSTRAINT "Holding_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "CardVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistItem" ADD CONSTRAINT "WatchlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistItem" ADD CONSTRAINT "WatchlistItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "CardVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckCard" ADD CONSTRAINT "DeckCard_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckCard" ADD CONSTRAINT "DeckCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "CardVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationEvidence" ADD CONSTRAINT "RecommendationEvidence_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "Recommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
