"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { ciblesDe, concerne, TOUT, type Cible, type EtatTempsReel } from "@/lib/temps-reel/regles";

export { estEnDirect } from "@/lib/temps-reel/regles";

// ── Le temps réel du back-office ────────────────────────────────────────────
//
// Un seul canal par écran ouvert : le canal PRIVÉ du monde de l'équipier
// (`bo:activite:reel` ou `bo:activite:test`). La base y annonce qu'une
// opération a bougé, que la file « À traiter » a changé, et bat chaque minute.
//
// 🔴 LE TEMPS RÉEL ACCÉLÈRE, IL NE DÉCIDE RIEN. Un message ne porte que des
// identifiants : il déclenche une relecture, sous les droits de l'équipier. La
// relecture périodique reste, au cas où le canal se tairait.

const Contexte = createContext<EtatTempsReel>({ connecte: false, dernierSigne: null });

/** Ce que sait l'écran du temps réel. */
export function useTempsReel(): EtatTempsReel {
  return useContext(Contexte);
}

// ⚠️ UNE RAFALE, UNE RELECTURE : la synchronisation de la file peut toucher
// plusieurs dossiers d'un coup, un paiement plusieurs lignes du journal.
const DELAI_RELECTURE = 600;

/**
 * Le canal de l'équipier, pour toutes les rubriques. Il relit ce qui a bougé
 * — Activité en direct, « À traiter », la fiche de l'opération concernée — et
 * dit s'il porte encore.
 *
 * ⚠️ LE JETON EST CELUI DE LA SESSION, RENOUVELÉ PAR LE CLIENT à chaque
 * battement du canal : un jeton Clerk ne vit qu'une minute.
 */
export function FournisseurTempsReel({
  monde,
  ecoute,
  children,
}: {
  monde: "reel" | "test";
  /** L'équipier lit l'activité : sans cela, la base refuserait l'écoute. */
  ecoute: boolean;
  children: React.ReactNode;
}) {
  const { getToken } = useAuth();
  const jeton = useRef(getToken);
  useEffect(() => {
    jeton.current = getToken;
  }, [getToken]);
  const client = useQueryClient();
  const [etat, setEtat] = useState<EtatTempsReel>({ connecte: false, dernierSigne: null });

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const cle = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!ecoute || !url || !cle) return;

    const supabase = createClient(url, cle, { accessToken: async () => (await jeton.current()) ?? null });
    const aRelire = new Set<Cible>();
    let minuteur: ReturnType<typeof setTimeout> | null = null;
    const relire = (cibles: Cible[]) => {
      if (cibles.length === 0) return;
      for (const c of cibles) aRelire.add(c);
      if (minuteur) return;
      minuteur = setTimeout(() => {
        minuteur = null;
        const lot = new Set(aRelire);
        aRelire.clear();
        void client.invalidateQueries({ predicate: (q) => concerne(q.queryKey, lot) });
      }, DELAI_RELECTURE);
    };

    let deja = false;
    const canal = supabase
      .channel(`bo:activite:${monde}`, { config: { private: true } })
      .on("broadcast", { event: "*" }, ({ event, payload }) => {
        setEtat((e) => ({ ...e, dernierSigne: Date.now() }));
        relire(ciblesDe(event, payload));
      })
      .subscribe((statut) => {
        const connecte = statut === "SUBSCRIBED";
        setEtat((e) => ({ ...e, connecte }));
        // ⚠️ UNE RECONNEXION PEUT AVOIR MANQUÉ DES MESSAGES : on relit tout ce qui est ouvert.
        if (connecte && deja) relire(TOUT);
        if (connecte) deja = true;
      });

    return () => {
      if (minuteur) clearTimeout(minuteur);
      void supabase.removeChannel(canal).finally(() => supabase.realtime.disconnect());
      setEtat({ connecte: false, dernierSigne: null });
    };
  }, [monde, ecoute, client]);

  return <Contexte.Provider value={etat}>{children}</Contexte.Provider>;
}
