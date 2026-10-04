// Les réglages de la plateforme (§20, R20.3, R20.4) — hand-to-hand `20261003005000` : les délais de
// réclamation, les frais et la commission, les rendez-vous de co-livraison. Chacun se publie par
// versions, jamais rétroactives ; un changement se demande, et une seconde personne de la Direction
// le valide.
//
// ⚠️ À L'OUVERTURE, TOUS SONT FIGÉS (03/10/2026) : la version de l'application qui les lit en base
// n'est pas encore installée. Chaque réglage dit pourquoi (`raison_figee`).

export type Unite = "jours" | "heures" | "minutes" | "centimes" | "taux";

export type TableReglage = "ref.claim_windows" | "ref.commission_config" | "ref.delay_protocol";

export type Champ = {
  colonne: string;
  libelle: string;
  description: string;
  unite: Unite;
  minimum: number;
  maximum: number;
  /** Peut rester vide (« aucun plafond »). */
  facultatif: boolean;
  modifiable: boolean;
  /** Pourquoi il ne se change pas d'ici — nul s'il se change. */
  raison_figee: string | null;
};

/** Un changement : un réglage, son avant, son après. */
export type Ecart = {
  colonne: string;
  libelle: string;
  unite: Unite;
  avant: number | null;
  apres: number | null;
};

/** Qui l'a demandé, qui l'a validé, pourquoi, sa portée — nul pour une version publiée par migration. */
export type Changement = {
  demandeur: string | null;
  demande_le: string;
  valideur: string | null;
  valide_le: string | null;
  motif: string;
  changements: Ecart[];
  portee: string;
} | null;

export type Valeurs = Record<string, number | string | null>;

export type GroupeReglages = {
  table: TableReglage;
  libelle: string;
  /** Ce qu'une nouvelle version gouverne. */
  portee: string;
  champs: Champ[];
  en_vigueur: { version: number; depuis: string; valeurs: Valeurs } | null;
  programmees: { version: number; effet: string; valeurs: Valeurs; changement: Changement; annulable: boolean }[];
  historique: { version: number; depuis: string; changement: Changement }[];
  demandes: {
    validation: string;
    demandeur: string | null;
    demande_le: string;
    expire_le: string;
    /** Nul : dès la validation. */
    effet: string | null;
    changements: Ecart[];
    motif: string;
  }[];
  possible: { demander: boolean; raison: string | null };
};

export type ChangementDemande = {
  table: TableReglage;
  /** Les valeurs nouvelles, dans l'unité de la base (centimes, taux en fraction). */
  changements: Record<string, number | null>;
  /** Nul : dès la validation. */
  effet: string | null;
  motif: string;
};

const ENTIER = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const EUROS = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });
const POURCENT = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

/** Une valeur de réglage comme l'équipe la lit : « 48 h », « 30 jours », « 0,70 € », « 5 % ». */
export function valeurDite(unite: Unite, valeur: number | string | null | undefined): string {
  if (valeur === null || valeur === undefined) return "aucun";
  const n = Number(valeur);
  if (!Number.isFinite(n)) return String(valeur);
  switch (unite) {
    case "jours":
      return `${ENTIER.format(n)} jour${n > 1 ? "s" : ""}`;
    case "heures":
      return `${ENTIER.format(n)} h`;
    case "minutes":
      return `${ENTIER.format(n)} min`;
    case "centimes":
      return EUROS.format(n / 100);
    case "taux":
      return `${POURCENT.format(n * 100)} %`;
  }
}

/** L'unité d'une saisie : l'équipe saisit des euros et des pourcentages, la base garde des centimes et des fractions. */
export const UNITE_SAISIE: Record<Unite, string> = {
  jours: "jours",
  heures: "heures",
  minutes: "minutes",
  centimes: "€",
  taux: "%",
};

/** Ce que l'équipe saisit → ce que la base garde. */
export function versLaBase(unite: Unite, saisie: number): number {
  if (unite === "centimes") return Math.round(saisie * 100);
  if (unite === "taux") return Math.round(saisie * 10) / 1000;
  return saisie;
}

/** Ce que la base garde → ce que l'équipe saisit. */
export function versLaSaisie(unite: Unite, valeur: number): number {
  if (unite === "centimes") return valeur / 100;
  if (unite === "taux") return Math.round(valeur * 1000) / 10;
  return valeur;
}
