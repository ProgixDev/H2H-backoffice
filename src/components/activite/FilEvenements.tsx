import { StatutPastille } from "@/components/bo/StatutPastille";
import { dateCourte, ilYA } from "@/lib/activite/temps";
import { LIBELLE_SERVICE, type Evenement } from "@/lib/activite/types";

/**
 * Une suite d'événements, du plus récent au plus ancien — la vue « Derniers
 * événements » du §4, et la chronologie d'une opération.
 *
 * ⚠️ UN MEMBRE DE L'ÉQUIPE S'Y LIT « L'ÉQUIPE HANDTOHAND » : son nom est au
 * journal d'audit, pas dans le fil que tout équipier lit.
 */
export function FilEvenements({
  evenements,
  maintenant,
  avecReference = true,
}: {
  evenements: Evenement[];
  maintenant: number;
  avecReference?: boolean;
}) {
  return (
    <ol className="grid">
      {evenements.map((e) => (
        <li key={e.id} className="grid grid-cols-[auto_1fr] gap-x-3 border-b py-2.5 last:border-0">
          <span className="mt-1.5 size-2 rounded-full bg-h2h-primary" aria-hidden />
          <span className="grid gap-0.5">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-medium">{e.libelle}</span>
              {avecReference && e.ref && (
                <span className="text-legende text-muted-foreground tabular-nums">
                  {e.ref} · {LIBELLE_SERVICE[e.service]}
                </span>
              )}
              {e.est_test && <StatutPastille ton="attention" className="px-1.5 py-0">TEST</StatutPastille>}
            </span>
            <span className="text-legende text-muted-foreground">
              {e.acteur ?? "Compte effacé"} · {dateCourte(e.le, maintenant)} · {ilYA(e.le, maintenant)}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
