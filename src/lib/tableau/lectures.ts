import "server-only";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { DetailIndicateur, FiltresTableau, Tableau } from "./types";

/**
 * Le tableau de bord (§3) : tous les indicateurs du registre, sur une période
 * en jours de Paris — trente jours jusqu'à aujourd'hui, si aucune n'est donnée.
 *
 * ⚠️ CHAQUE MONDE LIT LE SIEN : le test n'entre dans les résultats que si un
 * équipier réel le demande (`test`) ; un équipier de test ne lit que le test.
 */
export async function lireTableau(f: FiltresTableau): Promise<Tableau> {
  return rpc<Tableau>(await supabaseServeur(), "bo_tableau_de_bord", {
    p_du: f.du,
    p_au: f.au,
    p_inclure_test: f.test,
  });
}

/**
 * Les lignes qui composent le chiffre d'un indicateur — celles que la base a
 * comptées, les plus récentes d'abord. Demande, en plus de la lecture du
 * tableau, la permission de la rubrique que ces lignes concernent.
 */
export async function lireDetailIndicateur(code: string, f: FiltresTableau): Promise<DetailIndicateur> {
  return rpc<DetailIndicateur>(await supabaseServeur(), "bo_tableau_detail", {
    p_code: code,
    p_du: f.du,
    p_au: f.au,
    p_inclure_test: f.test,
  });
}
