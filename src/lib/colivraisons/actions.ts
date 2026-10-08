"use server";

import { geste } from "@/lib/db/geste";
import { cheminFiche } from "@/lib/operations/types";
import type { DecisionRecours } from "@/lib/utilisateurs/types";

/** Ce que rend l'examen d'une contestation de frais d'annulation tardive (migration 20261008007000). */
export type RecoursFraisExamine = { recours: string; commande: string; decision: DecisionRecours; frais_cents: number };

/**
 * Examiner une contestation de frais d'annulation tardive (CGU H2H Logistic § 5.6.2, § 5.6.5) : la Logistique ou
 * la Direction, identité reconfirmée, jamais un équipier partie à la co-livraison. Acceptée, les frais sont levés
 * — la plateforme l'écrit au grand livre dans la minute, l'examen n'y écrit rien ; rejetée, ils sont maintenus. La
 * réponse part à la personne, dans son application ; le dossier « À traiter » se clôt.
 */
export async function examinerRecoursFrais(p: {
  recours: string;
  /** La référence de l'opération, pour relire sa fiche. */
  operation: string;
  decision: DecisionRecours;
  reponse: string;
  motif: string;
  cle: string;
}) {
  return geste<RecoursFraisExamine>([cheminFiche(p.operation), "/a-traiter"], "bo_recours_frais_examiner", {
    p_recours: p.recours,
    p_decision: p.decision,
    p_reponse: p.reponse,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

/** Ce que rend l'examen d'une contestation de refus du colis (migration 20261008009000). */
export type RefusColisExamine = { refus: string; contestation: string; commande: string; decision: "maintenu" | "injustifie" };

/**
 * Examiner la contestation d'un refus du colis (CGU H2H Logistic § 5.6.3) : la Logistique ou la Direction, identité
 * reconfirmée, jamais un équipier partie à la co-livraison. Acceptée, le refus est dit injustifié ; rejetée, il est
 * maintenu. L'examen n'écrit rien au grand livre : la plateforme annule la co-livraison dans la minute, avec les frais
 * de qui les doit. Le vendeur et le cotransporteur reçoivent la réponse ; le dossier « À traiter » se clôt.
 */
export async function examinerRefusColis(p: {
  contestation: string;
  /** La référence de l'opération, pour relire sa fiche. */
  operation: string;
  decision: DecisionRecours;
  reponse: string;
  motif: string;
  cle: string;
}) {
  return geste<RefusColisExamine>([cheminFiche(p.operation), "/a-traiter"], "bo_refus_colis_examiner", {
    p_contestation: p.contestation,
    // Accepter la contestation, c'est dire le refus injustifié ; la rejeter, le maintenir.
    p_decision: p.decision === "accepte" ? "injustifie" : "maintenu",
    p_reponse: p.reponse,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}
