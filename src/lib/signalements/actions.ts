"use server";

import { geste } from "@/lib/db/geste";
import { cheminAnnonce } from "@/lib/annonces/types";
import { cheminCompte } from "@/lib/utilisateurs/types";
import type { ExamenSignalements, GenreSignale, IssueSignalement } from "./types";

/**
 * Examiner des signalements d'une même cible : fondés, ou non fondés. Chaque
 * personne qui a signalé reçoit la réponse — jamais la mesure prise, ni le
 * motif, qui reste au journal de l'équipe. Le dossier « À traiter » se clôt
 * quand plus rien n'attend.
 *
 * ⚠️ LA BASE DÉCIDE ENCORE : la permission de modérer (ou de sanctionner, pour un
 * compte), jamais par une partie, une seule fois. La mesure elle-même —
 * masquer, retirer, sanctionner — est un autre geste.
 */
export async function examinerSignalements(p: {
  genre: GenreSignale;
  cible: string;
  signalements: string[];
  issue: IssueSignalement;
  reponse: string;
  motif: string;
  cle: string;
}) {
  return geste<ExamenSignalements>(
    [
      p.genre === "utilisateur" ? cheminCompte(p.cible) : cheminAnnonce(p.cible),
      "/a-traiter",
      "/litiges-et-signalements",
      "/tableau-de-bord",
    ],
    "bo_signalements_examiner",
    {
      p_genre: p.genre,
      p_signalements: p.signalements,
      p_issue: p.issue,
      p_reponse: p.reponse,
      p_motif: p.motif,
      p_cle: p.cle,
    },
  );
}
