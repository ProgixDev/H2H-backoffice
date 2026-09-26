// Les règles du temps réel du back-office, sans React : ce qu'un message fait
// relire, et quand le canal passe pour vivant.

export type EtatTempsReel = {
  /** Le canal est rejoint (la base a accepté l'écoute). */
  connecte: boolean;
  /** Le dernier message reçu — un battement, ou un événement. */
  dernierSigne: number | null;
};

/** La base bat chaque minute : deux battements et demi sans rien, et le canal ne porte plus. */
export const SILENCE_MAX = 150_000;

/** Le temps réel porte-t-il ? Rejoint, et un signe reçu il y a moins de deux minutes et demie. */
export function estEnDirect(e: EtatTempsReel, maintenant: number): boolean {
  return e.connecte && e.dernierSigne !== null && maintenant - e.dernierSigne < SILENCE_MAX;
}

/** Ce qu'un message fait relire : des familles de requêtes, et la fiche d'une opération. */
export type Cible = "activite" | "file" | "dossier" | "fiches" | `fiche:${string}`;

/**
 * Une requête de l'écran est-elle concernée ? Les clés suivent les écrans :
 * `activite…` (Activité en direct), `file` et `dossier` (« À traiter »),
 * `fiche` (la fiche complète : `["fiche", table, id]`).
 */
export function concerne(cle: readonly unknown[], cibles: ReadonlySet<Cible>): boolean {
  const [tete, , id] = cle;
  if (typeof tete !== "string") return false;
  if (tete.startsWith("activite")) return cibles.has("activite");
  if (tete === "file") return cibles.has("file");
  if (tete === "dossier") return cibles.has("dossier");
  if (tete === "fiche") return cibles.has("fiches") || cibles.has(`fiche:${String(id)}`);
  return false;
}

/** Ce que fait relire chaque message du canal. */
export function ciblesDe(evenement: string, charge: unknown): Cible[] {
  if (evenement === "operation") {
    const id = (charge as { objet_id?: unknown } | null)?.objet_id;
    // Une opération qui bouge change aussi la catégorie de son dossier.
    return ["activite", "file", "dossier", ...(typeof id === "string" ? [`fiche:${id}` as const] : [])];
  }
  if (evenement === "dossier") return ["file", "dossier", "fiches"];
  return [];
}

/** Après une coupure, tout ce qui est ouvert se relit : des messages ont pu se perdre. */
export const TOUT: Cible[] = ["activite", "file", "dossier", "fiches"];
