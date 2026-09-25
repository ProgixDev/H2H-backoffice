// Les demandes de rôle, telles que le back-office les lit (`bo_demandes_de_role_lister`).

export type DemandeRole = {
  id: string;
  profil_id: string;
  /** Le pseudonyme — la seule identité publique. */
  pseudo: string | null;
  ville: string | null;
  role: string;
  statut: string;
  demande_le: string;
  est_test: boolean;
  /**
   * Stripe a-t-il vérifié l'identité ? Oui ou non, et par quel moyen — jamais
   * le nom vérifié, qui se dévoilera un à un, avec un motif (phase 1).
   */
  identite_verifiee: boolean;
  identite_methode: "stripe_identity" | "stripe_connect" | null;
  identite_mode_test: boolean | null;
  compte_versement: "payable" | "incomplet" | null;
  /** Un mode que Stripe n'a pas encore dit vaut test : on ne présume jamais le réel. */
  compte_versement_mode_test: boolean | null;
  convention_version: string | null;
  convention_signee_le: string | null;
};

export const LIBELLE_ROLE: Record<string, string> = {
  seller: "Vendeur",
  transporter: "Cotransporteur particulier",
  relais: "Point relais",
};

// 🔴 ACCORDER UN RÔLE OUVRE UN MÉTIER. Le rappel est sur la carte, au moment de
// décider — comme sur l'écran mobile du support.
export const CE_QUE_LE_ROLE_OUVRE: Record<string, string> = {
  seller: "Vendre et encaisser sur la Marketplace.",
  transporter: "Publier des trajets et se voir confier les colis d’inconnus.",
  relais: "Garder les colis des autres dans son commerce.",
};

// Les valeurs de `role_status` qui attendent une décision.
export const LIBELLE_STATUT_ROLE: Record<string, string> = {
  pending_kyc: "Identité à vérifier",
  pending_convention: "Convention à signer",
  pending_validation: "À valider",
  pending_verification: "À vérifier",
  pending_config: "À configurer",
};

export const LIBELLE_METHODE: Record<string, string> = {
  stripe_identity: "pièce d’identité et selfie",
  stripe_connect: "compte de versement",
};

export const quand = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "—";
