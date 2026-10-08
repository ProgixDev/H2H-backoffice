// Les formes que rendent `bo_operation_trouver` et `bo_operation_lire`
// (migration 20260926009000 de hand-to-hand) : la fiche complète d'une
// opération (§6).
//
// ⚠️ UN ONGLET FERMÉ VAUT `null`. La base le rend ainsi quand la permission de
// l'onglet manque (`droits` dit lesquelles l'équipier détient) : l'écran
// explique le refus, il n'affiche jamais un onglet vide qui laisserait croire
// qu'il n'y a rien.
import type { Database } from "@/lib/db/contrat/database.types";
import type { Echeance, Operation } from "@/lib/activite/types";
import type { Priorite } from "@/lib/dossiers/types";
import type { AttenteFonds, EtatFonds, Retenue, StatutOrdre } from "@/lib/paiements/types";

type E = Database["public"]["Enums"];

export type ObjetFiche = "orders" | "courtage_listings" | "live_sessions";

/** Une opération retrouvée par une référence (R6.1). */
export type Trouvee = {
  objet_table: ObjetFiche;
  objet_id: string;
  ref: string;
  type: "achat" | "flash" | "live";
  titre: string | null;
  /** Ce qui a correspondu : « Numéro de suivi », « Acheteur : pseudo »… */
  correspondance: string;
  est_test: boolean;
  cree_le: string;
};

export type SourceFait =
  | "etat"
  | "remise"
  | "litige"
  | "incident"
  | "paiement"
  | "document"
  | "annonce"
  | "notification"
  | "equipe"
  | "dossier"
  | "offre"
  | "acces"
  | "achat";

/** Un fait de la chronologie : du plus récent au plus ancien. */
export type Fait = {
  le: string;
  source: SourceFait;
  libelle: string;
  detail: string | null;
  montant_cents: number | null;
  acteur_type: "utilisateur" | "equipe" | "prestataire" | "plateforme" | null;
  /** « Acheteur · pseudo », le nom de l'équipier, « Stripe », « Par la plateforme ». */
  acteur: string | null;
  /** L'équipe seule l'a fait ou vu (R6.3). */
  interne: boolean;
};

export type ParticipantFiche = {
  role: "acheteur" | "vendeur" | "cotransporteur";
  profil: string;
  pseudo: string | null;
  est_test: boolean;
  compte_efface: boolean;
};

export type DossierFiche = {
  id: string;
  ref: string;
  titre: string;
  statut: "ouvert" | "clos";
  categorie: string;
  priorite: Priorite;
  equipe: string;
  responsable: string | null;
  cree_le: string;
  clos_le: string | null;
};

export type Droits = {
  transactions: boolean;
  paiements: boolean;
  logistique: boolean;
  litiges: boolean;
  attestations: boolean;
  flash: boolean;
  live: boolean;
  dossiers: boolean;
  traiter: boolean;
};

// ── Bien et accord ──────────────────────────────────────────────────────────

export type BienAchat = {
  articles: {
    titre: string;
    image: string | null;
    quantite: number;
    prix_unitaire_cents: number;
    prix_total_cents: number;
    annonce: string | null;
  }[];
  /** L'annonce telle qu'elle a été acceptée : celle de l'attestation, à défaut du reçu. */
  fige: {
    source: "attestation" | "recu";
    le: string;
    titre: string | null;
    description: string | null;
    categorie: string | null;
    etat: string | null;
    marque: string | null;
    modele: string | null;
    caracteristiques: Record<string, unknown> | null;
    accessoires_inclus: boolean | null;
    elements_confirmes: Record<string, unknown> | null;
  } | null;
  /** L'annonce aujourd'hui : elle a pu changer depuis l'achat. */
  annonce: {
    id: string;
    titre: string;
    statut: E["product_status"];
    type: E["listing_type"];
    accessoires_inclus: boolean | null;
    modifications_apres_achat: number;
  } | null;
  accord: {
    modele_frais: string | null;
    devise: string | null;
    prix_cents: number | null;
    livraison_cents: number | null;
    total_cents: number | null;
    frais_service_cents: number | null;
    service_part_vendeur_pct: number | null;
    service_part_vendeur_cents: number | null;
    service_part_acheteur_cents: number | null;
    livraison_total_cents: number | null;
    livraison_part_vendeur_pct: number | null;
    livraison_part_vendeur_cents: number | null;
    a_regler_par_le_vendeur_cents: number | null;
    commission_plateforme_cents: number | null;
  };
  colivraison: {
    prix_cents: number | null;
    part_cotransporteur_cents: number | null;
    part_plateforme_cents: number | null;
  } | null;
  negociation: Negociation;
};

