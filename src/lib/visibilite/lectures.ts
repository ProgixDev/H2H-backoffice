import "server-only";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { FamilleOption, RemboursementOption } from "./types";

/**
 * Le remboursement d'une option : par le dossier d'une rétractation (« À
 * traiter »), ou par l'option elle-même.
 *
 * ⚠️ RÉSERVÉ À QUI LIT LES PAIEMENTS (`paiements.lire`) : la base refuse aux autres.
 */
export async function lireRemboursementOption(
  p: { dossier: string } | { famille: FamilleOption; boost: string },
): Promise<RemboursementOption> {
  const args = "dossier" in p ? { p_dossier: p.dossier } : { p_kind: p.famille, p_boost: p.boost };
  return rpc<RemboursementOption>(await supabaseServeur(), "bo_option_remboursement_lire", args);
}
