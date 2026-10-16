import { BadRequestException } from '@nestjs/common';
export function validate<T>(schema: { safeParse(input: unknown): { success: true; data: T } | { success: false; error: { issues: { path: PropertyKey[]; message: string }[] } } }, payload: unknown): T {
  const result = schema.safeParse(payload);
  if (!result.success) throw new BadRequestException(result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`));
  return result.data;
}
