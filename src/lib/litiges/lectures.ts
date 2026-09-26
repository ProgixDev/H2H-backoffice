import "server-only";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { CompteMotif, Litige, Signalement } from "./types";

/**
 * Les dossiers de réclamation, avec ce que chacun a déjà rendu et ce qui
 * partirait vraiment si l'on émettait maintenant — et leur dossier : motif,
 * décisions, recours, enquête.
 *
 * ⚠️ UNE SEULE LECTURE. L'écran mobile reconstituait ces montants dossier par
 * dossier ; la base les calcule avec la formule même de l'émission — un écran
 * qui annoncerait un autre montant que celui qui part ferait mentir la
 * confirmation.
 */
export async function listerLitiges(): Promise<Litige[]> {
  return rpc<Litige[]>(await supabaseServeur(), "bo_litiges_lister");
}

/** Les onze motifs du cahier des charges, et les dossiers ouverts sous chacun. */
export async function compterMotifs(): Promise<CompteMotif[]> {
  return rpc<CompteMotif[]>(await supabaseServeur(), "bo_litiges_motifs");
}

/** Les incidents de co-livraison et les signalements, d'un motif (ou de tous). */
export async function listerSignalements(motif: string | null): Promise<Signalement[]> {
  return rpc<Signalement[]>(await supabaseServeur(), "bo_signalements_lister", { p_motif: motif });
}
