// Ce qui reste dû aux transporteurs tiers, tel que le back-office le lit
// (`bo_transporteurs_a_regler`).

export type DuTransporteur = {
  commande_id: string;
  numero: string;
  /**
   * Le mode d'envoi de l'ALLER — à titre indicatif : un retour facturé après
   * absence n'enregistre pas son transporteur. D'où le choix explicite.
   */
  mode_envoi: string;
  du_cents: number;
  /** Vrai si le montant inclut un retour au vendeur facturé après absence. */
  retour_inclus: boolean;
  depuis: string;
  est_test: boolean;
};

// Les quatre transporteurs professionnels : `h2h_logistic` et `pickup` ne
// facturent rien, la base refuse de les régler.
export const TRANSPORTEURS = [
  { id: "mondial_relay", libelle: "Mondial Relay" },
  { id: "colissimo", libelle: "Colissimo" },
  { id: "chronopost", libelle: "Chronopost" },
  { id: "ups", libelle: "UPS" },
] as const;

export type Transporteur = (typeof TRANSPORTEURS)[number]["id"];

export const LIBELLE_TRANSPORTEUR: Record<string, string> = Object.fromEntries(
  TRANSPORTEURS.map((t) => [t.id, t.libelle]),
);

const FORMAT = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
export const euros = (cents: number | null | undefined) => FORMAT.format(Number(cents ?? 0) / 100);

/** « 12,50 » → 1250 ; `null` si ce n'est pas un montant. */
export function centimes(saisie: string): number | null {
  const propre = saisie.replace(/\s|€/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(propre)) return null;
  return Math.round(Number(propre) * 100);
}

/** 1250 → « 12,50 », pour pré-remplir une saisie. */
export const saisieEuros = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");

// ── Les fonds à verser (`bo_fonds_lister`, migration 20260926013000) ─────────
//
// 🔴 UNE SEULE RÈGLE DÉCIDE CE QUI RETIENT L'ARGENT : `app.fonds_retenus`, que
// les versements lisent aussi. « Versable » ici est ce que le versement
// paierait, pas une estimation de l'écran.

/** Où en est ce qu'une commande doit à une personne. */
export type EtatFonds = "verse" | "retenu" | "versable" | "en_attente" | "rien" | "annule";
/** Ce qu'attend un dû « en attente ». */
export type AttenteFonds = "paiement" | "remise" | "fenetre";
/** Les cinq causes qui retiennent l'argent, dans l'ordre où l'écran les nomme. */
export type MotifRetenue = "reclamation" | "opposition" | "incident" | "creance" | "retenue";

export type Retenue = {
  motif: MotifRetenue;
  libelle: string;
  depuis: string;
  /** L'identifiant d'une retenue de l'équipe — la seule cause qui se lève d'ici. */
  retenue: string | null;
};

/** Une ligne de « Fonds à verser » : une commande, une personne qu'elle paie. */
export type FondsAVerser = {
  order_id: string;
  reference: string;
  bien: string | null;
  role: "vendeur" | "cotransporteur";
  beneficiaire_id: string;
  pseudo: string | null;
  du_cents: number;
  etat: "retenu" | "versable" | "en_attente";
  attente: AttenteFonds | null;
  versable_le: string | null;
  retenues: Retenue[];
  est_test: boolean;
};

export const FILTRES_FONDS = ["retenu", "versable", "en_attente"] as const;
export type FiltreFonds = (typeof FILTRES_FONDS)[number];

export const LIBELLE_ETAT_FONDS: Record<EtatFonds, string> = {
  verse: "Versé",
  retenu: "Retenu",
  versable: "Versable",
  en_attente: "En attente",
  rien: "Rien à verser",
  annule: "Commande annulée",
};

export const LIBELLE_FILTRE_FONDS: Record<FiltreFonds, string> = {
  retenu: "Retenus",
  versable: "Versables",
  en_attente: "En attente",
};

export const LIBELLE_ATTENTE: Record<AttenteFonds, string> = {
  paiement: "Paiement de l’acheteur pas encore encaissé",
  remise: "Colis pas encore remis",
  fenetre: "Fenêtre de réclamation en cours",
};

export const LIBELLE_ROLE_FONDS: Record<FondsAVerser["role"], string> = {
  vendeur: "Vendeur",
  cotransporteur: "Cotransporteur",
};

