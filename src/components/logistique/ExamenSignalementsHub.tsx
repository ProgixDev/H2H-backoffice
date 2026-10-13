"use client";

import { useState } from "react";
import { cn } from "cn";
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
import { examinerSignalementsHub } from "@/lib/logistique/actions";
import {
  LIBELLE_RAISON_SIGNALEMENT_HUB,
  PHRASE_EXAMEN_HUB,
  type IssueSignalementHub,
  type SignalementHub,
} from "@/lib/logistique/types";

// Les longueurs que la base exige.
const REPONSE_MIN = 10;
const REPONSE_MAX = 2000;
const MOTIF_MIN = 5;

const ISSUES: { valeur: IssueSignalementHub; libelle: string; aide: string }[] = [
  {
    valeur: "fonde",
    libelle: "Fondés",
    aide: "Le problème signalé est constaté. La mesure — fermer le point aux nouvelles recherches, ou le corriger — se prend à part, sur cette fiche.",
  },
  {
    valeur: "non_fonde",
    libelle: "Non fondés",
    aide: "Rien ne justifie de toucher au point. Cet examen ne se conteste pas : la personne peut écrire au support, ou signaler le point de nouveau — une fois par jour.",
  },
];

/**
 * Ce qui est coché au départ : tout ce qui attend, dans UN monde — celui des comptes réels s'il y en a.
 * ⚠️ UN EXAMEN N'A QU'UN MONDE (la base le refuse sinon) : il clôt le dossier de ce monde-là.
 */
export function choixDeDepart(ouverts: SignalementHub[]): string[] {
  const reels = ouverts.filter((s) => !s.est_test);
  return (reels.length > 0 ? reels : ouverts).map((s) => s.id);
}

/** Cocher ou décocher un signalement ; celui de l'autre monde remplace la sélection au lieu de s'y ajouter. */
export function basculerChoix(choisis: string[], ouverts: SignalementHub[], id: string): string[] {
  if (choisis.includes(id)) return choisis.filter((x) => x !== id);
  const monde = (x: string) => ouverts.find((s) => s.id === x)?.est_test ?? false;
  return choisis.length > 0 && monde(choisis[0]) !== monde(id) ? [id] : [...choisis, id];
}

/**
 * « Examiner un signalement » (§ 12.4) : les signalements tranchés (tous ceux qui
 * attendent, par défaut), fondés ou non, la réponse que chaque personne qui a
 * signalé reçoit dans l'application du cotransporteur, et le motif que l'équipe
 * garde.
 */
export function GesteExamenSignalementsHub({ hub, ouverts }: { hub: string; ouverts: SignalementHub[] }) {
  const [ouvert, setOuvert] = useState(false);
  const [choisis, setChoisis] = useState<string[]>([]);
  const [issue, setIssue] = useState<IssueSignalementHub | null>(null);
  const [reponse, setReponse] = useState("");
  const [motif, setMotif] = useState("");
  const examiner = useGeste(examinerSignalementsHub);

  const longueur = reponse.trim().length;
  const valide =
    choisis.length > 0 &&
    issue !== null &&
    longueur >= REPONSE_MIN &&
    longueur <= REPONSE_MAX &&
    motif.trim().length >= MOTIF_MIN;
  const deuxMondes = ouverts.some((s) => s.est_test) && ouverts.some((s) => !s.est_test);

  return (
    <>
      <Button
        size="sm"
        onClick={() => {
          // Une saisie abandonnée ne revient pas, et le choix reprend ce qui attend.
          setChoisis(choixDeDepart(ouverts));
          setIssue(null);
          setReponse("");
          setMotif("");
          setOuvert(true);
        }}
      >
        Examiner les signalements
      </Button>
      <Dialog open={ouvert} onOpenChange={(o) => !o && setOuvert(false)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Examiner les signalements</DialogTitle>
            <DialogDescription>
              Chaque personne qui a signalé ce point reçoit votre réponse dans l’application du cotransporteur — jamais le
              motif interne. Le dossier « À traiter » du point se clôt quand plus rien n’attend.
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
                  onClick={() => setChoisis((c) => basculerChoix(c, ouverts, s.id))}
                  className={cn(
                    "flex flex-wrap items-center gap-x-2 rounded-lg border px-3 py-2 text-left text-corps transition-colors",
                    choisis.includes(s.id) ? "border-h2h-primary bg-h2h-primary-light" : "hover:bg-muted",
                  )}
                >
                  <span className="font-medium">{LIBELLE_RAISON_SIGNALEMENT_HUB[s.raison] ?? s.raison}</span>
                  <span className="text-legende text-muted-foreground">· {dateHeure(s.signale_le)}</span>
                  {s.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
                </button>
              ))}
              {deuxMondes && (
                <p className="text-legende text-muted-foreground">
                  Un examen ne mêle pas les signalements de comptes réels et de comptes de test : ils ont chacun leur
                  dossier. Examinez-les l’un après l’autre.
                </p>
              )}
            </div>
            <div className="grid gap-2" role="radiogroup" aria-label="Issue">
              {ISSUES.map((d) => (
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
              <Label htmlFor={`reponse-signalements-${hub}`}>Réponse aux personnes qui ont signalé</Label>
              {issue && (
                <p className="text-legende text-muted-foreground">Elle suit la phrase : « {PHRASE_EXAMEN_HUB[issue]} »</p>
              )}
              <Textarea
                id={`reponse-signalements-${hub}`}
                value={reponse}
                onChange={(e) => setReponse(e.target.value)}
                placeholder="Ce que l’équipe a vérifié, et ce qui change pour le point. Elle leur est envoyée telle quelle."
                rows={4}
              />
              <span className={cn("text-legende", longueur > REPONSE_MAX ? "text-h2h-error" : "text-muted-foreground")}>
                {longueur} / {REPONSE_MAX} caractères
              </span>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`motif-signalements-${hub}`}>Motif interne</Label>
              <Textarea
                id={`motif-signalements-${hub}`}
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Il reste au journal d’audit : les personnes qui ont signalé ne le lisent pas."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOuvert(false)} disabled={examiner.enCours}>
              Annuler
            </Button>
            <Button
              disabled={!valide || examiner.enCours}
              onClick={async () => {
                if (!issue) return;
                const r = await examiner.lancer(
                  { hub, signalements: choisis, issue, reponse: reponse.trim(), motif: motif.trim() },
                  issue === "fonde"
                    ? "Signalements fondés : les personnes qui ont signalé sont prévenues."
                    : "Signalements non fondés : les personnes qui ont signalé sont prévenues.",
                );
                if (r?.ok) setOuvert(false);
              }}
            >
              {examiner.enCours ? "Un instant…" : `Examiner (${choisis.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
