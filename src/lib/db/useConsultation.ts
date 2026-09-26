"use client";

import { useState } from "react";
import { useReverification } from "@clerk/nextjs";
import { toast } from "sonner";
import { useDemandeVerification } from "@/components/bo/VerificationIdentite";
import type { Resultat } from "@/lib/db/rpc";

// Une action de consultation : ses arguments, et ce qu'elle rend — un résultat,
// ou la demande de vérification que `useReverification` intercepte avant nous.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Action = (args: any) => Promise<unknown>;
/** Les données d'une consultation réussie, lues dans le type de l'action. */
type Donnees<F extends Action> =
  Extract<Awaited<ReturnType<F>>, { ok: true }> extends { donnees: infer T } ? T : never;

/**
 * Une consultation du back-office (révéler une donnée, ouvrir une pièce, lire
 * des échanges) : la vérification d'identité si la base la demande, le refus
 * dit tel quel — et rien d'autre.
 *
 * ⚠️ NI CLÉ, NI RAFRAÎCHISSEMENT : une consultation ne change rien. Elle se
 * journalise côté base, avec son motif ; l'écran garde la réponse pour lui.
 */
export function useConsultation<F extends Action>(action: F) {
  const [enCours, setEnCours] = useState(false);
  const demander = useDemandeVerification();
  const faire = useReverification(action, demander ? { onNeedsReverification: demander } : undefined);

  async function consulter(args: Parameters<F>[0]): Promise<Donnees<F> | null> {
    setEnCours(true);
    try {
      const r = (await faire(...([args] as Parameters<F>))) as Resultat<Donnees<F>> | undefined;
      if (!r) return null;
      if (!r.ok) {
        toast.error(r.message);
        return null;
      }
      return r.donnees;
    } catch {
      // La personne a fermé la vérification d'identité : rien n'a été consulté.
      toast.message("Consultation annulée.");
      return null;
    } finally {
      setEnCours(false);
    }
  }

  return { consulter, enCours };
}
