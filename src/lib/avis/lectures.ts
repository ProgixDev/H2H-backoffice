import "server-only";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { AvisLigne, CompteursAvis, FicheAvis, FiltresAvis } from "./types";

/** Les avis (§19), ceux qui ont des signalements d'abord : la base en décide l'ordre et le monde. */
export async function listerAvis(f: FiltresAvis): Promise<AvisLigne[]> {
  return rpc<AvisLigne[]>(await supabaseServeur(), "bo_avis_lister", {
    p_filtre: f.filtre,
    p_recherche: f.q,
    p_inclure_test: f.test,
  });
}

/** Un compteur par filtre, avec la même recherche : exactement ce que la liste montre. */
export async function compterAvis(f: FiltresAvis): Promise<CompteursAvis> {
  return rpc<CompteursAvis>(await supabaseServeur(), "bo_avis_compteurs", {
    p_recherche: f.q,
    p_inclure_test: f.test,
  });
}

/**
 * La fiche d'un avis : la commande, l'effet sur la moyenne affichée, les
 * signalements, les décisions, et ce que l'équipier qui lit peut en faire.
 * ⚠️ QUI A SIGNALÉ ne se lit que par qui peut modérer : la base le tait aux autres.
 */
export async function lireAvis(id: string): Promise<FicheAvis> {
  return rpc<FicheAvis>(await supabaseServeur(), "bo_avis_lire", { p_avis: id });
}
