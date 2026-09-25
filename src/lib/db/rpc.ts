import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Un refus de la base, avec l'INDICE qu'elle y attache.
 *
 * 🔴 L'ÉCRAN LIT L'INDICE, PAS LE MESSAGE. `BO_REVERIF` appelle une nouvelle
 * vérification d'identité, `BO_ETAT_CHANGE` un rechargement, `BO_QUATRE_YEUX`
 * une explication. Même règle que l'application (`RefusAttestation`).
 */
export class RefusBO extends Error {
  constructor(
    message: string,
    readonly indice: string | null,
    readonly code: string | null,
  ) {
    super(message);
    this.name = "RefusBO";
  }
}

export async function rpc<T>(
  client: SupabaseClient,
  nom: string,
  args?: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await client.rpc(nom, args);
  if (error) throw new RefusBO(error.message, error.hint || null, error.code || null);
  return data as T;
}

/** Ce qu'une action du back-office rend à l'écran : jamais une exception. */
export type Resultat<T> =
  | { ok: true; donnees: T }
  | { ok: false; indice: string | null; message: string };

export function refusEnResultat(e: unknown): Resultat<never> {
  if (e instanceof RefusBO) return { ok: false, indice: e.indice, message: e.message };
  // ⚠️ UNE PANNE N'EST PAS UN REFUS. On ne montre pas son détail technique,
  // mais on ne la déguise pas non plus en « non autorisé ».
  return { ok: false, indice: "BO_PANNE", message: "Un souci est survenu. Réessayez dans un instant." };
}
