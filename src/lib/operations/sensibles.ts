"use server";

import { reverificationError } from "@clerk/nextjs/server";
import { REVERIFICATION_BO } from "@/lib/connexion/reverification";
import { refusEnResultat, rpc, RefusBO, type Resultat } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { ChampSensible, DonneeRevelee, EchangesLus, NaturePiece, PieceOuverte } from "./types";

// ── Les consultations (§21) ─────────────────────────────────────────────────
//
// 🔴 UNE CONSULTATION N'EST PAS UN GESTE : elle ne change rien, donc ni clé
// « une seule fois », ni page à rafraîchir. Mais elle se JOURNALISE, avec son
// motif : c'est la base qui l'écrit, au nom de l'équipier du jeton.
//
// ⚠️ LE SECOND FACTEUR SE DEMANDE COMME POUR UN GESTE : `BO_REVERIF` devient la
// fenêtre de vérification, puis un nouvel essai.

async function consulter<T>(lire: () => Promise<T>) {
  try {
    return { ok: true, donnees: await lire() } satisfies Resultat<T>;
  } catch (e) {
    if (e instanceof RefusBO && e.indice === "BO_REVERIF") return reverificationError(REVERIFICATION_BO);
    return refusEnResultat(e);
  }
}

/** Une donnée masquée d'un achat, révélée pour un motif. */
export async function revelerDonnee(p: { objet: string; champ: ChampSensible; motif: string; piece?: string | null }) {
  return consulter(async () =>
    rpc<DonneeRevelee>(await supabaseServeur(), "bo_reveler", {
      p_objet_table: "orders",
      p_objet_id: p.objet,
      p_champ: p.champ,
      p_motif: p.motif,
      p_piece: p.piece ?? null,
    }),
  );
}

/**
 * Une pièce d'un achat : la base délivre le ticket (cinq minutes, journalisé),
 * puis on signe l'adresse du fichier avec le jeton de l'équipier.
 *
 * ⚠️ AUCUNE CLÉ DE SERVICE : c'est la politique du stockage qui accepte la
 * signature, parce qu'un ticket vivant le permet. L'adresse signée ne vaut
 * qu'une minute.
 */
export async function ouvrirPiece(p: { objet: string; nature: NaturePiece; piece: string; rang?: number | null; motif: string }) {
  return consulter(async (): Promise<PieceOuverte> => {
    const client = await supabaseServeur();
    const ticket = await rpc<{ bucket: string; chemin: string; expire_le: string }>(client, "bo_ouvrir_piece", {
      p_objet_id: p.objet,
      p_nature: p.nature,
      p_piece: p.piece,
      p_rang: p.rang ?? null,
      p_motif: p.motif,
    });
    const { data, error } = await client.storage.from(ticket.bucket).createSignedUrl(ticket.chemin, 60);
    if (error || !data?.signedUrl) {
      throw new RefusBO("Le fichier n’a pas pu être ouvert. Réessayez dans un instant.", "BO_PANNE", null);
    }
    return { url: data.signedUrl, expire_le: new Date(Date.now() + 60_000).toISOString() };
  });
}

/** Les messages d'une conversation liée à l'achat — seulement avec le litige de l'acheteur. */
export async function lireEchanges(p: { objet: string; conversation: string; motif: string }) {
  return consulter(async () =>
    rpc<EchangesLus>(await supabaseServeur(), "bo_echanges_lire", {
      p_objet_id: p.objet,
      p_conversation: p.conversation,
      p_motif: p.motif,
    }),
  );
}
