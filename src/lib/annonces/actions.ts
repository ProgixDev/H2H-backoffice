"use server";

import { geste } from "@/lib/db/geste";
import type { DecisionRecours } from "@/lib/utilisateurs/types";
import { cheminAnnonce, type ModerationPosee, type MotifCorrection, type RecoursModerationExamine } from "./types";

const CHEMIN = "/annonces";

// ⚠️ DEUX TEXTES, DEUX LECTEURS, pour chaque geste : le message part à l'auteur,
// tel quel, dans un avis que ses préférences ne coupent pas ; le motif reste au
// journal de l'équipe. La base exige l'un et l'autre, et décide encore de tout :
// la permission, l'identité reconfirmée, l'état, jamais sa propre annonce.

/**
 * Masquer une annonce ou une recherche — identité reconfirmée. Elle ne se montre
 * plus qu'à son auteur, ne s'achète, ne s'offre ni ne se discute plus ; ce qui
 * était engagé autour d'elle va au bout. L'équipe peut la rétablir.
 */
export async function masquerAnnonce(p: { annonce: string; message: string; motif: string; cle: string }) {
  return geste<ModerationPosee>([CHEMIN, cheminAnnonce(p.annonce)], "bo_annonce_masquer", {
    p_annonce: p.annonce,
    p_message: p.message,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

/** Rétablir une annonce masquée : elle se montre de nouveau, et l'auteur en est prévenu. */
export async function retablirAnnonce(p: { annonce: string; motif: string; cle: string }) {
  return geste<ModerationPosee>([CHEMIN, cheminAnnonce(p.annonce)], "bo_annonce_retablir", {
    p_annonce: p.annonce,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

/**
 * Retirer une annonce, pour de bon — identité reconfirmée. Seul un recours
 * accepté la rendrait ; elle ne se modifie plus.
 */
export async function retirerAnnonce(p: { annonce: string; message: string; motif: string; cle: string }) {
  return geste<ModerationPosee>([CHEMIN, cheminAnnonce(p.annonce)], "bo_annonce_retirer", {
    p_annonce: p.annonce,
    p_message: p.message,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

/**
 * Demander une correction : l'annonce reste en ligne, l'auteur reçoit la
 * demande, et la modification qu'il fait ensuite est gratuite — la base le sait.
 */
export async function demanderCorrection(p: {
  annonce: string;
  correction: MotifCorrection;
  message: string;
  motif: string;
  cle: string;
}) {
  return geste<ModerationPosee>([CHEMIN, cheminAnnonce(p.annonce)], "bo_annonce_demander_correction", {
    p_annonce: p.annonce,
    p_correction: p.correction,
    p_message: p.message,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

/**
 * Autoriser la publication d'une annonce qui attend sa vérification (D25) : elle
 * se montre, sa publication date d'ici — sa fenêtre d'offres Flash commence
 * entière —, l'auteur est prévenu, et le dossier « À traiter » se clôt.
 */
export async function autoriserPublication(p: { annonce: string; motif: string; cle: string }) {
  return geste<ModerationPosee>(
    [CHEMIN, cheminAnnonce(p.annonce), "/a-traiter", "/tableau-de-bord"],
    "bo_annonce_autoriser",
    { p_annonce: p.annonce, p_motif: p.motif, p_cle: p.cle },
  );
}

/**
 * Refuser la publication — identité reconfirmée. Elle ne se montrera pas et ne
 * se modifie plus ; seul un recours accepté la publierait. L'auteur reçoit le
 * message, et comment contester ; le dossier « À traiter » se clôt.
 */
export async function refuserPublication(p: { annonce: string; message: string; motif: string; cle: string }) {
  return geste<ModerationPosee>(
    [CHEMIN, cheminAnnonce(p.annonce), "/a-traiter", "/tableau-de-bord"],
    "bo_annonce_refuser",
    { p_annonce: p.annonce, p_message: p.message, p_motif: p.motif, p_cle: p.cle },
  );
}

/**
 * Examiner un recours contre un masquage, un retrait ou un refus de publication — identité reconfirmée,
 * jamais par l'auteur de la décision. Accepté, la décision est annulée, et
 * l'annonce se montre (de nouveau) si elle s'appliquait encore ; rejeté, elle est
 * maintenue. La réponse part à l'auteur, le motif reste au journal de l'équipe ;
 * le dossier « À traiter » se clôt.
 */
export async function examinerRecoursModeration(p: {
  recours: string;
  annonce: string;
  decision: DecisionRecours;
  reponse: string;
  motif: string;
  cle: string;
}) {
  return geste<RecoursModerationExamine>(
    [CHEMIN, cheminAnnonce(p.annonce), "/a-traiter", "/tableau-de-bord"],
    "bo_recours_moderation_examiner",
    { p_recours: p.recours, p_decision: p.decision, p_reponse: p.reponse, p_motif: p.motif, p_cle: p.cle },
  );
}
