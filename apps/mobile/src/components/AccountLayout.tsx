import { useEffect, type ReactNode } from 'react';
import { Link } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Pressable, Text } from 'react-native';
import type { ProfileResponse } from '@op-alpha/contracts';
import { ApiError, getProfile } from '../lib/api';
import { useSession } from '../providers/SessionProvider';
import { ScreenFrame, ui } from './ScreenFrame';
import { StateMessage } from './StateMessage';

export function AccountLayout({ title, children }: { title: string; children: (profile: ProfileResponse) => ReactNode }) {
  const session = useSession();
  const query = useQuery({
    queryKey: ['profile', session.user?.id], queryFn: ({ signal }) => getProfile(signal),
    enabled: !!session.user && !session.error, retry: false,
  });
  const expired = query.error instanceof ApiError && query.error.status === 401;
  useEffect(() => {
    if (expired && session.user) void session.expire(session.user.id);
  }, [expired, session.expire, session.user?.id]);
  const reload = () => { session.refresh(); if (session.user) void query.refetch(); };
  let content: ReactNode;
  if (session.loading) content = <StateMessage title="Carregando conta" loading/>;
  else if (session.error) content = <StateMessage title="Não foi possível verificar sua sessão" message={session.error.message}
    error actionLabel="Tentar novamente" onAction={session.refresh}/>;
  else if (!session.user || expired) content = <>
    <StateMessage title="Sua coleção em um só lugar" message="Entre na sua conta para consultar suas cartas."/>
    <Link href="/(tabs)/account" asChild><Pressable accessibilityRole="link" style={ui.button}><Text style={ui.buttonText}>Entrar na conta</Text></Pressable></Link>
  </>;
  else if (query.isPending) content = <StateMessage title="Carregando sua coleção" loading/>;
  else if (query.error || !query.data) content = <StateMessage title="Não foi possível carregar sua coleção"
    message={query.error?.message} error actionLabel="Tentar novamente" onAction={reload}/>;
  else content = children(query.data);
  return <ScreenFrame title={title} refreshing={query.isFetching} onRefresh={session.user ? reload : undefined}>{content}</ScreenFrame>;
}
