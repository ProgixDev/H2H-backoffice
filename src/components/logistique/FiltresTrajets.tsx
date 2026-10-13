import {
  FILTRES_TRAJET,
  LIBELLE_FILTRE_TRAJET,
  adresseTrajets,
  type CompteursTrajets,
  type FiltresTrajets,
} from "@/lib/logistique/types";
import { FiltresListe } from "./FiltresListe";

/**
 * Les filtres des trajets : ce qui cloche, puis la situation de chacun pour de
 * nouvelles propositions (des pastilles, chacune avec son compteur — le même
 * prédicat que la liste), puis la recherche.
 */
export function FiltresListeTrajets({
  f,
  compteurs,
  testVisible,
}: {
  f: FiltresTrajets;
  compteurs: CompteursTrajets | null;
  testVisible: boolean;
}) {
  return (
    <FiltresListe
      onglet="trajets"
      nom="Filtrer les trajets"
      filtres={FILTRES_TRAJET}
      libelles={LIBELLE_FILTRE_TRAJET}
      tous="Tous"
      aTraiter={["anomalies"]}
      f={f}
      compteurs={compteurs}
      adresse={adresseTrajets}
      recherche="Pseudonyme du cotransporteur, ville, point de rendez-vous, identifiant du trajet"
      testVisible={testVisible}
    />
  );
}
