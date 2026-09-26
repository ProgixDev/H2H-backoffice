"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { cn } from "cn";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { dateCourte } from "@/lib/activite/temps";
import { horodatage } from "@/lib/dates";
import { LIBELLE_SOURCE } from "@/lib/operations/libelles";
import type { Fait, SourceFait } from "@/lib/operations/types";
import { Aucun, Montant } from "../commun";

// Les familles de faits qu'on filtre : ce que l'équipe cherche en premier.
const FAMILLES: { code: string; libelle: string; sources: SourceFait[] }[] = [
  { code: "etats", libelle: "États", sources: ["etat", "offre", "acces", "achat", "annonce"] },
  { code: "remise", libelle: "Remise du colis", sources: ["remise"] },
  { code: "litige", libelle: "Litige et incidents", sources: ["litige", "incident"] },
  { code: "argent", libelle: "Argent et documents", sources: ["paiement", "document"] },
  { code: "notifications", libelle: "Notifications", sources: ["notification"] },
  { code: "equipe", libelle: "Équipe", sources: ["equipe", "dossier"] },
];

/**
 * Tout ce qui est arrivé à l'opération, du plus récent au plus ancien :
 * actions des utilisateurs, notifications, décisions, événements des
 * prestataires (R6.2).
 *
 * 🔴 CE QUE L'ÉQUIPE SEULE A FAIT OU VU EST MARQUÉ « INTERNE » (R6.3) : un
 * dossier, une décision en préparation. Tout le reste, un utilisateur l'a fait
 * ou reçu.
 */
export function ListeFaits({
  faits,
  tronquee,
  maintenant,
  filtres = true,
}: {
  faits: Fait[];
  tronquee: boolean;
  maintenant: number;
  filtres?: boolean;
}) {
  const [famille, setFamille] = useState<string | null>(null);
  const choisie = FAMILLES.find((f) => f.code === famille);
  const visibles = choisie ? faits.filter((x) => choisie.sources.includes(x.source)) : faits;

  return (
    <div className="grid gap-3">
      {filtres && (
        <div className="flex flex-wrap gap-2">
          {FAMILLES.map((f) => {
            const nb = faits.filter((x) => f.sources.includes(x.source)).length;
            if (nb === 0) return null;
            return (
              <button
                key={f.code}
                type="button"
                aria-pressed={famille === f.code}
                onClick={() => setFamille(famille === f.code ? null : f.code)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-legende font-semibold transition-colors",
                  famille === f.code ? "border-h2h-primary bg-h2h-primary-light text-h2h-primary" : "hover:bg-muted",
                )}
              >
                {f.libelle} · {nb}
              </button>
            );
          })}
        </div>
      )}

      {visibles.length === 0 ? (
        <Aucun>Rien d’enregistré ici.</Aucun>
      ) : (
        <ol className="grid">
          {visibles.map((x, i) => (
            <li key={`${x.le}-${i}`} className="grid grid-cols-[5.5rem_1fr] gap-3 border-b py-2.5 last:border-0">
              <time dateTime={x.le} className="pt-0.5 text-legende tabular-nums text-muted-foreground" title={horodatage(x.le)}>
                {dateCourte(x.le, maintenant)}
              </time>
              <div className="grid min-w-0 gap-0.5">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{x.libelle}</span>
                  {x.montant_cents !== null && <Montant cents={x.montant_cents} fort />}
                  {x.interne && (
                    <StatutPastille ton="neutre">
                      <Lock className="size-3" /> Interne
                    </StatutPastille>
                  )}
                </span>
                {x.detail && <span className="break-words text-corps text-muted-foreground">{x.detail}</span>}
                <span className="text-legende text-muted-foreground">
                  {LIBELLE_SOURCE[x.source]}
                  {x.acteur ? ` · ${x.acteur}` : ""}
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}

      {tronquee && (
        <p className="text-legende text-muted-foreground">
          Les 400 faits les plus récents sont affichés ; les plus anciens restent dans les journaux de la base.
        </p>
      )}
    </div>
  );
}
