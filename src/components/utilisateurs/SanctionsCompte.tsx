import { StatutPastille } from "@/components/bo/StatutPastille";
import { Aucun, Tableau } from "@/components/operations/commun";
import { dateHeure } from "@/lib/dates";
import {
  LIBELLE_NATURE_SANCTION,
  LIBELLE_PORTEE,
  LIBELLE_STATUT_RECOURS,
  type RecoursLu,
  type SanctionPassee,
  type SanctionsCompte as Sanctions,
  type StatutRecours,
} from "@/lib/utilisateurs/types";
import { GestesSanction, LeverSanction } from "@/components/utilisateurs/GestesSanction";
import { ExaminerRecours, PieceRecours } from "@/components/utilisateurs/GestesRecours";

/** « jusqu'au 07/10/2026 18:42 », ou le rappel qu'une sanction sans terme dure jusqu'à sa levée. */
export const terme = (jusquA: string | null) => (jusquA ? `jusqu’au ${dateHeure(jusquA)}` : "sans terme, jusqu’à sa levée");

/** Un recours accepté est un bon dénouement pour la personne ; rejeté, la décision tient. */
const TON_RECOURS: Record<StatutRecours, "attention" | "succes" | "neutre"> = {
  a_examiner: "attention",
  accepte: "succes",
  rejete: "neutre",
};

const decisionContestee = (x: Pick<SanctionPassee, "nature" | "portee">) =>
  `${LIBELLE_NATURE_SANCTION[x.nature]}${x.portee ? ` · ${LIBELLE_PORTEE[x.portee]}` : ""}`;

/**
 * Les sanctions d'un compte (§8) : celles en cours — ce qui est arrêté, depuis
 * quand, jusqu'à quand, qui l'a décidé —, les gestes que l'équipier peut faire,
 * les recours de la personne, puis l'historique : les avertissements, ce qui a
 * été levé, ce qui est arrivé à son terme.
 *
 * ⚠️ LE MESSAGE ET LE MOTIF SONT DEUX TEXTES : le premier a été envoyé à la
 * personne, le second n'est lu que par l'équipe. La fiche les distingue — et de
 * même la réponse à un recours et son motif.
 */
export function SanctionsCompte({ profil, pseudo, s }: { profil: string; pseudo: string | null; s: Sanctions }) {
  // Les recours de la personne : ceux qui attendent d'abord, puis les plus récents.
  const recours = [...s.en_cours, ...s.passees]
    .filter((x): x is typeof x & { recours: RecoursLu } => x.recours !== null)
    .sort((a, b) =>
      Number(b.recours.statut === "a_examiner") - Number(a.recours.statut === "a_examiner")
      || b.recours.depose_le.localeCompare(a.recours.depose_le));

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
                  {x.recours && (
                    <StatutPastille ton={TON_RECOURS[x.recours.statut]}>
                      Recours {LIBELLE_STATUT_RECOURS[x.recours.statut].toLowerCase()}
                    </StatutPastille>
                  )}
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

      {recours.length > 0 && (
        <section className="grid gap-2" aria-label="Recours">
          <h3 className="text-corps font-semibold">
            Recours{s.recours_a_examiner > 0 ? ` · ${s.recours_a_examiner} à examiner` : ""}
          </h3>
          <ul className="grid gap-2">
            {recours.map((x) => (
              <CarteRecours key={x.recours.id} r={x.recours} contre={x} profil={profil} />
            ))}
          </ul>
        </section>
      )}

      {s.passees.length > 0 && (
        <>
          <h3 className="text-corps font-semibold">Historique</h3>
          <Tableau entetes={["Sanction", "Posée le", "Fin", "Par", "Message envoyé", "Motif", "Recours"]} largeur={820}>
            {s.passees.map((x) => (
              <tr key={x.id}>
                <td className="font-medium">{decisionContestee(x)}</td>
                <td className="whitespace-nowrap tabular-nums">{dateHeure(x.depuis)}</td>
                <td>
                  {x.annulee
                    ? "Annulée sur recours"
                    : x.nature === "avertissement"
                      ? "—"
                      : x.levee_le
                        ? `Levée le ${dateHeure(x.levee_le)}${x.levee_par ? ` par ${x.levee_par}` : ""}${x.motif_levee ? ` : ${x.motif_levee}` : ""}`
                        : `Arrivée à son terme le ${dateHeure(x.jusqu_a)}`}
                </td>
                <td>{x.par ?? "—"}</td>
                <td>« {x.message} »</td>
                <td className="text-muted-foreground">{x.motif}</td>
                <td>
                  {x.recours ? (
                    <StatutPastille ton={TON_RECOURS[x.recours.statut]}>{LIBELLE_STATUT_RECOURS[x.recours.statut]}</StatutPastille>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </Tableau>
        </>
      )}
    </div>
  );
}

/**
 * Un recours : ce qu'il conteste, les mots de la personne et ses pièces, puis
 * l'examen — ou le geste qui l'examine, ou la raison pour laquelle l'équipier
 * qui lit ne le peut pas.
 */
function CarteRecours({
  r,
  contre,
  profil,
}: {
  r: RecoursLu;
  contre: Pick<SanctionPassee, "nature" | "portee" | "depuis">;
  profil: string;
}) {
  return (
    <li className="grid gap-2 rounded-lg border p-3" data-recours={r.id}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold tabular-nums">{r.reference}</span>
          <StatutPastille ton={TON_RECOURS[r.statut]}>{LIBELLE_STATUT_RECOURS[r.statut]}</StatutPastille>
          <span className="text-legende text-muted-foreground">
            Contre : {decisionContestee(contre)} du {dateHeure(contre.depuis)} · déposé le {dateHeure(r.depose_le)}
            {r.dossier ? ` · dossier ${r.dossier}` : ""}
          </span>
        </div>
        {r.examinable && <ExaminerRecours recours={r.id} profil={profil} reference={r.reference} />}
      </div>
      <dl className="grid gap-1 text-corps">
        <div>
          <dt className="text-legende text-muted-foreground">Les mots de la personne</dt>
          <dd className="whitespace-pre-line">« {r.texte} »</dd>
        </div>
      </dl>
      {r.pieces > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-legende text-muted-foreground">
            {r.pieces} pièce{r.pieces > 1 ? "s" : ""} jointe{r.pieces > 1 ? "s" : ""}
          </span>
          {r.pieces_ouvrables
            ? Array.from({ length: r.pieces }, (_, i) => <PieceRecours key={i} recours={r.id} rang={i + 1} />)
            : <span className="text-legende text-muted-foreground">— votre rôle ne permet pas de les ouvrir.</span>}
        </div>
      )}
      {r.statut !== "a_examiner" ? (
        <dl className="grid gap-1 text-corps">
          <div>
            <dt className="text-legende text-muted-foreground">
              Examiné le {r.examine_le ? dateHeure(r.examine_le) : "—"}
              {r.examine_par ? ` par ${r.examine_par}` : ""} · réponse envoyée à la personne
            </dt>
            <dd>« {r.reponse} »</dd>
          </div>
          <div>
            <dt className="text-legende text-muted-foreground">Motif interne</dt>
            <dd className="text-muted-foreground">{r.motif}</dd>
          </div>
        </dl>
      ) : (
        !r.examinable && r.raison && <p className="text-legende text-muted-foreground">{r.raison}</p>
      )}
    </li>
  );
}
