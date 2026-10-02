"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "cn";
import { CarteRecours } from "@/components/bo/CarteRecours";
import { DialogueExamenRecours, type ExamenSaisi as ExamenRecoursSaisi } from "@/components/bo/DialogueExamenRecours";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { dateHeure } from "@/lib/dates";
import { useGeste } from "@/lib/db/useGeste";
import { examinerRecoursSignalement, examinerSignalements } from "@/lib/signalements/actions";
import {
  CIBLE_DITE,
  LIBELLE_ISSUE_SIGNALEMENT,
  MESURE_DITE,
  PHRASE_CONTESTER,
  PHRASE_ISSUE,
  momentLive,
  type GenreSignale,
  type IssueSignalement,
  type SignalementLu,
  type SignalementsCible,
} from "@/lib/signalements/types";
import { LIBELLE_PRIORITE_SIGNALEMENT } from "@/lib/utilisateurs/types";

// Les longueurs que la base exige : la réponse envoyée aux personnes qui ont signalé, le motif gardé par l'équipe.
const REPONSE_MIN = 10;
const REPONSE_MAX = 2000;
const MOTIF_MIN = 5;

const GENRE_PREUVE: Record<string, string> = { link: "Lien", message: "Message recopié", detail: "Précision" };

/**
 * Examiner le recours d'une personne contre l'examen « non fondé » de son
 * signalement (20261001001000) : la même fenêtre que les autres recours.
 */
function ExaminerRecoursSignalement({
  recours,
  genre,
  cible,
  reference,
}: {
  recours: string;
  genre: GenreSignale;
  cible: string;
  reference: string;
}) {
  const [ouvert, setOuvert] = useState(false);
  const examiner = useGeste(examinerRecoursSignalement);

  async function confirmer(s: ExamenRecoursSaisi) {
    const r = await examiner.lancer(
      { recours, genre, cible, ...s },
      s.decision === "accepte"
        ? "Recours accepté : la personne est prévenue. Prenez maintenant la mesure sur cette fiche."
        : "Recours rejeté : la personne est prévenue.",
    );
    if (r?.ok) setOuvert(false);
  }

  return (
    <>
      <Button size="sm" onClick={() => setOuvert(true)}>
        Examiner le recours
      </Button>
      {/* Remontée à chaque ouverture : une saisie abandonnée ne revient pas. */}
      <DialogueExamenRecours
        key={ouvert ? "ouvert" : "ferme"}
        ouvert={ouvert}
        surFermeture={() => setOuvert(false)}
        reference={reference}
        description="La personne qui a signalé reçoit votre réponse. Le dossier « À traiter » se clôt."
        aides={{
          accepte:
            `L’examen est revu : la personne apprend qu’un manquement est constaté et que l’équipe prend les mesures nécessaires. La mesure — ${MESURE_DITE[genre]} — se prend ensuite sur cette fiche.`,
          rejete: "L’examen est maintenu. La personne en connaît la raison par votre réponse.",
        }}
        enCours={examiner.enCours}
        surConfirmation={confirmer}
      />
    </>
  );
}

/** Un signalement : son motif, sa priorité, ses mots, ses preuves écrites — son examen, et le recours contre lui. */
function CarteSignalement({ s, genre, cible }: { s: SignalementLu; genre: GenreSignale; cible: string }) {
  return (
    <li className="grid gap-1 rounded-lg border p-3">
      <span className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">{s.raison_libelle ?? s.raison}</span>
        <StatutPastille ton={s.priorite === "critique" || s.priorite === "tres_elevee" ? "erreur" : "neutre"}>
          Priorité {(LIBELLE_PRIORITE_SIGNALEMENT[s.priorite] ?? s.priorite).toLowerCase()}
        </StatutPastille>
        {s.examen ? (
          <StatutPastille ton="muet">
            {LIBELLE_ISSUE_SIGNALEMENT[s.examen.issue]} · {s.examen.reference}
          </StatutPastille>
        ) : (
          <StatutPastille ton="actif">À examiner</StatutPastille>
        )}
        {s.examen?.revu && <StatutPastille ton="attention">Revu sur recours</StatutPastille>}
      </span>
      <span className="text-legende text-muted-foreground">
        Signalé le {dateHeure(s.le)}
        {s.signale_par ? ` par ${s.signale_par}` : ""}
        {s.bonne_foi ? "" : " · sans déclaration de bonne foi"}
      </span>
      {/* Un live ne se revoit pas : le moment gelé par la base dit quel article était à l’écran. */}
      {s.contexte && <span className="text-legende">{momentLive(s.contexte)}</span>}
      {s.explication && <p className="whitespace-pre-line text-corps">« {s.explication} »</p>}
      {s.preuves.length > 0 && (
        <ul className="grid gap-0.5 text-legende">
          {s.preuves.map((p, i) => (
            <li key={i} className="break-words">
              <span className="text-muted-foreground">{(p.genre && GENRE_PREUVE[p.genre]) ?? "Preuve"} : </span>
              {p.texte ?? "—"}
            </li>
          ))}
        </ul>
      )}
      {s.examen && (
        <div className="mt-1 grid gap-0.5 border-t pt-2 text-legende">
          <span className="text-muted-foreground">
            Examiné le {dateHeure(s.examen.le)}
            {s.examen.par ? ` par ${s.examen.par}` : ""}
          </span>
          <span>
            <span className="text-muted-foreground">Réponse envoyée : </span>« {s.examen.reponse} »
          </span>
          <span className="text-muted-foreground">Motif interne : {s.examen.motif}</span>
        </div>
      )}
      {s.examen && s.recours && (
        <ul className="mt-1 grid gap-2">
          <CarteRecours
            r={s.recours}
            contre={`l’examen ${s.examen.reference} du ${dateHeure(s.examen.le)}, non fondé`}
            geste={
              <ExaminerRecoursSignalement
                recours={s.recours.id}
                genre={genre}
                cible={cible}
                reference={s.recours.reference}
              />
            }
          />
        </ul>
      )}
    </li>
  );
}

