"use server";

import { geste } from "@/lib/db/geste";
import { cheminAnnonce } from "@/lib/annonces/types";
import { cheminCompte } from "@/lib/utilisateurs/types";
import type { DecisionRecours } from "@/lib/utilisateurs/types";
import type { ExamenSignalements, GenreSignale, IssueSignalement, RecoursSignalementExamine } from "./types";

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

/**
 * Examiner le recours d'une personne contre l'examen « non fondé » de son
 * signalement — identité reconfirmée, jamais par l'équipier qui a examiné, jamais
 * par une partie. Accepté, l'équipe revoit sa décision : la personne apprend
 * qu'un manquement est constaté et que les mesures nécessaires sont prises.
 * Rejeté, l'examen est maintenu. La réponse part à la personne, le motif reste au
 * journal ; le dossier « À traiter » se clôt.
 *
 * ⚠️ ACCEPTÉ, IL NE PREND AUCUNE MESURE : masquer, retirer ou sanctionner restent
 * des gestes à part, sur la même fiche.
 */
export async function examinerRecoursSignalement(p: {
  recours: string;
  genre: GenreSignale;
  cible: string;
  decision: DecisionRecours;
  reponse: string;
  motif: string;
  cle: string;
}) {
  return geste<RecoursSignalementExamine>(
    [p.genre === "utilisateur" ? cheminCompte(p.cible) : cheminAnnonce(p.cible), "/a-traiter", "/tableau-de-bord"],
    "bo_recours_signalement_examiner",
    { p_recours: p.recours, p_decision: p.decision, p_reponse: p.reponse, p_motif: p.motif, p_cle: p.cle },
  );
}
