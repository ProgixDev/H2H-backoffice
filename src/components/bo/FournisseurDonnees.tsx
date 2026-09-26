"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";

/**
 * Les lectures vivantes (TanStack Query) et les filtres dans l'adresse (nuqs).
 *
 * ⚠️ AUCUN CACHE PERSISTÉ : ce qui a été lu vit en mémoire le temps de l'onglet,
 * jamais dans le navigateur au-delà.
 */
export function FournisseurDonnees({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 0, refetchOnWindowFocus: true } } }),
  );
  return (
    <NuqsAdapter>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </NuqsAdapter>
  );
}
