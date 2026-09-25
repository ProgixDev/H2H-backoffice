import "server-only";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { DuTransporteur } from "./types";

/**
 * Ce qui reste dû aux transporteurs tiers, commande par commande — le grand
 * livre netté par commande : une commande remboursée n'y figure plus.
 *
 * ⚠️ CHAQUE MONDE LIT SES DETTES : un équipier de test ne voit que les
 * commandes de test, un équipier réel que les vraies.
 */
export async function listerTransporteursARegler(): Promise<DuTransporteur[]> {
  return rpc<DuTransporteur[]>(await supabaseServeur(), "bo_transporteurs_a_regler");
}
