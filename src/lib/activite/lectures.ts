import "server-only";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { Compteur, Evenement, FiltresActivite, Operation } from "./types";

/**
 * Les opérations en cours (ou récemment terminées), filtrées.
 *
 * 🔴 UN COMPTEUR EST UN FILTRE : `compteur` fait rendre à la base exactement les
 * lignes qu'elle a comptées dans le bandeau. L'écran ne refiltre rien.
 */
export async function listerOperations(f: FiltresActivite): Promise<Operation[]> {
  return rpc<Operation[]>(await supabaseServeur(), "bo_operations_lister", {
    p_compteur: f.compteur,
    p_service: f.service,
    p_recherche: f.recherche,
    p_termines: f.termines,
    p_inclure_test: f.inclureTest,
  });
}

/** Les douze compteurs du bandeau (§4). */
export async function compterOperations(inclureTest: boolean): Promise<Compteur[]> {
  return rpc<Compteur[]>(await supabaseServeur(), "bo_operations_compteurs", { p_inclure_test: inclureTest });
}

/** Les derniers événements — de toutes les opérations, ou d'une seule (`objet`). */
export async function listerEvenements(o: {
  inclureTest: boolean;
  objet?: string | null;
  avant?: number | null;
}): Promise<Evenement[]> {
  return rpc<Evenement[]>(await supabaseServeur(), "bo_evenements_lister", {
    p_avant: o.avant ?? null,
    p_limite: 100,
    p_objet_id: o.objet ?? null,
    p_inclure_test: o.inclureTest,
  });
}
