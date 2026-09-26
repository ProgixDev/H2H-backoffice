import { NextResponse, type NextRequest } from "next/server";
import { RefusBO } from "@/lib/db/rpc";
import { lireOperation } from "@/lib/operations/lectures";
import type { ObjetFiche } from "@/lib/operations/types";

// 🔴 JAMAIS EN CACHE : chaque réponse dépend de l'équipier et de l'instant.
export const dynamic = "force-dynamic";

const TABLES: readonly ObjetFiche[] = ["orders", "courtage_listings", "live_sessions"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Ce que la fiche complète relit toutes les quinze secondes : l'opération
 * `?table=&id=`, tous ses onglets ouverts à l'équipier.
 */
export async function GET(requete: NextRequest) {
  const p = requete.nextUrl.searchParams;
  const table = p.get("table") as ObjetFiche | null;
  const id = p.get("id");
  if (!table || !TABLES.includes(table) || !id || !UUID.test(id)) {
    return reponse({ indice: "BO_INTROUVABLE", message: "Cette opération est introuvable." }, 404);
  }
  try {
    return reponse(await lireOperation(table, id));
  } catch (e) {
    if (e instanceof RefusBO) {
      return reponse({ indice: e.indice, message: e.message }, e.indice === "BO_INTROUVABLE" ? 404 : 403);
    }
    return reponse({ indice: "BO_PANNE", message: "Un souci est survenu. Réessayez dans un instant." }, 502);
  }
}

const reponse = (corps: unknown, status = 200) =>
  NextResponse.json(corps, { status, headers: { "cache-control": "no-store" } });
