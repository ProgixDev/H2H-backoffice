"use server";

import { geste } from "@/lib/db/geste";

const CHEMIN = "/h2h-logistic";

/**
 * Valider une épingle ET écrire le sous-texte — c'est le même geste. La base
 * refuse un détail vide, trop court, ou qui porte encore « à compléter ».
 */
export async function validerHub(p: { hub: string; detail: string; repere: string | null; cle: string }) {
  return geste<{ hub: string; statut: string }>("bo_hub_valider", {
    p_hub_id: p.hub,
    p_detail_affiche: p.detail,
    p_landmark: p.repere,
    p_cle: p.cle,
  }, [CHEMIN]);
}

/** Retirer un point en service, ou écarter une épingle en attente — avec son motif, désormais gardé. */
export async function retirerHub(p: { hub: string; motif: string; cle: string }) {
  return geste<{ hub: string; statut: string }>("bo_hub_retirer", {
    p_hub_id: p.hub,
    p_motif: p.motif,
    p_cle: p.cle,
  }, [CHEMIN]);
}

/**
 * Accepter (le point relais naît) ou refuser une candidature — un motif dans les
 * deux sens ; seul celui d'un refus part au candidat, l'autre reste au journal.
 */
export async function trancherCandidature(p: { candidature: string; approuver: boolean; motif: string; cle: string }) {
  return geste<{ candidature: string; statut: string; point_relais: string | null }>("bo_candidature_relais_trancher", {
    p_id: p.candidature,
    p_approuver: p.approuver,
    p_motif: p.motif,
    p_cle: p.cle,
  }, [CHEMIN]);
}
