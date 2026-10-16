import { config } from 'dotenv';
config({ path: ['.env', '../../.env'] });
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { CardLanguage, Lens, LiquidityLevel, RecommendationAction, RiskLevel, SourceType, TrendDirection, CardCondition, PriceKind } from '../src/generated/prisma/enums.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required');
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const userId = await prisma.$transaction(async tx => {
    const user = await tx.user.upsert({
      where: { email: 'breno@opalpha.local' }, update: {}, create: { email: 'breno@opalpha.local', name: 'Breno' },
    });
    const extraBooster = await tx.cardSet.upsert({ where: { code: 'EB03' }, update: {}, create: { code: 'EB03', name: 'Extra Booster 03' } });
    const promos = await tx.cardSet.upsert({ where: { code: 'P' }, update: {}, create: { code: 'P', name: 'Promo' } });
    const source = await tx.dataSource.upsert({ where: { key: 'manual-seed' }, update: {}, create: { key:'manual-seed', name:'Manual Seed', type: SourceType.MANUAL, isAuthorized:true, reliabilityPct:60 } });
    // Existing demo fixtures, not externally verified catalog or market data.
    const cards = [
      { code:'EB03-061', name:'Uta', variant:'Alternate Art', key:'uta-eb03-061-aa', setId:extraBooster.id, price:339, fair:399, score:91 },
      { code:'P-088', name:'Trafalgar Law', variant:'Reprint Event', key:'trafalgar-law-p-088-re', setId:promos.id, price:210, fair:245, score:86 },
      { code:'EB03-055', name:'Nico Robin', variant:'Rare', key:'nico-robin-eb03-055', setId:extraBooster.id, price:72, fair:89, score:82 },
    ];
    for (const c of cards) {
      const card = await tx.card.upsert({ where:{ code:c.code }, update:{ name:c.name,setId:c.setId }, create:{ code:c.code,name:c.name,rarity:'SR',setId:c.setId } });
      const variant = await tx.cardVariant.upsert({
        where:{ externalKey:c.key },
        update:{ cardId:card.id,variantName:c.variant,language:CardLanguage.EN,setId:c.setId,publicationApproved:true },
        create:{ cardId:card.id,variantName:c.variant,language:CardLanguage.EN,externalKey:c.key,artType:'AA',setId:c.setId,publicationApproved:true }
      });
      await tx.pricePoint.create({ data:{ variantId:variant.id, sourceId:source.id, observedAt:new Date(), amount:c.price, currency:'BRL', condition:CardCondition.NM, kind:PriceKind.MARKET, region:'BR' } });
      for (const lens of [Lens.COLLECTOR,Lens.INVESTOR,Lens.PLAYER]) {
        await tx.recommendation.create({ data:{
          variantId:variant.id,lens,action: lens===Lens.PLAYER ? RecommendationAction.HOLD : RecommendationAction.BUY_BELOW,
          alphaScore:c.score,fairPrice:c.fair,currency:'BRL',risk:RiskLevel.MEDIUM,liquidity:LiquidityLevel.HIGH,
          trend:TrendDirection.UP,confidence:72,rationale:'Preço abaixo da referência, demanda multilateral e liquidez preservada.',engineVersion:'0.1.0'
        }});
      }
    }
    await tx.deck.upsert({ where:{ id:'00000000-0000-0000-0000-000000000001' }, update:{}, create:{ id:'00000000-0000-0000-0000-000000000001', userId:user.id, name:'Enel Roxo', leaderCode:'OP15-001', winRate:61.4 } });
    return user.id;
  });
  console.log({ userId });
}
main().finally(() => prisma.$disconnect());
