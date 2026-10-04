"use server";

import type { Json } from "@/lib/db/contrat/database.types";
import { geste } from "@/lib/db/geste";
import type { ChangementDemande, Ecart, TableReglage } from "./types";

const CHEMINS = ["/documents-et-parametres", "/equipe-et-audit"];

/**
 * Demander un changement de réglage : la seconde personne de la Direction le valide dans
 * « Validations ». La base contrôle chaque valeur — bornes, unité, réglage ouvert, valeurs qui vont
 * ensemble — et ne publie rien avant la validation.
 */
export async function demanderChangement(p: ChangementDemande & { cle: string }) {
  return geste<{ validation: string; statut: "en_attente"; expire_le: string; effet: string | null; changements: Ecart[] }>(
    CHEMINS,
    "bo_parametre_demander",
    {
      p_table: p.table,
      p_changements: p.changements as Json,
      p_effet: p.effet,
      p_motif: p.motif,
      p_cle: p.cle,
    },
  );
}

/** Annuler une version programmée, avant son heure : les règles en vigueur continuent. */
export async function annulerVersionReglage(p: { table: TableReglage; version: number; motif: string; cle: string }) {
  return geste<{ table: string; version: number; annulee: true }>(CHEMINS, "bo_parametre_annuler", {
    p_table: p.table,
    p_version: p.version,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}
