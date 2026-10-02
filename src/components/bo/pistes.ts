// L'état d'une piste, à l'écran : les transactions (§10) et les offres Flash (§13)
// suivent leurs pistes dans le même vocabulaire, et les dessinent pareil.
import type { Ton } from "@/components/bo/StatutPastille";
import type { EtatPiste } from "@/lib/transactions/types";

// ⚠️ UNE ISSUE DÉFAVORABLE N'EST JAMAIS VERTE : bloqué est ambre, en échec rouge.
export const TON_PISTE: Record<EtatPiste, Ton> = {
  fait: "succes",
  en_cours: "marque",
  a_venir: "neutre",
  bloque: "attention",
  echoue: "erreur",
  annule: "muet",
  sans_objet: "muet",
};

/** Le point d'une piste, par état. */
export const POINT_PISTE: Record<EtatPiste, string> = {
  fait: "bg-[var(--h2h-success)] border-[var(--h2h-success)]",
  en_cours: "bg-[var(--h2h-primary)] border-[var(--h2h-primary)]",
  a_venir: "border-[var(--h2h-text-muted)]",
  bloque: "bg-[#B45309] border-[#B45309]",
  echoue: "bg-[var(--h2h-error)] border-[var(--h2h-error)]",
  annule: "bg-[var(--h2h-text-muted)] border-[var(--h2h-text-muted)] opacity-60",
  sans_objet: "border-dashed border-[var(--h2h-text-muted)] opacity-50",
};
