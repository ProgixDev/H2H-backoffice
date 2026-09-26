import "server-only";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { CompteurDossier, DetailDossier, Dossier, FiltresFile } from "./types";

/**
 * La file « À traiter », rangée par la base : chaque dossier avec sa catégorie
 * (§5.1), calculée par la même fonction que le bandeau.
 */
export async function listerDossiers(f: FiltresFile): Promise<Dossier[]> {
  return rpc<Dossier[]>(await supabaseServeur(), "bo_dossiers_lister", {
    p_perimetre: f.perimetre,
    p_categorie: f.categorie,
    p_inclure_clos: f.clos,
    p_inclure_test: f.inclureTest,
  });
}

/** Les huit groupes du §5.1, comptés sur le périmètre choisi. */
export async function compterDossiers(f: FiltresFile): Promise<CompteurDossier[]> {
  return rpc<CompteurDossier[]>(await supabaseServeur(), "bo_dossiers_compteurs", {
    p_perimetre: f.perimetre,
    p_inclure_test: f.inclureTest,
  });
}

/** Un dossier, son journal (notes internes comprises) et les équipiers à qui le confier. */
export async function lireDossier(id: string): Promise<DetailDossier> {
  return rpc<DetailDossier>(await supabaseServeur(), "bo_dossier_lire", { p_id: id });
}
