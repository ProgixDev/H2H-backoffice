import "server-only";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { FilSupportLu } from "./types";

/**
 * Le fil d'un compte avec le support : ses messages, qui les a écrits, son
 * dossier « À traiter », et ce que l'équipier qui lit peut en faire.
 */
export async function lireFilSupport(profil: string): Promise<FilSupportLu> {
  return rpc<FilSupportLu>(await supabaseServeur(), "bo_support_lire", { p_profil: profil });
}
