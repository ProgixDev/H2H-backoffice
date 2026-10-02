"use server";

import { geste } from "@/lib/db/geste";
import { cheminAvis, type AvisModere } from "./types";

/**
 * Retirer ou rétablir un avis (R19.2) — identité reconfirmée. Retiré, il ne se lit
 * plus dans l'application et ne compte plus dans la moyenne du profil noté ;
 * rétabli, il revient. L'auteur l'apprend : le message pour un retrait, jamais le
 * motif, qui reste au journal de l'équipe.
 *
 * ⚠️ LA BASE DÉCIDE ENCORE : la permission de modérer les avis, jamais par une
 * partie (l'auteur ou la personne notée), une seule fois. La note et le
 * commentaire restent ceux de l'auteur.
 */
export async function modererAvis(p: {
  avis: string;
  decision: "retirer" | "retablir";
  message: string | null;
  motif: string;
  cle: string;
}) {
  return geste<AvisModere>(
    ["/avis-utilisateurs", cheminAvis(p.avis), "/utilisateurs"],
    "bo_avis_moderer",
    { p_avis: p.avis, p_decision: p.decision, p_message: p.message, p_motif: p.motif, p_cle: p.cle },
  );
}
