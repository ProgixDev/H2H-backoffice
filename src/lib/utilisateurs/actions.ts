"use server";

import { geste } from "@/lib/db/geste";
import {
  cheminCompte,
  type NomReserveDecide,
  type ObjetVerification,
  type ProfessionnelDecide,
  type VerificationClose,
  type VerificationDemandee,
  type DecisionRecours,
  type PorteeRestriction,
  type RecoursExamine,
  type SanctionPosee,
} from "./types";

const CHEMIN = "/utilisateurs";
// Une suspension se compte au tableau de bord : il se relit aussi.
const TABLEAU = "/tableau-de-bord";

/**
 * Accorder (le rôle s'active, la personne est prévenue) ou refuser une demande
 * de rôle. Un motif dans les deux sens ; seul celui d'un refus part à la
 * personne — la note d'acceptation reste au journal de l'équipe (R6.3).
 */
export async function trancherDemandeDeRole(p: { demande: string; approuver: boolean; motif: string; cle: string }) {
  return geste<{ demande: string; statut: string }>([CHEMIN], "bo_demande_de_role_trancher", {
    p_id: p.demande,
    p_approuver: p.approuver,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

/**
 * Avertir : un fait inscrit au compte, et dit à la personne. Rien ne s'arrête.
 *
 * ⚠️ DEUX TEXTES, DEUX LECTEURS. Le message part à la personne, tel quel ; le
 * motif reste au journal de l'équipe.
 */
export async function avertirCompte(p: { profil: string; message: string; motif: string; cle: string }) {
  return geste<SanctionPosee>([CHEMIN, cheminCompte(p.profil)], "bo_utilisateur_avertir", {
    p_profil: p.profil,
    p_message: p.message,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

/**
 * Restreindre un périmètre, pour quelques jours ou jusqu'à la levée — identité
 * reconfirmée. Ce qui est déjà engagé continue : la base ne refuse que ce qui
 * commence.
 */
export async function restreindreCompte(p: {
  profil: string;
  portee: PorteeRestriction;
  jours: number | null;
  message: string;
  motif: string;
  cle: string;
}) {
  return geste<SanctionPosee>([CHEMIN, cheminCompte(p.profil)], "bo_utilisateur_restreindre", {
    p_profil: p.profil,
    p_portee: p.portee,
    p_jours: p.jours,
    p_message: p.message,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

/**
 * Suspendre : plus rien ne commence, et les annonces quittent la vitrine.
 * Identité reconfirmée ; les transactions en cours vont au bout.
 */
export async function suspendreCompte(p: { profil: string; jours: number | null; message: string; motif: string; cle: string }) {
  return geste<SanctionPosee>([CHEMIN, cheminCompte(p.profil), TABLEAU], "bo_utilisateur_suspendre", {
    p_profil: p.profil,
    p_jours: p.jours,
    p_message: p.message,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

/** Lever une restriction ou une suspension en cours. La personne en est prévenue. */
export async function leverSanction(p: { sanction: string; profil: string; motif: string; cle: string }) {
  return geste<{ sanction: string; profil: string; levee: boolean }>(
    [CHEMIN, cheminCompte(p.profil), TABLEAU],
    "bo_restriction_lever",
    { p_restriction: p.sanction, p_motif: p.motif, p_cle: p.cle },
  );
}

/**
 * Examiner un recours — identité reconfirmée, jamais par l'auteur de la
 * décision. Accepté, la décision est annulée, et levée si elle court encore ;
 * rejeté, elle est maintenue. La réponse part à la personne, le motif reste au
 * journal de l'équipe ; le dossier « À traiter » se clôt.
 */
export async function examinerRecours(p: {
  recours: string;
  profil: string;
  decision: DecisionRecours;
  reponse: string;
  motif: string;
  cle: string;
}) {
  return geste<RecoursExamine>([CHEMIN, cheminCompte(p.profil), TABLEAU, "/a-traiter"], "bo_recours_examiner", {
    p_recours: p.recours,
    p_decision: p.decision,
    p_reponse: p.reponse,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

/**
 * Reconnaître un vendeur professionnel, ou ne plus le présenter comme tel : la
 * mention publique et la marque vérifiée bougent ensemble, identité reconfirmée,
 * la personne prévenue. Une décision qui changerait les règles d'une vente en
 * cours (l'attestation de vente) est refusée : elle attend la fin de la vente.
 */
export async function deciderProfessionnel(p: { profil: string; professionnel: boolean; motif: string; cle: string }) {
  return geste<ProfessionnelDecide>([CHEMIN, cheminCompte(p.profil)], "bo_utilisateur_professionnel", {
    p_profil: p.profil,
    p_professionnel: p.professionnel,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

/**
 * Autoriser un terme réservé — avec le pseudonyme convenu avec la personne,
 * posé dans le même geste —, ou retirer l'autorisation — avec un pseudonyme
 * ordinaire quand l'actuel emploie un terme réservé. Les insultes et les
 * doublons restent refusés ; la personne est prévenue.
 */
export async function deciderNomReserve(p: {
  profil: string;
  autoriser: boolean;
  pseudo: string | null;
  motif: string;
  cle: string;
}) {
  return geste<NomReserveDecide>([CHEMIN, cheminCompte(p.profil)], "bo_utilisateur_nom_reserve", {
    p_profil: p.profil,
    p_autoriser: p.autoriser,
    p_pseudo: p.pseudo,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

/**
 * Demander une vérification : le message part dans le fil de la personne avec
 * le support, au nom de HandtoHand, avec un avis ; un dossier « À traiter »
 * attend sa réponse, au nom de l'équipier.
 */
export async function demanderVerification(p: { profil: string; objet: ObjetVerification; texte: string; cle: string }) {
  return geste<VerificationDemandee>([CHEMIN, cheminCompte(p.profil), "/a-traiter"], "bo_verification_demander", {
    p_profil: p.profil,
    p_objet: p.objet,
    p_texte: p.texte,
    p_cle: p.cle,
  });
}

/**
 * Clore une demande de vérification — vérification faite, ou sans suite — et
 * son dossier avec elle. La décision qui en découle reste un geste à part.
 */
export async function cloreVerification(p: {
  demande: string;
  profil: string;
  issue: "verifiee" | "sans_suite";
  motif: string;
  cle: string;
}) {
  return geste<VerificationClose>([CHEMIN, cheminCompte(p.profil), "/a-traiter"], "bo_verification_clore", {
    p_demande: p.demande,
    p_issue: p.issue,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}
