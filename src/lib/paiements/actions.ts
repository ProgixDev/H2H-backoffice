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
  return geste<{ reglement: string; total_cents: number; commandes: number }>("bo_transporteur_regler", {
    p_transporteur: p.transporteur,
    p_reference: p.reference,
    p_commandes: p.commandes,
    p_total_attendu_cents: p.total,
    p_cle: p.cle,
  }, [CHEMIN]);
}
