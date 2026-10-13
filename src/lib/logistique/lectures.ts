import "server-only";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type {
  CandidatureRelais,
  Colivraison,
  CompteursColivraisons,
  CompteursTrajets,
  FicheTrajet,
  FiltresColivraisons,
  FiltresTrajets,
  HubAValider,
  Trajet,
} from "./types";

/** Les points de rendez-vous dont l'épingle attend un regard (hors épingles écartées). */
export async function listerHubsAValider(): Promise<HubAValider[]> {
  return rpc<HubAValider[]>(await supabaseServeur(), "bo_hubs_a_valider");
}

/** Les candidatures relais en attente, le téléphone masqué. */
export async function listerCandidaturesRelais(): Promise<CandidatureRelais[]> {
  return rpc<CandidatureRelais[]>(await supabaseServeur(), "bo_candidatures_relais_lister");
}

/** Les co-livraisons (§ 12.3) : un incident ouvert d'abord, puis par rendez-vous ; la base en décide l'ordre et le monde. */
export async function listerColivraisons(f: FiltresColivraisons): Promise<Colivraison[]> {
  return rpc<Colivraison[]>(await supabaseServeur(), "bo_colivraisons_lister", {
    p_filtre: f.filtre,
    p_recherche: f.q,
    p_inclure_test: f.test,
  });
}

/** Un compteur par filtre, avec la même recherche : exactement ce que la liste montre. */
export async function compterColivraisons(f: FiltresColivraisons): Promise<CompteursColivraisons> {
  return rpc<CompteursColivraisons>(await supabaseServeur(), "bo_colivraisons_compteurs", {
    p_recherche: f.q,
    p_inclure_test: f.test,
  });
}

/** Les trajets (§ 12.2) : une anomalie d'abord, puis les suspendus, puis par prochain passage ; la base en décide. */
export async function listerTrajets(f: FiltresTrajets): Promise<Trajet[]> {
  return rpc<Trajet[]>(await supabaseServeur(), "bo_trajets_lister", {
    p_filtre: f.filtre,
    p_recherche: f.q,
    p_inclure_test: f.test,
  });
}

/** Un compteur par filtre, avec la même recherche : exactement ce que la liste montre. */
export async function compterTrajets(f: FiltresTrajets): Promise<CompteursTrajets> {
  return rpc<CompteursTrajets>(await supabaseServeur(), "bo_trajets_compteurs", {
    p_recherche: f.q,
    p_inclure_test: f.test,
  });
}

/** La fiche d'un trajet : ses passages, ses co-livraisons, ce qui l'écarte des recherches ouvertes, ses suspensions. */
export async function lireTrajet(id: string): Promise<FicheTrajet> {
  return rpc<FicheTrajet>(await supabaseServeur(), "bo_trajet_lire", { p_trajet: id });
}
