import "server-only";
import { auth } from "@clerk/nextjs/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CLE_PUBLIABLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Le client Supabase d'une requête du back-office, AU NOM DE L'ÉQUIPIER.
 *
 * 🔴 LE JETON DE SESSION CLERK, PAS LE MODÈLE `supabase` DES APPLICATIONS. Le
 * modèle ne peut pas porter `fva` (l'âge du second facteur), `azp` ni `sts` :
 * sans eux, la base ne pourrait vérifier ni la double authentification ni
 * l'origine. Le jeton de session porte déjà `role: authenticated` sur les deux
 * instances (réglage vérifié le 25/09/2026 avec `clerk config pull`).
 *
 * ⚠️ JAMAIS LA CLÉ DE SERVICE. Toute autorisation se décide dans la base, sur
 * le jeton de l'appelant : sous la clé de service, `app.uid()` serait nul et
 * chaque contrôle refuserait — ou, pire, un raccourci serait tentant.
 */
/**
 * Appelle une fonction Edge du projet AU NOM DE L'ÉQUIPIER, depuis le serveur.
 *
 * ⚠️ JAMAIS DEPUIS LE NAVIGATEUR : les fonctions Edge ne répondent à aucun
 * CORS, et c'est voulu. D'ici, c'est un appel de serveur à serveur.
 *
 * 🔴 LE JETON DE SESSION DE L'ÉQUIPIER, comme pour la base : la fonction relit
 * tout sous ce jeton (permission, double authentification, conflit d'intérêts).
 * Rend le statut HTTP et le corps JSON, tels quels ; `null` si le réseau a
 * failli — une panne, pas un refus.
 */
export async function fonctionEdge<T>(
  nom: string,
  corps: Record<string, unknown>,
): Promise<{ statut: number; corps: T | null } | null> {
  if (!URL_SUPABASE) throw new Error("NEXT_PUBLIC_SUPABASE_URL manquante");
  const { getToken } = await auth();
  const jeton = await getToken();
  try {
    const r = await fetch(`${URL_SUPABASE}/functions/v1/${nom}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${jeton ?? ""}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(corps),
      cache: "no-store",
    });
    return { statut: r.status, corps: (await r.json().catch(() => null)) as T | null };
  } catch {
    return null;
  }
}

export async function supabaseServeur(): Promise<SupabaseClient> {
  if (!URL_SUPABASE || !CLE_PUBLIABLE) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY manquantes");
  }
  const { getToken } = await auth();
  return createClient(URL_SUPABASE, CLE_PUBLIABLE, {
    // Le jeton vit 60 secondes : on le demande à chaque appel, sans le garder.
    accessToken: async () => (await getToken()) ?? null,
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
