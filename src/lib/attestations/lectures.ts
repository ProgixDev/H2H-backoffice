import "server-only";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { AttestationLigne, FiltreAttestation } from "./types";

/**
 * Les attestations de vente (§11) : la version courante de chaque achat, sous
 * les mots du cahier des charges, et toutes ses versions comparables.
 */
export async function listerAttestations(filtre: FiltreAttestation | null, test: boolean): Promise<AttestationLigne[]> {
  return rpc<AttestationLigne[]>(await supabaseServeur(), "bo_attestations_lister", {
    p_filtre: filtre,
    p_inclure_test: test,
  });
}
