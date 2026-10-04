"use server";

import { geste } from "@/lib/db/geste";
import type { FamilleOption } from "./types";

const CHEMINS = ["/a-traiter", "/paiements-et-comptabilite", "/equipe-et-audit"];

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
    CHEMINS,
    "bo_option_rembourser_demander",
    { p_kind: p.famille, p_boost: p.boost, p_montant_cents: p.montant, p_motif: p.motif, p_cle: p.cle },
  );
}
