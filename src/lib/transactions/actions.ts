"use server";

import { geste } from "@/lib/db/geste";

// Une annulation se voit aussi dans l'Activité en direct (« Annulation en
// cours ») et, si elle n'aboutit pas, dans « À traiter ».
const CHEMINS = ["/transactions", "/activite-en-direct", "/a-traiter"];

/**
 * Annuler selon la procédure (R10.3) : avant l'encaissement seulement. La base
 * pose la demande sur le chemin des annulations automatiques — l'autorisation
 * est levée chez Stripe, la part déjà payée par le vendeur lui est rendue, et
 * les deux parties lisent le motif de la procédure, jamais le motif interne.
 */
export async function annulerTransaction(p: { commande: string; motif: string; statutAttendu: string; cle: string }) {
  return geste<{ commande: string; annulation: "demandee" }>(CHEMINS, "bo_transaction_annuler", {
    p_order: p.commande,
    p_motif: p.motif,
    p_statut_attendu: p.statutAttendu,
    p_cle: p.cle,
  });
}
