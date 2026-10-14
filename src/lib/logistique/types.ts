// L'annuaire des points de rendez-vous et les candidatures relais, tels que le
// back-office les lit (`bo_hubs_lister`, `bo_candidatures_relais_lister`).
import type { Acteur } from "@/lib/activite/types";
import type { Detenteur, RefusColisLu, StatutCandidature, StatutRecherche } from "@/lib/operations/types";

// ── L'annuaire des points de rendez-vous (§ 12.4, hand-to-hand `20261013005000`, `20261013006000`) ──

/** Où en est un point : une épingle à regarder, un point proposé, un point fermé, une épingle écartée. */
export type EtatHub = "a_valider" | "actif" | "ferme" | "ecarte";

/** Une ligne de l'annuaire, telle que `bo_hubs_lister` la rend. */
export type Hub = {
  id: string;
  nom: string | null;
  repere: string | null;
  detail_affiche: string | null;
  type_lieu: string;
  ville: string | null;
  region: string | null;
  latitude: number;
  longitude: number;
  /** Le rayon de la zone de rendez-vous, en mètres. */
  rayon_m: number;
  statut: string;
  etat: EtatHub;
  valide_le: string | null;
  /** La fermeture en cours, et son motif — interne : l'annuaire public ne le porte pas. */
  ferme_le: string | null;
  motif_fermeture: string | null;
  /** Tous ses signalements, examinés ou non. */
  signalements: number;
  dernier_signalement_le: string | null;
  /** Ceux qui attendent encore l'équipe (hand-to-hand `20261013008000`) : c'est eux que « Signalements à examiner » compte. */
  signalements_a_examiner: number;
  /**
   * Les trajets qui ne sont pas clos et qui passent par ce point.
   * ⚠️ LE POINT EST RÉEL, CE QUI Y PASSE A SON MONDE : un équipier de test ne compte et ne lit que le monde du
   * test ; un équipier réel compte les deux, et la fiche étiquette ce qui est du test.
   */
  trajets: number;
  /** Les rendez-vous qui restent à tenir à ce point : ils y restent, fermé ou non. */
  rendez_vous_en_cours: number;
  cree_le: string;
  /** L'adresse du LIEU — jamais celle d'une personne. */
  adresse_du_lieu: string | null;
  /** Les propositions en cours qui peuvent encore aboutir à ce point (hand-to-hand `20261013006000`). */
  propositions_en_cours: number;
  /**
   * La version du point : elle change dès qu'un champ corrigeable change. Le formulaire de correction rend celle
   * qu'il a lue — la base refuse s'il a été ouvert avant la correction d'un collègue, qu'il déferait sinon.
   */
  version: string;
};

/** Ce qui se pose et se corrige d'un point, tel que les formulaires le saisissent. */
export type PointSaisi = {
  type_lieu: string;
  repere: string;
  detail: string;
  ville: string;
  region: string;
  adresse: string;
  /** « latitude, longitude », comme une carte en ligne les donne à copier. */
  coordonnees: string;
  /** Vide : le rayon par défaut de la base, ou celui que le point a déjà. */
  rayon_m: string;
};

/**
 * Lit « 43.7046, 7.2619 » : la latitude puis la longitude, séparées par une virgule ou un espace, avec un point
 * décimal. `null` quand ce n'en est pas — la base refuserait de toute façon un point hors de la carte.
 */
