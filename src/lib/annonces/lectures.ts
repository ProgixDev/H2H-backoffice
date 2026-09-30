import "server-only";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { AnnonceListe, CategorieFiltre, Fiche, FiltresAnnonces } from "./types";

/**
 * Les annonces, ou les recherches « Je cherche », les plus récentes d'abord :
 * cherchées par titre, ville, pseudonyme ou identifiant ; les 300 dernières.
 *
 * ⚠️ CHAQUE MONDE LIT LE SIEN : le monde du test ne s'ajoute que sur demande.
 */
export async function listerAnnonces(f: FiltresAnnonces): Promise<AnnonceListe[]> {
  return rpc<AnnonceListe[]>(await supabaseServeur(), "bo_annonces_lister", {
    p_recherche: f.q,
    p_nature: f.vue,
    p_filtre: f.filtre,
    p_categorie: f.categorie,
    p_inclure_test: f.test,
  });
}

/** Les catégories du filtre, avec le nombre d'annonces en ligne. */
export async function listerCategories(): Promise<CategorieFiltre[]> {
  return rpc<CategorieFiltre[]>(await supabaseServeur(), "bo_annonces_categories");
}

/** La fiche d'une annonce ou d'une recherche : la base dit laquelle. */
export async function lireAnnonce(id: string): Promise<Fiche> {
  return rpc<Fiche>(await supabaseServeur(), "bo_annonce_lire", { p_id: id });
}
