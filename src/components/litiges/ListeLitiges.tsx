"use client";

import { useState } from "react";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { StatutPastille, type Ton } from "@/components/bo/StatutPastille";
import { Button } from "@/components/ui/button";
import { dateHeure } from "@/lib/dates";
import { useGeste } from "@/lib/db/useGeste";
import { deciderLitige } from "@/lib/litiges/actions";
import { BoutonRembourserLitige } from "@/components/paiements/GestesOrdres";
import { TON_ORDRE } from "@/components/paiements/OrdresFinanciers";
import { LIBELLE_STATUT_ORDRE } from "@/lib/paiements/types";
import {
  euros,
  libelleMotif,
  LIBELLE_DECISION,
  LIBELLE_FAMILLE,
  LIBELLE_PHASE,
  type Litige,
} from "@/lib/litiges/types";
import { DialogueArbitrage } from "./DialogueArbitrage";

// ⚠️ UNE ISSUE DÉFAVORABLE N'EST JAMAIS VERTE : un rejet est neutre, pas un succès.
const TON_PHASE: Record<string, Ton> = {
  open: "actif",
  support_direct: "actif",
  seller_response: "actif",
  amicable: "actif",
  support_review: "actif",
  decided: "marque",
  return_pending: "attention",
  return_in_transit: "attention",
  return_validation: "attention",
  closed: "muet",
  rejected: "neutre",
};

type Props = { litiges: Litige[]; peutDecider: boolean; peutRembourser: boolean };

/**
 * Les dossiers de réclamation, l'arbitrage et la demande du remboursement.
 *
 * ⚠️ LE REMBOURSEMENT SE DEMANDE, IL NE PART PAS D'ICI : c'est un ordre
 * financier, validé au-delà de 100 €, exécuté par `stripe-ordres`. Son dernier
 * ordre dit où il en est ; un ordre en échec se relance depuis Paiements.
 *
 * 🔴 LES BOUTONS NE PROTÈGENT RIEN : chaque geste repasse par la base, qui
 * vérifie la permission, la double authentification, le conflit d'intérêts et
 * l'état du dossier. Ils ne font que ne pas proposer ce qui serait refusé.
 */
export function ListeLitiges({ litiges, peutDecider, peutRembourser }: Props) {
  const [arbitrage, setArbitrage] = useState<Litige | null>(null);
  const decider = useGeste(deciderLitige);

  if (litiges.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <AnimationH2H nom="vault-shield" taille={96} />
        <p className="mt-3 font-semibold">Aucun dossier à arbitrer</p>
        <p className="text-corps text-muted-foreground">Les réclamations des acheteurs apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <>
      <ul className="grid gap-3">
        {litiges.map((l) => {
          // Un ordre vivant — ou une réservation de l'écran mobile — porte déjà le remboursement.
          const enRoute = l.reservation_cents !== null
            || (l.ordre_statut !== null && l.ordre_statut !== "reussi");
          return (
            <li key={l.id} className="rounded-xl border bg-card p-4" style={{ boxShadow: "var(--ombre-carte)" }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="grid min-w-0 flex-1 gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">Commande {l.numero_commande}</span>
                    <StatutPastille ton={TON_PHASE[l.phase] ?? "neutre"}>
                      {LIBELLE_PHASE[l.phase] ?? l.phase}
                    </StatutPastille>
                    {l.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
                  </div>
                  <span className="text-legende text-muted-foreground">
                    {l.acheteur ?? "—"} (acheteur) · {l.vendeur ?? "—"} (vendeur) · ouvert le {dateHeure(l.ouvert_le)}
                  </span>
                  <span className="text-corps">
                    {LIBELLE_FAMILLE[l.famille] ?? l.famille} — {libelleMotif(l.motif)}
                  </span>
                  <p className="line-clamp-3 text-corps text-muted-foreground">« {l.description} »</p>
                  <span className="text-legende text-muted-foreground">
                    Payé {euros(l.total_cents)}
                    {l.decision && ` · décision : ${LIBELLE_DECISION[l.decision]}`}
                    {l.decision_cents !== null && ` (${euros(l.decision_cents)})`}
                    {l.deja_rendu_cents > 0 && ` · déjà rendu ${euros(l.deja_rendu_cents)}`}
                    {` · encore remboursable ${euros(l.restant_cents)}`}
                  </span>
                  {l.reservation_cents !== null && (
                    <span className="text-legende text-h2h-warning">
                      Un remboursement de {euros(l.reservation_cents)} lancé depuis l’application mobile est en
                      cours depuis le {dateHeure(l.reservation_depuis)}.
                    </span>
                  )}
                  {l.ordre_statut && l.ordre_cents !== null && (
                    <span className="flex flex-wrap items-center gap-2 text-legende text-muted-foreground">
                      <StatutPastille ton={TON_ORDRE[l.ordre_statut]}>
                        {l.ordre_ref} · {LIBELLE_STATUT_ORDRE[l.ordre_statut]}
                      </StatutPastille>
                      {euros(l.ordre_cents)} depuis le {dateHeure(l.ordre_depuis)}
                      {l.ordre_statut === "echoue" && " — relancez-le ou annulez-le depuis Paiements et comptabilité"}
                    </span>
                  )}
                  {l.ordre_erreur && l.ordre_statut === "echoue" && (
                    <span className="text-legende text-h2h-error">{l.ordre_erreur}</span>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {peutDecider && l.phase !== "closed" && (
                    <Button variant="outline" onClick={() => setArbitrage(l)}>
                      Arbitrer
                    </Button>
                  )}
                  {peutRembourser && !enRoute && l.a_emettre_cents > 0 && (
                    <BoutonRembourserLitige commande={l.commande_id} litige={l.id} montant={l.a_emettre_cents} />
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <DialogueArbitrage
        litige={arbitrage}
        enCours={decider.enCours}
        surFermeture={() => setArbitrage(null)}
        surConfirmation={async (d) => {
          if (!arbitrage) return;
          const r = await decider.lancer(
            { dossier: arbitrage.id, phaseAttendue: arbitrage.phase, ...d },
            "Décision enregistrée.",
          );
          if (r?.ok) setArbitrage(null);
        }}
      />

    </>
  );
}
