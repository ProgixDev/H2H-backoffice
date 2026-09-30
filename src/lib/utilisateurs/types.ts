// Les demandes de rôle, telles que le back-office les lit (`bo_demandes_de_role_lister`).

export type DemandeRole = {
  id: string;
  profil_id: string;
  /** Le pseudonyme — la seule identité publique. */
  pseudo: string | null;
  ville: string | null;
  role: string;
  statut: string;
  demande_le: string;
  est_test: boolean;
  /**
   * Stripe a-t-il vérifié l'identité ? Oui ou non, et par quel moyen — jamais
   * le nom vérifié, qui se dévoilera un à un, avec un motif (phase 1).
   */
  identite_verifiee: boolean;
  identite_methode: "stripe_identity" | "stripe_connect" | null;
  identite_mode_test: boolean | null;
  compte_versement: "payable" | "incomplet" | null;
  /** Un mode que Stripe n'a pas encore dit vaut test : on ne présume jamais le réel. */
  compte_versement_mode_test: boolean | null;
  convention_version: string | null;
  convention_signee_le: string | null;
};

export const LIBELLE_ROLE: Record<string, string> = {
  seller: "Vendeur",
  transporter: "Cotransporteur particulier",
  relais: "Point relais",
};

// 🔴 ACCORDER UN RÔLE OUVRE UN MÉTIER. Le rappel est sur la carte, au moment de
// décider — comme sur l'écran mobile du support.
export const CE_QUE_LE_ROLE_OUVRE: Record<string, string> = {
  seller: "Vendre et encaisser sur la Marketplace.",
  transporter: "Publier des trajets et se voir confier les colis d’inconnus.",
  relais: "Garder les colis des autres dans son commerce.",
};

// Les valeurs de `role_status` : celles qui attendent une décision, et l'issue.
export const LIBELLE_STATUT_ROLE: Record<string, string> = {
  active: "Actif",
  suspended: "Suspendu",
  rejected: "Refusé",
  pending_kyc: "Identité à vérifier",
  pending_convention: "Convention à signer",
  pending_validation: "À valider",
  pending_verification: "À vérifier",
  pending_config: "À configurer",
};

export const LIBELLE_METHODE: Record<string, string> = {
  stripe_identity: "pièce d’identité et selfie",
  stripe_connect: "compte de versement",
};

// ── Les comptes (`bo_utilisateurs_lister`, `bo_utilisateur_lire` — migration 20260930002000) ──
//
// 🔴 NI NOM, NI E-MAIL, NI TÉLÉPHONE, NI ADRESSE ICI : la liste et la fiche ne
// portent que le pseudonyme. Ces données se révèlent une à la fois, avec un
// motif, par `bo_reveler` — et chaque révélation est journalisée.

export type RoleCompte = { role: string; statut: string };

/** Une ligne de la liste des comptes. */
export type CompteListe = {
  id: string;
  pseudo: string | null;
  ville: string | null;
  type_compte: "individual" | "ecommerce";
  inscrit_le: string;
  /** Les rôles demandés ou tenus, hors acheteur. */
  roles: RoleCompte[];
  identite_verifiee: boolean;
  compte_versement: "payable" | "incomplet" | null;
  note: number | null;
  avis: number;
  annonces: number;
  achats: number;
  ventes: number;
  /** Les signalements reçus depuis quatre-vingt-dix jours. */
  signalements: number;
  derniere_ouverture: string | null;
  efface: boolean;
  vitrine: boolean;
  est_test: boolean;
};

export const FILTRES_COMPTES = ["vendeurs", "cotransporteurs", "relais", "professionnels", "signales", "effaces"] as const;
export type FiltreComptes = (typeof FILTRES_COMPTES)[number];

export const LIBELLE_FILTRE_COMPTES: Record<FiltreComptes, string> = {
  vendeurs: "Vendeurs",
  cotransporteurs: "Cotransporteurs particuliers",
  relais: "Points relais",
  professionnels: "Professionnels",
  signales: "Signalés",
  effaces: "Comptes effacés",
};

export type FiltresComptes = { q: string | null; filtre: FiltreComptes | null; test: boolean };

export type AvisCompte = {
  id: string;
  note: number;
  commentaire: string | null;
  le: string;
  /** L'autre personne : celle qui a noté, ou celle qui a été notée. */
  avec: string | null;
  /** En tant que quoi la personne notée l'a été. */
  role: "seller" | "buyer" | "transporter" | "relais";
};

