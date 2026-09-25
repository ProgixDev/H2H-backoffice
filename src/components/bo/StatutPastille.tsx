import { cn } from "cn";

export type Ton = "actif" | "succes" | "erreur" | "attention" | "neutre" | "muet" | "marque";

// Les tons de l'application (`CourtageStatusBadge`) : une couleur par sens, la
// même partout. ⚠️ UNE ISSUE DÉFAVORABLE N'EST JAMAIS VERTE.
const COULEUR: Record<Ton, string> = {
  actif: "var(--h2h-warning)",
  attention: "#B45309",
  succes: "var(--h2h-success)",
  erreur: "var(--h2h-error)",
  neutre: "var(--h2h-text-secondary)",
  muet: "var(--h2h-text-muted)",
  marque: "var(--h2h-primary)",
};

/** La pastille d'état : un point, un libellé, le fond teinté de la couleur. */
export function StatutPastille({ ton, children, className }: { ton: Ton; children: React.ReactNode; className?: string }) {
  const c = COULEUR[ton];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-legende font-semibold", className)}
      style={{ color: c, backgroundColor: `color-mix(in srgb, ${c} 10%, transparent)` }}
    >
      <span className="size-[7px] shrink-0 rounded-full" style={{ backgroundColor: c }} aria-hidden />
      {children}
    </span>
  );
}
