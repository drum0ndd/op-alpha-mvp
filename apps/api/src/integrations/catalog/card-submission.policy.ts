import {
  CardSubmissionSchema, CardSubmissionVerificationSchema,
  type CardSubmission, type CardSubmissionVerification,
} from '@op-alpha/contracts';
import { createHash } from 'node:crypto';

// Only server code may supply this configuration. No endpoint or live source adapter exists yet.
export type CardSubmissionVerificationPolicy = {
  sourceKey: string;
  enabled: boolean;
  validate?: (submission: CardSubmission) => Promise<unknown>;
};

export function cardSubmissionDigest(input: unknown) {
  // Zod supplies a stable property order and the same trimming/normalization used by verification.
  return createHash('sha256').update(JSON.stringify(CardSubmissionSchema.parse(input))).digest('hex');
}

export function requiredCardVerificationFields(submission: CardSubmission) {
  const content = submission.operation === 'CREATE' ? submission : submission.changes;
  return [
    ...Object.entries(content.card ?? {}).filter(([, value]) => value !== undefined).map(([key]) => `card.${key}`),
    ...Object.entries(content.printing ?? {}).filter(([, value]) => value !== undefined).map(([key]) => `printing.${key}`),
  ];
}

export async function verifyCardSubmission(
  input: unknown, policy?: CardSubmissionVerificationPolicy,
): Promise<CardSubmissionVerification> {
  const submission = CardSubmissionSchema.parse(input);
  if (!policy) return { status: 'unavailable', reason: 'source_not_configured', evidence: null };
  if (!policy.enabled) return { status: 'unavailable', reason: 'source_disabled', evidence: null };
  if (!policy.validate) return { status: 'unavailable', reason: 'validator_not_configured', evidence: null };
  try {
    const result = CardSubmissionVerificationSchema.safeParse(await policy.validate(submission));
    if (!result.success || (result.data.evidence && (result.data.evidence.sourceKey !== policy.sourceKey
      || result.data.evidence.contentDigest !== cardSubmissionDigest(submission)))) {
      return { status: 'unavailable', reason: 'invalid_evidence', evidence: null };
    }
    if (result.data.status === 'verified') {
      const checked = new Set<string>(result.data.evidence.checkedFields);
      if (requiredCardVerificationFields(submission).some(field => !checked.has(field))) {
        return { status: 'unavailable', reason: 'invalid_evidence', evidence: null };
      }
    }
    // A content match is an advisory verification result, never a publication decision.
    return result.data;
  } catch {
    return { status: 'unavailable', reason: 'verification_failed', evidence: null };
  }
}
