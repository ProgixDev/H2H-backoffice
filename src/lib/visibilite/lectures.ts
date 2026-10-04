import "server-only";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type {
  CompteursOptions,
  FamilleOption,
  FicheOption,
  FiltresOptions,
  OptionLigne,
  RemboursementOption,
} from "./types";

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

/** Les options (§17) : les anomalies d'abord, puis ce qui reste à rendre ; la base en décide l'ordre et le monde. */
export async function listerOptions(f: FiltresOptions): Promise<OptionLigne[]> {
  return rpc<OptionLigne[]>(await supabaseServeur(), "bo_options_lister", {
    p_filtre: f.filtre,
    p_recherche: f.q,
    p_inclure_test: f.test,
  });
}

/** Un compteur par filtre, avec la même recherche : exactement ce que la liste montre. */
export async function compterOptions(f: FiltresOptions): Promise<CompteursOptions> {
  return rpc<CompteursOptions>(await supabaseServeur(), "bo_options_compteurs", {
    p_recherche: f.q,
    p_inclure_test: f.test,
  });
}

/**
 * La fiche d'une option : son tarif, son exécution, la preuve de l'accord, sa
 * rétractation, son remboursement et ses avoirs, ses contestations, ses arrêts,
 * et ce que l'équipier qui lit peut en faire.
 */
export async function lireOption(id: string): Promise<FicheOption> {
  return rpc<FicheOption>(await supabaseServeur(), "bo_option_lire", { p_option: id });
}