/**
 * Ce qui a précédé l'accord (R10.4, migration 20260927001000) : les offres de la
 * messagerie entre ces deux-là sur ce bien, avant l'achat — jamais le texte d'un
 * message —, l'accès demandé, et pour une Offre Flash, les propositions et l'accès.
 */
export type Negociation = {
  type_annonce: E["listing_type"] | null;
  prix_paye_cents: number | null;
  offres: {
    montant_cents: number;
    statut: E["offer_status"] | null;
    de: "acheteur" | "vendeur" | null;
    le: string;
  }[];
  acces: { statut: E["access_request_status"]; demande_le: string; decide_le: string | null } | null;
  flash: {
    propositions: { montant_cents: number; retiree: boolean; le: string }[];
    acces: {
      mode: E["courtage_selection_mode"];
      statut: E["purchase_access_status"];
      accorde_le: string;
      expire_le: string;
    } | null;
  } | null;
};

export type AchatNe = { id: string; ref: string; statut: string; total_cents: number; cree_le: string };

export type BienFlash = {
  article: {
    id: string;
    titre: string;
    description: string | null;
    etat: E["product_condition"] | null;
    categorie: string | null;
    prix_depart_cents: number;
    statut: E["product_status"];
  };
  statut: E["courtage_status"];
  mode: E["courtage_selection_mode"] | null;
  offres_fin: string | null;
  choix_fin: string | null;
  rechoix_fin: string | null;
  tentatives_exclu: number | null;
  vagues_flash: number | null;
  vendu_a: string | null;
  offres: {
    acheteur: string | null;
    montant_cents: number;
    le: string;
    retiree: boolean;
    masquee: boolean;
    anonyme: boolean;
    remise_preferee: E["courtage_handover"] | null;
    compatible_h2h: boolean | null;
  }[];
  acces: {
    acheteur: string | null;
    mode: E["courtage_selection_mode"];
    vague: number | null;
    accorde_le: string;
    expire_le: string;
    statut: E["purchase_access_status"];
  }[];
  achats: AchatNe[];
};

export type BienLive = {
  titre: string;
  image: string | null;
  format: E["live_format"] | null;
  statut: E["live_status"];
  diffusion: E["live_stream_state"] | null;
  programme_le: string | null;
  debut: string | null;
  fin: string | null;
  places: number | null;
  places_vip: number | null;
  /** Toujours nul : l'application ne compte pas les spectateurs (hand-to-hand 20261002004000). */
  spectateurs: number | null;
  /** Le moment du déroulé, lu sur l'horloge du live : « Article 3 sur 8 · offres », « Live terminé »… */
  deroule: string | null;
  articles_prevus: number | null;
  rediffusion: boolean;
  articles: {
    position: number;
    titre: string | null;
    prix_depart_cents: number | null;
    phase: E["live_article_phase"] | null;
    phase_fin: string | null;
    issue: E["live_article_outcome"] | null;
    mode: E["live_selection_mode"] | null;
    vendu_a: string | null;
    vendu_le: string | null;
    offres: number;
    meilleure_offre_cents: number | null;
  }[];
  /** `role.etat` → nombre de places, par exemple `buyer.confirmed`. */
  sieges: Record<string, number>;
  acces: {
    article: string | null;
    acheteur: string | null;
    mode: E["live_selection_mode"];
    vague: number | null;
    accorde_le: string;
    expire_le: string;
    statut: E["purchase_access_status"];
  }[];
  achats: AchatNe[];
};

