"use client";

import { SessionProvider } from "@/components/providers/SessionProvider";
import { QueryClientProvider } from "@/components/providers/QueryClientProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
