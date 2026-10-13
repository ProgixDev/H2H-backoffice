import { cheminAnnonce } from "@/lib/annonces/types";
import type { Dossier } from "@/lib/dossiers/types";
import { cheminLive } from "@/lib/lives/types";
import { cheminHub } from "@/lib/logistique/types";
import { cheminCompte } from "@/lib/utilisateurs/types";

/**
 * Où s'examinent les signalements d'un dossier : sur la fiche de ce qu'ils visent — l'annonce, la recherche, le
 * live, le point de rendez-vous (hand-to-hand `20261013008000`) ; le compte quand le dossier ne porte pas de table.
 *
 * ⚠️ UN POINT DE RENDEZ-VOUS A SA FICHE DANS H2H LOGISTIC : sans ce cas, le dossier d'un point signalé ouvrait la
 * fiche d'un compte qui n'existe pas.
 */
export function ficheDesSignalements(
  d: Pick<Dossier, "objet_table" | "objet_id">,
): { href: string; fiche: string } | null {
  if (!d.objet_id) return null;
  switch (d.objet_table) {
    case "products":
      return { href: cheminAnnonce(d.objet_id), fiche: "de l’annonce" };
    case "je_cherche_demandes":
      return { href: cheminAnnonce(d.objet_id), fiche: "de la recherche" };
    case "live_sessions":
      return { href: cheminLive(d.objet_id), fiche: "du live" };
    case "hubs":
      return { href: cheminHub(d.objet_id), fiche: "du point de rendez-vous" };
    default:
      return { href: cheminCompte(d.objet_id), fiche: "du compte" };
  }
}
