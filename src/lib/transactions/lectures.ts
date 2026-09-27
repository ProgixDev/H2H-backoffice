import "server-only";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { FiltresTransactions, Transaction } from "./types";

/**
 * Les transactions, piste par piste (§10). La base calcule chaque piste depuis
 * la table qui la porte : l'écran n'en déduit aucune.
 */
export async function listerTransactions(f: FiltresTransactions): Promise<Transaction[]> {
  return rpc<Transaction[]>(await supabaseServeur(), "bo_transactions_lister", {
    p_etat: f.etat,
    p_mode: f.mode,
    p_du: f.du,
    p_au: f.au,
    p_recherche: f.q,
    p_inclure_test: f.test,
  });
}
