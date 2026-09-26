"use client";

import { ilYA, type EtatSynchro } from "@/lib/activite/temps";
import { estEnDirect, useTempsReel } from "./TempsReel";

const COULEUR: Record<EtatSynchro, string> = {
  a_jour: "var(--h2h-success)",
  degrade: "var(--h2h-warning)",
  perime: "var(--h2h-error)",
};
const LIBELLE: Record<EtatSynchro, string> = { a_jour: "À jour", degrade: "Lecture ralentie", perime: "Plus à jour" };

/**
 * La dernière synchronisation, toujours visible (§4 : « indication de la
 * dernière synchronisation », « avertissement si les données ne sont plus
 * actualisées »). Activité en direct et la fiche complète la montrent pareil.
 *
 * « En direct » : le canal du temps réel porte, et ce qui bouge se relit
 * aussitôt. Sans lui, la relecture périodique continue — l'écran le dit.
 */
export function IndicateurSynchro({ etat, derniere, maintenant }: { etat: EtatSynchro; derniere: number; maintenant: number }) {
  const direct = estEnDirect(useTempsReel(), maintenant);
  return (
    <span className="inline-flex items-center gap-2 text-legende text-muted-foreground" aria-live="polite">
      <span className="size-2 rounded-full" style={{ backgroundColor: COULEUR[etat] }} aria-hidden />
      <span>
        <span className="font-semibold text-foreground">{LIBELLE[etat]}</span>
        {derniere > 0 && ` · synchronisé ${ilYA(derniere, maintenant)}`}
        {direct ? " · en direct" : " · relu toutes les 15 s"}
      </span>
    </span>
  );
}
