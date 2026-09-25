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
