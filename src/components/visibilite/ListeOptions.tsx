import Link from "next/link";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { StatutPastille, type Ton } from "@/components/bo/StatutPastille";
import { TON_ORDRE } from "@/components/paiements/OrdresFinanciers";
import { dateHeure, jour } from "@/lib/dates";
import { euros, LIBELLE_STATUT_ORDRE } from "@/lib/paiements/types";
import {
  causePauseDite,
  cheminOption,
  LIBELLE_ANOMALIE,
  LIBELLE_CONTESTATION,
  LIBELLE_FIN_OPTION,
  LIBELLE_OPTION,
  type EtatOption,
  type OptionLigne,
} from "@/lib/visibilite/types";

export const TON_ETAT_OPTION: Record<EtatOption, Ton> = {
  reservee: "neutre",
  en_cours: "actif",
  en_pause: "attention",
  terminee: "muet",
};

export const LIBELLE_ETAT_COURT: Record<EtatOption, string> = {
  reservee: "Réservée",
  en_cours: "En cours",
  en_pause: "En pause",
  terminee: "Terminée",
};

/** Ce que l'état veut dire, en une ligne : les remontées, la pause et sa cause, la fin et son motif. */
export function etatDetaille(o: Pick<OptionLigne, "etat" | "remontees_faites" | "remontees_prevues" | "remontees_manquees"
  | "pause_cause" | "fin_motif" | "paiement_statut">): string | null {
  const remontees = o.remontees_prevues > 0
    ? `${o.remontees_faites} remontée(s) sur ${o.remontees_prevues}${o.remontees_manquees > 0 ? `, ${o.remontees_manquees} manquée(s)` : ""}`
    : null;
  switch (o.etat) {
    case "reservee":
      return o.paiement_statut === "captured" ? "Payée, pas encore démarrée" : "Paiement attendu";
    case "en_pause":
      return [`Parce que ${causePauseDite(o.pause_cause)}`, remontees].filter(Boolean).join(" · ");
    case "terminee":
      return [o.fin_motif ? (LIBELLE_FIN_OPTION[o.fin_motif] ?? o.fin_motif) : null, remontees].filter(Boolean).join(" · ") || null;
    default:
      return remontees;
  }
}

/**
 * Les options (§17, R17.1) : ce qu'elles mettent en avant, pour qui, leur état et
 * leur exécution, ce qu'elles ont coûté et ce qui en a été rendu, leur
 * rétractation, leurs anomalies. Chaque ligne ouvre la fiche de l'option.
 *
 * ⚠️ UNE ANOMALIE N'EST JAMAIS VERTE, ET UNE OPTION ARRÊTÉE NON PLUS.
 */
export function ListeOptions({ options, filtree }: { options: OptionLigne[]; filtree: boolean }) {
  if (options.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <AnimationH2H nom="recherche" taille={96} />
        <p className="mt-3 font-semibold">{filtree ? "Aucune option pour ces filtres" : "Aucune option"}</p>
        <p className="text-corps text-muted-foreground">
          Chaque option apparaît ici dès qu’elle est réservée, depuis l’écran de boost de l’application.
        </p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[1080px] text-corps">
        <thead className="bg-muted/40 text-left text-legende text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Option</th>
            <th className="px-3 py-2 font-medium">Met en avant · acheteur</th>
            <th className="px-3 py-2 font-medium">État</th>
            <th className="px-3 py-2 font-medium">Période</th>
            <th className="px-3 py-2 font-medium">Prix · rendu</th>
            <th className="px-3 py-2 font-medium">Rétractation</th>
            <th className="px-3 py-2 font-medium">Anomalies</th>
          </tr>
        </thead>
        <tbody>
          {options.map((o) => {
            const detail = etatDetaille(o);
            return (
              <tr key={o.id} className="border-t align-top hover:bg-muted/30">
                <td className="px-3 py-2">
                  <Link href={cheminOption(o.id)} className="font-medium tabular-nums text-h2h-primary hover:underline">
                    {o.ref}
                  </Link>
                  <span className="block">{LIBELLE_OPTION[o.option] ?? o.option}</span>
                  <span className="block text-legende text-muted-foreground">
                    {o.famille === "annonce" ? "sur une annonce" : "sur une demande"} · réservée le {jour(o.reservee_le)}
                  </span>
                  {o.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
                </td>
                <td className="max-w-xs px-3 py-2">
                  <span className="line-clamp-2">« {o.cible_titre ?? "—"} »</span>
                  <span className="block text-legende text-muted-foreground">{o.acheteur ?? "Compte effacé"}</span>
                </td>
                <td className="px-3 py-2">
                  <StatutPastille ton={o.fin_motif === "arretee" ? "erreur" : TON_ETAT_OPTION[o.etat]}>
                    {LIBELLE_ETAT_COURT[o.etat]}
                  </StatutPastille>
                  {detail && <span className="block text-legende text-muted-foreground">{detail}</span>}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-legende tabular-nums">
                  {o.active_depuis ? (
                    <>
                      <span className="block">depuis le {dateHeure(o.active_depuis)}</span>
                      <span className="block text-muted-foreground">
                        {o.termine_le
                          ? `finie le ${dateHeure(o.termine_le)}`
                          : o.fin_prevue
                            ? `jusqu’au ${dateHeure(o.fin_prevue)}${o.etat === "en_pause" ? ", reculée par la pause" : ""}`
                            : "—"}
                      </span>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <span className="font-semibold tabular-nums">{euros(o.prix_cents)}</span>
                  {o.paiement_reel === false && <span className="block text-legende text-muted-foreground">mode test</span>}
                  {o.rembourse_cents > 0 && (
                    <span className="block text-legende tabular-nums">rendu {euros(o.rembourse_cents)}</span>
                  )}
                  {o.remboursement_statut && o.remboursement_statut !== "reussi" && (
                    <StatutPastille ton={TON_ORDRE[o.remboursement_statut]}>
                      {LIBELLE_STATUT_ORDRE[o.remboursement_statut]}
                    </StatutPastille>
                  )}
                  {o.contestation && (
                    <StatutPastille ton={o.contestation === "gagnee" ? "neutre" : "erreur"}>
                      {LIBELLE_CONTESTATION[o.contestation]}
                    </StatutPastille>
                  )}
                </td>
                <td className="px-3 py-2 text-legende">
                  {o.retractation_ref ? (
                    <>
                      <span className="block font-medium tabular-nums">{o.retractation_ref}</span>
                      {(o.retractation_reste_cents ?? 0) > 0 ? (
                        <span className="block">
                          {euros(o.retractation_reste_cents)} à rendre avant le {jour(o.rembourser_avant)}
                        </span>
                      ) : (
                        <span className="block text-muted-foreground">rendue</span>
                      )}
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-2">
                  {o.anomalies.length === 0 ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <span className="flex flex-wrap gap-1">
                      {o.anomalies.map((a) => (
                        <StatutPastille key={a} ton="erreur">
                          {LIBELLE_ANOMALIE[a] ?? a}
                        </StatutPastille>
                      ))}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
