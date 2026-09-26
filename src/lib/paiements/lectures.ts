import "server-only";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { DuTransporteur, FiltreFonds, FondsAVerser } from "./types";

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

/**
 * Ce qui est dû et n'est pas encore parti, personne par personne : retenu
 * d'abord (avec ses causes), puis versable, puis en attente.
 *
 * ⚠️ CHAQUE MONDE LIT SES FONDS : l'équipier de test ne voit que le test.
 */
export async function listerFondsAVerser(etat: FiltreFonds | null): Promise<FondsAVerser[]> {
  return rpc<FondsAVerser[]>(await supabaseServeur(), "bo_fonds_lister", { p_etat: etat, p_inclure_test: false });
}
