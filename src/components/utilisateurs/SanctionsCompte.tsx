import { StatutPastille } from "@/components/bo/StatutPastille";
import { Aucun, Tableau } from "@/components/operations/commun";
import { dateHeure } from "@/lib/dates";
import { LIBELLE_NATURE_SANCTION, LIBELLE_PORTEE, type SanctionsCompte as Sanctions } from "@/lib/utilisateurs/types";
import { GestesSanction, LeverSanction } from "@/components/utilisateurs/GestesSanction";

/** « jusqu'au 07/10/2026 18:42 », ou le rappel qu'une sanction sans terme dure jusqu'à sa levée. */
export const terme = (jusquA: string | null) => (jusquA ? `jusqu’au ${dateHeure(jusquA)}` : "sans terme, jusqu’à sa levée");

/**
 * Les sanctions d'un compte (§8) : celles en cours — ce qui est arrêté, depuis
 * quand, jusqu'à quand, qui l'a décidé —, les gestes que l'équipier peut faire,
 * puis l'historique : les avertissements, ce qui a été levé, ce qui est arrivé
 * à son terme.
 *
 * ⚠️ LE MESSAGE ET LE MOTIF SONT DEUX TEXTES : le premier a été envoyé à la
 * personne, le second n'est lu que par l'équipe. La fiche les distingue.
 */
export function SanctionsCompte({ profil, pseudo, s }: { profil: string; pseudo: string | null; s: Sanctions }) {
  return (
    <div className="grid gap-3">
      {s.en_cours.length === 0 ? (
        <Aucun>Aucune restriction ni suspension en cours : le compte peut tout commencer.</Aucun>
      ) : (
        <ul className="grid gap-2">
          {s.en_cours.map((x) => (
            <li key={x.id} className="grid gap-2 rounded-lg border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StatutPastille ton={x.nature === "suspension" ? "erreur" : "attention"}>
                    {x.nature === "suspension"
                      ? "Suspendu"
                      : `Restreint · ${x.portee ? LIBELLE_PORTEE[x.portee] : (x.portee_libelle ?? "")}`}
                  </StatutPastille>
                  <span className="text-legende text-muted-foreground">
                    Depuis le {dateHeure(x.depuis)}, {terme(x.jusqu_a)}
                    {x.par ? ` · par ${x.par}` : ""}
                  </span>
                </div>
                {s.possibles.sanctionner && <LeverSanction sanction={x.id} profil={profil} nature={x.nature} />}
              </div>
              <p className="text-corps">
                {x.nature === "suspension"
                  ? "Arrêté : tout ce qui commence — ses annonces ont quitté la vitrine."
                  : `Arrêté : ${x.effet ?? ""}.`}{" "}
                Ses transactions et ses colis déjà engagés vont au bout.
              </p>
              <dl className="grid gap-1 text-corps">
                <div>
                  <dt className="text-legende text-muted-foreground">Message envoyé à la personne</dt>
                  <dd>« {x.message} »</dd>
                </div>
                <div>
                  <dt className="text-legende text-muted-foreground">Motif interne</dt>
                  <dd className="text-muted-foreground">{x.motif}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}

      <GestesSanction profil={profil} pseudo={pseudo} possibles={s.possibles} />

      <p className="text-legende text-muted-foreground">
        {s.avertissements === 0
          ? "Aucun avertissement reçu."
          : `${s.avertissements} avertissement${s.avertissements > 1 ? "s" : ""} reçu${s.avertissements > 1 ? "s" : ""}.`}
      </p>

      {s.passees.length > 0 && (
        <>
          <h3 className="text-corps font-semibold">Historique</h3>
          <Tableau entetes={["Sanction", "Posée le", "Fin", "Par", "Message envoyé", "Motif"]} largeur={720}>
            {s.passees.map((x) => (
              <tr key={x.id}>
                <td className="font-medium">
                  {LIBELLE_NATURE_SANCTION[x.nature]}
                  {x.portee ? ` · ${LIBELLE_PORTEE[x.portee]}` : ""}
                </td>
                <td className="whitespace-nowrap tabular-nums">{dateHeure(x.depuis)}</td>
                <td>
                  {x.nature === "avertissement"
                    ? "—"
                    : x.levee_le
                      ? `Levée le ${dateHeure(x.levee_le)}${x.levee_par ? ` par ${x.levee_par}` : ""}${x.motif_levee ? ` : ${x.motif_levee}` : ""}`
                      : `Arrivée à son terme le ${dateHeure(x.jusqu_a)}`}
                </td>
                <td>{x.par ?? "—"}</td>
                <td>« {x.message} »</td>
                <td className="text-muted-foreground">{x.motif}</td>
              </tr>
            ))}
          </Tableau>
        </>
      )}
    </div>
  );
}
