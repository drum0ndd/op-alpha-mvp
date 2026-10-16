import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren, useState } from 'react';
import { SessionProvider } from './SessionProvider';
import { LensProvider } from './LensProvider';
export function AppProviders({ children }: PropsWithChildren) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 } } }));
  return <QueryClientProvider client={client}><SessionProvider><LensProvider>{children}</LensProvider></SessionProvider></QueryClientProvider>;
}
