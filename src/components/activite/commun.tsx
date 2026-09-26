"use client";

import { useEffect, useState } from "react";
import type { Ton } from "@/components/bo/StatutPastille";
import type { Operation } from "@/lib/activite/types";

/** Un refus ou une panne de la route `/api/activite`, avec l'indice de la base. */
export class ErreurLecture extends Error {
  constructor(
    message: string,
    readonly indice: string,
    readonly statut: number,
  ) {
    super(message);
  }
}

export async function lireActivite<T>(params: URLSearchParams, signal?: AbortSignal): Promise<T> {
  let r: Response;
  try {
    r = await fetch(`/api/activite?${params}`, { signal, cache: "no-store" });
  } catch (e) {
    if (signal?.aborted) throw e;
    throw new ErreurLecture("Le réseau ne répond pas.", "BO_RESEAU", 0);
  }
  const corps = await r.json().catch(() => null);
  if (!r.ok) {
    throw new ErreurLecture(corps?.message ?? "Un souci est survenu.", corps?.indice ?? "BO_PANNE", r.status);
  }
  return corps as T;
}

/** L'heure courante, qui avance toutes les secondes — les comptes à rebours en vivent. */
export function useMaintenant(pas = 1000): number {
  const [t, setT] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setT(Date.now()), pas);
    return () => clearInterval(id);
  }, [pas]);
  return t;
}

// ⚠️ UNE ISSUE DÉFAVORABLE N'EST JAMAIS VERTE ; une étape terminée est muette.
export function tonEtape(o: Pick<Operation, "etape" | "type">): Ton {
  if (o.etape === "termine") return "muet";
  if (o.type === "litige" || o.type === "incident") return "attention";
  if (o.etape.startsWith("live.")) return "erreur";
  return "marque";
}

export const TON_ALERTE: Record<NonNullable<Operation["alerte"]>, Ton> = {
  erreur: "erreur",
  incident: "attention",
  retard: "actif",
};
