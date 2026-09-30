"use server";

import { consulter } from "@/lib/db/consultation";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { CompteTrouve } from "./types";

/**
 * Retrouver un compte par son e-mail — ce que fait le support quand un client
 * lui écrit. La recherche est exacte, et c'est une consultation : un motif, une
 * identité reconfirmée, une ligne au journal, qui dit ce qui a été trouvé et
 * jamais l'adresse cherchée.
 *
 * ⚠️ L'E-MAIL NE PASSE JAMAIS PAR L'ADRESSE DE LA PAGE : il part dans cette
 * action, pas dans un paramètre que l'historique du navigateur garderait.
 */
export async function trouverCompteParEmail(p: { email: string; motif: string }) {
  return consulter(async () =>
    rpc<{ trouves: CompteTrouve[] }>(await supabaseServeur(), "bo_utilisateur_trouver_par_email", {
      p_email: p.email,
      p_motif: p.motif,
    }),
  );
}
