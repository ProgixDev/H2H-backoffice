// Les formes que rendent `bo_operations_lister`, `bo_operations_compteurs` et
// `bo_evenements_lister` (migration 20260926005000 de hand-to-hand).

export const SERVICES = ["marketplace", "logistic", "flash", "live"] as const;
export type Service = (typeof SERVICES)[number];

export type Acteur =
  | "acheteur"
  | "vendeur"
  | "cotransporteur"
  | "acheteur_vendeur"
  | "support"
  | "prestataire"
  | "plateforme";

export type Participant = { role: "acheteur" | "vendeur" | "cotransporteur"; pseudo: string | null };

export type Operation = {
  ref: string;
  type: string;
  service: Service;
  objet_table: "orders" | "courtage_listings" | "live_sessions";
  objet_id: string;
  bien_titre: string | null;
  bien_image: string | null;
  participants: Participant[];
  etape: string;
  etape_libelle: string;
  finance: string;
  finance_libelle: string;
  action_attendue: string | null;
  acteur_attendu: Acteur | null;
  echeance: string | null;
  localisation: string | null;
  dernier_evenement: string;
  dernier_evenement_le: string;
  alerte: "erreur" | "incident" | "retard" | null;
  alerte_libelle: string | null;
  montant_cents: number | null;
  paiement_en_attente: boolean;
  est_test: boolean;
  termine_le: string | null;
};

export type Compteur = {
  code: string;
  libelle: string;
  description: string;
  nombre: number;
  /** L'heure de la base : les comptes à rebours s'y calent. */
  calcule_le: string;
};

export type Evenement = {
  id: number;
  le: string;
  objet_table: Operation["objet_table"];
  objet_id: string;
  ref: string | null;
  service: Service;
  entite: string;
  libelle: string;
  acteur_type: "utilisateur" | "equipe" | "prestataire" | "plateforme";
  acteur: string | null;
  est_test: boolean;
};

export type FiltresActivite = {
  compteur: string | null;
  service: Service | null;
  recherche: string | null;
  termines: boolean;
  inclureTest: boolean;
};

/** Ce que la route `/api/activite` rend. */
export type ReponseOperations = { compteurs: Compteur[]; operations: Operation[] };
export type ReponseEvenements = { evenements: Evenement[] };

export const LIBELLE_SERVICE: Record<Service, string> = {
  marketplace: "Marketplace",
  logistic: "H2H Logistic",
  flash: "Offre Flash",
  live: "Live",
};

export const LIBELLE_TYPE: Record<string, string> = {
  achat: "Achat",
  attestation: "Attestation",
  envoi: "Envoi",
  remise: "Remise",
  recherche: "Recherche",
  colivraison: "Co-livraison",
  incident: "Incident",
  litige: "Litige",
  flash: "Offre Flash",
  live: "Live",
};

export const LIBELLE_ACTEUR: Record<Acteur, string> = {
  acheteur: "Acheteur",
  vendeur: "Vendeur",
  cotransporteur: "Cotransporteur",
  acheteur_vendeur: "Acheteur et vendeur",
  support: "Support",
  prestataire: "Prestataire",
  plateforme: "Par la plateforme",
};

/** Les filtres d'une adresse : la page, la route et l'écran lisent les mêmes. */
export function filtresDepuis(p: { get(cle: string): string | null }): FiltresActivite {
  const service = p.get("service");
  const q = p.get("q")?.trim();
  return {
    compteur: p.get("compteur") || null,
    service: (SERVICES as readonly string[]).includes(service ?? "") ? (service as Service) : null,
    recherche: q ? q.slice(0, 80) : null,
    termines: p.get("termines") === "true",
    inclureTest: p.get("test") === "true",
  };
}
