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
