"use server";

import { geste } from "@/lib/db/geste";
import { cheminCompte } from "@/lib/utilisateurs/types";
import type { MessageSupportEcrit } from "./types";

/**
 * Écrire à une personne, au nom de HandtoHand, dans son fil avec le support —
 * ouvert s'il ne l'était pas. Elle reçoit un avis que ses préférences ne coupent
 * pas ; l'équipier qui écrit est au journal, jamais dans le fil ; le dossier
 * « À traiter » se clôt.
 *
 * ⚠️ LA BASE DÉCIDE ENCORE : la permission de traiter les dossiers et de lire les
 * comptes, jamais son propre compte ni un compte effacé, une seule fois.
 */
export async function ecrireAuSupport(p: { profil: string; texte: string; cle: string }) {
  return geste<MessageSupportEcrit>(
    [cheminCompte(p.profil), "/a-traiter", "/tableau-de-bord"],
    "bo_support_ecrire",
    { p_profil: p.profil, p_texte: p.texte, p_cle: p.cle },
  );
}
