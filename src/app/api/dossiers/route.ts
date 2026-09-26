import { NextResponse, type NextRequest } from "next/server";
import { RefusBO } from "@/lib/db/rpc";
import { compterDossiers, lireDossier, listerDossiers } from "@/lib/dossiers/lectures";
import { filtresFileDepuis } from "@/lib/dossiers/types";

// 🔴 JAMAIS EN CACHE : chaque réponse dépend de l'équipier et de l'instant.
export const dynamic = "force-dynamic";

/**
 * Ce que la page « À traiter » relit toutes les quinze secondes : la file et
 * son bandeau, ou un dossier (`?id=`) avec son journal.
 */
export async function GET(requete: NextRequest) {
  const p = requete.nextUrl.searchParams;
  try {
    const id = p.get("id");
    if (id) return reponse(await lireDossier(id));
    const f = filtresFileDepuis(p);
    const [compteurs, dossiers] = await Promise.all([compterDossiers(f), listerDossiers(f)]);
    return reponse({ compteurs, dossiers });
  } catch (e) {
    if (e instanceof RefusBO) {
      return reponse({ indice: e.indice, message: e.message }, e.indice === "BO_INTROUVABLE" ? 404 : 403);
    }
    return reponse({ indice: "BO_PANNE", message: "Un souci est survenu. Réessayez dans un instant." }, 502);
  }
}

const reponse = (corps: unknown, status = 200) =>
  NextResponse.json(corps, { status, headers: { "cache-control": "no-store" } });
