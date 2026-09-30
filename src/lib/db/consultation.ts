import "server-only";
import { reverificationError } from "@clerk/nextjs/server";
import { REVERIFICATION_BO } from "@/lib/connexion/reverification";
import { refusEnResultat, RefusBO, type Resultat } from "@/lib/db/rpc";

/**
 * Une consultation du back-office : révéler une donnée, ouvrir une pièce, lire
 * des échanges, retrouver un compte par son e-mail.
 *
 * 🔴 UNE CONSULTATION N'EST PAS UN GESTE : elle ne change rien, donc ni clé
 * « une seule fois », ni page à rafraîchir. Mais elle se JOURNALISE, avec son
 * motif : c'est la base qui l'écrit, au nom de l'équipier du jeton.
 *
 * ⚠️ LE SECOND FACTEUR SE DEMANDE COMME POUR UN GESTE : `BO_REVERIF` devient la
 * fenêtre de vérification, puis un nouvel essai.
 *
 * ⚠️ PAS DE `"use server"` ICI : ce module n'est pas une action, il en aide
 * plusieurs (même règle que `geste.ts`).
 */
export async function consulter<T>(lire: () => Promise<T>) {
  try {
    return { ok: true, donnees: await lire() } satisfies Resultat<T>;
  } catch (e) {
    if (e instanceof RefusBO && e.indice === "BO_REVERIF") return reverificationError(REVERIFICATION_BO);
    return refusEnResultat(e);
  }
}
