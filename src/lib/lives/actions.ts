"use server";

import { geste } from "@/lib/db/geste";
import { cheminLive, type ArticleRetire, type LiveArrete } from "./types";

// ⚠️ DEUX TEXTES, DEUX LECTEURS : le message part à l'hôte, tel quel, dans un
// avis qui ne se coupe pas ; le motif reste au journal de l'équipe. La base
// décide encore de tout : la permission de modérer, l'identité reconfirmée,
// jamais son propre live, ni un article vendu, retiré, ou dont un achat existe.

/**
 * Retirer un article d'un live (R14.4) — identité reconfirmée. Il garde sa
 * place dans le déroulé, mais ne reçoit plus d'offre et ne s'achète plus ; les
 * fenêtres d'achat ouvertes se closent, et l'hôte et les acheteurs concernés
 * sont prévenus.
 */
export async function retirerArticle(p: { live: string; article: string; message: string; motif: string; cle: string }) {
  return geste<ArticleRetire>(["/live-shopping", cheminLive(p.live)], "bo_live_article_retirer", {
    p_article: p.article,
    p_message: p.message,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

/**
 * Arrêter la diffusion d'un live en direct (R14.4) — identité reconfirmée. Le live est
 * terminé pour tout le monde, et le flux se ferme chez le prestataire vidéo ; les
 * fenêtres d'achat et les paiements déjà ouverts vont au bout (R14.6).
 */
export async function arreterLive(p: { live: string; message: string; motif: string; cle: string }) {
  return geste<LiveArrete>(["/live-shopping", cheminLive(p.live)], "bo_live_arreter", {
    p_live: p.live,
    p_message: p.message,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}
