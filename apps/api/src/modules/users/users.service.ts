import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserSchema, ProfileResponseSchema } from '@op-alpha/contracts';
import { UsersRepository } from './users.repository.js';
import { hashPassword } from '../identity/password.js';
import { publicUser } from '../identity/public-user.js';
import { validate } from '../../common/validation.js';
@Injectable()
export class UsersService {
  constructor(private readonly repository: UsersRepository) {}
  async profile(userId: string) {
    const row = await this.repository.profile(userId);
    return ProfileResponseSchema.parse({
      user: publicUser(row),
      holdings: row.holdings.map(({ variant, acquisitionPrice, acquisitionCurrency, ...holding }) => ({
        ...holding,
        acquisitionPrice: acquisitionCurrency === 'BRL' ? acquisitionPrice?.toFixed(2) ?? null : null,
        acquisitionCurrency: acquisitionCurrency === 'BRL' ? 'BRL' : null,
        cardCode: variant.card.code, name: variant.card.name, variant: variant.variantName,
        language: variant.language, imageKey: variant.externalKey ?? variant.card.code, imageUrl: variant.imageUrl,
        setCode: (variant.set ?? variant.card.set).code, setName: (variant.set ?? variant.card.set).name,
      })),
      activeDecks: row.decks.map(deck => ({ ...deck, winRate: deck.winRate === null ? null : Number(deck.winRate) })),
      watchlistCount: row._count.watchlist,
    });
  }
  async create(payload: unknown) {
    const { password, ...input } = validate(CreateUserSchema, payload);
    const passwordHash = await hashPassword(password);
    try {
      const user = await this.repository.create(input, passwordHash);
      return publicUser(user);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') throw new ConflictException('E-mail já cadastrado.');
      throw error;
    }
  }
}