// ── Paiements ───────────────────────────────────────────────────────────────

export type Paiements = {
  paiements: {
    id: string;
    objet: string;
    statut: E["payment_status"];
    montant_cents: number;
    devise: string | null;
    stripe: string | null;
    reel: boolean | null;
    cree_le: string;
    maj_le: string;
  }[];
  remboursements: {
    montant_cents: number;
    motif: string | null;
    stripe: string | null;
    le: string;
    par: string | null;
    litige: boolean;
  }[];
  demandes: {
    statut: "en_cours" | "reussi" | "echoue";
    montant_cents: number;
    erreur: string | null;
    demande_le: string;
    clos_le: string | null;
    par: string | null;
  }[];
  oppositions: {
    montant_cents: number;
    frais_cents: number | null;
    motif: string | null;
    statut: string | null;
    issue: string | null;
    preuves_avant: string | null;
    ouverte_le: string | null;
    close_le: string | null;
    stripe: string;
  }[];
  ecritures: {
    le: string;
    evenement: E["ledger_event"];
    sens: "D" | "C";
    compte: E["ledger_account_kind"];
    montant_cents: number;
    statut: E["tx_status"];
    libelle: string | null;
    groupe: string;
  }[];
  /**
   * L'état des fonds (R15.2, migration 20260926013000) : ce que l'achat doit à
   * chaque personne qu'il paie, ce qui le retient, et les retenues de l'équipe.
   */
  fonds: {
    beneficiaires: {
      role: "vendeur" | "cotransporteur";
      profil: string;
      pseudo: string | null;
      du_cents: number;
      etat: EtatFonds;
      attente: AttenteFonds | null;
      versable_le: string | null;
      verse_le: string | null;
    }[];
    /** Tout ce qui retient l'argent, maintenant. `beneficiaire` nul : pour tous. */
    retenues: (Retenue & { beneficiaire: string | null; pseudo: string | null })[];
    /** Les retenues de l'équipe, posées puis levées — la plus récente d'abord. */
    historique: {
      id: string;
      beneficiaire: string | null;
      pseudo: string | null;
      motif: string;
      posee_par: string | null;
      posee_le: string;
      levee_par: string | null;
      levee_le: string | null;
      motif_levee: string | null;
    }[];
  };
  /** Les ordres financiers de l'achat (migration 20260926014000), du plus récent au plus ancien. */
  ordres: {
    id: string;
    ref: string;
    nature: "remboursement";
    statut: StatutOrdre;
    montant_cents: number;
    litige: boolean;
    /** Le motif INTERNE de l'équipe. */
    motif: string;
    demande_par: string | null;
    cree_le: string;
    demande_le: string | null;
    termine_le: string | null;
    erreur: string | null;
    stripe: string | null;
    tentatives: number;
    reel: boolean;
    reprise: Record<string, unknown> | null;
    validation: {
      id: string;
      statut: string;
      expire_le: string;
      valideur: string | null;
      decide_le: string | null;
      motif_decision: string | null;
      peut_decider: boolean;
    } | null;
    essais: {
      numero: number;
      le: string;
      resultat: "reussi" | "en_attente" | "echoue" | "inconnu" | null;
      erreur: string | null;
      stripe: string | null;
      verifications: number;
    }[];
  }[];
  /** Ce qu'un nouvel ordre pourrait encore rendre, ordres en route déduits. */
  remboursable_cents: number;
};

// ── Livraison ───────────────────────────────────────────────────────────────

/**
 * La mise en relation du § 5 des CGU H2H Logistic (hand-to-hand `20261006001000`,
 * lue par la fiche depuis `20261008001000`). Des textes contraints en base, pas
 * des énumérations : les unions sont écrites ici, et chaque libellé les couvre.
 */
