import { z } from 'zod';

const code = z.string().trim().min(1).max(40);
const setCode = z.string().trim().min(1).max(80);
const optionalText = (max: number) => z.string().trim().min(1).max(max).nullable().optional();

export const ProposedCardSchema = z.object({
  code,
  name: z.string().trim().min(1).max(200),
  setCode,
  cardType: z.string().trim().min(1).max(80),
  color: optionalText(80),
  rarity: optionalText(40),
}).strict();

export const ProposedPrintingSchema = z.object({
  variantName: z.string().trim().min(1).max(200),
  language: z.enum(['EN', 'JP', 'PT']),
  setCode,
}).strict();

// Proposals contain no price, account type, publication flag, source URL or source identity.
// An official source and its validator must be configured separately by the server.
export const CreateCardSubmissionSchema = z.object({
  operation: z.literal('CREATE'),
  card: ProposedCardSchema,
  printing: ProposedPrintingSchema,
}).strict();

const cardChanges = ProposedCardSchema.omit({ code: true }).partial().refine(
  value => Object.values(value).some(field => field !== undefined), 'Informe ao menos uma alteração da carta.',
);
const printingChanges = ProposedPrintingSchema.partial().refine(
  value => Object.values(value).some(field => field !== undefined), 'Informe ao menos uma alteração da impressão.',
);
export const EditCardSubmissionSchema = z.object({
  operation: z.literal('EDIT'),
  submissionId: z.string().uuid(),
  expectedVersion: z.number().int().positive(),
  cardId: z.string().uuid(),
  printingId: z.string().uuid(),
  changes: z.object({ card: cardChanges.optional(), printing: printingChanges.optional() }).strict()
    .refine(value => value.card !== undefined || value.printing !== undefined, 'Informe o conteúdo a revisar.'),
}).strict();
export const CardSubmissionSchema = z.discriminatedUnion('operation', [CreateCardSubmissionSchema, EditCardSubmissionSchema]);
export type CardSubmission = z.infer<typeof CardSubmissionSchema>;

export const CardVerificationEvidenceSchema = z.object({
  sourceKey: z.string().regex(/^[a-z0-9][a-z0-9_-]{0,63}$/),
  referenceId: z.string().trim().min(1).max(120),
  checkedAt: z.string().datetime(),
  contentDigest: z.string().regex(/^[a-f0-9]{64}$/),
  checkedFields: z.array(z.enum([
    'card.code', 'card.name', 'card.setCode', 'card.cardType', 'card.color', 'card.rarity',
    'printing.variantName', 'printing.language', 'printing.setCode',
  ])).min(1),
}).strict();

export const CardSubmissionVerificationSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('pending'), reason: z.literal('awaiting_verification'), evidence: z.null() }).strict(),
  z.object({ status: z.literal('verified'), evidence: CardVerificationEvidenceSchema }).strict(),
  z.object({
    status: z.literal('rejected'), reason: z.enum(['content_mismatch', 'unsupported_printing', 'review_required']),
    evidence: CardVerificationEvidenceSchema.nullable(),
  }).strict(),
  z.object({
    status: z.literal('unavailable'),
    reason: z.enum(['source_not_configured', 'source_disabled', 'validator_not_configured', 'verification_failed', 'invalid_evidence']),
    evidence: z.null(),
  }).strict(),
]);
export type CardSubmissionVerification = z.infer<typeof CardSubmissionVerificationSchema>;
