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

/**
 * Un jour choisi dans un calendrier (« 2026-10-03 »), à une heure de Paris,
 * en instant ISO. ⚠️ LE DÉCALAGE CHANGE DEUX FOIS L'AN : on essaie l'heure
 * d'hiver puis l'heure d'été, et l'on garde celle qui tombe juste à Paris.
 */
export function instantParis(jour: string, heure = "18:00"): string {
  for (const decalage of ["+01:00", "+02:00"]) {
    const d = new Date(`${jour}T${heure}:00${decalage}`);
    if (enHeureDeParis(d, { hour: "2-digit", minute: "2-digit" }) === heure) return d.toISOString();
  }
  return new Date(`${jour}T${heure}:00+01:00`).toISOString();
}

/** Aujourd'hui à Paris, au format d'un champ date (« 2026-09-26 »). */
export function aujourdhuiParis(maintenant: Instant = Date.now()): string {
  const [j, m, a] = enHeureDeParis(maintenant, { day: "2-digit", month: "2-digit", year: "numeric" }).split("/");
  return `${a}-${m}-${j}`;
}
