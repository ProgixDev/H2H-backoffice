"use server";

import { geste } from "@/lib/db/geste";

const CHEMIN = "/utilisateurs";

/**
 * Accorder (le rôle s'active, la personne est prévenue) ou refuser une demande
 * de rôle. Un motif dans les deux sens ; seul celui d'un refus part à la
 * personne — la note d'acceptation reste au journal de l'équipe (R6.3).
 */
export async function trancherDemandeDeRole(p: { demande: string; approuver: boolean; motif: string; cle: string }) {
  return geste<{ demande: string; statut: string }>([CHEMIN], "bo_demande_de_role_trancher", {
    p_id: p.demande,
    p_approuver: p.approuver,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}
