import type { QueryClient } from '@tanstack/react-query';

export function createSessionGuard(client: QueryClient) {
  let generation = 0;
  const capture = (expectedUserId?: string) => {
    const captured = generation;
    return () => captured === generation && (expectedUserId === undefined
      || client.getQueryData<{ id: string } | null>(['session'])?.id === expectedUserId);
  };
  return { capture, advance: () => { generation++; return capture(); } };
}

export async function clearPrivateData(client: QueryClient, userId?: string) {
  const filters = { queryKey: userId === undefined ? ['profile'] : ['profile', userId] };
  const previousQueries = new Set(client.getQueryCache().findAll(filters));
  await client.cancelQueries(filters);
  // Queries created by a newer login during cancellation belong to that new session.
  client.removeQueries({ predicate: query => previousQueries.has(query) });
}

export async function expireSession(client: QueryClient, expectedUserId?: string, isCurrent: () => boolean = () => true) {
  const matchesIdentity = () => expectedUserId === undefined
    || client.getQueryData<{ id: string } | null>(['session'])?.id === expectedUserId;
  if (!isCurrent() || !matchesIdentity()) return;
  await client.cancelQueries({ queryKey: ['session'] });
  if (!isCurrent() || !matchesIdentity()) return;
  client.setQueryData(['session'], null);
  await clearPrivateData(client, expectedUserId);
}
