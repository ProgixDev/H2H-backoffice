"use server";

import { consulter } from "@/lib/db/consultation";
import { rpc, RefusBO } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { ChampSensible, DonneeRevelee, EchangesLus, NaturePiece, PieceOuverte } from "./types";

// ── Les consultations (§21) ─────────────────────────────────────────────────
//
// Révéler une donnée, ouvrir une pièce, lire des échanges : chacune passe par
// `consulter` (`lib/db/consultation.ts`), qui dit ce qu'une consultation est —
// et n'est pas.

/**
 * Une donnée masquée, révélée pour un motif : celle d'un achat (`orders`, par
 * défaut) ou celle d'un compte (`profiles`). La base refuse l'une demandée
 * au nom de l'autre.
 */
export async function revelerDonnee(p: {
  objet: string;
  table?: "orders" | "profiles";
  champ: ChampSensible;
  motif: string;
  piece?: string | null;
}) {
  return consulter(async () =>
    rpc<DonneeRevelee>(await supabaseServeur(), "bo_reveler", {
      p_objet_table: p.table ?? "orders",
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
