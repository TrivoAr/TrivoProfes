"use client";

import { QueryClient, QueryClientProvider as TanstackQueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryClientProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutos - datos considerados frescos
            gcTime: 10 * 60 * 1000, // 10 minutos - tiempo en caché (antes era cacheTime)
            refetchOnWindowFocus: false, // No refetch al volver a la pestaña
            refetchOnReconnect: false, // No refetch al reconectar
            retry: 1, // Solo 1 reintento en caso de error
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: 0, // No reintentar mutaciones automáticamente
          },
        },
      })
  );

  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
    </TanstackQueryClientProvider>
  );
}
