"use client";

import Link from "next/link";
import { cn } from "cn";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { StatutPastille, type Ton } from "@/components/bo/StatutPastille";
import { dateHeure } from "@/lib/dates";
import { cheminFiche } from "@/lib/operations/types";
import {
  LIBELLE_STATUT_ORDRE,
  STATUTS_ORDRE,
  euros,
  type OrdreFinancier,
  type StatutOrdre,
} from "@/lib/paiements/types";
import { BoutonAnnulerOrdre, BoutonRelancer, BoutonsValidation } from "./GestesOrdres";

// ⚠️ UNE ISSUE DÉFAVORABLE N'EST JAMAIS VERTE : échoué est rouge, annulé éteint.
export const TON_ORDRE: Record<StatutOrdre, Ton> = {
  en_validation: "actif",
  demande: "marque",
  en_cours: "marque",
  reussi: "succes",
  echoue: "erreur",
  annule: "muet",
};

/**
 * Les ordres financiers (§16) : chaque remboursement, du moment où il est
 * demandé jusqu'à son issue chez Stripe — demandé, en cours, réussi, échoué
 * (§16.5). Ce qui attend l'équipe vient d'abord.
 *
 * 🔴 AUCUN ARGENT NE PART D'ICI : valider, relancer ou annuler repasse par la
 * base, et c'est l'exécuteur qui parle à Stripe.
 */
export function OrdresFinanciers({
  ordres,
  filtre,
  peutPreparer,
}: {
  ordres: OrdreFinancier[];
  filtre: StatutOrdre | null;
  /** `remboursements.preparer` : relancer, annuler. */
  peutPreparer: boolean;
}) {
  const lien = (f: StatutOrdre | null) => `/paiements-et-comptabilite?onglet=remboursements${f ? `&statut=${f}` : ""}`;

  return (
    <div className="grid gap-4">
      <nav className="flex flex-wrap gap-2" aria-label="Filtrer les ordres">
        {[null, ...STATUTS_ORDRE].map((f) => (
          <Link
            key={f ?? "tous"}
            href={lien(f)}
            className={cn(
              "rounded-full border px-3 py-1 text-legende font-medium transition-colors",
              f === filtre
                ? "border-h2h-primary bg-h2h-primary/10 text-h2h-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f ? LIBELLE_STATUT_ORDRE[f] : "Tous"}
          </Link>
        ))}
      </nav>

      {ordres.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <AnimationH2H nom="coin" taille={96} />
          <p className="mt-3 font-semibold">
            {filtre ? `Aucun ordre « ${LIBELLE_STATUT_ORDRE[filtre].toLowerCase()} »` : "Aucun remboursement demandé"}
          </p>
          <p className="text-corps text-muted-foreground">
            Un remboursement se demande depuis un litige, ou depuis la fiche d’un achat.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3">
          {ordres.map((o) => (
            <li key={o.id} className="rounded-xl border bg-card p-4" style={{ boxShadow: "var(--ombre-carte)" }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="grid min-w-0 flex-1 gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold tabular-nums">{o.ordre_ref}</span>
                    <StatutPastille ton={TON_ORDRE[o.statut]}>{LIBELLE_STATUT_ORDRE[o.statut]}</StatutPastille>
                    <span className="font-semibold tabular-nums">{euros(o.montant_cents)}</span>
                    <StatutPastille ton="neutre">{o.litige ? "Litige" : "Hors litige"}</StatutPastille>
                    {o.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
                  </div>
                  <span className="text-corps">
                    Remboursement de la commande{" "}
                    <Link href={cheminFiche(o.reference, "paiements")} className="font-medium hover:underline">
                      {o.reference}
                    </Link>
                  </span>
                  <span className="text-legende text-muted-foreground">
                    Demandé par {o.demande_par ?? "—"} le {dateHeure(o.cree_le)} · « {o.motif} »
                  </span>
                  {o.statut === "en_validation" && o.validation_expire_le && (
                    <span className="text-legende text-muted-foreground">
                      Attend une seconde personne (Finance ou Direction) jusqu’au {dateHeure(o.validation_expire_le)}.
                    </span>
                  )}
                  {o.tentatives > 0 && (
                    <span className="text-legende text-muted-foreground">
                      {o.tentatives} tentative{o.tentatives > 1 ? "s" : ""} chez Stripe
                      {o.stripe ? ` · ${o.stripe}` : ""}
                      {o.termine_le ? ` · terminé le ${dateHeure(o.termine_le)}` : ""}
                    </span>
                  )}
                  {o.erreur && <span className="text-legende text-h2h-error">{o.erreur}</span>}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {o.statut === "en_validation" && o.validation_id && o.peut_decider && (
                    <BoutonsValidation validation={o.validation_id} />
                  )}
                  {peutPreparer && o.statut === "echoue" && <BoutonRelancer ordre={o.id} />}
                  {peutPreparer && ["en_validation", "demande", "echoue"].includes(o.statut) && (
                    <BoutonAnnulerOrdre ordre={o.id} />
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
