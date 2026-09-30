import type { ReactNode } from "react";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { PieceRecours } from "@/components/utilisateurs/GestesRecours";
import { dateHeure } from "@/lib/dates";
import { LIBELLE_STATUT_RECOURS, type RecoursLu, type StatutRecours } from "@/lib/utilisateurs/types";

/** Un recours accepté est un bon dénouement pour la personne ; rejeté, la décision tient. */
export const TON_RECOURS: Record<StatutRecours, "attention" | "succes" | "neutre"> = {
  a_examiner: "attention",
  accepte: "succes",
  rejete: "neutre",
};

/**
 * Un recours — contre une sanction ou contre une décision de modération : ce
 * qu'il conteste, les mots de la personne et ses pièces, puis l'examen — ou le
 * geste qui l'examine, ou la raison pour laquelle l'équipier qui lit ne le peut
 * pas. Le même, quelle que soit la décision contestée.
 */
export function CarteRecours({
  r,
  contre,
  geste,
}: {
  r: RecoursLu;
  /** La décision contestée, dite : « Suspension du 30/09/2026 14:00 ». */
  contre: string;
  /** Le geste d'examen, montré seulement si la base le permet (`examinable`). */
  geste: ReactNode;
}) {
  return (
    <li className="grid gap-2 rounded-lg border p-3" data-recours={r.id}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold tabular-nums">{r.reference}</span>
          <StatutPastille ton={TON_RECOURS[r.statut]}>{LIBELLE_STATUT_RECOURS[r.statut]}</StatutPastille>
          <span className="text-legende text-muted-foreground">
            Contre : {contre} · déposé le {dateHeure(r.depose_le)}
            {r.dossier ? ` · dossier ${r.dossier}` : ""}
          </span>
        </div>
        {r.examinable && geste}
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
