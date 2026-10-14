import "server-only";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type {
  CandidatureRelais,
  Colivraison,
  CompteursColivraisons,
  CompteursHubs,
  CompteursIncidents,
  CompteursTrajets,
  FicheHub,
  FicheIncident,
  FicheTrajet,
  FiltresColivraisons,
  FiltresHubs,
  FiltresIncidents,
  FiltresTrajets,
  Hub,
  Incident,
  Trajet,
} from "./types";

/**
 * L'annuaire des points de rendez-vous (§ 12.4) : les points dont un signalement
 * attend l'équipe d'abord, puis les épingles à valider, puis par ville ; la base
 * en décide l'ordre. Les épingles à regarder en sont un filtre (`a_valider`), les
 * signalements à examiner aussi (`signales`) — plus une lecture à part.
 */
export async function listerHubs(f: Pick<FiltresHubs, "filtre" | "q">): Promise<Hub[]> {
  return rpc<Hub[]>(await supabaseServeur(), "bo_hubs_lister", { p_filtre: f.filtre, p_recherche: f.q });
}

/** Un compteur par filtre, avec la même recherche : exactement ce que la liste montre. */
export async function compterHubs(f: Pick<FiltresHubs, "q">): Promise<CompteursHubs> {
  return rpc<CompteursHubs>(await supabaseServeur(), "bo_hubs_compteurs", { p_recherche: f.q });
}

/** La fiche d'un point : son état, le motif de sa fermeture, ses signalements, les trajets et les rendez-vous qui y passent. */
export async function lireHub(id: string): Promise<FicheHub> {
  return rpc<FicheHub>(await supabaseServeur(), "bo_hub_lire", { p_hub: id });
}

/** Les candidatures relais en attente, le téléphone masqué. */
export async function listerCandidaturesRelais(): Promise<CandidatureRelais[]> {
  return rpc<CandidatureRelais[]>(await supabaseServeur(), "bo_candidatures_relais_lister");
}

/** Les co-livraisons (§ 12.3) : un incident ouvert d'abord, puis par rendez-vous ; la base en décide l'ordre et le monde. */
export async function listerColivraisons(f: FiltresColivraisons): Promise<Colivraison[]> {
  return rpc<Colivraison[]>(await supabaseServeur(), "bo_colivraisons_lister", {
    p_filtre: f.filtre,
    p_recherche: f.q,
    p_inclure_test: f.test,
  });
}

/** Un compteur par filtre, avec la même recherche : exactement ce que la liste montre. */
export async function compterColivraisons(f: FiltresColivraisons): Promise<CompteursColivraisons> {
  return rpc<CompteursColivraisons>(await supabaseServeur(), "bo_colivraisons_compteurs", {
    p_recherche: f.q,
    p_inclure_test: f.test,
  });
}

/** Les trajets (§ 12.2) : une anomalie d'abord, puis les suspendus, puis par prochain passage ; la base en décide. */
export async function listerTrajets(f: FiltresTrajets): Promise<Trajet[]> {
  return rpc<Trajet[]>(await supabaseServeur(), "bo_trajets_lister", {
    p_filtre: f.filtre,
    p_recherche: f.q,
    p_inclure_test: f.test,
  });
}

/** Un compteur par filtre, avec la même recherche : exactement ce que la liste montre. */
export async function compterTrajets(f: FiltresTrajets): Promise<CompteursTrajets> {
  return rpc<CompteursTrajets>(await supabaseServeur(), "bo_trajets_compteurs", {
    p_recherche: f.q,
    p_inclure_test: f.test,
  });
}

/** La fiche d'un trajet : ses passages, ses co-livraisons, ce qui l'écarte des recherches ouvertes, ses suspensions. */
export async function lireTrajet(id: string): Promise<FicheTrajet> {
  return rpc<FicheTrajet>(await supabaseServeur(), "bo_trajet_lire", { p_trajet: id });
}

/**
 * Les incidents de co-livraison (§ 12.5), un dossier par déclaration des
 * formulaires 2, 4, 6, 7, 11 et 13 : ceux qui attendent l'équipe d'abord, puis
 * ceux que la plateforme doit clore, ceux dont le délai de contestation court,
 * les clos ; la base en décide l'ordre et le monde.
 */
export async function listerIncidents(f: FiltresIncidents): Promise<Incident[]> {
  return rpc<Incident[]>(await supabaseServeur(), "bo_incidents_lister", {
    p_filtre: f.filtre,
    p_formulaire: f.formulaire,
    p_recherche: f.q,
    p_inclure_test: f.test,
  });
}

/** Un compteur par filtre, avec la même recherche et le même formulaire : exactement ce que la liste montre. */
export async function compterIncidents(f: FiltresIncidents): Promise<CompteursIncidents> {
  return rpc<CompteursIncidents>(await supabaseServeur(), "bo_incidents_compteurs", {
    p_formulaire: f.formulaire,
    p_recherche: f.q,
    p_inclure_test: f.test,
  });
}

/** La fiche d'un incident : sa déclaration, ses délais propres, les présences, sa contestation, ce qu'il retient. */
export async function lireIncident(id: string): Promise<FicheIncident> {
  return rpc<FicheIncident>(await supabaseServeur(), "bo_incident_lire", { p_incident: id });
}
