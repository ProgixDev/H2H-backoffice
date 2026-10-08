import type { ReactNode } from "react";
import { StatutPastille } from "@/components/bo/StatutPastille";
import type { RefusColisLu } from "@/lib/operations/types";
import { Champs, Quand } from "../commun";
import { BoutonPiece } from "../sensibles";

/** Les réponses du formulaire 11, dans ses mots (h2h-logistic, `formulairesIncident.ts`). */
const QUESTIONS: [string, string][] = [
  ["presented", "Colis présenté au cotransporteur"],
  ["matches", "Conforme à l’annonce"],
  ["safe_transport", "Emballage sûr pour le transport"],
];

const ISSUE: Record<NonNullable<RefusColisLu["issue"]>, string> = {
  refus_effectif: "Refus effectif : co-livraison annulée, frais du vendeur",
  refus_injustifie: "Refus non retenu : co-livraison annulée, frais du cotransporteur",
  sans_objet: "Sans objet : le colis a été pris en charge malgré le refus",
};

/**
 * Le refus du colis à la collecte (formulaire 11, CGU H2H Logistic § 5.6.3) : ce que le cotransporteur a déclaré,
 * qui était au hub, le délai du vendeur, sa contestation, l'examen et l'issue.
 *
 * ⚠️ L'ÉQUIPE NE DÉCIDE QUE SUR CONTESTATION : sans elle, le refus devient effectif à l'échéance, par la plateforme.
 * Et l'examen n'écrit rien au grand livre — la plateforme annule la co-livraison dans la minute qui suit.
 */
export function RefusColisBloc({
  refus,
  maintenant,
  geste,
}: {
  refus: RefusColisLu;
  maintenant: number;
  /** L'examen, quand cet équipier peut le faire. */
  geste?: ReactNode;
}) {
  const k = refus.contestation;
  const x = refus.decision;
  const etat = refus.issue
    ? ISSUE[refus.issue]
    : x
      ? x.decision === "maintenu" ? "Refus maintenu : l’annulation s’exécute" : "Refus dit injustifié : l’annulation s’exécute"
      : k
        ? "Contesté par le vendeur : à examiner"
        : "Délai de contestation du vendeur en cours";
  return (
    <div className="grid gap-3 rounded-lg border p-3">
      <span className="flex flex-wrap items-center gap-2">
        <StatutPastille ton={refus.issue ? "muet" : k && !x ? "attention" : "neutre"}>Refus du colis</StatutPastille>
        <span>{etat}</span>
      </span>
      <Champs
        colonnes={4}
        items={[
          ["Déclaré par", refus.cotransporteur],
          ["Déclaré", <Quand key="d" iso={refus.declare_le} maintenant={maintenant} />],
          ["Collecte prévue", <Quand key="c" iso={refus.collecte_le} maintenant={maintenant} />],
          ["Motif", refus.motif],
          ["Cotransporteur au hub", refus.presence_cotransporteur_le
            ? <Quand key="pc" iso={refus.presence_cotransporteur_le} maintenant={maintenant} /> : "Non déclaré"],
          ["Vendeur au hub", refus.presence_vendeur_le
            ? <Quand key="pv" iso={refus.presence_vendeur_le} maintenant={maintenant} /> : "Non déclaré"],
          ["Contestable jusqu’au", <Quand key="cj" iso={refus.contestable_jusqu_au} maintenant={maintenant} />],
          ...QUESTIONS.map(([cle, libelle]): [string, ReactNode] => [libelle, refus.reponses?.[cle] ?? null]),
        ]}
      />
      {refus.reponses?.describe && (
        <blockquote className="border-l-2 pl-3 text-corps whitespace-pre-line">
          <span className="block text-legende text-muted-foreground">Explication du cotransporteur</span>
          {refus.reponses.describe}
        </blockquote>
      )}
      {refus.commentaire && <p className="text-corps text-muted-foreground">{refus.commentaire}</p>}
      {refus.pieces > 0 && refus.pieces_ouvrables && (
        <div className="flex flex-wrap items-center gap-2 text-legende text-muted-foreground">
          <span>Photos du cotransporteur :</span>
          {Array.from({ length: refus.pieces }, (_, i) => (
            <BoutonPiece key={i} nature="piece_incident" piece={refus.id} rang={i + 1} libelle={`Refus du colis — photo ${i + 1}`} />
          ))}
        </div>
      )}

      {k && (
        <div className="grid gap-2 border-t pt-3">
          <span className="text-legende font-semibold text-muted-foreground">
            Contestation du vendeur · <Quand iso={k.declaree_le} maintenant={maintenant} />
            {k.dossier ? ` · dossier ${k.dossier}` : ""}
          </span>
          {k.motif && <p className="text-corps">{k.motif}</p>}
          {k.commentaire && <p className="text-corps text-muted-foreground whitespace-pre-line">{k.commentaire}</p>}
          {k.pieces > 0 && refus.pieces_ouvrables && (
            <div className="flex flex-wrap items-center gap-2 text-legende text-muted-foreground">
              <span>Photos du vendeur :</span>
              {Array.from({ length: k.pieces }, (_, i) => (
                <BoutonPiece key={i} nature="piece_incident" piece={k.id} rang={i + 1} libelle={`Contestation — photo ${i + 1}`} />
              ))}
            </div>
          )}
        </div>
      )}

      {x && (
        <div className="grid gap-1 border-t pt-3 text-corps">
          <span className="text-legende font-semibold text-muted-foreground">
            Examen · {x.decision === "maintenu" ? "refus maintenu" : "refus non retenu"} · {x.par ?? "—"} ·{" "}
            <Quand iso={x.le} maintenant={maintenant} />
          </span>
          <p>« {x.reponse} »</p>
          <p className="text-legende text-muted-foreground">Motif : {x.motif}</p>
        </div>
      )}

      {k && !x && !refus.issue && (geste ?? (refus.raison ? <p className="text-legende text-muted-foreground">{refus.raison}</p> : null))}
    </div>
  );
}
