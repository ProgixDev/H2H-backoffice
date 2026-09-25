import "server-only";
import { cache } from "react";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { Moi } from "./types";

/**
 * Qui est l'équipier de cette requête, avec ses rôles et permissions.
 *
 * ⚠️ UNE FOIS PAR REQUÊTE (`cache`), POUR TOUTE LA PAGE. Le cadre et chaque
 * rubrique le demandent : sans ce cache, autant d'allers-retours vers la base.
 * Ce n'est jamais mis en cache ENTRE deux requêtes — une révocation vaut dès la
 * suivante.
 */
export const chargerMoi = cache(async (): Promise<Moi> => {
  const sb = await supabaseServeur();
  return rpc<Moi>(sb, "bo_moi");
});
