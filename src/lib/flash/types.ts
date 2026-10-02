// Les offres Flash telles que le back-office les lit (`bo_flash_lister`,
// `bo_flash_compteurs`) : chaque offre sous l'étape du cahier des charges (§13),
// ses cinq pistes, ses échéances, ce qui ne va pas.
import type { Database } from "@/lib/db/contrat/database.types";
import type { EtatModeration } from "@/lib/annonces/types";
import type { EtatPiste } from "@/lib/transactions/types";

type E = Database["public"]["Enums"];

/** L'étape d'une offre, dans les mots du §13. */
export type EtapeFlash =
  | "offres"
  | "choix"
  | "nouveau_choix"
  | "exclu"
  | "acces_flash"
  | "paiement"
  | "payee"
  | "non_vendue"
  | "annulee"
  | "litige";

/** Un filtre : une étape, ce qui n'est pas terminé, ou ce qui ne va pas. */
export type FiltreFlash = EtapeFlash | "en_cours" | "anomalie";

/** Dans l'ordre du bandeau : le travail en cours d'abord, puis les issues. */
export const FILTRES_FLASH: FiltreFlash[] = [
  "en_cours",
  "offres",
  "choix",
  "nouveau_choix",
  "exclu",
  "acces_flash",
  "paiement",
  "payee",
  "non_vendue",
  "annulee",
  "litige",
  "anomalie",
];

export const LIBELLE_FILTRE_FLASH: Record<FiltreFlash, string> = {
  en_cours: "En cours",
  offres: "Offres en cours",
  choix: "Choix du vendeur",
  nouveau_choix: "Nouveau choix attendu",
  exclu: "Exclu",
  acces_flash: "Accès Flash",
  paiement: "Confirmation du vendeur",
  payee: "Payées",
  non_vendue: "Non vendues",
  annulee: "Annulées",
  litige: "Litiges",
  anomalie: "Anomalies",
};

export type CodePisteFlash = "offres" | "choix" | "acces" | "paiement" | "issue";

/** Une piste (R13.1) : `le`, ce qui l'a fait avancer ; `echeance`, ce qu'elle attend. */
export type PisteFlash = {
  code: CodePisteFlash;
  libelle: string;
  etat: EtatPiste;
  le: string | null;
  echeance: string | null;
  detail: string;
};

/** Ce qui ne va pas (R13.2) : constaté dans les tables, examiné par un ticket. */
export type AnomalieFlash = { code: string; libelle: string };

/** Un acheteur de la dernière sélection — l'Exclu, ou la vague —, avec sa fenêtre d'achat. */
export type SelectionneFlash = {
  pseudo: string | null;
  mode: E["courtage_selection_mode"];
  vague: number | null;
  expire_le: string;
  statut: E["purchase_access_status"];
};

/** L'achat qui compte : le plus récent sur l'objet depuis l'ouverture de l'offre. */
export type PaiementFlash = {
  id: string;
  numero: string;
  statut: E["order_status"];
  total_cents: number;
  acheteur: string | null;
  /** L'échéance de la confirmation du vendeur, quand le paiement est autorisé. */
  echeance: string | null;
  annulation_demandee: boolean;
};

export type OffreFlash = {
  id: string;
  ref: string;
  produit_id: string;
  cree_le: string;
  maj_le: string;
  statut: E["courtage_status"];
  mode: E["courtage_selection_mode"] | null;
  etape: EtapeFlash;
  etape_libelle: string;
  action_attendue: string | null;
  acteur_attendu: string | null;
  echeance: string | null;
  bien_titre: string;
  bien_image: string | null;
  prix_depart_cents: number;
  vendeur: string | null;
  vendeur_id: string | null;
  ville: string | null;
  offres: number;
  offres_fin: string;
  tentatives_exclu: number;
  vagues_flash: number;
  selectionnes: SelectionneFlash[];
  paiement: PaiementFlash | null;
  pistes: PisteFlash[];
  piste_courante: CodePisteFlash | null;
  anomalies: AnomalieFlash[];
  moderation: EtatModeration | null;
  est_test: boolean;
};

export type CompteursFlash = Record<FiltreFlash | "toutes", number>;

export type FiltresFlash = {
  filtre: FiltreFlash | null;
  q: string | null;
  test: boolean;
};

/** L'adresse d'une liste filtrée : les filtres restent dans l'adresse (R4.10). */
export function adresseFlash(f: FiltresFlash): string {
  const p = new URLSearchParams();
  if (f.filtre) p.set("filtre", f.filtre);
  if (f.q) p.set("q", f.q);
  if (f.test) p.set("test", "1");
  const s = p.toString();
  return s ? `/offres-flash?${s}` : "/offres-flash";
}

/** Qui l'étape attend, dans les mots de l'écran. */
export const LIBELLE_ACTEUR_FLASH: Record<string, string> = {
  acheteurs: "Les acheteurs",
  acheteur: "L’acheteur choisi",
  vendeur: "Le vendeur",
  equipe: "L’équipe",
};
