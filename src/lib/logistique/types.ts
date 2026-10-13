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
