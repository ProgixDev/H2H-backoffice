// Les annonces (§9) : ce que `bo_annonces_lister`, `bo_annonces_categories` et
// `bo_annonce_lire` rendent (20260930005000), leur modération (20260930006000),
// et les mots pour le dire.
//
// ⚠️ R9.3 : LE STATUT D'UNE ANNONCE N'EST PAS CELUI DE SES TRANSACTIONS. La
// fiche montre chaque commande à part, avec son propre état.
// Les mots reprennent ceux que l'acheteur lit dans l'application
// (`app_product_id.condition*`, `app_je_cherche_id.status*`, `app_report.reasons`).
import type { Database } from "@/lib/db/contrat/database.types";
import type { DecisionRecours, RecoursLu } from "@/lib/utilisateurs/types";

type E = Database["public"]["Enums"];

export type NatureAnnonce = "annonce" | "recherche";
export type StatutRecherche = E["je_cherche_status"];

/** Une ligne de la liste : une annonce, ou une recherche « Je cherche ». */
export type AnnonceListe = {
  id: string;
  nature: NatureAnnonce;
  titre: string;
  image: string | null;
  categorie: string | null;
  categorie_libelle: string | null;
  /** Le prix d'une annonce, le budget d'une recherche. */
  montant_cents: number;
  statut: string;
  /** Le type d'une annonce (prix fixe, offres, Offre Flash) ; l'urgence d'une recherche. */
  type: string;
  mode: E["product_mode"] | null;
  acces: E["product_access_mode"] | null;
  auteur: string;
  auteur_pseudo: string | null;
  ville: string | null;
  cree_le: string;
  publiee_le: string | null;
  expire_le: string | null;
  vues: number;
  favoris: number;
  signalements: number | null;
  propositions: number | null;
  commandes_en_cours: number | null;
  mise_en_avant: boolean;
  /** Posée par l'équipe, distincte du statut (R9.3). */
  moderation: EtatModeration | null;
  /** La correction qui attend l'auteur, ou celle qu'il vient d'apporter (14 jours), à vérifier. */
  correction: "demandee" | "apportee" | null;
  /** Un recours contre une de ses décisions attend l'équipe (20260930007000). */
  recours: "a_examiner" | null;
  est_test: boolean;
};

export const FILTRES_ANNONCES = [
  "en_ligne",
  "brouillons",
  "reservees",
  "vendues",
  "expirees",
  "signalees",
  "acces_controle",
  "flash",
  "echange",
  "mises_en_avant",
  "moderees",
  "corrections",
  "recours",
  "verification",
] as const;
export type FiltreAnnonces = (typeof FILTRES_ANNONCES)[number];
export const LIBELLE_FILTRE_ANNONCES: Record<FiltreAnnonces, string> = {
  en_ligne: "En ligne",
  brouillons: "Brouillons",
  reservees: "Réservées",
  vendues: "Vendues",
  expirees: "Expirées",
  signalees: "Signalées",
  acces_controle: "Accès contrôlé",
  flash: "Offres Flash",
  echange: "Échanges",
  mises_en_avant: "Mises en avant",
  moderees: "Modérées",
  corrections: "Corrections",
  recours: "Recours à examiner",
  verification: "À vérifier avant publication",
};

export const FILTRES_RECHERCHES = [
  "actives",
  "trouvees",
  "expirees",
  "annulees",
  "moderees",
  "corrections",
  "recours",
] as const;
export type FiltreRecherches = (typeof FILTRES_RECHERCHES)[number];
export const LIBELLE_FILTRE_RECHERCHES: Record<FiltreRecherches, string> = {
  actives: "Actives",
  trouvees: "Trouvées",
  expirees: "Expirées",
  annulees: "Annulées",
  moderees: "Masquées ou retirées",
  corrections: "Corrections",
  recours: "Recours à examiner",
};

export type VueAnnonces = "annonces" | "recherches";
export type FiltresAnnonces = {
  vue: VueAnnonces;
  q: string | null;
  filtre: FiltreAnnonces | FiltreRecherches | null;
  categorie: string | null;
  test: boolean;
};

export type CategorieFiltre = {
  id: string;
  libelle: string;
  famille: string | null;
  contact_seulement: boolean;
  annonces_en_ligne: number;
};

// ── La modération (20260930006000) ──────────────────────────────────────────

