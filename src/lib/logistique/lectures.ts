import "server-only";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { CandidatureRelais, HubAValider } from "./types";

/** Les points de rendez-vous dont l'épingle attend un regard (hors épingles écartées). */
export async function listerHubsAValider(): Promise<HubAValider[]> {
  return rpc<HubAValider[]>(await supabaseServeur(), "bo_hubs_a_valider");
}

/** Les candidatures relais en attente, le téléphone masqué. */
export async function listerCandidaturesRelais(): Promise<CandidatureRelais[]> {
  return rpc<CandidatureRelais[]>(await supabaseServeur(), "bo_candidatures_relais_lister");
}
