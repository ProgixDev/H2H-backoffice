"use server";

import { geste } from "@/lib/db/geste";
import { cheminOption, type FamilleOption, type OptionArretee } from "./types";

const CHEMINS = ["/a-traiter", "/paiements-et-comptabilite", "/equipe-et-audit", "/visibilite-et-publicite"];

/**
 * Demander le remboursement d'une option.
 *
 * 🔴 TOUJOURS UNE SECONDE PERSONNE (Finance ou Direction) avant tout envoi à
 * Stripe. La base refuse un montant sous ce qu'une rétractation impose, ou
 * au-delà de ce qui reste payé ; à la réussite, elle émet l'avoir.
 */
export async function demanderRemboursementOption(p: {
  famille: FamilleOption;
  boost: string;
  montant: number;
  motif: string;
  cle: string;
}) {
  return geste<{ ordre: string; ref: string; statut: string; montant_cents: number; validation: string | null }>(
    [...CHEMINS, cheminOption(p.boost)],
    "bo_option_rembourser_demander",
    { p_kind: p.famille, p_boost: p.boost, p_montant_cents: p.montant, p_motif: p.motif, p_cle: p.cle },
  );
}

/**
 * Arrêter une option — identité reconfirmée. Elle s'arrête pour de bon ;
 * l'acheteur reçoit le message, jamais le motif, qui reste au journal.
 *
 * 🔴 LE REMBOURSEMENT SE PROPOSE, IL NE PART PAS : la part non exécutée, que la
 * base calcule, attend une seconde personne (Finance ou Direction) avant tout
 * envoi à Stripe.
 */
export async function arreterOption(p: {
  option: string;
  message: string;
  motif: string;
  rembourser: boolean;
  cle: string;
}) {
  return geste<OptionArretee>(
    [...CHEMINS, cheminOption(p.option), "/annonces"],
    "bo_option_arreter",
    { p_option: p.option, p_message: p.message, p_motif: p.motif, p_rembourser: p.rembourser, p_cle: p.cle },
  );
}