/** La fiche d'un compte (§8) : tout ce qui se lit sans rien révéler. */
export type FicheCompte = {
  compte: {
    id: string;
    pseudo: string | null;
    avatar: string | null;
    ville: string | null;
    region: string | null;
    type_compte: "individual" | "ecommerce";
    inscrit_le: string;
    connexion: string | null;
    langue: string | null;
    note: number | null;
    avis: number;
    est_test: boolean;
    vitrine: boolean;
    efface_le: string | null;
  };
  /** Ce compte est celui de l'équipier qui le lit : il n'en révèle rien. */
  conflit: boolean;
  verifications: {
    identite: {
      verifiee: boolean;
      methode: "stripe_identity" | "stripe_connect" | null;
      verifiee_le: string | null;
      mode_test: boolean | null;
      selfie: boolean | null;
      type_document: string | null;
    };
    demandes: {
      statut: string;
      statut_stripe: string | null;
      soumise_le: string;
      verifiee_le: string | null;
      motif_rejet: string | null;
      echecs: number;
      selfie: boolean;
      mode_test: boolean;
    }[];
    professionnel_verifie: boolean;
    pseudo_autorise: boolean;
    /** Nul si la personne n'a pas de profil de cotransporteur. */
    documents_cotransporteur: boolean | null;
  };
  roles: (RoleCompte & { demande_le: string; active_le: string | null; decide_le: string | null; motif: string | null })[];
  point_relais: { nom: string; ville: string | null; statut: string; verifie_le: string | null; en_pause: boolean } | null;
  paiement: {
    compte_versement: "absent" | "incomplet" | "payable";
    encaissements: boolean | null;
    mode_test: boolean | null;
    payable_depuis: string | null;
    ouvert_le: string | null;
    /** La référence du compte chez Stripe — rendue seulement à qui lit les paiements. */
    reference: string | null;
    carte_enregistree: boolean;
  };
  documents: {
    conventions: { role: string; version: string; acceptee_le: string; mandat_debit: boolean }[];
    /** Nul : l'acceptation des conditions générales n'est pas encore enregistrée par les applications. */
    conditions_generales: null;
  };
  activite: {
    annonces: { publiees: number; en_ligne: number; vendues: number; brouillons: number };
    recherches: number;
    achats: { total: number; en_cours: number; annules: number };
    ventes: { total: number; en_cours: number; annulees: number };
    colivraisons: { total: number; realisees: number };
    trajets: number;
    ouvertures: { application: "marketplace" | "logistic" | "relais"; le: string }[];
  };
  annonces: { id: string; titre: string; statut: string; type: string; mode: string; prix_cents: number; publiee_le: string }[];
  transactions: {
    reference: string;
    role: "acheteur" | "vendeur";
    statut: string;
    total_cents: number;
    le: string;
    avec: string | null;
    titre: string | null;
  }[];
  colivraisons: { reference: string | null; statut: string; le: string; retour: boolean }[];
  avis: { recus: AvisCompte[]; donnes: AvisCompte[] };
  signalements: {
    recus: { id: string; motif: string; libelle: string; priorite: string; le: string; par: string | null }[];
    recus_total: number;
    /** Ce que la personne a signalé elle-même : un compte, une annonce, un avis, un point de rendez-vous. */
    faits: number;
    annonces: number;
    avis: number;
    blocages: number;
  };
  litiges: { total: number; ouverts: number };
  /** Nul : avertissements, restrictions et suspensions arrivent avec la tranche suivante. */
  sanctions: null;
};

export type CompteTrouve = { profil: string; pseudo: string | null; est_test: boolean };

export const LIBELLE_TYPE_COMPTE: Record<CompteListe["type_compte"], string> = {
  individual: "Particulier",
  ecommerce: "Professionnel",
};

export const LIBELLE_CONNEXION: Record<string, string> = {
  apple: "Apple",
  google: "Google",
  facebook: "Facebook",
  phone: "Téléphone",
};

export const LIBELLE_APPLICATION: Record<FicheCompte["activite"]["ouvertures"][number]["application"], string> = {
  marketplace: "HandtoHand",
  logistic: "H2H Logistic",
  relais: "H2H Relais",
};

export const LIBELLE_ROLE_NOTE: Record<AvisCompte["role"], string> = {
  seller: "vendeur",
  buyer: "acheteur",
  transporter: "cotransporteur particulier",
  relais: "point relais",
};

export const LIBELLE_PRIORITE_SIGNALEMENT: Record<string, string> = {
  normale: "Normale",
  elevee: "Élevée",
  tres_elevee: "Très élevée",
  critique: "Critique",
};

export const LIBELLE_STATUT_KYC: Record<string, string> = {
  none: "Aucune",
  pending: "En cours",
  verified: "Vérifiée",
  rejected: "Refusée",
};

/** L'adresse de la liste : la recherche et le filtre restent dans l'adresse (R4.10). */
export function adresseComptes(f: FiltresComptes): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.filtre) p.set("filtre", f.filtre);
  if (f.test) p.set("test", "1");
  const s = p.toString();
  return s ? `/utilisateurs?${s}` : "/utilisateurs";
}

/** L'adresse de la fiche d'un compte. */
export const cheminCompte = (id: string) => `/utilisateurs/${encodeURIComponent(id)}`;
