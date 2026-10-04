import { NextResponse, type NextRequest } from "next/server";
import { RefusBO } from "@/lib/db/rpc";
import { lireRemboursementOption } from "@/lib/visibilite/lectures";

// 🔴 JAMAIS EN CACHE : chaque réponse dépend de l'équipier et de l'instant.
export const dynamic = "force-dynamic";

/**
 * Le remboursement d'une option, que la fiche d'un dossier relit : par le dossier
 * d'une rétractation (`?dossier=`), ou par l'option (`?famille=&boost=`).
 */
export async function GET(requete: NextRequest) {
  const p = requete.nextUrl.searchParams;
  try {
    const dossier = p.get("dossier");
    const famille = p.get("famille");
    const boost = p.get("boost");
    if (dossier) return reponse(await lireRemboursementOption({ dossier }));
    if ((famille === "annonce" || famille === "demande") && boost) {
      return reponse(await lireRemboursementOption({ famille, boost }));
    }
    return reponse({ indice: "BO_INTROUVABLE", message: "Cette option est introuvable." }, 404);
  } catch (e) {
    if (e instanceof RefusBO) {
      return reponse({ indice: e.indice, message: e.message }, e.indice === "BO_INTROUVABLE" ? 404 : 403);
    }
    return reponse({ indice: "BO_PANNE", message: "Un souci est survenu. Réessayez dans un instant." }, 502);
  }
}

const reponse = (corps: unknown, status = 200) =>
  NextResponse.json(corps, { status, headers: { "cache-control": "no-store" } });
