import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { HoldingInputSchema, HoldingResponseSchema } from '@op-alpha/contracts';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class CollectionService {
  constructor(private readonly prisma: PrismaService) {}
  async create(userId: string, body: unknown) {
    const parsed = HoldingInputSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException('Informe impressão, quantidade, condição e custo em reais válidos.');
    const input = parsed.data;
    const holding = await this.prisma.$transaction(async tx => {
      const variant = await tx.cardVariant.findFirst({ where: { id: input.variantId, publicationApproved: true }, select: { id: true } });
      if (!variant) throw new NotFoundException('Impressão não encontrada no catálogo aprovado.');
      // Each purchase is a separate lot: condition and unit cost can differ.
      return tx.holding.create({ data: { userId, ...input } });
    });
    return HoldingResponseSchema.parse({ ...holding, acquisitionPrice: holding.acquisitionPrice?.toString() ?? null });
  }
}
