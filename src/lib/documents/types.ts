// Les textes que les personnes acceptent, et ceux qui se versionnent seulement (§20, R20.1) —
// hand-to-hand `20261003002000` : chaque texte, ses versions, les acceptations, les demandes de
// publication qui attendent leur seconde validation.

export type ApplicationTexte = "marketplace" | "logistic" | "toutes";

/** Programmée (pas encore en vigueur), en vigueur, ou remplacée par une plus récente. */
export type StatutVersion = "programmee" | "en_vigueur" | "remplacee";

export const LIBELLE_STATUT_VERSION: Record<StatutVersion, string> = {
  programmee: "Programmée",
  en_vigueur: "En vigueur",
  remplacee: "Remplacée",
};

export const LIBELLE_APPLICATION: Record<ApplicationTexte, string> = {
  marketplace: "Place de marché",
  logistic: "H2H Logistic",
  toutes: "Les deux applications",
};

/** Qui l'a demandée, qui l'a validée, pourquoi — nul pour une version inscrite par migration. */
export type ChangementVersion = {
  demandeur: string | null;
  demande_le: string;
  valideur: string | null;
  valide_le: string | null;
  motif: string;
} | null;

export type VersionTexte = {
  version: string;
  titre: string;
  url: string;
  empreinte: string;
  application: ApplicationTexte;
  /** Se fait-elle accepter par chaque personne ? */
  obligatoire: boolean;
  en_vigueur_le: string;
  publie_le: string;
  statut: StatutVersion;
  /** Les personnes du monde de l'équipier qui l'ont acceptée. */
  acceptations: number;
  changement: ChangementVersion;
  annulable: boolean;
};

export type DemandeTexte = {
  validation: string;
  demandeur: string | null;
  demande_le: string;
  expire_le: string;
  version: string;
  titre: string;
  /** Nulle : dès la validation. */
  effet: string | null;
  obligatoire: boolean;
  motif: string;
};

export type Texte = {
  code: string;
  libelle: string;
  /** L'application dont c'est le texte ; nulle : celle que la version dit. */
  application: "marketplace" | "logistic" | null;
  /** Se fait-il accepter ? Sinon, il se versionne seulement (chartes, règles de classement, procédures). */
  acceptable: boolean;
  versions: VersionTexte[];
  demandes: DemandeTexte[];
  possible: { demander: boolean; raison: string | null };
};

/** Ce que rend une demande de publication. */
export type PublicationDemandee = { validation: string; statut: "en_attente"; expire_le: string; effet: string | null };

/** Une empreinte calculée : le sha-256 du texte publié, et sa taille. */
export type EmpreinteCalculee = { ok: true; empreinte: string; octets: number } | { ok: false; erreur: string };

export const EMPREINTE_VALIDE = /^[0-9a-f]{64}$/;
export const VERSION_VALIDE = /^[0-9A-Za-z._-]{1,40}$/;
