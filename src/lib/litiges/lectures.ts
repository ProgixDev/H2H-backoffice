import "server-only";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { Litige } from "./types";

/**
 * Les dossiers de réclamation, avec ce que chacun a déjà rendu et ce qui
 * partirait vraiment si l'on émettait maintenant.
 *
 * ⚠️ UNE SEULE LECTURE. L'écran mobile reconstituait ces montants dossier par
 * dossier ; la base les calcule avec la formule même de l'émission — un écran
 * qui annoncerait un autre montant que celui qui part ferait mentir la
 * confirmation.
 */
export async function listerLitiges(): Promise<Litige[]> {
  return rpc<Litige[]>(await supabaseServeur(), "bo_litiges_lister");
}
