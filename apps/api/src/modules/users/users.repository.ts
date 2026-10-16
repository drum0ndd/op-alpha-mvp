import { Injectable } from '@nestjs/common';
import type { CreateUser } from '@op-alpha/contracts';
import { PrismaService } from '../../prisma/prisma.service.js';
import { publicUserSelect } from '../identity/public-user.js';
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}
  profile(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        ...publicUserSelect,
        holdings: { orderBy: { id: 'asc' }, select: {
          id: true, variantId: true, quantity: true, condition: true,
          acquisitionPrice: true, acquisitionCurrency: true,
          variant: { select: {
            variantName: true, language: true, externalKey: true, imageUrl: true,
            set: { select: { code: true, name: true } },
            card: { select: { code: true, name: true, set: { select: { code: true, name: true } } } },
          } },
        } },
        decks: { where: { isActive: true }, orderBy: { updatedAt: 'desc' }, select: { id: true, name: true, winRate: true } },
        _count: { select: { watchlist: { where: { isActive: true } } } },
      },
    });
  }
  create(input: Omit<CreateUser, 'password'>, passwordHash: string) {
    return this.prisma.user.create({
      data: { ...input, passwordHash },
      select: publicUserSelect,
    });
  }
}
