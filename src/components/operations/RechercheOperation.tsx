"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "cn";
import { Input } from "@/components/ui/input";

/**
 * Ouvrir une opération par n'importe laquelle de ses références (R6.1) :
 * numéro de commande, FLASH-…, LIVE-…, DOS-…, paiement ou remboursement
 * Stripe, numéro de suivi, reçu, facture, identifiant — ou un pseudo.
 */
export function RechercheOperation({ initiale = "", compacte = false }: { initiale?: string; compacte?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState(initiale);

  return (
    <form
      role="search"
      className={cn("relative", compacte ? "w-56 lg:w-72" : "w-full max-w-xl")}
      onSubmit={(e) => {
        e.preventDefault();
        const r = q.trim();
        if (r.length >= 3) router.push(`/operations?q=${encodeURIComponent(r)}`);
      }}
    >
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={compacte ? "Référence, suivi, pseudo…" : "HTH-2026-…, FLASH-…, DOS-…, pi_…, numéro de suivi, pseudo…"}
        aria-label="Ouvrir une opération par sa référence"
        className="pl-8"
        maxLength={120}
      />
    </form>
  );
}