/**
 * Ce que l'équipe a posé sur une annonce ou une recherche. Nul : rien. Une
 * annonce d'une catégorie vérifiée avant publication (20260930008000, D25) attend
 * l'équipe à sa première mise en ligne, puis se montre ou reste refusée.
 */
export type EtatModeration = "masquee" | "retiree" | "en_verification" | "refusee";
export type DecisionModeration =
  | "masquer"
  | "retablir"
  | "retirer"
  | "demander_correction"
  | "autoriser"
  | "refuser";

/**
 * Les motifs d'une demande de correction : ceux que l'application nomme déjà
 * (`utils/correctionRequest.ts`), avec ses mots, et que la base vérifie.
 */
export const MOTIFS_CORRECTION = [
  { code: "conformite", libelle: "Conformité de l’annonce" },
  { code: "securite", libelle: "Sécurité" },
  { code: "doublon", libelle: "Annonce en double" },
  { code: "erreur_manifeste", libelle: "Erreur manifeste" },
  { code: "fraude", libelle: "Suspicion de fraude" },
  { code: "probleme_technique", libelle: "Problème technique" },
] as const;
export type MotifCorrection = (typeof MOTIFS_CORRECTION)[number]["code"];

/** La modération d'une fiche : où elle en est, la correction ouverte, l'historique, ce que l'équipier peut faire. */
export type ModerationFiche = {
  etat: EtatModeration | null;
  /**
   * La vérification avant publication, si l'annonce y est passée : son dossier
   * « À traiter », depuis quand, pourquoi sa catégorie est vérifiée (20260930008000).
   */
  verification: {
    dossier: string;
    dossier_id: string;
    depuis: string;
    statut: "ouvert" | "clos";
    clos_le: string | null;
    /** Nul si la catégorie n'est plus dans la liste. */
    pourquoi: string | null;
  } | null;
  correction: {
    id: string;
    code: MotifCorrection;
    libelle: string;
    message: string;
    le: string;
    par: string | null;
  } | null;
  historique: {
    id: string;
    decision: DecisionModeration;
    correction: MotifCorrection | null;
    correction_libelle: string | null;
    /** Ce que l'équipe a écrit à l'auteur ; nul pour un rétablissement ou une autorisation. */
    message: string | null;
    /** Ce que l'équipe garde pour elle : l'auteur ne le lit jamais. */
    motif: string;
    le: string;
    par: string | null;
    corrigee_le: string | null;
    /** Elle s'applique encore : l'annonce est masquée ou retirée par elle (20260930007000). */
    en_vigueur: boolean;
    /** L'équipe a donné raison à l'auteur sur recours. */
    annulee: boolean;
    /** Le recours de l'auteur contre elle, et ce que l'équipier qui lit peut en faire. */
    recours: RecoursLu | null;
  }[];
  /** Les recours contre ses décisions qui attendent l'équipe. */
  recours_a_examiner: number;
  possibles: {
    moderer: boolean;
    raison: string | null;
    masquer: boolean;
    retablir: boolean;
    retirer: boolean;
    corriger: boolean;
    /** La publication qui attend l'équipe (20260930008000). */
    autoriser: boolean;
    refuser: boolean;
  };
};

/** Ce que rend l'examen d'un recours contre une décision de modération. */
export type RecoursModerationExamine = {
  recours: string;
  cible: string;
  nature: NatureAnnonce;
  decision: DecisionRecours;
  /** L'annonce se montre de nouveau : la décision annulée s'appliquait encore. */
  retablie: boolean;
};

/** Ce que rend un geste de modération. */
export type ModerationPosee = {
  moderation: string;
  cible: string;
  nature: NatureAnnonce;
  decision: DecisionModeration;
  etat: EtatModeration | null;
};

export const LIBELLE_ETAT_MODERATION: Record<EtatModeration, string> = {
  masquee: "Masquée",
  retiree: "Retirée",
  en_verification: "En vérification",
  refusee: "Refusée",
};
/** Le ton d'un état : masquée, à surveiller ; en vérification, en cours ; retirée ou refusée, une issue défavorable. */
export const TON_ETAT_MODERATION: Record<EtatModeration, "attention" | "actif" | "erreur"> = {
  masquee: "attention",
  retiree: "erreur",
  en_verification: "actif",
  refusee: "erreur",
};
export const LIBELLE_DECISION_MODERATION: Record<DecisionModeration, string> = {
  masquer: "Masquée",
  retablir: "Rétablie",
  retirer: "Retirée",
  demander_correction: "Correction demandée",
  autoriser: "Publication autorisée",
  refuser: "Publication refusée",
};
export const LIBELLE_CORRECTION: Record<NonNullable<AnnonceListe["correction"]>, string> = {
  demandee: "Correction demandée",
  apportee: "Correction apportée",
};

