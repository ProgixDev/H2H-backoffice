"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useReverification } from "@clerk/nextjs";
import { toast } from "sonner";
import type { Resultat } from "@/lib/db/rpc";

// Ce que rend une action serveur du back-office : un résultat, ou la demande
// de vérification que `useReverification` intercepte avant nous.
type Action<A, T> = (args: A) => Promise<Resultat<T> | unknown>;

/**
 * Enveloppe un geste du back-office : vérification d'identité si la base la
 * demande, clé « une seule fois » tirée au clic, message, rafraîchissement.
 *
 * ⚠️ LA CLÉ EST TIRÉE UNE FOIS PAR CLIC, PAS PAR ESSAI. Si la vérification
 * d'identité relance le geste, c'est la même clé qui repart : la base rend le
 * premier résultat au lieu de refaire l'action.
 */
export function useGeste<A extends { cle: string }, T>(action: Action<A, T>) {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);
  const faire = useReverification(action);

  async function lancer(args: Omit<A, "cle">, succes: string): Promise<Resultat<T> | null> {
    setEnCours(true);
    try {
      const r = (await faire({ ...args, cle: crypto.randomUUID() } as A)) as Resultat<T> | undefined;
      if (!r) return null;
      if (r.ok) {
        const d = r.donnees as { ok?: boolean; raison?: string } | undefined;
        // Une validation peut « réussir » à s'exécuter… et constater que l'état
        // a changé : la base le dit sans lever (`{ ok: false, raison }`).
        if (d && d.ok === false) {
          toast.error(d.raison === "BO_ETAT_CHANGE"
            ? "La situation a changé depuis la demande : rien n'a été exécuté."
            : d.raison === "BO_EXPIREE" ? "Cette demande a expiré." : "La demande n'a pas pu être exécutée.");
        } else {
          toast.success(succes);
        }
        router.refresh();
      } else {
        toast.error(r.message);
      }
      return r;
    } catch {
      // La personne a fermé la vérification d'identité : rien n'est parti.
      toast.message("Action annulée.");
      return null;
    } finally {
      setEnCours(false);
    }
  }

  return { lancer, enCours };
}
