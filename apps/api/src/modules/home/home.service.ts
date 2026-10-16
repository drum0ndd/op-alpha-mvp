import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { HomeQueryDto } from './dto/home-query.dto.js';
import { HomeResponseSchema } from '@op-alpha/contracts';

const marketIndices = [
  { id: 'alpha', label: 'OP ALPHA INDEX', value: 1248.73, variationPct: 1.82, points: [22,24,20,21,18,19,14,11,7,9,5] },
  { id: 'manga', label: 'MANGA INDEX', value: 2053.11, variationPct: 2.45, points: [23,22,23,20,18,15,16,11,10,8,6] },
  { id: 'sealed', label: 'SEALED INDEX', value: 980.21, variationPct: -0.73, points: [12,15,17,16,20,18,19,18,21,23,24] },
  { id: 'leader', label: 'LEADER INDEX', value: 1105.87, variationPct: 0.91, points: [24,22,23,20,21,18,17,14,12,8,6] },
];

@Injectable()
export class HomeService {
  constructor(private readonly prisma: PrismaService) {}
  async getHome(input: HomeQueryDto) {
    if (input.userId) throw new UnauthorizedException('Autenticação necessária para acessar dados pessoais.');
    const now = new Date();
    const recommendations = await this.prisma.recommendation.findMany({
      where: { lens: input.lens, variant: { publicationApproved: true } },
      include: { variant: { include: { card: true, prices: {
        where: { source: { isAuthorized: true }, kind: 'MARKET', condition: 'NM', currency: 'BRL' },
        orderBy: [{ observedAt: 'desc' }, { id: 'asc' }], take: 1,
      } } } },
      orderBy: [{ alphaScore: 'desc' }, { createdAt: 'desc' }],
      take: input.limit ?? 6,
    });

    return HomeResponseSchema.parse({
      lens: input.lens,
      updatedAt: now.toISOString(),
      marketIndices,
      opportunities: recommendations.map((r) => {
        const price = r.variant.prices.find(observation => observation.currency === 'BRL');
        const current = price ? Number(price.amount) : null;
        const fair = r.fairPrice === null || r.currency !== 'BRL' ? null : Number(r.fairPrice);
        const currency = price?.currency ?? null;
        const fairCurrency = fair === null ? null : 'BRL';
        return {
          id: r.id,
          cardId: r.variant.card.id,
          variantId: r.variant.id,
          cardCode: r.variant.card.code,
          name: r.variant.card.name,
          variant: r.variant.variantName,
          imageKey: r.variant.externalKey ?? r.variant.card.code,
          imageUrl: r.variant.imageUrl,
          alphaScore: r.alphaScore,
          currentPrice: current,
          currency,
          priceObservedAt: price?.observedAt.toISOString() ?? null,
          currentCondition: price?.condition ?? null,
          currentPriceKind: price?.kind ?? null,
          fairPrice: fair,
          fairCurrency,
          // Recommendation has no condition/price-kind context for fairPrice.
          // Matching currencies alone cannot prove these amounts are comparable.
          marginPct: null,
          liquidity: r.liquidity,
          supply: null,
          trend: r.trend,
          recommendation: r.action,
          rationale: r.rationale,
          validUntil: r.validUntil?.toISOString() ?? null,
          expired: r.validUntil !== null && r.validUntil <= now,
        };
      }),
      portfolio: { totalValue: null, variationPct: null, itemCount: 0 },
      player: null,
    });
  }
}
