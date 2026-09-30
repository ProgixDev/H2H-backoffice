import "server-only";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { CompteListe, DemandeRole, FicheCompte, FiltresComptes } from "./types";

/**
 * Les demandes de rôle qui attendent une décision, avec ce qui aide à décider :
 * l'identité vérifiée par Stripe (oui ou non, jamais le nom), le compte de
 * versement, la convention du rôle — chaque fois avec son mode, test ou réel.
 */
export async function listerDemandesDeRole(): Promise<DemandeRole[]> {
  return rpc<DemandeRole[]>(await supabaseServeur(), "bo_demandes_de_role_lister");
}

/**
 * Les comptes, les inscriptions les plus récentes d'abord. La recherche porte
 * sur le pseudonyme, la ville ou l'identifiant — jamais sur l'e-mail, qui se
 * cherche par une consultation (`trouverCompteParEmail`).
 *
 * ⚠️ CHAQUE MONDE LIT LE SIEN, et les comptes de l'équipe n'y figurent pas.
 */
export async function listerComptes(f: FiltresComptes): Promise<CompteListe[]> {
  return rpc<CompteListe[]>(await supabaseServeur(), "bo_utilisateurs_lister", {
    p_recherche: f.q,
    p_filtre: f.filtre,
    p_inclure_test: f.test,
  });
}

/** La fiche d'un compte (§8) : tout ce qui se lit sans rien révéler. */
export async function lireCompte(id: string): Promise<FicheCompte> {
  return rpc<FicheCompte>(await supabaseServeur(), "bo_utilisateur_lire", { p_profil: id });
}
