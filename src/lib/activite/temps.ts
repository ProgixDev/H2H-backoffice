// Le temps tel que l'équipe le lit : « dans 12 min », « dépassée de 2 h »,
// « il y a 30 s ». Des fonctions pures — l'heure courante leur est donnée,
// calée sur l'horloge de la base.

import { anneeParis, enHeureDeParis } from "@/lib/dates";

const MIN = 60_000;
const HEURE = 60 * MIN;
const JOUR = 24 * HEURE;

function duree(ms: number): string {
  if (ms < MIN) return `${Math.max(1, Math.floor(ms / 1000))} s`;
  if (ms < HEURE) return `${Math.floor(ms / MIN)} min`;
  if (ms < JOUR) {
    const h = Math.floor(ms / HEURE);
    const m = Math.floor((ms % HEURE) / MIN);
    return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
  }
  const j = Math.floor(ms / JOUR);
  const h = Math.floor((ms % JOUR) / HEURE);
  return h ? `${j} j ${h} h` : `${j} j`;
}

export type CompteARebours = { texte: string; depassee: boolean; proche: boolean };

/** Le compte à rebours d'une échéance ; `proche` sous l'heure. */
export function compteARebours(echeance: string, maintenant: number): CompteARebours {
  const reste = Date.parse(echeance) - maintenant;
  if (reste <= 0) return { texte: `dépassée de ${duree(-reste)}`, depassee: true, proche: false };
  return { texte: `dans ${duree(reste)}`, depassee: false, proche: reste < HEURE };
}

/** « il y a 3 min » — ou « à l'instant ». */
export function ilYA(quand: string | number, maintenant: number): string {
  const ecart = maintenant - (typeof quand === "number" ? quand : Date.parse(quand));
  return ecart < 5_000 ? "à l’instant" : `il y a ${duree(ecart)}`;
}

/** « 26/09 14:30 » à l'heure de Paris — l'année quand elle n'est pas la courante. */
export function dateCourte(iso: string, maintenant: number): string {
  const memeAnnee = anneeParis(iso) === anneeParis(maintenant);
  return enHeureDeParis(iso, {
    day: "2-digit",
    month: "2-digit",
    ...(memeAnnee ? {} : { year: "numeric" }),
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * L'état de la synchronisation (§4 : « indication de la dernière
 * synchronisation », « avertissement si les données ne sont plus actualisées »).
 */
export type EtatSynchro = "a_jour" | "degrade" | "perime";
export function etatSynchro(derniereReussite: number, enEchec: boolean, maintenant: number): EtatSynchro {
  if (!derniereReussite || maintenant - derniereReussite > 90_000) return "perime";
  return enEchec || maintenant - derniereReussite > 45_000 ? "degrade" : "a_jour";
}
