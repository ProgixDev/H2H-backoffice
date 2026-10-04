// Le remboursement d'une option de visibilité, tel que le bureau le lit
// (`bo_option_remboursement_lire`, migration 20261004003000).
//
// 🔴 LA BASE CALCULE TOUT : ce qui a été payé, rendu, ce qui peut encore partir,
// le minimum qu'impose une rétractation, la suggestion au prorata. L'écran ne
// fait que le montrer, et la base refuse ce qui sort de ces bornes.

import type { StatutOrdre } from "@/lib/paiements/types";

export type FamilleOption = "annonce" | "demande";

export type OrdreOption = {
  id: string;
  /** OF-000042. */
  ref: string;
  statut: StatutOrdre;
  montant_cents: number;
  /** Le motif INTERNE de l'équipe — jamais montré à l'acheteur. */
  motif: string;
  demande_par: string | null;
  cree_le: string;
  termine_le: string | null;
  erreur: string | null;
  stripe: string | null;
  /** HTH-A-… : l'avoir émis à la réussite. */
  avoir: string | null;
};

export type AvoirOption = {
  numero: string;
  /** La facture que l'avoir corrige. */
  facture: string;
  montant_cents: number;
  emis_le: string;
  /** Ce que l'acheteur lit sur l'avoir. */
  raison: string;
};

export type PartExecutee = {
  part: number;
  methode: "remontees" | "duree" | "pas_commencee";
  faites?: number;
  prevues?: number;
  ecoule_secondes?: number;
  duree_secondes?: number;
};

export type RemboursementOption = {
  famille: FamilleOption;
  boost: string;
  option: {
    option: string;
    prix_cents: number;
    /** L'annonce ou la demande. */
    cible: string;
    titre: string | null;
    etat: "reservee" | "en_cours" | "en_pause" | "terminee";
    active_depuis: string | null;
    expires_at: string | null;
    termine_le: string | null;
    fin_motif: string | null;
  };
  paiement: { montant_cents: number | null; statut: string | null; reel: boolean | null; intention: string | null };
  facture: { numero: string; total_cents: number; emise_le: string } | null;
  retractation: {
    ref: string;
    demandee_le: string;
    execute_cents: number;
    a_rembourser_cents: number;
    deja_rembourse_cents: number;
    rembourser_avant: string;
    /** Ce qui reste à rendre : le dû, moins les remboursements réussis. */
    reste_cents: number;
  } | null;
  part: PartExecutee;
  rembourse_cents: number;
  /** Ce qui peut encore partir : le payé, moins le rendu, moins ce qui est en route. */
  disponible_cents: number;
  /** Ce qu'une rétractation impose de rendre ; zéro sans rétractation. */
  minimum_cents: number;
  suggestion_cents: number;
  ordres: OrdreOption[];
  avoirs: AvoirOption[];
  possible: boolean;
  raison: string | null;
  est_test: boolean;
};

export const LIBELLE_OPTION: Record<string, string> = {
  bump: "Remontée immédiate",
  daily7: "Chaque jour pendant 7 jours",
  daily14: "Chaque jour pendant 14 jours",
  daily30: "Chaque jour pendant 30 jours",
  urgent: "Badge Urgent",
  courtage: "Boost d’une Offre Flash",
};

export const LIBELLE_ETAT_OPTION: Record<RemboursementOption["option"]["etat"], string> = {
  reservee: "Réservée, pas payée",
  en_cours: "En cours",
  en_pause: "En pause — l’annonce n’est pas visible",
  terminee: "Terminée",
};

const JOURS = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

/** Ce que la part exécutée veut dire, en mots. */
export function partEnMots(p: PartExecutee): string {
  if (p.methode === "pas_commencee") return "Pas encore commencée";
  if (p.methode === "remontees") return `${p.faites ?? 0} remontée(s) faite(s) sur ${p.prevues ?? 0}`;
  const jours = (s: number | undefined) => JOURS.format(Number(s ?? 0) / 86_400);
  return `${jours(p.ecoule_secondes)} j d’affichage sur ${jours(p.duree_secondes)} j, pauses déduites`;
}