// ── La fiche ────────────────────────────────────────────────────────────────

export type Droits = { moderer: boolean; compte: boolean; operations: boolean };

export type Categorie = {
  id: string;
  libelle: string | null;
  famille: string | null;
  contact_seulement: boolean;
  xxl_seulement: boolean;
} | null;

export type Auteur = {
  id: string;
  pseudo: string | null;
  ville: string | null;
  type_compte: E["account_type"] | null;
  note: number | null;
  avis: number;
  est_test: boolean;
  efface: boolean;
  suspendu: boolean;
  publication_restreinte: boolean;
};

/** Une option de visibilité de l'annonce ou de la demande (20261004005000 : son identifiant, son état). */
export type Remontee = {
  id: string;
  option: E["visibility_option"];
  active: boolean;
  etat: "reservee" | "en_cours" | "en_pause" | "terminee";
  fin_motif: string | null;
  prix_cents: number;
  /** Le début : l'activation, à défaut la réservation. */
  depuis: string;
  /** La fin : effective, à défaut prévue. */
  jusqu_a: string | null;
};

export type FicheAnnonce = {
  nature: "annonce";
  droits: Droits;
  moderation: ModerationFiche;
  annonce: {
    id: string;
    titre: string;
    description: string | null;
    statut: E["product_status"];
    type: E["listing_type"];
    mode: E["product_mode"];
    acces: E["product_access_mode"];
    etat: E["product_condition"];
    prix_cents: number;
    prix_origine_cents: number | null;
    negociable: boolean;
    stock: number;
    accessoires: boolean;
    defauts: string | null;
    etiquettes: string[];
    echange_contre: string[];
    recherche_source: string | null;
    ville: string | null;
    region: string | null;
    photos: { url: string; miniature: string | null; rang: number }[];
    videos: number;
    video_max_secondes: number | null;
    pack_photos: E["photo_pack"] | null;
    cree_le: string;
    publiee_le: string | null;
    maj_le: string;
    expire_le: string | null;
    vues: number;
    favoris: number;
  };
  categorie: Categorie;
  /** Les attributs de la catégorie ; `libelle` nul pour une clé qu'elle ne connaît plus. */
  attributs: { cle: string; libelle: string | null; valeur: unknown; unite: string | null }[];
  auteur: Auteur;
  eligibilite: {
    paiement: boolean;
    livraison: "contact" | "sans_format" | "sur_devis" | "expedition";
    format: E["parcel_format"] | null;
    livraison_offerte: boolean;
    colivraison: boolean;
    colivraison_plafond_cents: number;
    part_vendeur_service_pct: number;
    part_vendeur_livraison_pct: number;
  };
  acces: { mode: E["product_access_mode"]; demandes: Partial<Record<E["access_request_status"], number>> };
  modifications: {
    le: string;
    origine: E["listing_edit_origin"];
    genre: "contenu" | "partage_frais";
    champs: string[];
    changements: unknown;
    frais_cents: number;
    paiement: string | null;
  }[];
  visibilite: {
    mise_en_avant: boolean;
    urgent_jusqu_au: string | null;
    remontees: Remontee[];
    options: {
      genre: E["listing_option_kind"];
      valeur: string;
      prix_cents: number;
      achetee_le: string;
      appliquee_le: string | null;
    }[];
  };
  signalements: {
    total: number;
    recents: {
      le: string;
      raison: E["listing_report_reason"];
      raison_libelle: string;
      priorite: E["report_priority"];
      explication: string;
      preuves: number;
      bonne_foi: boolean;
    }[];
  };
  commandes: {
    reference: string;
    statut: E["order_status"];
    total_cents: number;
    livraison: string | null;
    acheteur: string | null;
    le: string;
  }[];
  flash: {
    reference: string;
    statut: E["courtage_status"];
    fin_offres: string;
    fin_choix: string | null;
    mode_selection: E["courtage_selection_mode"] | null;
    vendue: boolean;
  } | null;
  lives: { reference: string; titre: string; statut: string; phase: string | null; issue: string | null }[];
  echanges: Partial<Record<E["exchange_status"], number>>;
};

