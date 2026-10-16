import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type PropsWithChildren } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { UserResponse } from '@op-alpha/contracts';
import * as api from '../lib/api';
import { clearPrivateData, createSessionGuard, expireSession } from '../lib/session-cache';

type Session = {
  user: UserResponse | null; loading: boolean; error: Error | null;
  refresh: () => void;
  expire: (expectedUserId: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};
const Context = createContext<Session | null>(null);
export function SessionProvider({ children }: PropsWithChildren) {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['session'], queryFn: ({ signal }) => api.getSession(signal), retry: false, staleTime: 0, refetchInterval: 60_000 });
  const previousIdentity = useRef<string | null>(null);
  const guard = useMemo(() => createSessionGuard(client), [client]);
  const expire = useCallback(async (expectedUserId: string) => {
    if (client.getQueryData<UserResponse | null>(['session'])?.id !== expectedUserId) return;
    const isCurrent = guard.advance();
    previousIdentity.current = null;
    await expireSession(client, expectedUserId, isCurrent);
  }, [client, guard]);
  useEffect(() => {
    if (!query.isSuccess) return;
    const identity = query.data?.id ?? null;
    if (previousIdentity.current !== identity) {
      guard.advance();
      if (previousIdentity.current !== null) void clearPrivateData(client, previousIdentity.current);
    }
    previousIdentity.current = identity;
  }, [client, guard, query.isSuccess, query.data?.id]);
  return <Context.Provider value={{
    user: query.data ?? null, loading: query.isPending, error: query.error,
    refresh: () => { void query.refetch(); },
    expire,
    signIn: async (email, password) => {
      const isCurrent = guard.advance();
      await api.login(email, password);
      if (!isCurrent()) throw new Error('A sessão mudou. Tente novamente.');
      previousIdentity.current = null;
      await expireSession(client, undefined, isCurrent);
      if (!isCurrent()) throw new Error('A sessão mudou. Tente novamente.');
      const user = await api.getSession();
      if (!isCurrent()) throw new Error('A sessão mudou. Tente novamente.');
      if (!user) throw new Error('Não foi possível manter a sessão. Verifique se os cookies estão habilitados.');
      previousIdentity.current = user.id;
      client.setQueryData(['session'], user);
    },
    signOut: async () => {
      const expectedUserId = client.getQueryData<UserResponse | null>(['session'])?.id;
      const isCurrent = guard.advance();
      await api.logout();
      if (isCurrent()) {
        previousIdentity.current = null;
        await expireSession(client, expectedUserId, isCurrent);
      }
    },
  }}>{children}</Context.Provider>;
}
export function useSession() {
  const session = useContext(Context);
  if (!session) throw new Error('SessionProvider ausente.');
  return session;
}