export function lireCoordonnees(texte: string): { latitude: number; longitude: number } | null {
  const m = /^\s*(-?\d{1,3}(?:\.\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/.exec(texte);
  if (!m) return null;
  const latitude = Number(m[1]);
  const longitude = Number(m[2]);
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return { latitude, longitude };
}

/** Ce qu'un formulaire de point envoie : l'épingle déjà lue, le rayon ou rien. */
export type PointEnvoye = {
  type_lieu: string;
  repere: string;
  detail: string;
  ville: string;
  region: string | null;
  adresse: string | null;
  latitude: number;
  longitude: number;
  rayon_m: number | null;
};

/**
 * La saisie prête à partir, ou ce qui lui manque encore.
 * ⚠️ UN CONFORT, PAS LA RÈGLE : la base refuse elle-même un point mal nommé, et dit pourquoi.
 */
export function versPoint(p: PointSaisi): { point: PointEnvoye } | { manque: string } {
  if (!p.type_lieu) return { manque: "Choisissez le type de lieu." };
  if (p.repere.trim().length < 2) return { manque: "Écrivez le repère : le nom du lieu, pas une adresse." };
  if (p.detail.trim().length < 3) return { manque: "Écrivez le détail affiché : où se présenter." };
  if (!p.ville.trim()) return { manque: "Indiquez la ville." };
  const c = lireCoordonnees(p.coordonnees);
  if (!c) return { manque: "Collez les coordonnées du point : latitude, longitude — par exemple 43.7046, 7.2619." };
  let rayon: number | null = null;
  if (p.rayon_m.trim()) {
    rayon = Number(p.rayon_m);
    if (!Number.isInteger(rayon) || rayon < 20 || rayon > 300) return { manque: "Le rayon de la zone va de 20 à 300 mètres." };
  }
  return {
    point: {
      type_lieu: p.type_lieu,
      repere: p.repere.trim(),
      detail: p.detail.trim(),
      ville: p.ville.trim(),
      region: p.region.trim() || null,
      adresse: p.adresse.trim() || null,
      latitude: c.latitude,
      longitude: c.longitude,
      rayon_m: rayon,
    },
  };
}

export const POINT_VIDE: PointSaisi = {
  type_lieu: "",
  repere: "",
  detail: "",
  ville: "",
  region: "",
  adresse: "",
  coordonnees: "",
  rayon_m: "",
};

/** Un point tel qu'il est, sous la forme que le formulaire de correction reprend. */
export function saisieDe(h: Hub): PointSaisi {
  return {
    type_lieu: h.type_lieu,
    repere: h.repere ?? "",
    detail: h.detail_affiche ?? "",
    ville: h.ville ?? "",
    region: h.region ?? "",
    adresse: h.adresse_du_lieu ?? "",
    coordonnees: `${h.latitude}, ${h.longitude}`,
    rayon_m: String(h.rayon_m),
  };
}

/** Le détail d'un point publié dit où se présenter : la règle de la validation, côté écran. */
export function detailPubliable(detail: string | null): boolean {
  const d = (detail ?? "").trim();
  return d.length >= 12 && !/à compléter|a completer/i.test(d);
}

/** Le nom que la base calculera : « Hub » + type de lieu + repère (protocole de nommage). */
export function nomDuPoint(typeLieu: string, repere: string): string {
  return `Hub ${LIBELLE_LIEU[typeLieu] ?? typeLieu} ${repere.trim()}`.trim();
}

export const LIBELLE_CHAMP_HUB: Record<string, string> = {
  type_lieu: "Type de lieu",
  repere: "Repère",
  detail_affiche: "Détail affiché",
  ville: "Ville",
  region: "Région",
  adresse_du_lieu: "Adresse du lieu",
  latitude: "Latitude",
  longitude: "Longitude",
  rayon_m: "Rayon de la zone (m)",
};

/** Les filtres, dans l'ordre de la base (`app.bo_hubs_filtres`). */
export type FiltreHub = "signales" | "a_valider" | "actifs" | "fermes" | "ecartes";

export const FILTRES_HUB: FiltreHub[] = ["signales", "a_valider", "actifs", "fermes", "ecartes"];

export const LIBELLE_FILTRE_HUB: Record<FiltreHub, string> = {
  signales: "Signalements à examiner",
  a_valider: "À valider",
  actifs: "Actifs",
  fermes: "Fermés",
  ecartes: "Écartés",
};

export const LIBELLE_ETAT_HUB: Record<EtatHub, string> = {
  a_valider: "Épingle à valider",
  actif: "Actif",
  ferme: "Fermé",
  ecarte: "Épingle écartée",
};

/** Un compteur par filtre et le total, avec la même recherche que la liste. */
export type CompteursHubs = Record<FiltreHub | "tous", number>;

/** ⚠️ L'ANNUAIRE N'A PAS DE MONDE DU TEST : `test` reste faux, il ne sert qu'à partager les filtres des autres listes. */
export type FiltresHubs = { filtre: FiltreHub | null; q: string | null; test: false };

/** L'adresse de l'annuaire filtré : les filtres restent dans l'adresse (R4.10). */
export function adresseHubs(f: Pick<FiltresHubs, "filtre" | "q">): string {
  const p = new URLSearchParams({ onglet: "points" });
  if (f.filtre) p.set("filtre", f.filtre);
  if (f.q) p.set("q", f.q);
  return `/h2h-logistic?${p.toString()}`;
}

export const cheminHub = (id: string) => `/h2h-logistic/points/${encodeURIComponent(id)}`;

// Les valeurs de `hub_report_reason`, avec les mots de l'application du cotransporteur.
export const LIBELLE_RAISON_SIGNALEMENT_HUB: Record<string, string> = {
  closed: "Point fermé à l’horaire indiqué",
  wrong_address: "Adresse incorrecte ou introuvable",
  saturated: "Point saturé, pas de place",
  security: "Problème de sécurité",
  partner_uncooperative: "Partenaire peu coopératif",
  other: "Autre",
};

export type SignalementHub = {
  id: string;
  raison: string;
  explication: string | null;
  signale_le: string;
  /** Le pseudonyme de son auteur — rien d'autre de la personne. */
  signale_par: string | null;
  /** La référence de la co-livraison qui l'a amené là, quand il y en a une. */
  colivraison: string | null;
  pieces: number;
  /** Le nom du point au moment du signalement. */
  nom_alors: string | null;
  /** Son auteur est un compte du monde de test. */
  est_test: boolean;
  /**
   * Le compte personnel de l'appelant l'a fait : la base refuse qu'il l'examine (`BO_CONFLIT`), la fiche le marque
   * et ne le propose pas à l'examen.
   */
  le_votre: boolean;
  /** Son examen (hand-to-hand `20261013008000`) ; nul : il attend l'équipe. */
  examen: ExamenSignalementHub | null;
};

export type IssueSignalementHub = "fonde" | "non_fonde";

/**
 * L'examen d'un signalement de point : ce que l'équipe a constaté, la réponse que la personne a reçue dans
 * l'application du cotransporteur, et le motif gardé. Il ne change plus.
 *
 * ⚠️ CE N'EST PAS L'EXAMEN D'UN SIGNALEMENT DE CONTENU : un point n'est le contenu de personne. Ni « manquement aux
 * règles », ni recours ; c'est la Logistique qui examine.
 */
export type ExamenSignalementHub = {
  id: string;
  issue: IssueSignalementHub;
  reponse: string;
  motif: string;
  par: string | null;
  le: string;
};

export const LIBELLE_ISSUE_HUB: Record<IssueSignalementHub, string> = { fonde: "Fondé", non_fonde: "Non fondé" };

/** La phrase que l'avis écrit avant la réponse de l'équipe, selon l'issue (les mots de la base). */
export const PHRASE_EXAMEN_HUB: Record<IssueSignalementHub, string> = {
  fonde: "L’équipe HandtoHand a examiné votre signalement : elle a constaté le problème signalé.",
  non_fonde: "L’équipe HandtoHand a examiné votre signalement : elle n’a pas constaté le problème signalé.",
};

/** Ce qu'un examen laisse : ce qui attend encore sur ce point, dans le monde des personnes qui ont signalé. */
export type ExamenHubEcrit = { examen: string; hub: string; issue: IssueSignalementHub; signalements: number; restants: number };

export type FermetureHub = {
  motif: string;
  le: string;
  par: string | null;
  leve_le: string | null;
  leve_par: string | null;
  motif_levee: string | null;
};

export type FicheHub = {
  hub: Hub;
  validation: { le: string; par: string | null } | null;
  /** Les fermetures, la plus récente d'abord ; celle sans `leve_le` est en cours. */
  fermetures: FermetureHub[];
  signalements: SignalementHub[];
  trajets: {
    id: string;
    role: "collecte" | "remise";
    ville_depart: string;
    ville_arrivee: string;
    cotransporteur: string | null;
    situation: SituationTrajet;
    prochain_passage: string | null;
    est_test: boolean;
  }[];
  rendez_vous: {
    mission: string;
    ref: string | null;
    role: "collecte" | "remise";
    quand: string | null;
    moment: MomentColivraison;
    est_test: boolean;
  }[];
  /** Les propositions en cours qui peuvent encore aboutir à ce point : une ligne par candidature et par rôle. */
  propositions: {
    candidature: string;
    ref: string | null;
    role: "collecte" | "remise";
    etape: StatutRecherche;
    reponse: StatutCandidature;
    est_test: boolean;
  }[];
  /** Les autres points à moins de 150 mètres, le plus proche d'abord : un doublon se voit. */
  voisins: { id: string; nom: string; etat: EtatHub; distance_m: number }[];
  /** Les corrections, la plus récente d'abord ; `avant` et `apres` ne portent que ce qui a changé. */
  corrections: {
    le: string;
    par: string | null;
    motif: string;
    deplace_de_m: number | null;
    avant: Record<string, string | number | null> | null;
    apres: Record<string, string | number | null> | null;
  }[];
  /**
   * Les dossiers « À traiter » ouverts pour les signalements de ce point : un par monde — celui des comptes réels,
   * celui des comptes de test —, dans le monde que l'appelant lit.
   */
  dossiers: { id: string; reference: string; est_test: boolean }[];
  possibles: {
    valider: GestePossible;
    fermer: GestePossible;
    rouvrir: GestePossible;
    corriger: GestePossible;
    /** Examiner ses signalements : le rôle seulement — un équipier de test examine ceux des comptes de test. */
    examiner: GestePossible;
  };
};

export type CandidatureRelais = {
  id: string;
  candidat: string | null;
  nom: string;
  categorie: string;
  adresse: string;
  ville: string;
  region: string | null;
  latitude: number;
  longitude: number;
  horaires: string | null;
  capacite: number | null;
  /** Les deux derniers chiffres seulement : le numéro se dévoilera avec un motif (phase 1). */
  telephone_masque: string | null;
  message: string | null;
  est_test: boolean;
  depose_le: string;
};

// ⚠️ UN HUB ET LA BOUTIQUE D'UN RELAIS SONT DES LIEUX PUBLICS : les montrer sur
// une carte n'est pas suivre quelqu'un (R4.15 porte sur les personnes).
export const lienCarte = (lat: number, lng: number) => `https://www.google.com/maps?q=${lat},${lng}`;

// Les valeurs de `hub_place_type` (l'application n'en a que des icônes :
// `src/constants/typesDeLieu.ts`).
export const LIBELLE_LIEU: Record<string, string> = {
  parking: "Parking",
  gare: "Gare",
  station: "Station",
  entree: "Entrée",
  rond_point: "Rond-point",
  commerce: "Commerce",
  place: "Place",
  port: "Port",
  eglise: "Église",
  aire_covoiturage: "Aire de covoiturage",
  arret: "Arrêt",
};

export const LIBELLE_CATEGORIE: Record<string, string> = {
  domicile: "À domicile",
  cafe: "Café",
  bakery: "Boulangerie",
  grocery: "Épicerie",
  pharmacy: "Pharmacie",
  newsstand: "Presse",
  florist: "Fleuriste",
  bookstore: "Librairie",
  tabac: "Tabac",
  restaurant: "Restaurant",
  other: "Autre commerce",
};

// ── Les co-livraisons (§ 12.3, hand-to-hand `20261013002000`) ─────────────────
//
// Une ligne par co-livraison, telle que `bo_colivraisons_lister` la rend. L'étape,
// la prochaine action et l'acteur attendu sont ceux de l'Activité en direct : la
// base les lit au même endroit.

/** Où en est la co-livraison : à collecter, en route, remise, ou close sans remise (annulée, expirée, retournée). */
export type MomentColivraison = "a_collecter" | "en_route" | "remise" | "sans_remise";

export type Colivraison = {
  id: string;
  commande: string;
  /** La référence de l'opération : elle ouvre la fiche complète. */
  ref: string;
  suivi: string | null;
  retour: boolean;
  /** Née d'une recherche du § 5 des CGU H2H Logistic ; sinon, l'ancien parcours. */
  par_recherche: boolean;
  statut: string;
  etat_colis: string | null;
  moment: MomentColivraison;
  etape: string | null;
  etape_libelle: string | null;
  action_attendue: string | null;
  acteur_attendu: Acteur | null;
  echeance: string | null;
  alerte: "erreur" | "incident" | "retard" | null;
  alerte_libelle: string | null;
  bien_titre: string | null;
  format: string | null;
  /**
   * Les pseudonymes. ⚠️ `null` NE DIT PAS POURQUOI : un membre peut ne pas en
   * avoir choisi. L'écran dit « sans pseudonyme », jamais « compte effacé ».
   */
  vendeur: string | null;
  acheteur: string | null;
  cotransporteur: string | null;
  /** Un cotransporteur est-il désigné ? Dit à part : un pseudonyme absent ne le dit pas. */
  cotransporteur_designe: boolean;
  hub_collecte: string | null;
  ville_collecte: string | null;
  collecte_prevue: string | null;
  collecte_validee_le: string | null;
  hub_remise: string | null;
  ville_remise: string | null;
  remise_prevue: string | null;
  remise_validee_le: string | null;
  detenteur: Detenteur | null;
  incidents_ouverts: number;
  est_test: boolean;
  cree_le: string;
};

/** Les filtres, dans l'ordre de la base (`app.bo_colivraisons_filtres`). */
export type FiltreColivraison = "incidents" | "a_collecter" | "en_route" | "remises" | "sans_remise";

export const FILTRES_COLIVRAISON: FiltreColivraison[] = ["incidents", "a_collecter", "en_route", "remises", "sans_remise"];

export const LIBELLE_FILTRE_COLIVRAISON: Record<FiltreColivraison, string> = {
  incidents: "Incident ouvert",
  a_collecter: "À collecter",
  en_route: "En route",
  remises: "Remises",
  sans_remise: "Sans remise",
};

export const LIBELLE_MOMENT: Record<MomentColivraison, string> = {
  a_collecter: "À collecter",
  en_route: "En route",
  remise: "Remise",
  sans_remise: "Sans remise",
};

/** Un compteur par filtre et le total, avec la même recherche que la liste. */
export type CompteursColivraisons = Record<FiltreColivraison | "tous", number>;

export type FiltresColivraisons = { filtre: FiltreColivraison | null; q: string | null; test: boolean };

/** L'adresse de la liste filtrée : les filtres restent dans l'adresse (R4.10). */
export function adresseColivraisons(f: FiltresColivraisons): string {
  const p = new URLSearchParams({ onglet: "colivraisons" });
  if (f.filtre) p.set("filtre", f.filtre);
  if (f.q) p.set("q", f.q);
  if (f.test) p.set("test", "1");
  return `/h2h-logistic?${p.toString()}`;
}

// ── Les trajets (§ 12.2, hand-to-hand `20261013003000`) ───────────────────────
//
// Une ligne par trajet, telle que `bo_trajets_lister` la rend. Le prochain
// passage, ses places et les réservations se lisent là où la mise en relation
// les compte ; les raisons, là où elle les lit.

/** Où en est un trajet pour de nouvelles propositions : cinq situations qui s'excluent. */
export type SituationTrajet = "propose" | "suspendu" | "en_pause" | "indisponible" | "clos";

/** Ce qui écarte un trajet d'une recherche : les dix premières tiennent au trajet ou à son cotransporteur. */
export type RaisonTrajet =
  | "trajet_suspendu"
  | "trajet_inactif"
  | "sans_point_de_collecte"
  | "point_de_collecte_inactif"
  // Plus aucune remise n'y est possible (hand-to-hand `20261013007000`) : aucun de ses points de remise n'est
  // proposé (§ 5), ou son premier point de remise est fermé (l'ancien parcours pose la remise là).
  | "sans_point_de_remise_ouvert"
  | "premier_point_de_remise_inactif"
  | "hors_ligne"
  | "compte_restreint"
  | "role_inactif"
  | "en_attente_ailleurs"
  | "format"
  | "poids"
  | "corridor"
  | "partie_a_la_vente"
  | "autre_monde"
  | "deja_propose";

/** Ce qui écarte un passage d'un trajet, une fois le trajet retenu. */
export type RaisonPassage = "sans_point_de_remise" | "jour_off" | "complet" | "chevauchement";

export type AnomalieTrajet =
  | "sans_point_de_collecte"
  | "point_de_collecte_inactif"
  | "sans_point_de_remise"
  | "point_de_remise_inactif"
  | "surreserve";

export type Trajet = {
  id: string;
  cotransporteur_id: string;
  /** ⚠️ `null` NE DIT PAS POURQUOI : l'écran dit « sans pseudonyme ». */
  cotransporteur: string | null;
  type: "one_time" | "recurring";
  /** Les jours d'un trajet récurrent : 1 = lundi … 7 = dimanche. */
  jours: number[];
  /** Le départ d'un trajet ponctuel. */
  depart_le: string | null;
  ville_depart: string;
  ville_arrivee: string;
  hub_collecte: string | null;
  hubs_remise: string[];
  mode: string;
  places: number;
  taille_max: string;
  poids_max_kg: number;
  hors_hub: boolean;
  statut: string;
  situation: SituationTrajet;
  /** Toutes les raisons qui l'écartent de toute recherche, dans l'ordre de la base. */
  raisons: RaisonTrajet[];
  suspendu_le: string | null;
  /** Le prochain passage ; `null` pour un trajet clos, ou sans passage à venir. */
  prochain_passage: string | null;
  /** Le déplacement de ce prochain passage, confirmé par le cotransporteur (hand-to-hand `20261013004000`). */
  prochain_passage_confirme_le?: string | null;
  places_restantes: number | null;
  /** Les engagements à venir sur ce trajet. */
  reservations: number;
  colivraisons_en_cours: number;
  anomalies: AnomalieTrajet[];
  est_test: boolean;
  cree_le: string;
};

/** Les filtres, dans l'ordre de la base (`app.bo_trajets_filtres`). */
export type FiltreTrajet = "anomalies" | "proposes" | "suspendus" | "en_pause" | "indisponibles" | "clos";

export const FILTRES_TRAJET: FiltreTrajet[] = ["anomalies", "proposes", "suspendus", "en_pause", "indisponibles", "clos"];

export const LIBELLE_FILTRE_TRAJET: Record<FiltreTrajet, string> = {
  anomalies: "À examiner",
  proposes: "Proposés",
  suspendus: "Suspendus",
  en_pause: "En pause",
  indisponibles: "Indisponibles",
  clos: "Clos",
};

export const LIBELLE_SITUATION: Record<SituationTrajet, string> = {
  propose: "Proposé aux recherches",
  suspendu: "Propositions suspendues",
  en_pause: "En pause",
  indisponible: "Indisponible",
  clos: "Clos",
};

export const LIBELLE_RAISON_TRAJET: Record<RaisonTrajet, string> = {
  trajet_suspendu: "L’équipe a suspendu ses nouvelles propositions",
  trajet_inactif: "Le trajet n’est pas actif",
  sans_point_de_collecte: "Le trajet n’a pas de point de collecte",
  point_de_collecte_inactif: "Son point de collecte est fermé",
  sans_point_de_remise_ouvert: "Aucun de ses points de remise n’est ouvert",
  premier_point_de_remise_inactif: "Son premier point de remise est fermé : l’ancien parcours pose la remise à ce point",
  hors_ligne: "Le cotransporteur s’est mis hors ligne",
  compte_restreint: "Son compte est restreint pour la co-livraison, ou suspendu",
  role_inactif: "Son rôle de cotransporteur n’est pas actif",
  en_attente_ailleurs: "Il attend une décision dans une autre recherche (§ 5.2.6)",
  format: "Le trajet ne prend pas ce format de colis",
  poids: "Le trajet ne prend pas ce poids",
  corridor: "Le trajet ne relie pas ces deux villes",
  partie_a_la_vente: "Le cotransporteur est l’acheteur ou le vendeur",
  autre_monde: "Le trajet n’est pas du même monde (réel ou test) que la recherche",
  deja_propose: "Cette recherche lui a déjà fait une proposition",
};

export const LIBELLE_RAISON_PASSAGE: Record<RaisonPassage, string> = {
  sans_point_de_remise: "Aucun point de remise",
  jour_off: "« Pas aujourd’hui »",
  complet: "Complet",
  chevauchement: "Un autre engagement le chevauche",
};

export const LIBELLE_ANOMALIE_TRAJET: Record<AnomalieTrajet, string> = {
  sans_point_de_collecte: "Pas de point de collecte",
  point_de_collecte_inactif: "Point de collecte inactif",
  sans_point_de_remise: "Pas de point de remise",
  point_de_remise_inactif: "Point de remise inactif",
  surreserve: "Passage sur-réservé",
};

export const EXPLICATION_ANOMALIE_TRAJET: Record<AnomalieTrajet, string> = {
  sans_point_de_collecte:
    "Le trajet n’a plus de point de collecte : la mise en relation ne le propose à aucune recherche.",
  point_de_collecte_inactif:
    "Son point de collecte est fermé : le trajet n’est plus proposé tant que le point n’est pas rouvert. Son cotransporteur en a été prévenu.",
  sans_point_de_remise:
    "Aucun de ses arrêts de remise n’a de point de rendez-vous : aucun de ses passages ne peut être proposé.",
  point_de_remise_inactif:
    "Un de ses points de remise est fermé : il n’est plus proposé à la remise sur ce trajet. Quand cela arrête le trajet — il ne lui reste aucun point de remise ouvert, ou c’est son premier dans l’ancien parcours —, sa situation le dit : « Indisponible ».",
  surreserve: "Un de ses passages à venir porte plus d’engagements que de places.",
};

/** Un compteur par filtre et le total, avec la même recherche que la liste. */
export type CompteursTrajets = Record<FiltreTrajet | "tous", number>;

export type FiltresTrajets = { filtre: FiltreTrajet | null; q: string | null; test: boolean };

/** L'adresse de la liste filtrée : les filtres restent dans l'adresse (R4.10). */
export function adresseTrajets(f: FiltresTrajets): string {
  const p = new URLSearchParams({ onglet: "trajets" });
  if (f.filtre) p.set("filtre", f.filtre);
  if (f.q) p.set("q", f.q);
  if (f.test) p.set("test", "1");
  return `/h2h-logistic?${p.toString()}`;
}

export const cheminTrajet = (id: string) => `/h2h-logistic/trajets/${encodeURIComponent(id)}`;

const JOURS = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];

/** « lun., mer., ven. », « tous les jours », ou « aucun jour ». */
export function joursDits(jours: number[]): string {
  const dits = [...new Set(jours)].filter((j) => j >= 1 && j <= 7).sort((a, b) => a - b);
  if (dits.length === 0) return "aucun jour";
  if (dits.length === 7) return "tous les jours";
  return dits.map((j) => JOURS[j - 1]).join(", ");
}

// Les valeurs de `transport_mode`.
export const LIBELLE_MODE: Record<string, string> = {
  walking: "À pied",
  bike: "Vélo",
  scooter: "Scooter",
  moto: "Moto",
  car: "Voiture",
  utilitaire: "Utilitaire",
  bus: "Bus",
  train: "Train",
};

// ── La fiche d'un trajet (`bo_trajet_lire`) ───────────────────────────────────

export type ArretTrajet = {
  position: number;
  ville: string | null;
  /** L'heure de passage, à Paris (« 09:00:00 »). */
  heure: string | null;
  point: string | null;
  /** `null` : l'arrêt n'a pas de point de rendez-vous. */
  point_actif: boolean | null;
};

/** Un passage des sept prochains jours, tel que la mise en relation le compte. */
export type PassageTrajet = {
  collecte_le: string;
  fin_le: string;
  places: number;
  reserves: number;
  libre: boolean;
  jour_off: boolean;
  /** Le déplacement de ce jour-là, confirmé par le cotransporteur dans son application ; `null` sinon. */
  confirme_le?: string | null;
  ecarte: RaisonPassage | null;
};

export type ColivraisonDuTrajet = {
  id: string;
  ref: string;
  statut: string;
  moment: MomentColivraison;
  collecte_prevue: string | null;
  remise_prevue: string | null;
};

/**
 * « Examiner une incompatibilité » : une recherche ouverte du corridor, et ce qui
 * en écarte le trajet — lu maintenant, là où la mise en relation le lit.
 */
export type RechercheOuverte = {
  recherche: string;
  numero: number;
  /** La référence de la commande : elle ouvre la fiche de l'opération. */
  ref: string | null;
  t0: string;
  statut: "ouverte" | "choix" | "validation_vendeur";
  format: string;
  /** La collecte la plus proche qu'une proposition envoyée maintenant pourrait tenir. */
  des: string;
  jusqu_au: string;
  /** La recherche n'a plus le temps de prévenir un cotransporteur avant la fin de son horizon. */
  fenetre_close: boolean;
  /** Le statut de sa candidature dans cette recherche, s'il a reçu une proposition. */
  candidature: string | null;
  sur_ce_trajet: boolean | null;
  ecarte: RaisonTrajet | null;
  /** Ses passages dans la fenêtre de la recherche ; `null` quand une candidature ou une raison répond déjà. */
  passages: { collecte_le: string; ecarte: RaisonPassage | null }[] | null;
};

export type SuspensionTrajet = {
  numero: number;
  message: string;
  motif: string;
  suspendu_le: string;
  suspendu_par: string | null;
  leve_le: string | null;
  leve_par: string | null;
  motif_levee: string | null;
};

export type GestePossible = { possible: boolean; raison: string | null };

export type FicheTrajet = {
  trajet: Trajet;
  arrets: ArretTrajet[];
  passages: PassageTrajet[];
  colivraisons: ColivraisonDuTrajet[];
  /** Ses candidatures sur ce trajet, comptées par statut. */
  candidatures: Record<string, number>;
  recherches_ouvertes: RechercheOuverte[];
  suspensions: SuspensionTrajet[];
  possibles: { suspendre: GestePossible; reprendre: GestePossible };
};

// ── Les incidents (§ 12.5, hand-to-hand `20261014001000` et `20261014002000`) ──
//
// Un dossier par déclaration des formulaires 2, 4, 6, 7, 11 et 13, tel que
// `bo_incidents_lister` le rend. Sa contestation lui est rattachée : elle n'a
// pas sa ligne. La base dit où il en est, qui il attend, ce qu'il retient.
// 🔴 NI POSITION, NI CHEMIN D'UNE PIÈCE : la base n'en rend aucun.

/**
 * Où en est un incident : six situations qui s'excluent. `en_validation` : une
 * décision est préparée, elle attend la seconde clé d'un autre membre de l'équipe.
 */
export type SituationIncident = "contestable" | "conteste" | "a_examiner" | "en_validation" | "en_cloture" | "clos";

/** Qui il attend : la personne visée (son délai court), l'équipe, la plateforme (une clôture). `null` : clos. */
export type AttenteIncident = "partie" | "equipe" | "plateforme";

export type RoleIncident = "acheteur" | "vendeur" | "cotransporteur";

export type Incident = {
  /** La déclaration. */
  id: string;
  /** Le numéro du formulaire : 2, 4, 6, 7, 11 ou 13. */
  numero: number;
  formulaire: string;
  /** Le nom du dossier (cahier des charges, § 12.5). */
  nom: string;
  /** Le libellé du formulaire, tel que les participants le lisent. */
  libelle: string;
  etape: "collecte" | "remise";
  situation: SituationIncident;
  situation_libelle: string;
  attend: AttenteIncident | null;
  /** La fin du délai de contestation, tant qu'il court. */
  echeance: string | null;
  /** La plateforme devait clore depuis plus d'un quart d'heure. */
  alerte: "cloture_en_retard" | null;
  commande: string | null;
  /** La référence de l'opération : elle ouvre la fiche complète. */
  ref: string | null;
  colivraison: string | null;
  bien_titre: string | null;
  hub: string | null;
  ville: string | null;
  rendez_vous: string;
  declare_le: string;
  declarant_role: RoleIncident;
  /** ⚠️ `null` NE DIT PAS POURQUOI : un membre peut ne pas avoir choisi de pseudonyme. */
  declarant: string | null;
  /** La personne que la déclaration met en cause : celle qui peut la contester. `null` : un blocage ne vise personne. */
  partie_visee_role: RoleIncident | null;
  partie_visee: string | null;
  conteste_le: string | null;
  contestable_jusqu_au: string | null;
  pieces: number;
  retient_les_fonds: boolean;
  issue: string | null;
  /** Le dossier « À traiter » ouvert qui le porte, tant qu'il attend l'équipe. */
  dossier: string | null;
  dossier_id: string | null;
  est_test: boolean;
};

/** Les filtres, dans l'ordre de la base (`app.bo_incidents_filtres`). */
export type FiltreIncident = "a_traiter" | "contestables" | "en_cloture" | "clos";

export const FILTRES_INCIDENT: FiltreIncident[] = ["a_traiter", "contestables", "en_cloture", "clos"];

export const LIBELLE_FILTRE_INCIDENT: Record<FiltreIncident, string> = {
  a_traiter: "À examiner",
  contestables: "Contestation possible",
  en_cloture: "Clôture en cours",
  clos: "Clos",
};

/** Les six formulaires d'incident, dans l'ordre de leurs numéros (§ 12.5). */
export const NUMEROS_INCIDENT: number[] = [2, 4, 6, 7, 11, 13];

/** Le nom de chaque dossier, mot pour mot du cahier des charges : le sélecteur les nomme même sans les compteurs. */
export const NOM_INCIDENT: Record<number, string> = {
  2: "Acheteur absent à la remise",
  4: "Cotransporteur absent à la remise",
  6: "Remise bloquée",
  7: "Vendeur absent à la collecte",
  11: "Refus du Colis",
  13: "Collecte bloquée",
};

/** Un formulaire d'incident, tel que la base le nomme. */
export type FormulaireIncident = { numero: number; formulaire: string; nom: string; libelle: string };

/** Un compteur par filtre et le total, avec la même recherche et le même formulaire que la liste ; et les six formulaires. */
export type CompteursIncidents = Record<FiltreIncident | "tous", number> & { formulaires: FormulaireIncident[] };

export type FiltresIncidents = {
  filtre: FiltreIncident | null;
  /** Le numéro d'un formulaire d'incident. */
  formulaire: number | null;
  q: string | null;
  test: boolean;
};

/** L'adresse de la liste filtrée : les filtres restent dans l'adresse (R4.10). */
export function adresseIncidents(f: FiltresIncidents): string {
  const p = new URLSearchParams({ onglet: "incidents" });
  if (f.filtre) p.set("filtre", f.filtre);
  if (f.formulaire) p.set("formulaire", String(f.formulaire));
  if (f.q) p.set("q", f.q);
  if (f.test) p.set("test", "1");
  return `/h2h-logistic?${p.toString()}`;
}

export const cheminIncident = (id: string) => `/h2h-logistic/incidents/${encodeURIComponent(id)}`;

export const LIBELLE_ROLE_INCIDENT: Record<RoleIncident, string> = {
  acheteur: "Acheteur",
  vendeur: "Vendeur",
  cotransporteur: "Cotransporteur particulier",
};

/** Qui un incident attend, en clair. */
export const LIBELLE_ATTENTE_INCIDENT: Record<AttenteIncident, string> = {
  partie: "La personne visée",
  equipe: "L’équipe",
  plateforme: "Par la plateforme",
};

/** Une présence déclarée au rendez-vous de l'incident (« Je suis au hub »). 🔴 JAMAIS UNE POSITION. */
export type PresenceIncident = {
  etape: "recuperation" | "remise";
  partie: "vendeur" | "acheteur" | "cotransporteur";
  pseudo: string | null;
  rendez_vous: string | null;
  declaree_le: string;
  /** La première fois que la personne a été vue dans la zone ; `null` : jamais. */
  validee_le: string | null;
  dans_la_zone: boolean;
  retard_minutes: number | null;
  tentatives: number;
};

/** L'issue d'une décision de l'équipe : ce que la déclaration affirme est établi, ne l'est pas, ou ne se tranche pas. */
export type IssueIncident = "retenue" | "ecartee" | "classee";

export const ISSUES_INCIDENT: IssueIncident[] = ["retenue", "ecartee", "classee"];

export const LIBELLE_ISSUE_INCIDENT: Record<IssueIncident, string> = {
  retenue: "Retenue",
  ecartee: "Non retenue",
  classee: "Classée sans suite",
};

/**
 * L'issue d'une déclaration close, quelle que soit sa voie : la décision de
 * l'équipe (§ 12.5), la clôture d'une déclaration transmise, l'examen d'un refus
 * du colis du § 5.
 */
export const LIBELLE_ISSUE_DECLARATION: Record<string, string> = {
  retenue: "décision de l’équipe — déclaration retenue",
  ecartee: "décision de l’équipe — déclaration non retenue",
  classee: "décision de l’équipe — classée sans suite",
  traitee: "traitée par l’équipe",
  refus_effectif: "refus effectif — co-livraison annulée, frais du vendeur",
  refus_injustifie: "refus non retenu — co-livraison annulée, frais du cotransporteur",
  sans_objet: "sans objet — le colis a été pris en charge malgré le refus",
};

/** Ce que l'avis d'une décision dit de la déclaration, après la réponse de l'équipe (la base l'écrit). */
export const PHRASE_ISSUE_INCIDENT: Record<IssueIncident, string> = {
  retenue: "est retenue",
  ecartee: "n’est pas retenue",
  classee: "est classée sans suite",
};

/** La décision rendue sur un incident : deux clés, et la réponse que les trois participants ont reçue. */
export type DecisionIncident = {
  id: string;
  issue: IssueIncident;
  /** À qui un blocage retenu est imputé ; vide pour toute autre décision. */
  responsables: RoleIncident[];
  reponse: string;
  motif: string;
  prepare_par: string | null;
  valide_par: string | null;
  le: string;
};

/** Une décision préparée, qui attend sa seconde clé. */
export type ValidationIncident = {
  /** La demande : c'est elle que la seconde clé valide ou refuse. */
  id: string;
  issue: IssueIncident;
  responsables: RoleIncident[];
  reponse: string;
  motif: string;
  demandeur: string | null;
  demande_le: string;
  expire_le: string;
  /** L'appelant l'a préparée : il ne la valide pas. */
  la_votre: boolean;
  /** La base dit si l'appelant peut donner la seconde clé : un rôle qui valide, et pas celui qui a préparé. */
  peut_valider: boolean;
};

/** Ce que l'appelant peut : préparer une décision, ou pourquoi non ; et à qui l'incident, retenu, peut s'imputer. */
export type DecisionPossible = { possible: boolean; raison: string | null; imputables: RoleIncident[] };

export type ContestationIncident = {
  id: string;
  formulaire: string;
  numero: number | null;
  libelle: string;
  declaree_le: string;
  role: RoleIncident;
  par: string | null;
  motif: string | null;
  commentaire: string | null;
  reponses: Record<string, unknown> | null;
  pieces: number;
  statut: string;
};

/** Une ligne de ce que le protocole prévoit : à qui, quoi, combien — `null` : une ligne sans montant fixe. */
export type LigneProtocole = {
  partie: "buyer" | "seller" | "transporter" | "platform";
  nature: "refund" | "pay" | "fee" | "kept" | "unpaid";
  libelle: string;
  montant_cents: number | null;
};

export const LIBELLE_PARTIE_PROTOCOLE: Record<LigneProtocole["partie"], string> = {
  buyer: "Acheteur",
  seller: "Vendeur",
  transporter: "Cotransporteur particulier",
  platform: "HandtoHand",
};

export type FicheIncident = {
  incident: Incident;
  declaration: {
    motif: string | null;
    commentaire: string | null;
    reponses: Record<string, unknown> | null;
    exactitude_confirmee: boolean;
    statut: string;
  };
  /** Les délais propres au cas (§ 12.5), au protocole de la co-livraison. */
  delais: {
    tolerance_minutes: number | null;
    /** Le formulaire ne se dépose qu'une fois la tolérance écoulée (règle D0). */
    attente_exigee: boolean;
    declarable_des: string | null;
    declaree_apres_minutes: number;
    /** Le délai de déclaration d'un blocage (formulaires 6 et 13) ; `null` pour les autres. */
    declaration_minutes: number | null;
    declaration_jusqu_au: string | null;
    /** ⚠️ LE SERVEUR NE FAIT PAS RESPECTER CE DÉLAI : la fiche dit s'il l'a été. */
    declaree_dans_le_delai: boolean | null;
    contestation_heures: number | null;
    contestable_jusqu_au: string | null;
    regle: { code: string; titre: string; texte: string } | null;
    /** 🔴 TOUJOURS `null` : les applications n'enregistrent aucune prolongation. L'écran le dit. */
    prolongations: null;
  };
  presences: PresenceIncident[];
  contestations: ContestationIncident[];
  colivraison: {
    id: string;
    statut: string;
    etat_colis: string | null;
    /** Née d'une recherche du § 5 des CGU H2H Logistic ; sinon, l'ancien parcours. */
    par_recherche: boolean;
    detenteur: Detenteur | null;
    vendeur: string | null;
    acheteur: string | null;
    cotransporteur: string | null;
    hub_collecte: string | null;
    collecte_prevue: string | null;
    collecte_validee_le: string | null;
    hub_remise: string | null;
    remise_prevue: string | null;
    remise_validee_le: string | null;
  } | null;
  /** Ce que le protocole prévoit pour ce formulaire. ⚠️ CE N'EST PAS CE QUI A ÉTÉ FAIT : `execution` le dit. */
  protocole: { titre: string; note: string | null; lignes: LigneProtocole[] } | null;
  execution: {
    issue: string | null;
    reglements: number;
    frais: { role: string; frais_cents: number; le: string } | null;
  };
  retenues: { libelle: string; depuis: string; de_la_contestation: boolean }[];
  dossiers: { id: string; reference: string; source: string; ouvert: boolean; est_test: boolean }[];
  /** Les autres déclarations de la même co-livraison. */
  autres: {
    id: string;
    formulaire: string;
    numero: number | null;
    libelle: string;
    genre: "incident" | "contestation" | "annulation" | "commun";
    declare_le: string;
    role: RoleIncident;
    statut: string;
  }[];
  /** Le refus du colis d'une co-livraison du § 5 : la lecture de l'onglet Livraison, où il s'examine. */
  refus_colis: RefusColisLu | null;
  /** La décision de l'équipe, une fois validée ; `null` : aucune. */
  decision: DecisionIncident | null;
  /** La décision préparée qui attend sa seconde clé ; `null` : aucune. */
  validation: ValidationIncident | null;
  possibles: { decider: DecisionPossible };
  /**
   * L'appelant peut ouvrir les pièces : ses permissions.
   * 🔴 QUI PREND PART À LA CO-LIVRAISON NE LIT PAS CETTE FICHE : la base la lui refuse (`BO_CONFLIT`).
   */
  pieces_ouvrables: boolean;
};
