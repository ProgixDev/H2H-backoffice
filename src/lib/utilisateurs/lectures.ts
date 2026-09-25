import "server-only";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { DemandeRole } from "./types";

/**
 * Les demandes de rôle qui attendent une décision, avec ce qui aide à décider :
 * l'identité vérifiée par Stripe (oui ou non, jamais le nom), le compte de
 * versement, la convention du rôle — chaque fois avec son mode, test ou réel.
 */
export async function listerDemandesDeRole(): Promise<DemandeRole[]> {
  return rpc<DemandeRole[]>(await supabaseServeur(), "bo_demandes_de_role_lister");
}