export type FicheRecherche = {
  nature: "recherche";
  droits: Droits;
  moderation: ModerationFiche;
  recherche: {
    id: string;
    titre: string;
    description: string | null;
    statut: StatutRecherche;
    expiree: boolean;
    budget_max_cents: number;
    zones: string[];
    urgence: E["je_cherche_urgency"];
    preferences_livraison: string[];
    ville: string | null;
    photos: string[];
    pack_photos: E["photo_pack"] | null;
    emploi: { contrat: string | null; disponibilite: string | null } | null;
    cree_le: string;
    maj_le: string;
    expire_le: string;
    vues: number;
    favoris: number;
    propositions_total: number;
  };
  categorie: Categorie;
  auteur: Auteur;
  propositions: {
    le: string;
    vendeur: string | null;
    statut: string;
    message: string | null;
    annonce: { id: string; titre: string; statut: E["product_status"]; prix_cents: number } | null;
  }[];
  visibilite: { mise_en_avant: boolean; urgent_jusqu_au: string | null; remontees: Remontee[] };
};

export type Fiche = FicheAnnonce | FicheRecherche;

// ── Les mots ────────────────────────────────────────────────────────────────

export const LIBELLE_MODE: Record<E["product_mode"], string> = { sale: "Vente", exchange: "Échange" };
export const LIBELLE_ACCES: Record<E["product_access_mode"], string> = { public: "Publique", controlled: "Accès contrôlé" };
export const LIBELLE_STATUT_RECHERCHE: Record<StatutRecherche, string> = {
  active: "Active",
  propositions_recues: "Offres reçues",
  en_discussion: "En discussion",
  trouve: "Trouvé",
  expiree: "Expirée",
  annulee: "Annulée",
};
export const LIBELLE_URGENCE: Record<E["je_cherche_urgency"], string> = {
  urgent: "Urgent",
  this_week: "Cette semaine",
  this_month: "Ce mois-ci",
};
export const LIBELLE_OPTION_VISIBILITE: Record<E["visibility_option"], string> = {
  bump: "Remontée",
  daily7: "Remontée quotidienne · 7 jours",
  daily14: "Remontée quotidienne · 14 jours",
  daily30: "Remontée quotidienne · 30 jours",
  urgent: "Badge « Urgent »",
  courtage: "Offre Flash",
};
export const LIBELLE_OPTION_ANNONCE: Record<E["listing_option_kind"], string> = {
  photo_pack: "Pack de photos",
  video_count: "Vidéos",
  video_duration: "Durée des vidéos",
  insertion_fee: "Frais d’insertion",
  edit_fee: "Frais de modification",
  courtage_duration: "Durée de l’Offre Flash",
  courtage_boost: "Relance de l’Offre Flash",
};
export const LIBELLE_ORIGINE_MODIFICATION: Record<E["listing_edit_origin"], string> = {
  seller: "Le vendeur",
  handtohand: "HandtoHand",
  // C'est le vendeur qui modifie, gratuitement, parce que l'équipe l'a demandé.
  moderation: "Le vendeur, sur demande de l’équipe",
};
export const LIBELLE_ECHANGE: Record<E["exchange_status"], string> = {
  pending: "en attente",
  accepted: "acceptée",
  declined: "refusée",
  withdrawn: "retirée",
  completed: "conclue",
};
export const LIBELLE_LIVRAISON: Record<FicheAnnonce["eligibilite"]["livraison"], string> = {
  contact: "Contact direct : ni paiement ni livraison par HandtoHand dans cette catégorie",
  sans_format: "Aucun format de colis : la livraison ne peut pas être facturée",
  sur_devis: "Format XXL : sur devis — remise en main propre ou transport à convenir",
  expedition: "Expédition possible",
};

/** L'adresse de la fiche d'une annonce ou d'une recherche — une seule porte pour les deux. */
export const cheminAnnonce = (id: string) => `/annonces/${encodeURIComponent(id)}`;

/** L'adresse de la liste, avec ses filtres ; une valeur vide n'y figure pas. */
export function adresseAnnonces(f: FiltresAnnonces): string {
  const p = new URLSearchParams();
  if (f.vue === "recherches") p.set("vue", "recherches");
  if (f.q) p.set("q", f.q);
  if (f.filtre) p.set("filtre", f.filtre);
  if (f.categorie) p.set("categorie", f.categorie);
  if (f.test) p.set("test", "1");
  const s = p.toString();
  return s ? `/annonces?${s}` : "/annonces";
}
