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

// ── Les ordres financiers (migration 20260926014000) ────────────────────────
//
// 🔴 AUCUN ARGENT NE PART D'ICI. Un remboursement se DEMANDE : la base fixe le
// montant d'un litige, plafonne un geste hors litige, exige une seconde
// personne au-delà du seuil — et c'est `stripe-ordres`, réveillée par
// l'horloge, qui parle à Stripe. L'écran suit ensuite l'ordre : demandé, en
// cours, réussi, échoué (§16.5).

// Un ordre change la liste des ordres, les litiges, l'Activité en direct et la file.
const CHEMINS_ORDRES = [CHEMIN, "/litiges-et-signalements", "/activite-en-direct", "/a-traiter"];

type Ordre = { ordre: string; ref: string; statut: string; montant_cents: number; validation: string | null };

/**
 * Demander un remboursement. `litige` : le montant est celui de la décision
 * (`montant` nul) ; sans litige, un montant, et toujours une seconde personne.
 */
export async function demanderRemboursement(p: {
  commande: string;
  litige: string | null;
  montant: number | null;
  motif: string;
  cle: string;
}) {
  return geste<Ordre>(CHEMINS_ORDRES, "bo_remboursement_demander", {
    p_order: p.commande,
    p_claim: p.litige,
    p_montant_cents: p.montant,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

/** Annuler un ordre qui n'est pas parti : en validation, demandé, ou en échec. */
export async function annulerOrdre(p: { ordre: string; motif: string; cle: string }) {
  return geste<{ ordre: string; statut: string }>(CHEMINS_ORDRES, "bo_ordre_annuler", {
    p_ordre: p.ordre,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

/**
 * Relancer un ordre en échec : une tentative de plus, donc une clé neuve — et
 * l'exécuteur cherche d'abord chez Stripe un remboursement de cet ordre.
 */
export async function relancerOrdre(p: { ordre: string; motif: string; cle: string }) {
  return geste<{ ordre: string; statut: string }>(CHEMINS_ORDRES, "bo_ordre_relancer", {
    p_ordre: p.ordre,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}
