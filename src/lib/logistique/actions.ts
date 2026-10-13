"use server";

import { geste } from "@/lib/db/geste";
import { cheminHub, cheminTrajet, type ExamenHubEcrit, type IssueSignalementHub, type PointEnvoye } from "./types";

const CHEMIN = "/h2h-logistic";

/**
 * Valider une épingle ET écrire le sous-texte — c'est le même geste. La base
 * refuse un détail vide, trop court, ou qui porte encore « à compléter ».
 */
export async function validerHub(p: { hub: string; detail: string; repere: string | null; cle: string }) {
  return geste<{ hub: string; statut: string }>([CHEMIN, cheminHub(p.hub)], "bo_hub_valider", {
    p_hub_id: p.hub,
    p_detail_affiche: p.detail,
    p_landmark: p.repere,
    p_cle: p.cle,
  });
}

/** Ce que fermer un point laisse : les cotransporteurs prévenus, les rendez-vous qui y restent. */
export type FermetureEcrite = {
  hub: string;
  statut: string;
  etat: string;
  trajets_prevenus: number;
  rendez_vous_en_cours: number;
};

/**
 * Fermer un point pour les nouvelles recherches (§ 12.4), ou écarter une épingle
 * en attente — avec son motif, gardé. La base n'y propose plus rien, prévient les
 * cotransporteurs dont un trajet y passe, et laisse les rendez-vous confirmés où
 * ils sont.
 */
export async function retirerHub(p: { hub: string; motif: string; cle: string }) {
  return geste<FermetureEcrite>([CHEMIN, cheminHub(p.hub)], "bo_hub_retirer", {
    p_hub_id: p.hub,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

/**
 * « Créer » (§ 12.4) : poser une épingle. Elle n'est proposée à personne tant que
 * quelqu'un ne l'a pas validée ; la base rend ses voisins à moins de 150 mètres.
 */
export async function poserHub(p: PointEnvoye & { cle: string }) {
  return geste<{ hub: string; nom: string; etat: string; voisins: { id: string; nom: string; distance_m: number }[] }>(
    [CHEMIN],
    "bo_hub_poser",
    {
      p_type_lieu: p.type_lieu,
      p_repere: p.repere,
      p_detail: p.detail,
      p_ville: p.ville,
      p_region: p.region,
      p_adresse: p.adresse,
      p_latitude: p.latitude,
      p_longitude: p.longitude,
      p_rayon_m: p.rayon_m,
      p_cle: p.cle,
    },
  );
}

/**
 * « Corriger » (§ 12.4). La base refuse tant qu'un rendez-vous est confirmé à ce
 * point ou qu'une proposition en cours peut y aboutir : aucune correction ne
 * déplace un rendez-vous. Elle garde l'histoire et prévient les cotransporteurs.
 */
export async function corrigerHub(p: PointEnvoye & { hub: string; version: string; motif: string; cle: string }) {
  return geste<{ hub: string; nom: string; etat: string; deplace_de_m: number | null; trajets_prevenus: number }>(
    [CHEMIN, cheminHub(p.hub)],
    "bo_hub_corriger",
    {
      p_hub_id: p.hub,
      // ⚠️ La version LUE AVEC LE FORMULAIRE : un formulaire ouvert avant la correction d'un collègue est refusé.
      p_version: p.version,
      p_type_lieu: p.type_lieu,
      p_repere: p.repere,
      p_detail: p.detail,
      p_ville: p.ville,
      p_region: p.region,
      p_adresse: p.adresse,
      p_latitude: p.latitude,
      p_longitude: p.longitude,
      p_rayon_m: p.rayon_m,
      p_motif: p.motif,
      p_cle: p.cle,
    },
  );
}

/** Rouvrir un point fermé ; une épingle écartée revient « à valider ». */
export async function reactiverHub(p: { hub: string; motif: string; cle: string }) {
  return geste<{ hub: string; statut: string; etat: string; trajets_prevenus: number }>(
    [CHEMIN, cheminHub(p.hub)],
    "bo_hub_reactiver",
    { p_hub_id: p.hub, p_motif: p.motif, p_cle: p.cle },
  );
}

/**
 * « Examiner un signalement » (§ 12.4) : fondés, ou non fondés. Chaque personne
 * qui a signalé reçoit la réponse dans l'application du cotransporteur — jamais
 * le motif, qui reste au journal. Le dossier « À traiter » du point se clôt quand
 * plus rien n'attend.
 *
 * ⚠️ LA BASE DÉCIDE ENCORE : le rôle (`hubs.gerer`), jamais par la personne qui a
 * signalé, une seule fois, un monde à la fois. Fermer ou corriger le point reste
 * un autre geste : un examen ne touche pas à l'annuaire.
 */
export async function examinerSignalementsHub(p: {
  hub: string;
  signalements: string[];
  issue: IssueSignalementHub;
  reponse: string;
  motif: string;
  cle: string;
}) {
  return geste<ExamenHubEcrit>([CHEMIN, cheminHub(p.hub), "/a-traiter"], "bo_hub_signalements_examiner", {
    p_hub_id: p.hub,
    p_signalements: p.signalements,
    p_issue: p.issue,
    p_reponse: p.reponse,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

/**
 * Accepter (le point relais naît) ou refuser une candidature — un motif dans les
 * deux sens ; seul celui d'un refus part au candidat, l'autre reste au journal.
 */
export async function trancherCandidature(p: { candidature: string; approuver: boolean; motif: string; cle: string }) {
  return geste<{ candidature: string; statut: string; point_relais: string | null }>([CHEMIN], "bo_candidature_relais_trancher", {
    p_id: p.candidature,
    p_approuver: p.approuver,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

type SuspensionEcrite = { trajet: string; suspension: string; suspendu: boolean };

/**
 * Suspendre les nouvelles propositions d'un trajet (§ 12.2). Le message part au
 * cotransporteur ; le motif reste au journal. Rien de ce qui est en cours ne
 * s'arrête : c'est la base qui le garantit.
 */
export async function suspendreTrajet(p: { trajet: string; message: string; motif: string; cle: string }) {
  return geste<SuspensionEcrite>([CHEMIN, cheminTrajet(p.trajet)], "bo_trajet_suspendre", {
    p_trajet: p.trajet,
    p_message: p.message,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

/** Rétablir les nouvelles propositions d'un trajet suspendu ; son cotransporteur est prévenu. */
export async function reprendreTrajet(p: { trajet: string; motif: string; cle: string }) {
  return geste<SuspensionEcrite>([CHEMIN, cheminTrajet(p.trajet)], "bo_trajet_reprendre", {
    p_trajet: p.trajet,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}
