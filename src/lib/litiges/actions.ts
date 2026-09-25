"use server";

import { reverificationError } from "@clerk/nextjs/server";
import { REVERIFICATION_BO } from "@/lib/connexion/reverification";
import { revalidatePath } from "next/cache";
import { geste } from "@/lib/db/geste";
import type { Resultat } from "@/lib/db/rpc";
import { fonctionEdge } from "@/lib/supabase/serveur";
import type { Decision } from "./types";

const CHEMIN = "/litiges-et-signalements";

/**
 * Arbitrer un dossier. La base décide du montant d'un remboursement intégral,
 * refuse un partiel qui n'en est pas un, prévient les deux parties et
 * journalise le motif.
 */
export async function deciderLitige(p: {
  dossier: string;
  decision: Decision;
  montantCents: number | null;
  motif: string;
  phaseAttendue: string;
  cle: string;
}) {
  return geste<{ a_rembourser_cents: number }>("bo_litige_decider", {
    p_claim_id: p.dossier,
    p_decision: p.decision,
    p_montant_cents: p.montantCents,
    p_motif: p.motif,
    p_phase_attendue: p.phaseAttendue,
    p_cle: p.cle,
  }, [CHEMIN]);
}

type ReponseRemboursement = {
  rembourse?: boolean;
  montantCents?: number;
  remboursement?: string;
  erreur?: string;
  motif?: string | null;
};

/**
 * Émettre le remboursement décidé sur un dossier — par `stripe-remboursement`,
 * la même fonction que l'écran mobile : c'est elle qui parle à Stripe.
 *
 * ⚠️ LA CLÉ DU CLIC N'EST PAS TRANSMISE, ET C'EST VOULU. Le double envoi est
 * tenu plus bas : la base réserve le remboursement avant tout appel à Stripe,
 * et la clé d'idempotence Stripe est celle de la réservation. Un second clic
 * retrouve la même réservation au lieu d'en ouvrir une autre.
 */
export async function emettreRemboursement(p: { dossier: string; cle: string }) {
  const r = await fonctionEdge<ReponseRemboursement>("stripe-remboursement", { claimId: p.dossier });
  if (!r) {
    return { ok: false, indice: "BO_PANNE", message: "Un souci est survenu. Réessayez dans un instant." } as Resultat<never>;
  }
  if (r.corps?.motif === "BO_REVERIF") return reverificationError(REVERIFICATION_BO);
  // L'état a pu changer dans tous les cas (réservation ouverte, libérée, écrite).
  revalidatePath(CHEMIN);
  if (r.statut >= 200 && r.statut < 300 && r.corps?.rembourse) {
    return {
      ok: true,
      donnees: { montantCents: r.corps.montantCents ?? 0, reference: r.corps.remboursement ?? "" },
    } as Resultat<{ montantCents: number; reference: string }>;
  }
  return {
    ok: false,
    indice: r.corps?.motif ?? null,
    message: r.corps?.erreur ?? "Un souci est survenu. Réessayez dans un instant.",
  } as Resultat<never>;
}