// ── Les ordres financiers (`bo_ordres_lister`, migration 20260926014000) ────
//
// §16.5 : « demandé, en cours, réussi, échoué » sont des statuts distincts ;
// avant eux la validation, après eux l'annulation.

export const STATUTS_ORDRE = ["en_validation", "demande", "en_cours", "reussi", "echoue", "annule"] as const;
export type StatutOrdre = (typeof STATUTS_ORDRE)[number];

export const LIBELLE_STATUT_ORDRE: Record<StatutOrdre, string> = {
  en_validation: "En validation",
  demande: "Demandé",
  en_cours: "En cours chez Stripe",
  reussi: "Réussi",
  echoue: "Échoué",
  annule: "Annulé",
};

/** Un ordre financier, tel que la liste de Paiements le lit. */
export type OrdreFinancier = {
  id: string;
  /** OF-000042. */
  ordre_ref: string;
  /** Le remboursement d'une commande, ou d'une option de visibilité (20261004003000). */
  nature: "remboursement" | "remboursement_option";
  statut: StatutOrdre;
  /** Nul pour une option. */
  commande_id: string | null;
  /** Le numéro de la commande ; pour une option, sa rétractation (RET-…) ou « Option … ». */
  reference: string;
  litige: boolean;
  montant_cents: number;
  /** Le motif INTERNE de l'équipe — jamais montré à l'acheteur. */
  motif: string;
  demande_par: string | null;
  cree_le: string;
  demande_le: string | null;
  termine_le: string | null;
  tentatives: number;
  erreur: string | null;
  /** L'identifiant du remboursement chez Stripe, une fois réussi. */
  stripe: string | null;
  validation_id: string | null;
  validation_statut: string | null;
  validation_expire_le: string | null;
  /** La base le dit : une autre personne, qui tient le rôle de valider. */
  peut_decider: boolean;
  reel: boolean;
  est_test: boolean;
  /** Une option : son annonce ou sa demande, l'option, sa rétractation, son avoir. */
  famille_option: "annonce" | "demande" | null;
  cible_id: string | null;
  option_id: string | null;
  retractation_ref: string | null;
  /** HTH-A-… : l'avoir émis à la réussite. */
  avoir: string | null;
};

// ── Le rapprochement avec Stripe (`bo_rapprochement_lire`, migration 20260927003000) ──
//
// 🔴 LA BASE JUGE : la fonction de nuit lit Stripe, la base dit ce qui est un
// écart. L'écran montre, et la Finance explique ; rien ne se corrige d'ici.

export type NatureEcart =
  | "paiement_inconnu"
  | "paiement_statut"
  | "paiement_montant"
  | "paiement_absent"
  | "remboursement_inconnu"
  | "remboursement_echoue"
  | "remboursement_montant"
  | "remboursement_absent"
  | "transfert_inconnu"
  | "transfert_montant"
  | "transfert_absent";

export type StatutEcart = "ouvert" | "resolu" | "explique";

/** Un passage de nuit, sur un compte Stripe. */
export type PassageRapprochement = {
  id: number;
  livemode: boolean;
  depuis: string;
  jusqu_a: string;
  demarre_le: string;
  fini_le: string | null;
  bilan: {
    paiements: number;
    remboursements: number;
    transferts: number;
    ecarts: number;
    nouveaux: number;
    resolus: number;
    tronques: string[];
    tout: boolean;
  } | null;
  erreur: string | null;
};

export type EcartRapprochement = {
  id: string;
  nature: NatureEcart;
  libelle: string;
  livemode: boolean;
  objet_stripe: string;
  commande_id: string | null;
  commande_ref: string | null;
  montant_stripe_cents: number | null;
  montant_base_cents: number | null;
  statut_stripe: string | null;
  statut_base: string | null;
  detail: string;
  statut: StatutEcart;
  constate_le: string;
  vu_le: string;
  resolu_le: string | null;
  explique_par: string | null;
  explique_le: string | null;
  motif: string | null;
  /** Nul quand rien ne dit le monde de l'objet (inconnu de la base). */
  est_test: boolean | null;
  dossier: string | null;
};

export type Rapprochement = { passages: PassageRapprochement[]; ecarts: EcartRapprochement[] };
