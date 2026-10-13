import Link from "next/link";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { StatutPastille, type Ton } from "@/components/bo/StatutPastille";
import { dateHeure } from "@/lib/dates";
import {
  LIBELLE_ANOMALIE_TRAJET,
  LIBELLE_MODE,
  LIBELLE_RAISON_TRAJET,
  LIBELLE_SITUATION,
  cheminTrajet,
  joursDits,
  type RaisonTrajet,
  type SituationTrajet,
  type Trajet,
} from "@/lib/logistique/types";
import { cheminCompte } from "@/lib/utilisateurs/types";

/** ⚠️ UNE SUSPENSION PAR L'ÉQUIPE N'EST JAMAIS VERTE ; un trajet clos se tait. */
export const TON_SITUATION: Record<SituationTrajet, Ton> = {
  propose: "succes",
  suspendu: "erreur",
  en_pause: "neutre",
  indisponible: "attention",
  clos: "muet",
};

/** ⚠️ UN PSEUDONYME ABSENT N'EST PAS UN COMPTE EFFACÉ : un membre peut ne pas en avoir choisi. */
export const SANS_PSEUDONYME = "sans pseudonyme";

const NOMBRE = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
export const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? "s" : ""}`;

/** « Ponctuel · le 14/10/2026 14:30 », ou « Récurrent · lun., mer., ven. ». */
export function rythmeDit(t: Pick<Trajet, "type" | "jours" | "depart_le">): string {
  return t.type === "recurring" ? `Récurrent · ${joursDits(t.jours)}` : `Ponctuel · le ${dateHeure(t.depart_le)}`;
}

/** « 3 places par passage · jusqu’au format L · 20 kg ». */
export function capaciteDite(t: Pick<Trajet, "places" | "taille_max" | "poids_max_kg">): string {
  return `${pluriel(t.places, "place")} par passage · jusqu’au format ${t.taille_max} · ${NOMBRE.format(t.poids_max_kg)} kg`;
}

/**
 * Les raisons à dire à côté de la situation : la suspension et la pause SONT la
 * situation — on ne les répète pas ; les autres resteraient vraies après.
 */
export function raisonsADire(t: Pick<Trajet, "situation" | "raisons">): RaisonTrajet[] {
  if (t.situation === "clos") return [];
  return t.raisons.filter((r) => r !== "trajet_suspendu" && r !== "trajet_inactif");
}

/**
 * Les trajets (§ 12.2) : ponctuel ou récurrent, le corridor, les points de
 * rendez-vous, la capacité, le prochain passage avec ses places et les
 * réservations à venir, et où en est le trajet pour de nouvelles propositions.
 * Chaque ligne ouvre la fiche du trajet.
 *
 * 🔴 NI POSITION, NI ADRESSE (R4.15) : des pseudonymes, des villes, des points de
 * rendez-vous nommés, des heures.
 */
export function ListeTrajets({ trajets, filtree, lienCompte }: { trajets: Trajet[]; filtree: boolean; lienCompte: boolean }) {
  if (trajets.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <AnimationH2H nom="car" taille={96} />
        <p className="mt-3 font-semibold">{filtree ? "Aucun trajet pour ces filtres" : "Aucun trajet"}</p>
        <p className="text-corps text-muted-foreground">
          Un trajet apparaît ici dès que son cotransporteur particulier le publie dans H2H Logistic.
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-2">
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[1180px] text-corps">
          <thead className="bg-muted/40 text-left text-legende text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Trajet</th>
              <th className="px-3 py-2 font-medium">Cotransporteur</th>
              <th className="px-3 py-2 font-medium">Points de rendez-vous</th>
              <th className="px-3 py-2 font-medium">Capacité</th>
              <th className="px-3 py-2 font-medium">Prochain passage</th>
              <th className="px-3 py-2 font-medium">Nouvelles propositions</th>
              <th className="px-3 py-2 font-medium">À examiner</th>
            </tr>
          </thead>
          <tbody>
            {trajets.map((t) => (
              <tr key={t.id} className="border-t align-top hover:bg-muted/30">
                <td className="max-w-56 px-3 py-2">
                  <Link href={cheminTrajet(t.id)} className="font-medium text-h2h-primary hover:underline">
                    {t.ville_depart} → {t.ville_arrivee}
                  </Link>
                  <span className="block text-legende tabular-nums text-muted-foreground">{rythmeDit(t)}</span>
                  <span className="block text-legende text-muted-foreground">{LIBELLE_MODE[t.mode] ?? t.mode}</span>
                  {t.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
                </td>
                <td className="px-3 py-2">
                  {lienCompte ? (
                    <Link href={cheminCompte(t.cotransporteur_id)} className="font-medium text-h2h-primary hover:underline">
                      {t.cotransporteur ?? SANS_PSEUDONYME}
                    </Link>
                  ) : (
                    (t.cotransporteur ?? SANS_PSEUDONYME)
                  )}
                </td>
                <td className="px-3 py-2 text-legende">
                  <span className="block">Collecte · {t.hub_collecte ?? "aucun point"}</span>
                  <span className="block">Remise · {t.hubs_remise.length > 0 ? t.hubs_remise.join(" · ") : "aucun point"}</span>
                </td>
                <td className="px-3 py-2 text-legende">
                  <span className="block">{capaciteDite(t)}</span>
                  {t.hors_hub && <span className="block text-muted-foreground">Hors point de rendez-vous possible</span>}
                </td>
                <td className="px-3 py-2">
                  {t.prochain_passage ? (
                    <>
                      <span className="block tabular-nums">{dateHeure(t.prochain_passage)}</span>
                      {t.places_restantes !== null && (
                        <span className="block text-legende text-muted-foreground">
                          {t.places_restantes > 0
                            ? `${pluriel(t.places_restantes, "place")} sur ${t.places} encore libre${t.places_restantes > 1 ? "s" : ""}`
                            : "plus de place sur ce passage"}
                        </span>
                      )}
                      {t.prochain_passage_confirme_le && (
                        <span className="block text-legende text-muted-foreground">déplacement confirmé</span>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground">Aucun passage à venir</span>
                  )}
                  {t.reservations > 0 && (
                    <span className="block text-legende text-muted-foreground">
                      {pluriel(t.reservations, "réservation")} à venir
                    </span>
                  )}
                  {t.colivraisons_en_cours > 0 && (
                    <span className="block text-legende text-muted-foreground">
                      {pluriel(t.colivraisons_en_cours, "co-livraison")} en cours
                    </span>
                  )}
                </td>
                <td className="max-w-64 px-3 py-2">
                  <StatutPastille ton={TON_SITUATION[t.situation]}>{LIBELLE_SITUATION[t.situation]}</StatutPastille>
                  {t.suspendu_le && (
                    <span className="block text-legende tabular-nums text-muted-foreground">
                      depuis le {dateHeure(t.suspendu_le)}
                    </span>
                  )}
                  {raisonsADire(t).map((r) => (
                    <span key={r} className="block text-legende text-muted-foreground">
                      {LIBELLE_RAISON_TRAJET[r] ?? r}
                    </span>
                  ))}
                </td>
                <td className="px-3 py-2">
                  {t.anomalies.length > 0 ? (
                    <span className="flex flex-wrap gap-1">
                      {t.anomalies.map((a) => (
                        <StatutPastille key={a} ton="attention">
                          {LIBELLE_ANOMALIE_TRAJET[a] ?? a}
                        </StatutPastille>
                      ))}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {trajets.length >= 300 && (
        <p className="text-legende text-muted-foreground">
          Les 300 premiers sont affichés : affinez par un filtre ou une recherche pour voir les autres.
        </p>
      )}
    </div>
  );
}
