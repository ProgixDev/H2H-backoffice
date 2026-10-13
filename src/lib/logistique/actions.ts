"use server";

import { geste } from "@/lib/db/geste";
import { cheminHub, cheminTrajet } from "./types";

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

/** Rouvrir un point fermé ; une épingle écartée revient « à valider ». */
export async function reactiverHub(p: { hub: string; motif: string; cle: string }) {
  return geste<{ hub: string; statut: string; etat: string; trajets_prevenus: number }>(
    [CHEMIN, cheminHub(p.hub)],
    "bo_hub_reactiver",
    { p_hub_id: p.hub, p_motif: p.motif, p_cle: p.cle },
  );
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
