import { Injectable, NotFoundException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { CardDetailSchema, CatalogPageSchema } from '@op-alpha/contracts';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ListCardsDto } from './dto/list-cards.dto.js';

const setSelect = { id: true, code: true, name: true, releaseDate: true } as const;
const publicCardSelect = {
  id: true, code: true, name: true, color: true, cardType: true, rarity: true,
  set: { select: setSelect },
  variants: {
    where: { publicationApproved: true },
    orderBy: [{ variantName: 'asc' }, { language: 'asc' }, { id: 'asc' }],
    select: { id: true, variantName: true, language: true, imageUrl: true, externalKey: true, set: { select: setSelect } },
  },
} satisfies Prisma.CardSelect;
type PublicCard = Prisma.CardGetPayload<{ select: typeof publicCardSelect }>;
function serializeCard(card: PublicCard) {
  return { ...card,
    set: { ...card.set, releaseDate: card.set.releaseDate?.toISOString() ?? null },
    variants: card.variants.map(variant => ({ ...variant,
      set: variant.set ? { ...variant.set, releaseDate: variant.set.releaseDate?.toISOString() ?? null } : null,
    })),
  };
}
@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}
  async list(input: ListCardsDto) {
    const page = input.page ?? 1;
    const limit = input.limit ?? 24;
    const publishedVariant = {
      publicationApproved: true,
      ...(input.language ? { language: input.language } : {}),
      ...(input.set ? { OR: [
        { set: { code: input.set } },
        { setId: null, card: { set: { code: input.set } } },
      ] } : {}),
    } satisfies Prisma.CardVariantWhereInput;
    const where: Prisma.CardWhereInput = {
      variants: { some: publishedVariant },
      ...(input.query ? { OR: [
        { code: { contains: input.query, mode: 'insensitive' } },
        { name: { contains: input.query, mode: 'insensitive' } },
      ] } : {}),
    };
    const [total, cards] = await this.prisma.$transaction([
      this.prisma.card.count({ where }),
      this.prisma.card.findMany({ where, select: { ...publicCardSelect, variants: { ...publicCardSelect.variants, where: publishedVariant } },
        orderBy: [{ set: { code: 'desc' } }, { code: 'asc' }, { id: 'asc' }],
        skip: (page - 1) * limit, take: limit,
      }),
    ], { isolationLevel: 'RepeatableRead' });
    return CatalogPageSchema.parse({ items: cards.map(serializeCard), page, limit, total, totalPages: Math.ceil(total / limit) });
  }
  async detail(identifier: string) {
    const card = await this.prisma.card.findUnique({
      where: isUUID(identifier) ? { id: identifier } : { code: identifier },
      select: publicCardSelect,
    });
    if (!card || !card.variants.length) throw new NotFoundException('Carta não encontrada.');
    return CardDetailSchema.parse(serializeCard(card));
  }
}
