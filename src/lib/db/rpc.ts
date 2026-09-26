import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/contrat/database.types";

// ── Le contrat avec la base ─────────────────────────────────────────────────
//
// 🔴 LE NOM ET LES ARGUMENTS D'UN APPEL SE VÉRIFIENT À LA COMPILATION, contre
// les types générés dans hand-to-hand (`npm run sync:contrat`). Un argument
// renommé ou ajouté là-bas casse la vérification de types ici, pas la
// production.
//
// ⚠️ LES VALEURS PEUVENT ÊTRE NULLES. Les types générés ne le disent pas pour un
// paramètre, mais la base l'accepte (motif absent, repère facultatif…) : ce qui
// dérive entre deux dépôts, ce sont les NOMS, et c'est eux qu'on tient.
type Fonctions = Database["public"]["Functions"];
export type NomRpc = keyof Fonctions & string;
type ArgsBruts<N extends NomRpc> = Fonctions[N] extends { Args: infer A } ? A : never;
type Nullables<A> = { [K in keyof A]: A[K] | null };

/** Un appel à la base : son nom, puis ses arguments s'il en a. */
export type AppelRpc = {
  [N in NomRpc]: [ArgsBruts<N>] extends [never]
    ? [nom: N]
    : [nom: N, args: Nullables<ArgsBruts<N>>];
}[NomRpc];

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

export async function rpc<T>(client: SupabaseClient, ...appel: AppelRpc): Promise<T> {
  const [nom, args] = appel as [string, Record<string, unknown> | undefined];
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
