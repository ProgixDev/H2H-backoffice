import "server-only";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { Fiche, ObjetFiche, Trouvee } from "./types";

/**
 * Les opérations qu'une référence désigne (R6.1) : numéro de commande (entier
 * ou ses six derniers caractères), FLASH-…, LIVE-…, DOS-…, un identifiant, un
 * paiement ou un remboursement Stripe, un numéro de suivi, un reçu, une
 * facture — ou le pseudo d'un utilisateur, pour ses opérations.
 */
export async function trouverOperation(reference: string): Promise<Trouvee[]> {
  return rpc<Trouvee[]>(await supabaseServeur(), "bo_operation_trouver", { p_reference: reference });
}

/**
 * La fiche complète d'une opération (§6). La base ferme elle-même les onglets
 * que le rôle ne permet pas de lire, refuse la fiche à un équipier qui prend
 * part à l'opération, et ne montre à un équipier de test que le monde du test.
 */
export async function lireOperation(table: ObjetFiche, id: string): Promise<Fiche> {
  return rpc<Fiche>(await supabaseServeur(), "bo_operation_lire", { p_objet_table: table, p_objet_id: id });
}
