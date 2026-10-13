import {
  FILTRES_COLIVRAISON,
  LIBELLE_FILTRE_COLIVRAISON,
  adresseColivraisons,
  type CompteursColivraisons,
  type FiltresColivraisons,
} from "@/lib/logistique/types";
import { FiltresListe } from "./FiltresListe";

/**
 * Les filtres des co-livraisons : le moment (des pastilles, chacune avec son
 * compteur — le même prédicat que la liste), puis la recherche.
 */
export function FiltresListeColivraisons({
  f,
  compteurs,
  testVisible,
}: {
  f: FiltresColivraisons;
  compteurs: CompteursColivraisons | null;
  testVisible: boolean;
}) {
  return (
    <FiltresListe
      onglet="colivraisons"
      nom="Filtrer les co-livraisons"
      filtres={FILTRES_COLIVRAISON}
      libelles={LIBELLE_FILTRE_COLIVRAISON}
      tous="Toutes"
      aTraiter={["incidents"]}
      f={f}
      compteurs={compteurs}
      adresse={adresseColivraisons}
      recherche="Référence HTH-…, numéro de suivi, pseudonyme, point de rendez-vous, ville, bien"
      testVisible={testVisible}
    />
  );
}
