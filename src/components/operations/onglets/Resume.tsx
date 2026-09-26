import Link from "next/link";
import { Echeance } from "@/components/activite/Echeance";
import { StatutPastille, type Ton } from "@/components/bo/StatutPastille";
import { TON_CATEGORIE, TON_PRIORITE } from "@/components/dossiers/tons";
import { ilYA } from "@/lib/activite/temps";
import { LIBELLE_SERVICE, LIBELLE_TYPE, type Echeance as EcheanceEnCours } from "@/lib/activite/types";
import { CATEGORIE_COURTE, LIBELLE_EQUIPE, LIBELLE_PRIORITE } from "@/lib/dossiers/types";
import type { Fiche } from "@/lib/operations/types";
import { ActionsTicket } from "../ActionsTicket";
import { Aucun, Bloc, Champs, Montant, Quand } from "../commun";

const STATUT_ECHEANCE: Record<EcheanceEnCours["statut"], { ton: Ton; libelle: string }> = {
  non_executee: { ton: "erreur", libelle: "Non exécutée" },
  echue: { ton: "actif", libelle: "Échue" },
  a_venir: { ton: "neutre", libelle: "À venir" },
};

const GENRE_ECHEANCE: Record<EcheanceEnCours["genre"], string> = {
  utilisateur: "Délai laissé à un utilisateur",
  interne: "Cible de traitement interne",
  prestataire: "Délai d’un prestataire",
};

/** Résumé : l'opération en un coup d'œil, ses échéances, les dossiers de l'équipe. */
export function OngletResume({ f, maintenant }: { f: Fiche; maintenant: number }) {
  const o = f.operation;
  const achat = o.objet_table === "orders";
  const dossierOuvert = f.dossiers.some((d) => d.statut === "ouvert");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Bloc titre="L’opération">
        <Champs
          colonnes={2}
          items={[
            ["Référence", <span key="r" className="font-semibold tabular-nums">{o.ref}</span>],
            ["Service", LIBELLE_SERVICE[o.service]],
            ["Nature", LIBELLE_TYPE[o.type] ?? o.type],
            ["Bien", o.bien_titre],
            ["Montant", <Montant key="m" cents={o.montant_cents} fort />],
            ["Situation financière", o.finance_libelle],
            ["Localisation utile", o.localisation],
            ["Ouverte le", <Quand key="c" iso={f.cree_le} maintenant={maintenant} />],
            ["Dernier événement", `${o.dernier_evenement} · ${ilYA(o.dernier_evenement_le, maintenant)}`],
            ["Terminée le", o.termine_le ? <Quand key="t" iso={o.termine_le} maintenant={maintenant} /> : null],
          ]}
        />
        {!achat && (
          <p className="text-legende text-muted-foreground">
            Paiements, livraison, documents et litiges se suivent dans la fiche de chaque achat né de cette{" "}
            {o.objet_table === "live_sessions" ? "vente en direct" : "offre"} (onglet « Bien et accord »).
          </p>
        )}
      </Bloc>

      <Bloc titre="Échéances en cours">
        {f.echeances.length === 0 ? (
          <Aucun>Aucune échéance en cours pour cette opération.</Aucun>
        ) : (
          <ul className="grid gap-2">
            {f.echeances.map((e) => (
              <li key={`${e.regle}:${e.fin}`} className="grid gap-1 rounded-lg border p-3 sm:grid-cols-[1fr_auto]">
                <span className="grid gap-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{e.regle_libelle}</span>
                    <StatutPastille ton={STATUT_ECHEANCE[e.statut].ton}>{STATUT_ECHEANCE[e.statut].libelle}</StatutPastille>
                  </span>
                  <span className="text-legende text-muted-foreground">
                    {GENRE_ECHEANCE[e.genre]}
                    {e.executeur ? ` · exécutée par ${e.executeur}` : " · personne n’agit à l’heure dite"}
                  </span>
                </span>
                <Echeance iso={e.fin} maintenant={maintenant} />
              </li>
            ))}
          </ul>
        )}
      </Bloc>

      <Bloc titre="Dossiers de l’équipe" className="lg:col-span-2">
        {f.dossiers.length === 0 ? (
          <Aucun>Aucun dossier n’a été ouvert sur cette opération.</Aucun>
        ) : (
          <ul className="grid gap-2">
            {f.dossiers.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border p-3">
                <Link href={`/a-traiter?dossier=${d.id}`} className="font-semibold tabular-nums text-h2h-primary">
                  {d.ref}
                </Link>
                <StatutPastille ton={d.statut === "clos" ? "muet" : (TON_CATEGORIE[d.categorie] ?? "neutre")}>
                  {d.statut === "clos" ? "Clos" : (CATEGORIE_COURTE[d.categorie] ?? d.categorie)}
                </StatutPastille>
                <StatutPastille ton={TON_PRIORITE[d.priorite]}>{LIBELLE_PRIORITE[d.priorite]}</StatutPastille>
                <span className="min-w-0 flex-1 text-corps">{d.titre}</span>
                <span className="text-legende text-muted-foreground">
                  {LIBELLE_EQUIPE[d.equipe] ?? d.equipe} · {d.responsable ?? "sans responsable"} · ouvert{" "}
                  {ilYA(d.cree_le, maintenant)}
                  {d.clos_le ? ` · clos ${ilYA(d.clos_le, maintenant)}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
        {f.droits.traiter && !dossierOuvert && <ActionsTicket o={o} />}
      </Bloc>
    </div>
  );
}
