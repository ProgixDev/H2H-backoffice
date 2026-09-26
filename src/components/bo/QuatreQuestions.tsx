import { cn } from "cn";
import { Echeance } from "@/components/activite/Echeance";
import { tonEtape, TON_ALERTE } from "@/components/activite/commun";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { LIBELLE_ACTEUR, type Operation } from "@/lib/activite/types";

const ROLE = { acheteur: "Acheteur", vendeur: "Vendeur", cotransporteur: "Cotransporteur particulier" } as const;

type Participant = {
  role: keyof typeof ROLE;
  pseudo: string | null;
  est_test?: boolean;
  compte_efface?: boolean;
};

function Question({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="grid content-start gap-1 rounded-xl border bg-card p-3">
      <h3 className="text-legende font-semibold text-muted-foreground">{titre}</h3>
      <div className="text-corps">{children}</div>
    </section>
  );
}

/**
 * Les quatre questions auxquelles chaque écran répond (§1, R1.7) : que se
 * passe-t-il, qui est concerné, quelle action est attendue, avant quelle
 * échéance. Le panneau d'Activité en direct et la fiche complète les posent
 * dans le même ordre, avec les mêmes mots.
 */
export function QuatreQuestions({
  operation: o,
  participants,
  maintenant,
  grille = false,
}: {
  operation: Operation;
  participants: Participant[];
  maintenant: number;
  /** Quatre colonnes sur un grand écran (la fiche), une pile sinon (le panneau). */
  grille?: boolean;
}) {
  return (
    <div className={cn("grid gap-3", grille && "sm:grid-cols-2 xl:grid-cols-4")}>
      <Question titre="Que se passe-t-il ?">
        <span className="flex flex-wrap items-center gap-2">
          <StatutPastille ton={tonEtape(o)}>{o.etape_libelle}</StatutPastille>
          {o.alerte && <StatutPastille ton={TON_ALERTE[o.alerte]}>{o.alerte_libelle}</StatutPastille>}
        </span>
        <p className="mt-1 text-muted-foreground">
          {o.finance_libelle}
          {o.localisation ? ` · ${o.localisation}` : ""}
        </p>
      </Question>
      <Question titre="Qui est concerné ?">
        {participants.length === 0 ? (
          <span className="text-muted-foreground">Personne : c’est un travail de la plateforme.</span>
        ) : (
          <ul className="grid gap-0.5">
            {participants.map((p, i) => (
              <li key={`${p.role}-${i}`} className="flex flex-wrap items-center gap-1.5">
                <span className="text-muted-foreground">{ROLE[p.role]} :</span>
                <span>{p.compte_efface ? "(compte effacé)" : (p.pseudo ?? "(compte effacé)")}</span>
                {p.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
              </li>
            ))}
          </ul>
        )}
      </Question>
      <Question titre="Quelle action est attendue ?">
        {o.action_attendue ?? "Aucune : l’opération est terminée."}
        {o.acteur_attendu && <p className="text-muted-foreground">{LIBELLE_ACTEUR[o.acteur_attendu]}</p>}
      </Question>
      <Question titre="Avant quelle échéance ?">
        <Echeance iso={o.echeance} maintenant={maintenant} />
      </Question>
    </div>
  );
}
