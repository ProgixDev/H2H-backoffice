"use server";

import { geste } from "@/lib/db/geste";
import type { Canal, Decision, GenreDossier, IssueEnquete, Partie } from "./types";

const CHEMIN = "/litiges-et-signalements";
// Un recours se voit aussi dans l'Activité en direct (étape « Recours à
// examiner ») et dans « À traiter » (« Contestations à examiner »).
const CHEMINS = [CHEMIN, "/activite-en-direct", "/a-traiter"];

/**
 * Arbitrer un dossier. La base décide du montant d'un remboursement intégral,
 * refuse un partiel qui n'en est pas un, prévient les deux parties et
 * inscrit la décision à l'historique du dossier.
 *
 * ⚠️ UNE DÉCISION RENDUE NE SE REVOIT QU'APRÈS UN RECOURS RECEVABLE, et le
 * remboursement décidé se demande ensuite comme un ordre financier
 * (`demanderRemboursement`, dans `lib/paiements/actions.ts`).
 */
export async function deciderLitige(p: {
  dossier: string;
  decision: Decision;
  montantCents: number | null;
  motif: string;
  phaseAttendue: string;
  cle: string;
}) {
  return geste<{ a_rembourser_cents: number; rang: number }>(CHEMINS, "bo_litige_decider", {
    p_claim_id: p.dossier,
    p_decision: p.decision,
    p_montant_cents: p.montantCents,
    p_motif: p.motif,
    p_phase_attendue: p.phaseAttendue,
    p_cle: p.cle,
  });
}

/** Ranger un dossier sous l'un des onze motifs. La qualification précédente reste au dossier. */
export async function qualifierDossier(p: {
  genre: GenreDossier;
  objet: string;
  motif: string;
  justification: string;
  cle: string;
}) {
  return geste<{ motif: string; avant: string | null }>(CHEMINS, "bo_litige_qualifier", {
    p_genre: p.genre,
    p_objet: p.objet,
    p_motif: p.motif,
    p_justification: p.justification,
    p_cle: p.cle,
  });
}

/**
 * Enregistrer le recours d'une partie contre la dernière décision, depuis le
 * canal où l'équipe l'a reçu. ⚠️ Une trace de l'équipe, résumée : jamais une
 * déclaration prêtée à la partie.
 */
export async function enregistrerRecours(p: { dossier: string; partie: Partie; canal: Canal; texte: string; cle: string }) {
  return geste<{ recours: string; statut: string; decision: number }>(CHEMINS, "bo_litige_recours_enregistrer", {
    p_claim: p.dossier,
    p_partie: p.partie,
    p_canal: p.canal,
    p_texte: p.texte,
    p_cle: p.cle,
  });
}

/**
 * Examiner un recours — jamais par l'auteur de la décision contestée.
 * Recevable : le dossier se rouvre pour la décision suivante.
 */
export async function examinerRecours(p: { recours: string; recevable: boolean; motif: string; cle: string }) {
  return geste<{ recours: string; statut: string }>(CHEMINS, "bo_litige_recours_examiner", {
    p_recours: p.recours,
    p_recevable: p.recevable,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

/** Ouvrir une enquête chez le transporteur tiers de la commande. */
export async function ouvrirEnquete(p: {
  dossier: string;
  reference: string;
  echeance: string | null;
  note: string;
  cle: string;
}) {
  return geste<{ enquete: string; statut: string }>(CHEMINS, "bo_enquete_ouvrir", {
    p_claim: p.dossier,
    p_reference: p.reference,
    p_echeance: p.echeance,
    p_note: p.note || null,
    p_cle: p.cle,
  });
}

/** Conclure l'enquête : son issue précise le motif du dossier. */
export async function conclureEnquete(p: { enquete: string; issue: IssueEnquete; conclusion: string; cle: string }) {
  return geste<{ enquete: string; issue: string; motif: string | null }>(CHEMINS, "bo_enquete_conclure", {
    p_enquete: p.enquete,
    p_issue: p.issue,
    p_conclusion: p.conclusion,
    p_cle: p.cle,
  });
}
