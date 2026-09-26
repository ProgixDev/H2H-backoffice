// Les dates telles que l'équipe les lit : À L'HEURE DE PARIS, où que la page
// soit mise en forme.
//
// ⚠️ SANS FUSEAU, UNE DATE PREND CELUI DE LA MACHINE QUI L'ÉCRIT : l'UTC des
// serveurs de Vercel pour un composant serveur (deux heures de moins l'été,
// une l'hiver), celui du navigateur pour un composant client — et React relève
// l'écart en hydratant. Toute date affichée passe donc par ici ; un test refuse
// `toLocaleString`, `Intl.DateTimeFormat` et `getHours()` partout ailleurs.
//
// Les comptes à rebours (`lib/activite/temps.ts`) sont des écarts : ils n'ont
// pas de fuseau.

export const FUSEAU = "Europe/Paris";

type Instant = string | number | Date;

const formats = new Map<string, Intl.DateTimeFormat>();

/** Un instant à l'heure de Paris, dans le format demandé. */
export function enHeureDeParis(quand: Instant, options: Intl.DateTimeFormatOptions): string {
  const cle = JSON.stringify(options);
  let format = formats.get(cle);
  if (!format) {
    format = new Intl.DateTimeFormat("fr-FR", { ...options, timeZone: FUSEAU });
    formats.set(cle, format);
  }
  return format.format(typeof quand === "string" ? new Date(quand) : quand);
}

/** « 26/09/2026 19:38 », ou « — ». */
export const dateHeure = (iso: string | null | undefined) =>
  iso ? enHeureDeParis(iso, { dateStyle: "short", timeStyle: "short" }) : "—";

/** « 26/09/2026 », ou « — ». */
export const jour = (iso: string | null | undefined) => (iso ? enHeureDeParis(iso, { dateStyle: "short" }) : "—");

/** « 26 sept. 2026 », ou « — ». */
export const jourMoyen = (iso: string | null | undefined) =>
  iso ? enHeureDeParis(iso, { dateStyle: "medium" }) : "—";

/** « 26/09/2026 19:38:05 » : l'horodatage complet (journal, info-bulles). */
export const horodatage = (iso: string) => enHeureDeParis(iso, { dateStyle: "short", timeStyle: "medium" });

/** L'année à Paris : le 31 décembre à 23 h 30 UTC y est déjà l'an suivant. */
export const anneeParis = (quand: Instant) => enHeureDeParis(quand, { year: "numeric" });
