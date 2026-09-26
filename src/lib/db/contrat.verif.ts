// LA PREUVE QUE LE CONTRAT MORD — vérifiée par `npm run typecheck`, jamais exécutée.
//
// Chaque appel ci-dessous est FAUX et marqué `@ts-expect-error`. Si le typage des
// appels à la base cessait de les refuser (contrat perdu, type trop large), la
// marque deviendrait inutile et la vérification de types échouerait : on ne
// perd pas cette garde en silence.
//
// ⚠️ UN APPEL FAUX PAR LIGNE : la marque ne couvre que la ligne qui la suit, et
// l'erreur se signale sur la propriété fautive.
import type { SupabaseClient } from "@supabase/supabase-js";
import { rpc } from "@/lib/db/rpc";

export function verificationsDuContrat(client: SupabaseClient) {
  const cle = "00000000-0000-0000-0000-000000000000";
  return [
    // @ts-expect-error — une fonction qui n'existe pas dans la base.
    rpc<unknown>(client, "bo_inexistante"),
    // @ts-expect-error — un argument renommé (p_total_cents au lieu de p_total_attendu_cents).
    rpc<unknown>(client, "bo_transporteur_regler", { p_transporteur: "ups", p_reference: "F-1", p_commandes: [], p_total_cents: 1, p_cle: cle }),
    // @ts-expect-error — un argument obligatoire oublié (p_cle).
    rpc<unknown>(client, "bo_hub_retirer", { p_hub_id: "x", p_motif: "doublon" }),
    // Et l'appel juste passe.
    rpc<unknown>(client, "bo_hub_retirer", { p_hub_id: "x", p_motif: "doublon", p_cle: cle }),
  ];
}
