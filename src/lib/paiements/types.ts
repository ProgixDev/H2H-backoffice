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

export const quand = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { dateStyle: "medium" }) : "—";