export type StatutRecherche = "ouverte" | "choix" | "validation_vendeur" | "confirmee" | "annulee";
export type StatutCandidature =
  | "proposee"
  | "refusee"
  | "expiree"
  | "close"
  | "en_attente"
  | "non_selectionnee"
  | "retenue"
  | "retiree"
  | "refusee_vendeur"
  | "expiree_vendeur"
  | "confirmee"
  | "non_retenue"
  /** Confirmée, puis la co-livraison annulée (hand-to-hand 20261008004000) : elle ne tient plus le passage. */
  | "annulee";
/** Pourquoi une candidature en attente ne pourrait pas être choisie maintenant (`app.colivraison_selectionnable`). */
export type RaisonIndisponible =
  | "statut"
  | "trajet_indisponible"
  | "cotransporteur_indisponible"
  | "temporairement_indisponible"
  | "trop_proche"
  | "complet";
/** `achat_annule` (hand-to-hand 20261008002000) : l'achat est tombé — support, conditions changées, autorisation
 * expirée, encaissement tardif — et sa recherche avec lui. */
export type MotifAnnulationRecherche =
  | "sans_candidat"
  | "choix_expire"
  | "achat_annule"
  /** La co-livraison annulée par l'un des trois (hand-to-hand 20261008004000). */
  | "annulee_acheteur"
  | "annulee_vendeur"
  | "annulee_cotransporteur";

export type CandidatureColivraison = {
  id: string;
  statut: StatutCandidature;
  /** Le pseudonyme ; `null` pour un compte effacé. */
  cotransporteur: string | null;
  proposee_le: string;
  repondre_avant: string;
  repondue_le: string | null;
  /** Combien de passages la proposition offrait. */
  passages: number;
  collecte_le: string | null;
  express: boolean | null;
  hub_collecte: string | null;
  hub_remise: string | null;
  remise_le: string | null;
  choisie_le: string | null;
  decision_vendeur_le: string | null;
  close_le: string | null;
  /** Le motif du cotransporteur qui a refusé la proposition. */
  motif_refus: string | null;
  /** Le motif du vendeur qui a refusé ce cotransporteur. */
  motif_vendeur: string | null;
  participation_cents: number;
  raison: RaisonIndisponible | null;
  /** Entre la confirmation et la collecte, pour la candidature confirmée. */
  marge_tenue_minutes: number | null;
};

export type RechercheColivraison = {
  id: string;
  numero: number;
  statut: StatutRecherche;
  /** 2 et plus : un remplaçant a été cherché (§ 5.3.3). */
  tour: number;
  t0: string;
  collecte_min: string;
  collecte_max: string;
  express_avant: string;
  choix_jusqu_au: string | null;
  validation_jusqu_au: string | null;
  confirmee_le: string | null;
  annulee_le: string | null;
  motif_annulation: MotifAnnulationRecherche | null;
  ville_depart: string;
  ville_arrivee: string;
  format: E["parcel_format"];
  /** Les délais et la marge du protocole figé sur la recherche, en minutes. */
  reponse_minutes: number;
  choix_minutes: number;
  validation_minutes: number;
  marge_minutes: number;
  /** Combien de cotransporteurs ont reçu la proposition. */
  propositions: number;
  candidatures: CandidatureColivraison[];
};

