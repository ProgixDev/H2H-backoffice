import { StatutPastille } from "@/components/bo/StatutPastille";
import { LIBELLE_STATUT_RECOURS } from "@/lib/utilisateurs/types";
import type { AnnulationTardive } from "@/lib/operations/types";
import { Montant, Quand } from "../commun";

const QUI_ANNULE = { acheteur: "l’acheteur", vendeur: "le vendeur", cotransporteur: "le cotransporteur" } as const;

/**
 * Une co-livraison annulée à moins d'une heure de la collecte (CGU H2H Logistic § 5.5.2, § 5.6.2) : qui, quand,
 * les frais, d'où ils viennent, vers qui ils vont — tels que la base les a écrits.
 */
export function AnnulationTardiveBloc({ a, maintenant }: { a: AnnulationTardive; maintenant: number }) {
  const lignes: [string, number][] = [];
  if (a.mise_en_relation_cents > 0) lignes.push(["dont frais de mise en relation, qui restent dus", a.mise_en_relation_cents]);
  if (a.retenu_cents > 0) {
    lignes.push([a.role === "acheteur" ? "Retenus sur son remboursement" : "Retenus sur sa part des frais", a.retenu_cents]);
  }
  if (a.du_cents > 0) {
    lignes.push([a.role === "cotransporteur" ? "Dus, retenus sur ses prochaines participations"
      : "Dus, retenus sur ses prochains virements", a.du_cents]);
  }
  if (a.compensation_vendeur_cents > 0) lignes.push(["Compensation du vendeur", a.compensation_vendeur_cents]);
  if (a.compensation_cotransporteur_cents > 0) lignes.push(["Compensation du cotransporteur", a.compensation_cotransporteur_cents]);
  lignes.push([a.plateforme_cents < 0 ? "Avancé par HandtoHand" : "Gardé par HandtoHand", Math.abs(a.plateforme_cents)]);
  return (
    <div className="grid gap-2 rounded-lg border p-3">
      <span className="flex flex-wrap items-center gap-2">
        {a.cause === "refus_colis" ? (
          <>
            {/* Un refus du colis (20261008009000) : ses frais à qui les doit, le vendeur ou le cotransporteur. */}
            <StatutPastille ton="attention">Refus du colis</StatutPastille>
            <span>
              Co-livraison annulée <Quand iso={a.annulee_le} maintenant={maintenant} /> : le colis a été refusé à la
              collecte — frais à la charge {a.role === "vendeur" ? "du vendeur (refus maintenu)" : "du cotransporteur (refus non retenu)"}
              {a.par ? ` (${a.par})` : ""}
            </span>
          </>
        ) : (
          <>
            <StatutPastille ton="attention">Annulation tardive</StatutPastille>
            <span>
              Annulée par {QUI_ANNULE[a.role]}{a.par ? ` (${a.par})` : ""} <Quand iso={a.annulee_le} maintenant={maintenant} />,
              moins d’une heure avant la collecte <Quand iso={a.collecte_le} maintenant={maintenant} />
            </span>
          </>
        )}
      </span>
      <span className="font-semibold">Frais : <Montant cents={a.frais_cents} fort /></span>
      {/* Sa contestation (20261008007000) : elle s'examine dans l'onglet Livraison ; ici, son état. */}
      {a.recours ? (
        <span className="text-legende text-muted-foreground">
          Contestation {a.recours.reference} : {LIBELLE_STATUT_RECOURS[a.recours.statut].toLowerCase()}
          {a.recours.statut === "accepte" ? (a.levee_ecrite ? " — frais levés au grand livre" : " — levée en cours d’écriture") : ""}
        </span>
      ) : a.contestable_jusqu_au ? (
        <span className="text-legende text-muted-foreground">
          Contestable jusqu’au <Quand iso={a.contestable_jusqu_au} maintenant={maintenant} />
        </span>
      ) : null}
      <ul className="grid gap-1 text-legende text-muted-foreground">
        {lignes.map(([libelle, cents]) => (
          <li key={libelle} className="flex justify-between gap-4">
            <span>{libelle}</span>
            <Montant cents={cents} />
          </li>
        ))}
      </ul>
    </div>
  );
}
