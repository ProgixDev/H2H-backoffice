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
  LIBELLE_CANAL,
  LIBELLE_DECISION,
  LIBELLE_FAMILLE,
  LIBELLE_ISSUE,
  LIBELLE_PARTIE,
  LIBELLE_PHASE,
  LIBELLE_STATUT_RECOURS,
  type CompteMotif,
  type Litige,
  type StatutRecours,
} from "@/lib/litiges/types";
import { DialogueArbitrage } from "./DialogueArbitrage";
import {
  BoutonConclureEnquete,
  BoutonEnquete,
  BoutonExaminerRecours,
  BoutonRecours,
  BoutonRequalifier,
} from "./GestesDossier";

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

const TON_RECOURS: Record<StatutRecours, Ton> = {
  a_examiner: "actif",
  recevable: "marque",
  irrecevable: "neutre",
  tranche: "muet",
};

type Props = {
  litiges: Litige[];
  /** Les onze motifs (et « à qualifier ») : ce que « Requalifier » propose. */
  motifs: CompteMotif[];
  peutDecider: boolean;
  peutInstruire: boolean;
  peutRembourser: boolean;
  /** Un motif est choisi : la liste vide le dit autrement. */
  filtree: boolean;
};

/**
 * Les dossiers de réclamation (§15) : leur motif, l'arbitrage et la décision
 * suivante, le recours, l'enquête transporteur, la demande du remboursement.
 *
 * ⚠️ UNE DÉCISION RENDUE NE SE REVOIT QU'APRÈS UN RECOURS RECEVABLE, examiné par
 * une autre personne que son auteur. Le remboursement se demande, il ne part
 * pas d'ici : c'est un ordre financier, exécuté par `stripe-ordres`.
 *
 * 🔴 LES BOUTONS NE PROTÈGENT RIEN : chaque geste repasse par la base, qui
 * vérifie la permission, la double authentification, le conflit d'intérêts et
 * l'état du dossier. Ils ne font que ne pas proposer ce qui serait refusé.
 */
