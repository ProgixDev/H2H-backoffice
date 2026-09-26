"use server";

import { geste } from "@/lib/db/geste";

const CHEMIN = "/paiements-et-comptabilite";

/**
 * Enregistrer le règlement d'une facture transporteur.
 *
 * ⚠️ LE TOTAL EST UN CONTRÔLE, PAS UN MONTANT : la base relit ce que chaque
 * commande doit, et refuse (`BO_ETAT_CHANGE`) si ce n'est plus le total que
 * l'écran a montré. Ce qui s'écrit au grand livre est toujours ce qu'elle calcule.
 */
export async function reglerFactureTransporteur(p: {
  transporteur: string;
  reference: string;
  commandes: string[];
  total: number;
  cle: string;
}) {
  return geste<{ reglement: string; total_cents: number; commandes: number }>([CHEMIN], "bo_transporteur_regler", {
    p_transporteur: p.transporteur,
    p_reference: p.reference,
    p_commandes: p.commandes,
    p_total_attendu_cents: p.total,
    p_cle: p.cle,
  });
}

// Une retenue change la liste des fonds, l'Activité en direct (situation
// « versement bloqué », étape « Fonds retenus ») et la file « À traiter ».
const CHEMINS_FONDS = [CHEMIN, "/activite-en-direct", "/a-traiter"];

/**
 * Retenir les fonds d'une commande : pour une personne, ou pour tous
 * (`beneficiaire` nul). Le motif reste interne ; la personne lit « versement
 * suspendu par le support ».
 */
export async function retenirFonds(p: { commande: string; beneficiaire: string | null; motif: string; cle: string }) {
  return geste<{ retenue: string; commande: string }>(CHEMINS_FONDS, "bo_fonds_retenir", {
    p_order: p.commande,
    p_beneficiaire: p.beneficiaire,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

/**
 * Lever UNE retenue de l'équipe (Finance, Direction ; identité reconfirmée).
 *
 * 🔴 RIEN D'AUTRE NE SE LIBÈRE (R15.5) : la base rend ce qui retient encore ces
 * fonds — une réclamation, un incident… — et l'écran le dit.
 */
export async function leverRetenue(p: { retenue: string; motif: string; cle: string }) {
  return geste<{ retenue: string; commande: string; toujours_retenus: string[] }>(CHEMINS_FONDS, "bo_fonds_liberer", {
    p_retenue: p.retenue,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}
