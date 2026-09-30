"use server";

import { consulter } from "@/lib/db/consultation";
import { rpc, RefusBO } from "@/lib/db/rpc";
import type { PieceOuverte } from "@/lib/operations/types";
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

/**
 * Une pièce d'un recours, jointe par la personne : un motif, un ticket de cinq
 * minutes pris par la base, puis l'adresse du fichier signée avec le jeton de
 * l'équipier — elle ne vaut qu'une minute.
 *
 * ⚠️ AUCUNE CLÉ DE SERVICE : c'est la politique du stockage qui accepte la
 * signature, parce qu'un ticket vivant le permet.
 */
export async function ouvrirPieceRecours(p: { recours: string; rang: number; motif: string }) {
  return consulter(async (): Promise<PieceOuverte> => {
    const client = await supabaseServeur();
    const ticket = await rpc<{ bucket: string; chemin: string; expire_le: string }>(client, "bo_recours_ouvrir_piece", {
      p_recours: p.recours,
      p_rang: p.rang,
      p_motif: p.motif,
    });
    const { data, error } = await client.storage.from(ticket.bucket).createSignedUrl(ticket.chemin, 60);
    if (error || !data?.signedUrl) {
      throw new RefusBO("Le fichier n’a pas pu être ouvert. Réessayez dans un instant.", "BO_PANNE", null);
    }
    return { url: data.signedUrl, expire_le: new Date(Date.now() + 60_000).toISOString() };
  });
}
