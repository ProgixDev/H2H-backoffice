"use server";

import { geste } from "@/lib/db/geste";

// Une attestation attendue se lit aussi dans l'Activité en direct.
const CHEMINS = ["/transactions", "/activite-en-direct"];

/**
 * Relancer la partie qu'une attestation attend. ⚠️ UN RAPPEL NE DÉPLACE RIEN :
 * ni l'attestation, ni une échéance. Une fois par douze heures au plus.
 */
export async function relancerAttestation(p: { attestation: string; cle: string }) {
  return geste<{ attestation: string; relances: number }>(CHEMINS, "bo_attestation_relancer", {
    p_attestation: p.attestation,
    p_cle: p.cle,
  });
}

/**
 * Demander aux parties de refaire une attestation signée : l'acheteur la
 * remplace depuis l'application, le vendeur la signe à nouveau. ⚠️ L'ÉQUIPE
 * DEMANDE, ELLE N'ÉCRIT RIEN (R11.4) ; son motif reste au journal d'audit.
 */
export async function demanderRemplacement(p: { attestation: string; motif: string; cle: string }) {
  return geste<{ attestation: string; remplacement: "demande" }>(CHEMINS, "bo_attestation_demander_remplacement", {
    p_attestation: p.attestation,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}
