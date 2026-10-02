import "server-only";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { CompteursLives, FicheLive, FiltreLive, FiltresLives, LiveLigne, PlaceLive } from "./types";

/**
 * Les lives (§14) : la base place chaque live dans sa zone, lit son moment sur
 * l'horloge du live et constate ses anomalies. L'écran n'en déduit rien.
 */
export async function listerLives(f: FiltresLives, filtre: FiltreLive | null): Promise<LiveLigne[]> {
  return rpc<LiveLigne[]>(await supabaseServeur(), "bo_lives_lister", {
    p_zone: filtre,
    p_recherche: f.q,
    p_inclure_test: f.test,
  });
}

/** Un compteur par filtre, avec la même recherche : exactement ce que la liste montre. */
export async function compterLives(f: FiltresLives): Promise<CompteursLives> {
  return rpc<CompteursLives>(await supabaseServeur(), "bo_lives_compteurs", {
    p_recherche: f.q,
    p_inclure_test: f.test,
  });
}

/** Les réservations (R14.3) : des lives qui ne sont pas terminés — ou toutes celles d'un live. */
export async function listerPlaces(f: FiltresLives): Promise<PlaceLive[]> {
  return rpc<PlaceLive[]>(await supabaseServeur(), "bo_live_places_lister", {
    p_live: f.live,
    p_recherche: f.q,
    p_inclure_test: f.test,
  });
}

/** La fiche d'un live et ses articles, avec pour chacun si le retrait est possible. */
export async function lireLive(id: string): Promise<FicheLive> {
  return rpc<FicheLive>(await supabaseServeur(), "bo_live_lire", { p_live: id });
}
