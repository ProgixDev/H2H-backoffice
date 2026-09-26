"use server";

import { geste } from "@/lib/db/geste";
import type { Priorite } from "./types";

// La file et l'activité montrent toutes deux l'effet d'un geste.
const CHEMINS = ["/a-traiter", "/activite-en-direct"];

type Retour = { dossier: string };

/** M'attribuer (`responsable` nul) ou réattribuer. `attendu` : qui l'avait à l'affichage. */
export async function attribuerDossier(p: { dossier: string; responsable: string | null; attendu: string | null; cle: string }) {
  return geste<Retour>(CHEMINS, "bo_dossier_attribuer", {
    p_id: p.dossier,
    p_responsable: p.responsable,
    p_responsable_attendu: p.attendu,
    p_cle: p.cle,
  });
}

export async function prioriserDossier(p: { dossier: string; priorite: Priorite; motif: string; cle: string }) {
  return geste<Retour>(CHEMINS, "bo_dossier_prioriser", {
    p_id: p.dossier,
    p_priorite: p.priorite,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

/** Une note INTERNE : aucun utilisateur ne la reçoit. */
export async function noterDossier(p: { dossier: string; texte: string; cle: string }) {
  return geste<Retour>(CHEMINS, "bo_dossier_noter", { p_id: p.dossier, p_texte: p.texte, p_cle: p.cle });
}

/** Une demande de preuve : elle PART au participant, par notification. */
export async function demanderPreuve(p: { dossier: string; destinataire: string; message: string; cle: string }) {
  return geste<Retour>(CHEMINS, "bo_dossier_demander_preuve", {
    p_id: p.dossier,
    p_destinataire: p.destinataire,
    p_message: p.message,
    p_cle: p.cle,
  });
}

export async function escaladerDossier(p: { dossier: string; vers: string; motif: string; cle: string }) {
  return geste<Retour>(CHEMINS, "bo_dossier_escalader", {
    p_id: p.dossier,
    p_vers: p.vers,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

/** « Créer un ticket » — la base rend le dossier existant plutôt qu'un doublon. */
export async function ouvrirDossier(p: {
  objetTable: string | null;
  objetId: string | null;
  titre: string | null;
  motif: string;
  priorite: Priorite;
  securite: boolean;
  attribuer: boolean;
  cle: string;
}) {
  return geste<Retour & { existant: boolean }>(CHEMINS, "bo_dossier_ouvrir", {
    p_objet_table: p.objetTable,
    p_objet_id: p.objetId,
    p_titre: p.titre,
    p_motif: p.motif,
    p_priorite: p.priorite,
    p_securite: p.securite,
    p_attribuer: p.attribuer,
    p_cle: p.cle,
  });
}

/** Clore un ticket manuel (un dossier automatique se clôt tout seul). */
export async function cloreDossier(p: { dossier: string; motif: string; cle: string }) {
  return geste<Retour>(CHEMINS, "bo_dossier_clore", { p_id: p.dossier, p_motif: p.motif, p_cle: p.cle });
}
