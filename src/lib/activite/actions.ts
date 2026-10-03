"use server";

import { geste } from "@/lib/db/geste";

/**
 * Renvoyer le push d'une notification qui n'est pas arrivée (R20.6).
 *
 * 🔴 UNE NOUVELLE TENTATIVE SUR LA MÊME NOTIFICATION, JAMAIS UNE NOUVELLE : sa
 * date ne bouge pas, aucune échéance comptée depuis elle ne repart. La base
 * décide si elle se renvoie (`bo_notification_renvoyer`).
 */
export async function renvoyerNotification(p: { notification: string; motif: string; cle: string }) {
  return geste<{ ok: true; notification: string; push_statut: "prevu"; renvois: number }>(
    ["/activite-en-direct", "/documents-et-parametres", "/a-traiter"],
    "bo_notification_renvoyer",
    { p_notification: p.notification, p_motif: p.motif, p_cle: p.cle },
  );
}