export type ExamenSaisi = { signalements: string[]; issue: IssueSignalement; reponse: string; motif: string };

/**
 * La fenêtre d'examen : les signalements tranchés (tous ceux qui attendent, par
 * défaut), fondés ou non, la réponse que chaque personne qui a signalé reçoit,
 * et le motif que l'équipe garde.
 */
function DialogueExamenSignalements({
  ouvert,
  genre,
  ouverts,
  enCours,
  surFermeture,
  surConfirmation,
}: {
  ouvert: boolean;
  genre: GenreSignale;
  ouverts: SignalementLu[];
  enCours: boolean;
  surFermeture: () => void;
  surConfirmation: (s: ExamenSaisi) => void;
}) {
  const [choisis, setChoisis] = useState<string[]>(() => ouverts.map((s) => s.id));
  const [issue, setIssue] = useState<IssueSignalement | null>(null);
  const [reponse, setReponse] = useState("");
  const [motif, setMotif] = useState("");

  const longueur = reponse.trim().length;
  const valide =
    choisis.length > 0 &&
    issue !== null &&
    longueur >= REPONSE_MIN &&
    longueur <= REPONSE_MAX &&
    motif.trim().length >= MOTIF_MIN;
  const basculer = (id: string) =>
    setChoisis((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const issues: { valeur: IssueSignalement; libelle: string; aide: string }[] = [
    {
      valeur: "fonde",
      libelle: "Fondés",
      aide: `Un manquement est constaté. La mesure — ${MESURE_DITE[genre]} — se prend à part, sur la fiche.`,
    },
    {
      valeur: "non_fonde",
      libelle: "Non fondés",
      aide: `Rien ne justifie d’agir sur ${CIBLE_DITE[genre]}. Chaque personne qui a signalé peut contester cet examen pendant six mois.`,
    },
  ];

  return (
    <Dialog open={ouvert} onOpenChange={(o) => !o && surFermeture()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Examiner les signalements</DialogTitle>
          <DialogDescription>
            Chaque personne qui a signalé {CIBLE_DITE[genre]} reçoit votre réponse — jamais la mesure prise, ni le
            motif interne. Le dossier « À traiter » se clôt quand plus rien n’attend.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2" role="group" aria-label="Signalements examinés">
            <Label>Signalements examinés</Label>
            {ouverts.map((s) => (
              <button
                key={s.id}
                type="button"
                role="checkbox"
                aria-checked={choisis.includes(s.id)}
                onClick={() => basculer(s.id)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-corps transition-colors",
                  choisis.includes(s.id) ? "border-h2h-primary bg-h2h-primary-light" : "hover:bg-muted",
                )}
              >
                <span className="font-medium">{s.raison_libelle ?? s.raison}</span>
                <span className="text-legende text-muted-foreground"> · {dateHeure(s.le)}</span>
              </button>
            ))}
          </div>
          <div className="grid gap-2" role="radiogroup" aria-label="Issue">
            {issues.map((d) => (
              <button
                key={d.valeur}
                type="button"
                role="radio"
                aria-checked={issue === d.valeur}
                onClick={() => setIssue(d.valeur)}
                className={cn(
                  "grid gap-0.5 rounded-lg border px-3 py-2 text-left text-corps transition-colors",
                  issue === d.valeur ? "border-h2h-primary bg-h2h-primary-light text-h2h-primary" : "hover:bg-muted",
                )}
              >
                <span className="font-medium">{d.libelle}</span>
                <span className="text-legende text-muted-foreground">{d.aide}</span>
              </button>
            ))}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reponse-signalements">Réponse aux personnes qui ont signalé</Label>
            {issue && (
              <p className="text-legende text-muted-foreground">
                Elle suit la phrase : « {PHRASE_ISSUE[issue]} »
                {issue === "non_fonde" && <> — et l’avis finit par : « {PHRASE_CONTESTER} »</>}
              </p>
            )}
            <Textarea
              id="reponse-signalements"
              value={reponse}
              onChange={(e) => setReponse(e.target.value)}
              placeholder="Ce que l’équipe a vérifié, sans rien dire de la mesure prise. Elle leur est envoyée telle quelle."
              rows={4}
            />
            <span className={cn("text-legende", longueur > REPONSE_MAX ? "text-h2h-error" : "text-muted-foreground")}>
              {longueur} / {REPONSE_MAX} caractères
            </span>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="motif-signalements">Motif interne</Label>
            <Textarea
              id="motif-signalements"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Il reste au journal d’audit : les personnes qui ont signalé ne le lisent pas."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={surFermeture} disabled={enCours}>
            Annuler
          </Button>
          <Button
            disabled={!valide || enCours}
            onClick={() =>
              issue && surConfirmation({ signalements: choisis, issue, reponse: reponse.trim(), motif: motif.trim() })
            }
          >
            {enCours ? "Un instant…" : `Examiner (${choisis.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Les signalements d'une annonce, d'une recherche, d'un compte ou d'un live (§8, §9, §14) :
 * ceux qui attendent d'abord, leur examen, le dossier « À traiter » — et le
 * geste d'examen, ou la raison de ne pas pouvoir. Sous un signalement jugé non
 * fondé, le recours de la personne qui l'a fait (art. 20 du règlement sur les
 * services numériques), examiné ici par un autre regard.
 *
 * ⚠️ L'ÉCRAN MONTRE CE QUE LA BASE PERMET (`possibles`), et la base décide encore.
 */
export function BlocSignalements({ genre, cible, s }: { genre: GenreSignale; cible: string; s: SignalementsCible }) {
  const [ouvert, setOuvert] = useState(false);
  const examiner = useGeste(examinerSignalements);
  const ouverts = s.signalements.filter((x) => x.examen === null);

  async function confirmer(saisie: ExamenSaisi) {
    const r = await examiner.lancer(
      { genre, cible, ...saisie },
      saisie.issue === "fonde"
        ? "Signalements fondés : les personnes qui ont signalé sont prévenues."
        : "Signalements non fondés : les personnes qui ont signalé sont prévenues.",
    );
    if (r?.ok) setOuvert(false);
  }

  if (s.signalements.length === 0) {
    return <p className="text-corps text-muted-foreground">Aucun signalement.</p>;
  }
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-corps">
          {s.a_examiner > 0
            ? `${s.a_examiner} signalement${s.a_examiner > 1 ? "s" : ""} à examiner`
            : "Tous les signalements sont examinés."}
          {s.recours_a_examiner > 0 &&
            ` · ${s.recours_a_examiner} recours à examiner contre ${s.recours_a_examiner > 1 ? "leurs examens" : "un examen"}`}
          {s.dossier && (
            <>
              {" · "}
              <Link
                href={`/a-traiter?dossier=${s.dossier.id}`}
                className="font-semibold tabular-nums text-h2h-primary hover:underline"
              >
                {s.dossier.reference}
              </Link>
            </>
          )}
        </p>
        {s.a_examiner > 0 &&
          (s.possibles.examiner ? (
            <Button size="sm" onClick={() => setOuvert(true)}>
              Examiner les signalements
            </Button>
          ) : (
            <span className="text-legende text-muted-foreground">{s.possibles.raison}</span>
          ))}
      </div>
      <ul className="grid gap-2">
        {s.signalements.map((x) => (
          <CarteSignalement key={x.id} s={x} genre={genre} cible={cible} />
        ))}
      </ul>
      {/* Remontée à chaque ouverture : une saisie abandonnée ne revient pas, et le choix reprend tout ce qui attend. */}
      <DialogueExamenSignalements
        key={ouvert ? "ouvert" : "ferme"}
        ouvert={ouvert}
        genre={genre}
        ouverts={ouverts}
        enCours={examiner.enCours}
        surFermeture={() => setOuvert(false)}
        surConfirmation={confirmer}
      />
    </div>
  );
}

/**
 * Les signalements d'une fiche, ou l'échec de leur lecture — jamais une liste
 * vide à la place d'une panne : l'équipe conclurait que rien n'attend.
 */
export function SignalementsLus({ genre, cible, s }: { genre: GenreSignale; cible: string; s: SignalementsCible | null }) {
  return s ? (
    <BlocSignalements genre={genre} cible={cible} s={s} />
  ) : (
    <LectureEchouee
      titre="Les signalements ne se lisent pas"
      message="Le reste de la fiche est à jour. Rechargez la page dans un instant."
    />
  );
}
