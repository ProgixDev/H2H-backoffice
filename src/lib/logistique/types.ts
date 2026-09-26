// L'annuaire des points de rendez-vous et les candidatures relais, tels que le
// back-office les lit (`bo_hubs_a_valider`, `bo_candidatures_relais_lister`).

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
