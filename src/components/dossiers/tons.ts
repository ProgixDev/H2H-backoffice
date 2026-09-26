import type { Ton } from "@/components/bo/StatutPastille";
import type { Priorite } from "@/lib/dossiers/types";

// ⚠️ UNE ISSUE DÉFAVORABLE N'EST JAMAIS VERTE : rien, dans la file, n'est un succès.
export const TON_CATEGORIE: Record<string, Ton> = {
  urgence_securite: "erreur",
  echec: "erreur",
  contestation: "attention",
  echeance_depassee: "erreur",
  reponse_recue: "marque",
  echeance_proche: "actif",
  sans_responsable: "attention",
  pret_decision: "marque",
  clos: "muet",
};

export const TON_PRIORITE: Record<Priorite, Ton> = { normale: "neutre", haute: "actif", urgence: "erreur" };