export type Livraison = {
  /** Les recherches de cotransporteur du § 5, la plus récente d'abord. */
  recherches?: RechercheColivraison[];
  mode: E["shipping_method"] | null;
  transporteur: E["carrier_key"] | null;
  suivi: string | null;
  /** La commune seule : l'adresse reste masquée. */
  ville_destination: string | null;
  envois: {
    id: string;
    etat: E["shipment_state"];
    mode: E["shipping_method"];
    suivi: string | null;
    format: E["parcel_format"] | null;
    assurance: E["insurance_tier"] | null;
    couverture_cents: number | null;
    cotransporteur: string | null;
    hub_depart: string | null;
    hub_arrivee: string | null;
    collecte_debut: string | null;
    collecte_fin: string | null;
    remise_prevue: string | null;
    tolerance_minutes: number | null;
    tentative: number | null;
    tentatives_max: number | null;
    expedie_le: string | null;
    relais_le: string | null;
    relais_retour_avant: string | null;
    livre_le: string | null;
    presume_le: string | null;
    reception_confirmee_le: string | null;
    absence_declaree_le: string | null;
    cree_le: string;
  }[];
  missions: {
    id: string;
    statut: E["mission_status"];
    retour: boolean;
    suivi: string | null;
    cotransporteur: string | null;
    format: E["parcel_format"] | null;
    poids_kg: number | null;
    hub_collecte: string | null;
    ville_collecte: string | null;
    hub_remise: string | null;
    ville_remise: string | null;
    hors_point_de_rendez_vous: boolean;
    collecte_prevue: string | null;
    remise_prevue: string | null;
    tolerance_minutes: number | null;
    collecte_validee_le: string | null;
    remise_validee_le: string | null;
    hub_remise_choisi_le: string | null;
    proposition_expire_le: string | null;
    vendeur_avant: string | null;
    tentative: number | null;
    tentatives_max: number | null;
    annulation: E["cancellation_reason"] | null;
    refus: number;
    cree_le: string;
  }[];
  refus: { le: string; motif: string | null; cotransporteur: string | null }[];
};

// ── Documents ───────────────────────────────────────────────────────────────

export type Documents = {
  attestations: {
    id: string;
    version: number;
    statut: E["attestation_status"];
    reference: string | null;
    creee_le: string;
    figee_le: string | null;
    signee_vendeur_le: string | null;
    signee_acheteur_le: string | null;
    decision_acheteur: E["buyer_decision"] | null;
    empreinte: string | null;
    document: boolean;
    preuve_signature: boolean;
    photos: {
      id: string;
      emplacement: string;
      prise_le: string | null;
      dans_l_application: boolean | null;
      lisible: boolean | null;
    }[];
  }[] | null;
  recus: {
    id: string;
    numero: string;
    statut: E["receipt_status"];
    total_cents: number;
    prix_cents: number;
    protection_cents: number | null;
    livraison_cents: number | null;
    autres_frais_cents: number | null;
    colivraison_cents: number | null;
    mise_en_relation_cents: number | null;
    finalise_le: string | null;
    remplace: boolean | null;
    remplace_le_numero: string | null;
  }[] | null;
  factures: {
    id: string;
    numero: string;
    total_cents: number;
    livraison_cents: number | null;
    service_cents: number | null;
    emise_le: string;
    pdf: boolean;
  }[] | null;
  preuves: {
    id: string;
    auteur: E["claim_party"];
    nature: E["claim_proof_kind"];
    precision: string;
    dans_l_application: boolean;
    complementaire: boolean;
    prise_le: string;
    ajoutee_le: string;
  }[] | null;
  pieces_incidents: { incident: string; formulaire: string; pieces: number; declare_le: string | null }[] | null;
  /** Les photos de la remise et de l'absence : leur ligne, jamais leur chemin. */
  photos_remise: { nature: "photo_remise" | "photo_absence"; id: string; le: string | null; libelle: string }[] | null;
};

// ── Échanges ────────────────────────────────────────────────────────────────

export type Echanges = {
  conversations: {
    id: string;
    nature: E["conversation_kind"];
    ouverte_le: string;
    messages: number;
    dernier_message_le: string | null;
  }[];
  consultation_acheteur: boolean | null;
  consultation_vendeur: boolean | null;
};

// ── Litiges ─────────────────────────────────────────────────────────────────

