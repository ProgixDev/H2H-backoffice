import "server-only";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { GenreSignale, SignalementsCible } from "./types";

/**
 * Les signalements d'une annonce, d'une recherche ou d'un compte : ceux qui
 * attendent d'abord, leur examen, son dossier « À traiter ».
 *
 * ⚠️ QUI A SIGNALÉ ne se lit que par qui peut examiner : la base le tait aux autres.
 */
export async function lireSignalementsCible(genre: GenreSignale, cible: string): Promise<SignalementsCible> {
  return rpc<SignalementsCible>(await supabaseServeur(), "bo_signalements_cible", { p_genre: genre, p_cible: cible });
}
