"use server";

import { geste } from "@/lib/db/geste";
import { cheminCompte, type PorteeRestriction, type SanctionPosee } from "./types";

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
