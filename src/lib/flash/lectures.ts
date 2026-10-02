import "server-only";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { CompteursFlash, FiltresFlash, OffreFlash } from "./types";

/**
 * Les offres Flash (§13) : la base place chaque offre sous son étape, calcule
 * ses pistes et constate ses anomalies. L'écran n'en déduit rien.
 */
export async function listerFlash(f: FiltresFlash): Promise<OffreFlash[]> {
  return rpc<OffreFlash[]>(await supabaseServeur(), "bo_flash_lister", {
    p_etape: f.filtre,
    p_recherche: f.q,
    p_inclure_test: f.test,
  });
}

/** Un compteur par filtre, avec la même recherche : exactement ce que la liste montre. */
export async function compterFlash(f: FiltresFlash): Promise<CompteursFlash> {
  return rpc<CompteursFlash>(await supabaseServeur(), "bo_flash_compteurs", {
    p_recherche: f.q,
    p_inclure_test: f.test,
  });
}
