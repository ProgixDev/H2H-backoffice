import {
  FILTRES_INCIDENT,
  LIBELLE_FILTRE_INCIDENT,
  NOM_INCIDENT,
  NUMEROS_INCIDENT,
  adresseIncidents,
  type CompteursIncidents,
  type FiltresIncidents,
} from "@/lib/logistique/types";
import { FiltresListe } from "./FiltresListe";

/**
 * Les filtres des incidents : où ils en sont (des pastilles, chacune avec son
 * compteur — le même prédicat que la liste), le formulaire, puis la recherche.
 *
 * ⚠️ LES COMPTEURS SONT CEUX DU FORMULAIRE CHOISI : chaque pastille annonce ce
 * que la liste montrera. Les formulaires sont nommés par la base quand elle
 * répond ; sinon par le cahier des charges, que l'écran recopie.
 */
export function FiltresListeIncidents({
  f,
  compteurs,
  testVisible,
}: {
  f: FiltresIncidents;
  compteurs: CompteursIncidents | null;
  testVisible: boolean;
}) {
  const formulaires =
    compteurs?.formulaires.map((x) => ({ numero: x.numero, nom: x.nom })) ??
    NUMEROS_INCIDENT.map((numero) => ({ numero, nom: NOM_INCIDENT[numero] }));
  return (
    <FiltresListe
      onglet="incidents"
      nom="Filtrer les incidents"
      filtres={FILTRES_INCIDENT}
      libelles={LIBELLE_FILTRE_INCIDENT}
      tous="Tous"
      aTraiter={["a_traiter"]}
      f={f}
      compteurs={compteurs}
      adresse={(x) => adresseIncidents({ ...x, formulaire: f.formulaire })}
      recherche="Référence de la commande, pseudonyme, point de rendez-vous, ville, bien"
      testVisible={testVisible}
      supplement={
        <label className="grid gap-1 text-legende text-muted-foreground">
          Formulaire
          <select
            name="formulaire"
            defaultValue={f.formulaire ?? ""}
            className="h-9 rounded-md border bg-background px-2 text-corps text-foreground"
          >
            <option value="">Tous les formulaires</option>
            {formulaires.map((x) => (
              <option key={x.numero} value={x.numero}>
                {x.numero} · {x.nom}
              </option>
            ))}
          </select>
        </label>
      }
    />
  );
}
