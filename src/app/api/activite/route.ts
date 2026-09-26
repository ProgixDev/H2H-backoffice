import { NextResponse, type NextRequest } from "next/server";
import {
  compterOperations,
  listerEcheances,
  listerEvenements,
  listerOperations,
  listerReglesDelai,
  listerTaches,
} from "@/lib/activite/lectures";
import { filtresDepuis } from "@/lib/activite/types";
import { RefusBO } from "@/lib/db/rpc";

// 🔴 JAMAIS EN CACHE : chaque réponse dépend de l'équipier et de l'instant.
export const dynamic = "force-dynamic";

/**
 * Ce que la page « Activité en direct » relit toutes les quinze secondes.
 *
 * ⚠️ UNE ROUTE, PAS UNE ACTION SERVEUR : Next.js exécute les actions serveur
 * l'une après l'autre. Une relecture lente ferait attendre le geste d'un
 * équipier derrière elle.
 */
export async function GET(requete: NextRequest) {
  const p = requete.nextUrl.searchParams;
  const filtres = filtresDepuis(p);
  try {
    if (p.get("vue") === "echeances") {
      const [echeances, regles] = await Promise.all([listerEcheances(filtres.inclureTest), listerReglesDelai()]);
      return reponse({ echeances, regles });
    }
    if (p.get("vue") === "taches") {
      return reponse({ taches: await listerTaches() });
    }
    if (p.get("vue") === "evenements") {
      const avant = Number(p.get("avant"));
      const evenements = await listerEvenements({
        inclureTest: filtres.inclureTest,
        objet: p.get("objet"),
        avant: Number.isSafeInteger(avant) && avant > 0 ? avant : null,
      });
      return reponse({ evenements });
    }
    const [compteurs, operations] = await Promise.all([
      compterOperations(filtres.inclureTest),
      listerOperations(filtres),
    ]);
    return reponse({ compteurs, operations });
  } catch (e) {
    // ⚠️ UNE PANNE N'EST PAS UN REFUS, ET L'ÉCRAN DOIT POUVOIR LES DISTINGUER.
    if (e instanceof RefusBO) {
      return reponse({ indice: e.indice, message: e.message }, e.indice === "BO_INTROUVABLE" ? 404 : 403);
    }
    return reponse({ indice: "BO_PANNE", message: "Un souci est survenu. Réessayez dans un instant." }, 502);
  }
}

const reponse = (corps: unknown, status = 200) =>
  NextResponse.json(corps, { status, headers: { "cache-control": "no-store" } });
