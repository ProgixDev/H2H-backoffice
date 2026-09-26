"use server";

import { geste } from "@/lib/db/geste";
import type { Decision } from "./types";

const CHEMIN = "/litiges-et-signalements";

/**
 * Arbitrer un dossier. La base décide du montant d'un remboursement intégral,
 * refuse un partiel qui n'en est pas un, prévient les deux parties et
 * journalise le motif.
 *
 * ⚠️ LE REMBOURSEMENT DÉCIDÉ SE DEMANDE ENSUITE, comme un ordre financier
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
  return geste<{ a_rembourser_cents: number }>([CHEMIN], "bo_litige_decider", {
    p_claim_id: p.dossier,
    p_decision: p.decision,
    p_montant_cents: p.montantCents,
    p_motif: p.motif,
    p_phase_attendue: p.phaseAttendue,
    p_cle: p.cle,
  });
}
