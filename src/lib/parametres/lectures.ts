import "server-only";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { GroupeReglages } from "./types";

/**
 * Les réglages de la plateforme (R20.3) : pour chacun, la version en vigueur, les versions
 * programmées, l'histoire — l'avant, l'après, qui, quand, pourquoi, la portée —, les demandes qui
 * attendent, et ce que l'équipier peut faire. La base dit aussi pourquoi un réglage ne se change pas.
 */
export async function lireParametres(): Promise<GroupeReglages[]> {
  return rpc<GroupeReglages[]>(await supabaseServeur(), "bo_parametres_lire");
}