export type Reclamation = {
  id: string;
  famille: E["claim_family"];
  parcours: E["claim_journey"] | null;
  motif: string | null;
  description: string | null;
  etat_colis: E["package_state"] | null;
  dommages: string[] | null;
  detail_dommages: string | null;
  usage: string | null;
  solution_demandee: E["requested_solution"] | null;
  solution_convenue: E["requested_solution"] | null;
  phase: E["claim_phase"];
  decision: E["support_decision"] | null;
  decision_cents: number | null;
  echeance: string | null;
  echeance_amiable: string | null;
  echeance_retour: string | null;
  echeance_validation_retour: string | null;
  frais_retour: E["return_fee_payer"] | null;
  exception_frais_retour: E["return_fee_exception"] | null;
  consultation_autorisee: boolean | null;
  bonne_foi: boolean | null;
  ouvert_le: string;
  clos_le: string | null;
  rembourse_cents: number;
  observations: { auteur: E["claim_party"]; texte: string; le: string }[];
  reponse_vendeur: {
    conformite: string | null;
    authenticite: string | null;
    observations: string | null;
    proposition: string | null;
    montant_partiel_cents: number | null;
    motif_partiel: string | null;
    transporteur_retour: string | null;
    commentaire_retour: string | null;
    adresse_retour_donnee: boolean;
    consultation_autorisee: boolean | null;
    bonne_foi: boolean | null;
    le: string | null;
  } | null;
  retours: {
    transporteur: string;
    suivi_mode: E["return_tracking_mode"];
    suivi: string | null;
    emballage: string | null;
    expedie_le: string | null;
    recu_le: string | null;
    contestation: string | null;
    note_contestation: string | null;
    cree_le: string;
  }[];
  /** L'un des onze motifs du cahier des charges (migration 20260926015000) ; `null` : à qualifier. */
  motif_litige: string | null;
  motif_litige_libelle: string | null;
  qualifications: { motif: string; libelle: string | null; justification: string; par: string | null; le: string }[];
  /** Chaque décision, dans l'ordre : la première, les suivantes. */
  decisions: {
    rang: number;
    decision: E["support_decision"];
    montant_cents: number | null;
    motif: string | null;
    par: string | null;
    le: string | null;
    source: "back_office" | "support_mobile" | "reprise";
    /** Le recours que cette décision tranche. */
    recours: string | null;
  }[];
  recours: {
    id: string;
    decision_rang: number;
    partie: E["claim_party"];
    canal: string;
    texte: string;
    recu_le: string;
    enregistre_par: string | null;
    statut: "a_examiner" | "recevable" | "irrecevable" | "tranche";
    examine_par: string | null;
    examine_le: string | null;
    motif_examen: string | null;
  }[];
  enquetes: {
    id: string;
    transporteur: string;
    suivi: string | null;
    reference: string;
    echeance: string | null;
    note: string | null;
    ouverte_par: string | null;
    ouverte_le: string;
    statut: "ouverte" | "conclue";
    issue: "perdu" | "livre_confirme" | "endommage" | "retrouve" | "sans_suite" | null;
    conclusion: string | null;
    conclue_par: string | null;
    conclue_le: string | null;
  }[];
};

export type Incident = {
  id: string;
  formulaire: E["incident_form_type"];
  formulaire_libelle: string;
  declarant_role: E["declarant_role"];
  declarant: string | null;
  hub: string | null;
  rendez_vous: string;
  declare_le: string | null;
  statut: E["mission_form_status"];
  motif: string | null;
  commentaire: string | null;
  reponses: Record<string, unknown> | null;
  exactitude_confirmee: boolean;
  contestation_avant: string | null;
  conteste: string | null;
  issue: string | null;
  pieces: number;
  /** Absence, refus de colis… ; `null` : à qualifier (ou une contestation, lue avec l'incident qu'elle conteste). */
  motif_litige: string | null;
  motif_litige_libelle: string | null;
};

export type Litiges = { reclamations: Reclamation[]; incidents: Incident[]; oppositions: number };

// ── Notes internes ──────────────────────────────────────────────────────────

export type Notes = {
  notes: { id: number; le: string; auteur: string | null; texte: string; dossier: string; dossier_id: string }[];
  /** Le dossier ouvert de l'opération, où la prochaine note s'écrira. */
  dossier_ouvert: { id: string; ref: string } | null;
};

// ── La fiche ────────────────────────────────────────────────────────────────

