// L'annuaire des points de rendez-vous et les candidatures relais, tels que le
// back-office les lit (`bo_hubs_a_valider`, `bo_candidatures_relais_lister`).
import type { Acteur } from "@/lib/activite/types";
import type { Detenteur } from "@/lib/operations/types";

export type HubAValider = {
  id: string;
  nom: string | null;
  repere: string | null;
  detail_affiche: string | null;
  type_lieu: string;
  ville: string | null;
  region: string | null;
  latitude: number;
  longitude: number;
  statut: string;
  cree_le: string;
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

/** Ce qui écarte un trajet d'une recherche : les sept premières tiennent au trajet ou à son cotransporteur. */
export type RaisonTrajet =
  | "trajet_suspendu"
  | "trajet_inactif"
  | "sans_point_de_collecte"
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
    "Son point de collecte n’est plus actif, et le trajet reste proposé : la mise en relation ne lit pas encore l’état d’un point.",
  sans_point_de_remise:
    "Aucun de ses arrêts de remise n’a de point de rendez-vous : aucun de ses passages ne peut être proposé.",
  point_de_remise_inactif:
    "Un de ses points de remise n’est plus actif, et reste proposé aux acheteurs : la mise en relation ne lit pas encore l’état d’un point.",
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
