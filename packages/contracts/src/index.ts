import { z } from 'zod';
export * from './card-submission.js';

export const LensSchema = z.enum(['COLLECTOR', 'INVESTOR', 'PLAYER']);
export type Lens = z.infer<typeof LensSchema>;
export const CurrencySchema = z.literal('BRL');

export const MarketIndexSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number(),
  variationPct: z.number().nullable(),
  points: z.array(z.number()),
});

export const OpportunitySchema = z.object({
  id: z.string(),
  cardId: z.string().uuid(),
  variantId: z.string().uuid(),
  cardCode: z.string(),
  name: z.string(),
  variant: z.string(),
  imageKey: z.string(),
  imageUrl: z.string().url().nullable(),
  alphaScore: z.number().min(0).max(100),
  currentPrice: z.number().nullable(),
  currency: CurrencySchema.nullable(),
  priceObservedAt: z.string().datetime().nullable(),
  currentCondition: z.enum(['NM', 'LP', 'MP', 'HP', 'DMG']).nullable(),
  currentPriceKind: z.enum(['LISTING', 'SOLD', 'FLOOR', 'MARKET', 'OFFER_STATISTIC']).nullable(),
  fairPrice: z.number().nullable(),
  fairCurrency: CurrencySchema.nullable(),
  marginPct: z.number().nullable(),
  liquidity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  supply: z.enum(['LOW', 'MEDIUM', 'HIGH']).nullable(),
  trend: z.enum(['DOWN', 'STABLE', 'UP']),
  recommendation: z.enum(['BUY', 'BUY_BELOW', 'HOLD', 'SELL', 'AVOID', 'SPECULATIVE']),
  rationale: z.string(),
  validUntil: z.string().datetime().nullable(),
  expired: z.boolean(),
});

export const HomeResponseSchema = z.object({
  lens: LensSchema,
  updatedAt: z.string(),
  marketIndices: z.array(MarketIndexSchema),
  opportunities: z.array(OpportunitySchema),
  portfolio: z.object({
    totalValue: z.number().nullable(),
    variationPct: z.number().nullable(),
    itemCount: z.number(),
  }),
  player: z.object({
    deckName: z.string(),
    winRate: z.number().nullable(),
    nextTournamentAt: z.string().nullable(),
  }).nullable(),
});
export type HomeResponse = z.infer<typeof HomeResponseSchema>;

export const CreateUserSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome.').max(100),
  email: z.string().trim().toLowerCase().email('Informe um e-mail válido.').max(254),
  password: z.string().min(12, 'A senha deve ter pelo menos 12 caracteres.').max(128),
}).strict();
export type CreateUser = z.infer<typeof CreateUserSchema>;
export const UserResponseSchema = z.object({
  id: z.string().uuid(), name: z.string(), email: z.string().email(),
  createdAt: z.string().datetime(),
});
export type UserResponse = z.infer<typeof UserResponseSchema>;

export const ProfileResponseSchema = z.object({
  user: UserResponseSchema,
  holdings: z.array(z.object({
    id: z.string().uuid(), variantId: z.string().uuid(), quantity: z.number().int(),
    condition: z.string(), acquisitionPrice: z.string().nullable(), acquisitionCurrency: CurrencySchema.nullable(),
    cardCode: z.string(), name: z.string(), variant: z.string(), language: z.string(),
    setCode: z.string(), setName: z.string(), imageKey: z.string(), imageUrl: z.string().url().nullable(),
  })),
  activeDecks: z.array(z.object({ id: z.string().uuid(), name: z.string(), winRate: z.number().nullable() })),
  watchlistCount: z.number().int().nonnegative(),
});
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;

export const CardSetSchema = z.object({
  id: z.string().uuid(), code: z.string(), name: z.string(), releaseDate: z.string().datetime().nullable(),
});
export const CatalogVariantSchema = z.object({
  id: z.string().uuid(), variantName: z.string(), language: z.enum(['EN', 'JP', 'PT']),
  imageUrl: z.string().url().nullable(), externalKey: z.string().nullable(), set: CardSetSchema.nullable(),
});
export const CatalogCardSchema = z.object({
  id: z.string().uuid(), code: z.string(), name: z.string(), color: z.string().nullable(),
  cardType: z.string().nullable(), rarity: z.string().nullable(), set: CardSetSchema,
  variants: z.array(CatalogVariantSchema),
});
export const CardDetailSchema = CatalogCardSchema;
export type CardDetail = z.infer<typeof CardDetailSchema>;
export const CatalogPageSchema = z.object({
  items: z.array(CatalogCardSchema), page: z.number().int().positive(), limit: z.number().int().positive(),
  total: z.number().int().nonnegative(), totalPages: z.number().int().nonnegative(),
});
export type CatalogPage = z.infer<typeof CatalogPageSchema>;

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(128),
}).strict();
export const HoldingInputSchema = z.object({
  variantId: z.string().uuid(), quantity: z.number().int().min(1).max(10000),
  condition: z.enum(['NM', 'LP', 'MP', 'HP', 'DMG']).default('NM'),
  acquisitionPrice: z.string().regex(/^(0|[1-9]\d{0,9})(\.\d{1,2})?$/).nullable().default(null),
  acquisitionCurrency: CurrencySchema.nullable().default(null),
}).strict().refine(x => (x.acquisitionPrice === null) === (x.acquisitionCurrency === null), 'Informe custo e moeda juntos.');
export const FavoriteInputSchema = z.object({ variantId: z.string().uuid() }).strict();
export type HoldingInput = z.infer<typeof HoldingInputSchema>;
export const HoldingResponseSchema = z.object({
  id: z.string().uuid(), variantId: z.string().uuid(), quantity: z.number().int().positive(),
  condition: z.enum(['NM', 'LP', 'MP', 'HP', 'DMG']),
  acquisitionPrice: z.string().nullable(), acquisitionCurrency: CurrencySchema.nullable(),
});
export const PriceObservationSchema = z.object({
  variantId: z.string().uuid(), source: z.string().min(1), observedAt: z.string().datetime(),
  amount: z.string().regex(/^(0|[1-9]\d{0,9})(\.\d{1,2})?$/), currency: CurrencySchema,
  kind: z.enum(['LISTING', 'OFFER_STATISTIC', 'SOLD']),
});
export type PriceObservation = z.infer<typeof PriceObservationSchema>;
export const CatalogEntrySchema = z.object({
  source: z.enum(['synthetic', 'bandai']), printingId: z.string().min(1).max(120),
  code: z.string().min(1).max(40), name: z.string().min(1).max(200),
  collection: z.object({ id: z.string().min(1).max(80), name: z.string().min(1).max(200) }).strict(),
  language: z.enum(['EN', 'JP', 'PT']), variant: z.string().min(1).max(200),
  rarity: z.string().max(40).nullable().default(null), category: z.string().max(80).nullable().default(null),
  color: z.string().max(80).nullable().default(null), type: z.string().max(200).nullable().default(null),
  cost: z.number().int().nonnegative().nullable().default(null), life: z.number().int().nonnegative().nullable().default(null),
  power: z.number().int().nonnegative().nullable().default(null), counter: z.number().int().nonnegative().nullable().default(null),
  effect: z.string().max(5000).nullable().default(null), trigger: z.string().max(5000).nullable().default(null),
  sourceUrl: z.string().url(), collectedAt: z.string().datetime(),
}).strict();
export type CatalogEntry = z.infer<typeof CatalogEntrySchema>;