export type Fiche = {
  operation: Operation;
  cree_le: string;
  participants: ParticipantFiche[];
  echeances: Echeance[];
  dossiers: DossierFiche[];
  droits: Droits;
  chronologie: Fait[];
  chronologie_tronquee: boolean;
  bien: BienAchat | BienFlash | BienLive | null;
  paiements: Paiements | null;
  livraison: Livraison | null;
  documents: Documents | null;
  echanges: Echanges | null;
  litiges: Litiges | null;
  notes: Notes | null;
};

// ── Les onglets (R6.2) ──────────────────────────────────────────────────────

export const ONGLETS = [
  "resume",
  "bien-et-accord",
  "chronologie",
  "paiements",
  "livraison",
  "documents",
  "echanges",
  "litiges",
  "notes-internes",
] as const;
export type Onglet = (typeof ONGLETS)[number];

export const LIBELLE_ONGLET: Record<Onglet, string> = {
  resume: "Résumé",
  "bien-et-accord": "Bien et accord",
  chronologie: "Chronologie",
  paiements: "Paiements",
  livraison: "Livraison",
  documents: "Documents",
  echanges: "Échanges",
  litiges: "Litiges",
  "notes-internes": "Notes internes",
};

/** Une offre Flash ou un live n'a ni paiement, ni livraison, ni litige propres : chaque vente a sa fiche d'achat. */
export function ongletsDe(table: ObjetFiche): Onglet[] {
  return table === "orders" ? [...ONGLETS] : ["resume", "bien-et-accord", "chronologie", "notes-internes"];
}

/** L'adresse d'une fiche : sa référence, et l'onglet s'il n'est pas le premier. */
export function cheminFiche(ref: string, onglet?: Onglet): string {
  const base = `/operations/${encodeURIComponent(ref)}`;
  return onglet && onglet !== "resume" ? `${base}?onglet=${onglet}` : base;
}

// ── Les consultations (§21) ─────────────────────────────────────────────────
// Ce que `bo_reveler`, `bo_ouvrir_piece` et `bo_echanges_lire` rendent
// (migration 20260926011000 de hand-to-hand). Chacune est une consultation
// journalisée, avec un motif.

/** Les données qu'un équipier peut révéler — le registre `ref.bo_champs_sensibles`. */
export const CHAMPS_SENSIBLES = [
  "acheteur.nom",
  "acheteur.email",
  "acheteur.telephone",
  "acheteur.identite_verifiee",
  "vendeur.nom",
  "vendeur.email",
  "vendeur.telephone",
  "vendeur.identite_verifiee",
  "cotransporteur.nom",
  "cotransporteur.email",
  "cotransporteur.telephone",
  "livraison.adresse",
  "attestation.vendeur",
  "attestation.acheteur",
  // Les données d'un compte (migration 20260930002000) : révélées depuis sa fiche, jamais depuis un achat.
  "compte.nom",
  "compte.email",
  "compte.telephone",
  "compte.identite_verifiee",
  "compte.adresses",
] as const;
export type ChampSensible = (typeof CHAMPS_SENSIBLES)[number];

export type DonneeRevelee = { champ: ChampSensible; libelle: string; valeur: string | null };

/** Les pièces qui s'ouvrent par un ticket de cinq minutes. */
export type NaturePiece =
  | "document_attestation"
  | "photo_attestation"
  | "preuve_litige"
  | "piece_incident"
  | "photo_remise"
  | "photo_absence"
  | "image_message";

/** Une pièce ouverte : son adresse signée, valable une minute, pour le ticket pris. */
export type PieceOuverte = { url: string; expire_le: string };

export type MessageLu = {
  id: string;
  le: string;
  type: E["message_type"];
  auteur: string | null;
  role: "acheteur" | "vendeur" | "cotransporteur" | null;
  texte: string | null;
  montant_cents: number | null;
  statut_offre: E["offer_status"] | null;
  /** L'image ne vient pas avec le message : elle s'ouvre à part (`image_message`). */
  image: boolean;
  duree_appel: string | null;
};

export type EchangesLus = {
  conversation: { id: string; nature: E["conversation_kind"]; ouverte_le: string };
  messages: MessageLu[];
  tronquee: boolean;
};
