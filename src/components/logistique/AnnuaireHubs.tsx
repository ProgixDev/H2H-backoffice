import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { StatutPastille, type Ton } from "@/components/bo/StatutPastille";
import { dateHeure } from "@/lib/dates";
import {
  FILTRES_HUB,
  LIBELLE_ETAT_HUB,
  LIBELLE_FILTRE_HUB,
  LIBELLE_LIEU,
  adresseHubs,
  cheminHub,
  lienCarte,
  type CompteursHubs,
  type EtatHub,
  type FiltresHubs,
  type Hub,
} from "@/lib/logistique/types";
import { FiltresListe } from "./FiltresListe";
import { pluriel } from "./ListeTrajets";

/** ⚠️ UN POINT FERMÉ N'EST JAMAIS VERT ; une épingle écartée se tait. */
export const TON_ETAT_HUB: Record<EtatHub, Ton> = {
  a_valider: "actif",
  actif: "succes",
  ferme: "erreur",
  ecarte: "muet",
};

/**
 * Les filtres de l'annuaire : les points signalés, puis l'état de chacun (des
 * pastilles, chacune avec son compteur — le même prédicat que la liste), puis la
 * recherche. ⚠️ PAS DE MONDE DU TEST : chaque point est réel.
 */
export function FiltresAnnuaireHubs({ f, compteurs }: { f: FiltresHubs; compteurs: CompteursHubs | null }) {
  return (
    <FiltresListe
      onglet="points"
      nom="Filtrer les points de rendez-vous"
      filtres={FILTRES_HUB}
      libelles={LIBELLE_FILTRE_HUB}
      tous="Tous"
      aTraiter={["signales", "a_valider"]}
      f={f}
      compteurs={compteurs}
      adresse={adresseHubs}
      recherche="Nom du point, ville, région, identifiant"
      testVisible={false}
    />
  );
}

/**
 * L'annuaire des points de rendez-vous (§ 12.4) : la localisation, l'état et le
 * motif de l'indisponibilité, les signalements, les trajets qui y passent et les
 * rendez-vous qui y restent. Chaque ligne ouvre la fiche du point.
 *
 * ⚠️ DES COORDONNÉES, ET CE N'EST PAS UNE ENTORSE À R4.15 : un point de
 * rendez-vous est un lieu public. Aucune personne n'y est située.
 */
export function AnnuaireHubs({ hubs, filtree }: { hubs: Hub[]; filtree: boolean }) {
  if (hubs.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <AnimationH2H nom="handoff" taille={96} />
        <p className="mt-3 font-semibold">{filtree ? "Aucun point pour ces filtres" : "Aucun point de rendez-vous"}</p>
        <p className="text-corps text-muted-foreground">
          Un point apparaît ici dès qu’il est posé dans l’annuaire, qu’il soit proposé ou non.
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-2">
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[1040px] text-corps">
          <thead className="bg-muted/40 text-left text-legende text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Point de rendez-vous</th>
              <th className="px-3 py-2 font-medium">Où se présenter</th>
              <th className="px-3 py-2 font-medium">État</th>
              <th className="px-3 py-2 font-medium">Signalements</th>
              <th className="px-3 py-2 font-medium">Ce qui y passe</th>
            </tr>
          </thead>
          <tbody>
            {hubs.map((h) => (
              <tr key={h.id} className="border-t align-top hover:bg-muted/30">
                <td className="max-w-64 px-3 py-2">
                  <Link href={cheminHub(h.id)} className="font-medium text-h2h-primary hover:underline">
                    {h.nom ?? h.repere ?? "Point sans nom"}
                  </Link>
                  <span className="block text-legende text-muted-foreground">
                    {[LIBELLE_LIEU[h.type_lieu] ?? h.type_lieu, h.ville, h.region].filter(Boolean).join(" · ")}
                  </span>
                </td>
                <td className="max-w-72 px-3 py-2 text-legende">
                  <span className="block">« {h.detail_affiche ?? "—"} »</span>
                  <a
                    href={lienCarte(h.latitude, h.longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-h2h-primary hover:underline"
                  >
                    Voir sur la carte <ExternalLink className="size-3" />
                  </a>
                </td>
                <td className="max-w-64 px-3 py-2">
                  <StatutPastille ton={TON_ETAT_HUB[h.etat]}>{LIBELLE_ETAT_HUB[h.etat]}</StatutPastille>
                  {h.ferme_le && (
                    <span className="block text-legende tabular-nums text-muted-foreground">depuis le {dateHeure(h.ferme_le)}</span>
                  )}
                  {h.motif_fermeture && <span className="block text-legende text-muted-foreground">« {h.motif_fermeture} »</span>}
                </td>
                <td className="px-3 py-2">
                  {h.signalements > 0 ? (
                    <>
                      <StatutPastille ton="attention">{pluriel(h.signalements, "signalement")}</StatutPastille>
                      <span className="block text-legende tabular-nums text-muted-foreground">
                        le dernier le {dateHeure(h.dernier_signalement_le)}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-2 text-legende">
                  {h.trajets === 0 && h.rendez_vous_en_cours === 0 && h.propositions_en_cours === 0 ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <>
                      {h.trajets > 0 && <span className="block">{pluriel(h.trajets, "trajet")}</span>}
                      {h.propositions_en_cours > 0 && (
                        <span className="block">{pluriel(h.propositions_en_cours, "proposition")} en cours</span>
                      )}
                      {h.rendez_vous_en_cours > 0 && (
                        <span className={h.etat === "ferme" ? "block font-semibold text-[#B45309]" : "block"}>
                          {h.rendez_vous_en_cours} rendez-vous à tenir
                        </span>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hubs.length >= 300 && (
        <p className="text-legende text-muted-foreground">
          Les 300 premiers sont affichés : affinez par un filtre ou une recherche — une ville, un nom — pour voir les
          autres.
        </p>
      )}
    </div>
  );
}
