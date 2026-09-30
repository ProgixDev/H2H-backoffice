// Les périodes du tableau de bord : des jours de calendrier (« 2026-03-31 »),
// que la base lit à l'heure de Paris.
//
// ⚠️ DU CALCUL DE CALENDRIER, PAS D'HORLOGE : on ajoute des jours à un jour, en
// UTC, sans jamais passer par le fuseau de la machine. « Aujourd'hui », lui,
// vient de `aujourdhuiParis()` (`lib/dates.ts`).
import type { FiltresTableau } from "./types";

const JOUR = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PAR_JOUR = 86_400_000;

function enMs(jour: string): number {
  const m = JOUR.exec(jour);
  if (!m) throw new Error(`jour illisible : ${jour}`);
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}
const enJour = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** Un jour de calendrier qui existe : « 2026-02-30 » n'en est pas un. */
export function jourValide(jour: string): boolean {
  return JOUR.test(jour) && enJour(enMs(jour)) === jour;
}

/** Le jour `n` jours plus tard (ou plus tôt, si `n` est négatif). */
export function decaler(jour: string, n: number): string {
  return enJour(enMs(jour) + n * MS_PAR_JOUR);
}

/** Le premier jour du mois, `mois` mois plus tard (ou plus tôt). */
function premierDuMois(jour: string, mois = 0): string {
  const m = JOUR.exec(jour);
  if (!m) throw new Error(`jour illisible : ${jour}`);
  return enJour(Date.UTC(Number(m[1]), Number(m[2]) - 1 + mois, 1));
}

export type Prereglage = { code: string; libelle: string; du: string; au: string };

/** Les périodes toutes faites, comptées depuis aujourd'hui à Paris. */
export function prereglages(aujourdhui: string): Prereglage[] {
  const ceMois = premierDuMois(aujourdhui);
  return [
    { code: "7j", libelle: "7 jours", du: decaler(aujourdhui, -6), au: aujourdhui },
    { code: "30j", libelle: "30 jours", du: decaler(aujourdhui, -29), au: aujourdhui },
    { code: "90j", libelle: "90 jours", du: decaler(aujourdhui, -89), au: aujourdhui },
    { code: "mois", libelle: "Ce mois-ci", du: ceMois, au: aujourdhui },
    { code: "mois-dernier", libelle: "Le mois dernier", du: premierDuMois(aujourdhui, -1), au: decaler(ceMois, -1) },
    { code: "annee", libelle: "Cette année", du: `${aujourdhui.slice(0, 4)}-01-01`, au: aujourdhui },
  ];
}

/**
 * L'adresse du tableau, ou du détail d'un indicateur : la période reste dans
 * l'adresse (R4.10), on la partage telle quelle.
 */
export function adresseTableau(f: FiltresTableau, indicateur?: string): string {
  const p = new URLSearchParams();
  if (f.du) p.set("du", f.du);
  if (f.au) p.set("au", f.au);
  if (f.test) p.set("test", "1");
  const s = p.toString();
  const base = indicateur ? `/tableau-de-bord/${encodeURIComponent(indicateur)}` : "/tableau-de-bord";
  return s ? `${base}?${s}` : base;
}

type Params = Record<string, string | string[] | undefined>;
const texte = (v: string | string[] | undefined) => (typeof v === "string" ? v.trim() : "");

/**
 * Les filtres lus dans l'adresse. Un jour illisible est ignoré, pas transmis ;
 * `testPermis` : seul un équipier réel peut demander le monde du test en plus.
 */
export function lireFiltres(p: Params, testPermis: boolean): FiltresTableau {
  const du = texte(p.du);
  const au = texte(p.au);
  return {
    du: jourValide(du) ? du : null,
    au: jourValide(au) ? au : null,
    test: testPermis && texte(p.test) === "1",
  };
}
