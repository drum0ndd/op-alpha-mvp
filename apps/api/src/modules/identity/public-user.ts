import { UserResponseSchema } from '@op-alpha/contracts';

export const publicUserSelect = { id: true, name: true, email: true, createdAt: true } as const;

type PublicUserRow = { id: string; name: string; email: string; createdAt: Date };

export function publicUser(row: PublicUserRow) {
  return UserResponseSchema.parse({
    id: row.id, name: row.name, email: row.email, createdAt: row.createdAt.toISOString(),
  });
}