export function ListeLitiges({ litiges, motifs, peutDecider, peutInstruire, peutRembourser, filtree }: Props) {
  const [arbitrage, setArbitrage] = useState<Litige | null>(null);
  const decider = useGeste(deciderLitige);

  if (litiges.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <AnimationH2H nom="vault-shield" taille={96} />
        <p className="mt-3 font-semibold">{filtree ? "Aucune réclamation sous ce motif" : "Aucun dossier à arbitrer"}</p>
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
          const recoursOuvert = l.recours_statut === "a_examiner" || l.recours_statut === "recevable";
          const clos = l.phase === "closed" || l.phase === "rejected";
          const peutArbitrer = peutDecider && !clos && (l.decision === null || l.recours_statut === "recevable");
          return (
            <li key={l.id} className="rounded-xl border bg-card p-4" style={{ boxShadow: "var(--ombre-carte)" }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="grid min-w-0 flex-1 gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">Commande {l.numero_commande}</span>
                    <StatutPastille ton={TON_PHASE[l.phase] ?? "neutre"}>
                      {LIBELLE_PHASE[l.phase] ?? l.phase}
                    </StatutPastille>
                    <StatutPastille ton={l.motif_litige ? "neutre" : "attention"}>
                      {l.motif_litige_libelle ?? "À qualifier"}
                    </StatutPastille>
                    {l.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
                  </div>
                  <span className="text-legende text-muted-foreground">
                    {l.acheteur ?? "—"} (acheteur) · {l.vendeur ?? "—"} (vendeur) · ouvert le {dateHeure(l.ouvert_le)}
                    {l.motif_qualifie && " · motif qualifié par l’équipe"}
                  </span>
                  <span className="text-corps">
                    {LIBELLE_FAMILLE[l.famille] ?? l.famille} — {libelleMotif(l.motif)}
                  </span>
                  <p className="line-clamp-3 text-corps text-muted-foreground">« {l.description} »</p>
                  <span className="text-legende text-muted-foreground">
                    Payé {euros(l.total_cents)}
                    {l.decision && ` · décision : ${LIBELLE_DECISION[l.decision]}`}
                    {l.decision_cents !== null && ` (${euros(l.decision_cents)})`}
                    {l.decisions > 1 && ` · ${l.decisions} décisions au dossier`}
                    {l.deja_rendu_cents > 0 && ` · déjà rendu ${euros(l.deja_rendu_cents)}`}
                    {` · encore remboursable ${euros(l.restant_cents)}`}
                  </span>
                  {l.recours_id && l.recours_statut && (
                    <span className="flex flex-wrap items-center gap-2 text-legende text-muted-foreground">
                      <StatutPastille ton={TON_RECOURS[l.recours_statut]}>
                        {LIBELLE_STATUT_RECOURS[l.recours_statut]}
                      </StatutPastille>
                      {l.recours_partie ? LIBELLE_PARTIE[l.recours_partie] : "Une partie"} conteste la décision n°
                      {l.recours_decision_rang}
                      {l.recours_canal ? ` · reçu par ${LIBELLE_CANAL[l.recours_canal].toLowerCase()}` : ""} le{" "}
                      {dateHeure(l.recours_recu_le)}
                    </span>
                  )}
                  {l.recours_texte && recoursOuvert && (
                    <p className="line-clamp-3 border-l-2 pl-3 text-corps text-muted-foreground">« {l.recours_texte} »</p>
                  )}
                  {peutDecider && l.recours_statut === "a_examiner" && !l.recours_examinable && (
                    <span className="text-legende text-muted-foreground">
                      Vous avez rendu la décision contestée : une autre personne examine ce recours.
                    </span>
                  )}
                  {l.enquete_id && l.enquete_statut && (
                    <span className="flex flex-wrap items-center gap-2 text-legende text-muted-foreground">
                      <StatutPastille ton={l.enquete_statut === "ouverte" ? "actif" : "muet"}>
                        {l.enquete_statut === "ouverte"
                          ? "Enquête transporteur ouverte"
                          : `Enquête conclue : ${l.enquete_issue ? LIBELLE_ISSUE[l.enquete_issue] : "—"}`}
                      </StatutPastille>
                      {l.transporteur ?? "Transporteur"} · réf. {l.enquete_reference}
                      {l.enquete_statut === "ouverte" && l.enquete_echeance
                        ? ` · réponse attendue le ${dateHeure(l.enquete_echeance)}`
                        : ""}
                    </span>
                  )}
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
                <div className="flex max-w-xs shrink-0 flex-wrap justify-end gap-2">
                  {peutArbitrer && (
                    <Button variant="outline" onClick={() => setArbitrage(l)}>
                      {l.decision === null ? "Arbitrer" : "Décision suivante"}
                    </Button>
                  )}
                  {peutDecider && l.recours_statut === "a_examiner" && l.recours_examinable && l.recours_id && (
                    <BoutonExaminerRecours recours={l.recours_id} rang={l.recours_decision_rang ?? l.decisions} />
                  )}
                  {peutRembourser && !enRoute && l.a_emettre_cents > 0 && (
                    <BoutonRembourserLitige commande={l.commande_id} litige={l.id} montant={l.a_emettre_cents} />
                  )}
                  {peutInstruire && l.decision !== null && !recoursOuvert && (
                    <BoutonRecours dossier={l.id} rang={l.decisions} />
                  )}
                  {peutInstruire && l.transporteur && !clos && l.enquete_statut !== "ouverte" && (
                    <BoutonEnquete dossier={l.id} transporteur={l.transporteur} />
                  )}
                  {peutInstruire && l.enquete_statut === "ouverte" && l.enquete_id && (
                    <BoutonConclureEnquete enquete={l.enquete_id} reference={l.enquete_reference ?? ""} />
                  )}
                  {peutInstruire && (
                    <BoutonRequalifier genre="reclamation" objet={l.id} motifs={motifs} actuel={l.motif_litige} />
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
