import "server-only";
import { reverificationError } from "@clerk/nextjs/server";
import { REVERIFICATION_BO } from "@/lib/connexion/reverification";
import { revalidatePath } from "next/cache";
import { refusEnResultat, rpc, RefusBO, type AppelRpc, type Resultat } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";

/**
 * Un geste du back-office : l'appel à la base au nom de l'équipier, puis le
 * rafraîchissement des pages qui en montrent l'effet.
 *
 * ⚠️ CHAQUE GESTE ARRIVE AVEC SA CLÉ, TIRÉE AU CLIC PAR L'ÉCRAN. La base
 * (`app.bo_une_fois`) rend le résultat déjà obtenu si la même clé revient : un
 * double clic ou une requête rejouée ne font jamais deux fois la même chose.
 *
 * 🔴 `BO_REVERIF` N'EST PAS UNE ERREUR À AFFICHER : c'est la base qui exige un
 * second facteur de moins de dix minutes. On le traduit en
 * `reverificationError(REVERIFICATION_BO)` — exactement cela, pas davantage —,
 * que `useReverification` côté écran transforme en fenêtre de vérification
 * (la nôtre, `VerificationIdentite`), puis en nouvel essai avec un jeton neuf.
 *
 * ⚠️ PAS DE `"use server"` ICI : ce module n'est pas une action, il en aide
 * plusieurs. Marqué ainsi, chacune de ses exportations deviendrait un point
 * d'entrée appelable depuis le navigateur.
 */
export async function geste<T>(
  chemins: string[],
  ...appel: AppelRpc
): Promise<Resultat<T> | ReturnType<typeof reverificationError>> {
  try {
    const donnees = await rpc<T>(await supabaseServeur(), ...appel);
    for (const c of chemins) revalidatePath(c);
    return { ok: true, donnees };
  } catch (e) {
    if (e instanceof RefusBO && e.indice === "BO_REVERIF") return reverificationError(REVERIFICATION_BO);
    // 🔴 L'ÉTAT A CHANGÉ SOUS NOS YEUX : l'écran doit relire, pas seulement
    // afficher le refus.
    if (e instanceof RefusBO && e.indice === "BO_ETAT_CHANGE") for (const c of chemins) revalidatePath(c);
    return refusEnResultat(e);
  }
}
