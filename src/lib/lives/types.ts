// Les lives tels que le back-office les lit (`bo_lives_lister`, `bo_lives_compteurs`,
// `bo_live_places_lister`) : chaque live dans sa zone, au moment de son déroulé
// lu sur l'horloge du live (§14), ses articles, ses places, ce qui ne va pas.
import type { Database } from "@/lib/db/contrat/database.types";

type E = Database["public"]["Enums"];

/** La zone d'un live (R14.1). */
export type ZoneLive = "programme" | "en_direct" | "termine";

/** Un filtre de la liste : une zone, les rediffusions, ou ce qui ne va pas. */
export type FiltreLive = ZoneLive | "rediffusions" | "anomalie";

/** Les onglets de la rubrique : les filtres, plus les réservations et les accès (R14.3). */
export type OngletLive = FiltreLive | "reservations";

export const ONGLETS_LIVE: OngletLive[] = ["en_direct", "programme", "termine", "rediffusions", "anomalie", "reservations"];

export const LIBELLE_ONGLET_LIVE: Record<OngletLive, string> = {
  en_direct: "En direct",
  programme: "Programmés",
  termine: "Terminés",
  rediffusions: "Rediffusions",
  anomalie: "Anomalies",
  reservations: "Réservations et accès",
};

/** Le moment du déroulé, lu sur `live_phase` ; « clos » : le live est terminé. */
export type MomentLive = {
  etape: "attente" | "intro" | "article" | "conclusion" | "termine" | "clos";
  article?: string | null;
  position?: number | null;
  phase?: E["live_article_phase"] | null;
  fin?: string | null;
};

export type PlacesLive = {
  total: number | null;
  acheteurs_vip: number | null;
  confirmees: number;
  reservees: number;
  attente: number;
  liberees: number;
  spectateurs: number;
};

export type AnomalieLive = { code: string; libelle: string };

export type LiveLigne = {
  id: string;
  ref: string;
  cree_le: string;
  maj_le: string;
  titre: string;
  image: string | null;
  format: E["live_format"];
  statut: E["live_status"];
  diffusion: E["live_stream_state"];
  vendeur: string | null;
  vendeur_id: string | null;
  ville: string | null;
  programme_le: string | null;
  debut: string | null;
  fin: string | null;
  zone: ZoneLive;
  moment: MomentLive;
  moment_libelle: string;
  action_attendue: string | null;
  acteur_attendu: string | null;
  echeance: string | null;
  articles: number;
  vendus: number;
  invendus: number;
  retires: number;
  en_cours: number;
  acces_ouverts: number;
  paiements_ouverts: number;
  places: PlacesLive;
  rediffusion: boolean;
  anomalies: AnomalieLive[];
  est_test: boolean;
};

export type CompteursLives = Record<FiltreLive | "tous", number>;

/** L'état d'une réservation, dans les mots du R14.3. */
export type CategoriePlace = "confirmee" | "reservee" | "alertee" | "attente" | "liberee";

export const CATEGORIES_PLACE: CategoriePlace[] = ["confirmee", "reservee", "alertee", "attente", "liberee"];

export const LIBELLE_CATEGORIE_PLACE: Record<CategoriePlace, string> = {
  confirmee: "Confirmées",
  reservee: "À confirmer",
  alertee: "Alertées d’une place libérée",
  attente: "En liste d’attente",
  liberee: "Libérées ou expirées",
};

export type PlaceLive = {
  id: string;
  live_id: string;
  live_ref: string;
  live_titre: string;
  live_format: E["live_format"];
  live_zone: ZoneLive;
  programme_le: string | null;
  pseudo: string | null;
  role: E["live_seat_role"];
  etat: E["live_seat_state"];
  categorie: CategoriePlace;
  categorie_libelle: string;
  acces: "acces_complet" | "spectateur";
  acces_libelle: string;
  /** L'ordre d'arrivée dans la liste d'attente — pas un classement. */
  rang: number | null;
  reserve_le: string | null;
  confirme_le: string | null;
  libere_le: string | null;
  verrou_fin: string | null;
  alerte_le: string | null;
  est_test: boolean;
};

export type FiltresLives = {
  onglet: OngletLive | null;
  q: string | null;
  test: boolean;
  /** Les réservations d'un seul live, toutes, terminé ou non. */
  live: string | null;
};

/** L'adresse d'une vue filtrée : les filtres restent dans l'adresse (R4.10). */
export function adresseLives(f: FiltresLives): string {
  const p = new URLSearchParams();
  if (f.onglet) p.set("zone", f.onglet);
  if (f.live) p.set("live", f.live);
  if (f.q) p.set("q", f.q);
  if (f.test) p.set("test", "1");
  const s = p.toString();
  return s ? `/live-shopping?${s}` : "/live-shopping";
}

/** Qui le moment attend, dans les mots de l'écran. */
export const LIBELLE_ACTEUR_LIVE: Record<string, string> = {
  vendeur: "L’hôte",
  acheteurs: "Les spectateurs",
};
