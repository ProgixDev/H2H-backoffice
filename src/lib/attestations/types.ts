// Les attestations de vente telles que le back-office les lit
// (`bo_attestations_lister`) : la version courante de chaque achat, et toutes
// ses versions, comparables (§11).
import type { Database } from "@/lib/db/contrat/database.types";

type E = Database["public"]["Enums"];

/** La partie qu'une attestation attend ; `identites` : l'une ou l'autre doit faire vérifier son identité. */
export type Attendu = "vendeur" | "acheteur" | "identites";
export type FiltreAttestation = "a_faire" | "signees" | "erreurs" | "remplacees";
export const FILTRES_ATTESTATION: FiltreAttestation[] = ["a_faire", "signees", "erreurs", "remplacees"];

type IdentiteFigee = {
  verifiee: boolean | null;
  methode: string | null;
  verifiee_le: string | null;
  document: string | null;
  mode_test: boolean | null;
};

/**
 * Une version, comparable aux autres. ⚠️ NI NOM LÉGAL, NI ADRESSE, NI CHEMIN :
 * les noms se révèlent un à un (`bo_reveler`), les fichiers s'ouvrent un à un.
 */
export type VersionAttestation = {
  id: string;
  version: number;
  statut: E["attestation_status"];
  libelle: string;
  erreur: string | null;
  creee_le: string;
  figee_le: string | null;
  signee_vendeur_le: string | null;
  decision_acheteur: E["buyer_decision"] | null;
  signee_acheteur_le: string | null;
  /** Les seize premiers caractères de l'empreinte SHA-256. */
  empreinte: string | null;
  document: boolean;
  elements_confirmes: Record<string, unknown> | null;
  declarations: Record<string, unknown> | null;
  photos: { id: string; emplacement: string; prise_le: string | null; lisibilite_confirmee: boolean }[];
  identites: {
    exigees: boolean;
    figees_le: string | null;
    vendeur: IdentiteFigee;
    acheteur: IdentiteFigee;
  };
};

export type RelanceAttestation = {
  nature: "rappel" | "remplacement";
  le: string;
  par: string | null;
  version: number | null;
  destinataires: ("acheteur" | "vendeur" | null)[];
};

export type AttestationLigne = {
  commande_id: string;
  numero: string;
  statut_commande: E["order_status"];
  attestation_id: string;
  version: number;
  versions: number;
  statut: E["attestation_status"];
  libelle: string;
  /** « Erreur technique » : un exemplaire jamais déposé, des identités vérifiées jamais figées. */
  erreur: string | null;
  attendu: Attendu | null;
  acheteur: string | null;
  vendeur: string | null;
  ouverte_le: string;
  maj_le: string;
  document: boolean;
  derniere_relance_le: string | null;
  derniere_relance: "rappel" | "remplacement" | null;
  remplacement_demande_le: string | null;
  historique: VersionAttestation[];
  relances: RelanceAttestation[];
  est_test: boolean;
};

export const LIBELLE_FILTRE_ATTESTATION: Record<FiltreAttestation, string> = {
  a_faire: "En cours",
  signees: "Signées",
  erreurs: "Erreur technique",
  remplacees: "Remplacées",
};

export const LIBELLE_ATTENDU: Record<Attendu, string> = {
  vendeur: "Le vendeur",
  acheteur: "L’acheteur",
  identites: "La vérification d’identité",
};

export const LIBELLE_METHODE_IDENTITE: Record<string, string> = {
  stripe_identity: "Pièce d’identité (Stripe Identity)",
  stripe_connect: "Compte de versement vérifié (Stripe)",
};

export const LIBELLE_DOCUMENT_IDENTITE: Record<string, string> = {
  id_card: "Carte d’identité",
  passport: "Passeport",
  driving_license: "Permis de conduire",
};
