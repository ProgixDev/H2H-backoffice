"use client";

import { useState } from "react";
import { cn } from "cn";
import { FileSearch, FileCheck2, Gavel, MessageSquareWarning, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { aujourdhuiParis, instantParis } from "@/lib/dates";
import { useGeste } from "@/lib/db/useGeste";
import {
  conclureEnquete,
  enregistrerRecours,
  examinerRecours,
  ouvrirEnquete,
  qualifierDossier,
} from "@/lib/litiges/actions";
import {
  CANAUX,
  ISSUES,
  LIBELLE_PARTIE,
  type Canal,
  type CompteMotif,
  type GenreDossier,
  type IssueEnquete,
  type Partie,
} from "@/lib/litiges/types";

type Taille = "sm" | "xs";

/** Un choix parmi quelques-uns : un seul coché, comme les boutons radio de l'application. */
function Choix<T extends string>({
  etiquette,
  options,
  valeur,
  surChoix,
  colonnes = 2,
}: {
  etiquette: string;
  options: { valeur: T; libelle: string; detail?: string }[];
  valeur: T | null;
  surChoix: (v: T) => void;
  colonnes?: 1 | 2 | 3;
}) {
  return (
    <div className="grid gap-2">
      <span className="text-legende font-semibold text-muted-foreground">{etiquette}</span>
      <div
        role="radiogroup"
        aria-label={etiquette}
        className={cn("grid gap-2", colonnes === 1 ? "grid-cols-1" : colonnes === 3 ? "grid-cols-3" : "grid-cols-2")}
      >
        {options.map((o) => (
          <button
            key={o.valeur}
            type="button"
            role="radio"
            aria-checked={valeur === o.valeur}
            onClick={() => surChoix(o.valeur)}
            className={cn(
              "rounded-lg border px-3 py-2 text-left text-corps transition-colors",
              valeur === o.valeur ? "border-h2h-primary bg-h2h-primary-light text-h2h-primary" : "hover:bg-muted",
            )}
          >
            <span className="block font-medium">{o.libelle}</span>
            {o.detail && <span className="block text-legende text-muted-foreground">{o.detail}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Le pied commun : annuler, confirmer. */
function Pied({ enCours, valide, libelle, surAnnuler, surConfirmer }: {
  enCours: boolean;
  valide: boolean;
  libelle: string;
  surAnnuler: () => void;
  surConfirmer: () => void;
}) {
  return (
    <DialogFooter>
      <Button variant="outline" onClick={surAnnuler} disabled={enCours}>
        Annuler
      </Button>
      <Button disabled={!valide || enCours} onClick={surConfirmer}>
        {enCours ? "Un instant…" : libelle}
      </Button>
    </DialogFooter>
  );
}

/**
 * Ranger un dossier sous l'un des onze motifs du cahier des charges. La
 * qualification l'emporte sur le motif calculé ; les précédentes restent.
 */
export function BoutonRequalifier({
  genre,
  objet,
  motifs,
  actuel,
  taille = "sm",
}: {
  genre: GenreDossier;
  objet: string;
  motifs: CompteMotif[];
  /** Le motif en vigueur, qu'on ne propose pas. */
  actuel: string | null;
  taille?: Taille;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [motif, setMotif] = useState<string | null>(null);
  const [justification, setJustification] = useState("");
  const qualifier = useGeste(qualifierDossier);
  const options = motifs
    .filter((m) => m.motif !== null && m.motif !== actuel)
    .map((m) => ({ valeur: m.motif as string, libelle: m.libelle }));
  const fermer = () => {
    setOuvert(false);
    setMotif(null);
    setJustification("");
  };
  return (
    <>
      <Button variant="outline" size={taille} onClick={() => setOuvert(true)}>
        <Tags /> Requalifier
      </Button>
      <Dialog open={ouvert} onOpenChange={(o) => (o ? setOuvert(true) : fermer())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ranger le dossier sous un autre motif</DialogTitle>
            <DialogDescription>
              Les onze motifs du cahier des charges. Votre justification reste au dossier, avec les qualifications
              précédentes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Choix etiquette="Motif" options={options} valeur={motif} surChoix={setMotif} colonnes={3} />
            <div className="grid gap-2">
              <Label htmlFor="justification">Justification</Label>
              <Textarea
                id="justification"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={3}
                placeholder="Ce que le dossier montre."
              />
            </div>
          </div>
          <Pied
            enCours={qualifier.enCours}
            valide={motif !== null && justification.trim().length >= 5}
            libelle="Requalifier"
            surAnnuler={fermer}
            surConfirmer={async () => {
              if (!motif) return;
              const r = await qualifier.lancer({ genre, objet, motif, justification: justification.trim() }, "Dossier requalifié.");
              if (r?.ok) fermer();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Enregistrer le recours d'une partie contre la dernière décision.
 * ⚠️ Une trace de l'équipe, depuis le canal où le recours est arrivé : résumé
 * fidèlement, jamais réécrit au nom de la partie.
 */
export function BoutonRecours({ dossier, rang, taille = "sm" }: { dossier: string; rang: number; taille?: Taille }) {
  const [ouvert, setOuvert] = useState(false);
  const [partie, setPartie] = useState<Partie | null>(null);
  const [canal, setCanal] = useState<Canal | null>(null);
  const [texte, setTexte] = useState("");
  const enregistrer = useGeste(enregistrerRecours);
  const fermer = () => {
    setOuvert(false);
    setPartie(null);
    setCanal(null);
    setTexte("");
  };
  return (
    <>
      <Button variant="outline" size={taille} onClick={() => setOuvert(true)}>
        <MessageSquareWarning /> Enregistrer un recours
      </Button>
      <Dialog open={ouvert} onOpenChange={(o) => (o ? setOuvert(true) : fermer())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recours contre la décision n°{rang}</DialogTitle>
            <DialogDescription>
              Notez le recours tel qu’il est arrivé. Une autre personne que l’auteur de la décision l’examinera ;
              recevable, il rouvrira le dossier.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Choix
              etiquette="Qui conteste"
              options={(["buyer", "seller"] as Partie[]).map((p) => ({ valeur: p, libelle: LIBELLE_PARTIE[p] }))}
              valeur={partie}
              surChoix={setPartie}
            />
            <Choix
              etiquette="Reçu par"
              options={CANAUX.map((c) => ({ valeur: c.canal, libelle: c.libelle }))}
              valeur={canal}
              surChoix={setCanal}
              colonnes={3}
            />
            <div className="grid gap-2">
              <Label htmlFor="texte-recours">Ce que dit la partie</Label>
              <Textarea
                id="texte-recours"
                value={texte}
                onChange={(e) => setTexte(e.target.value)}
                rows={4}
                placeholder="Le résumé fidèle du recours, et les pièces qu’il annonce."
              />
            </div>
          </div>
          <Pied
            enCours={enregistrer.enCours}
            valide={partie !== null && canal !== null && texte.trim().length >= 10}
            libelle="Enregistrer le recours"
            surAnnuler={fermer}
            surConfirmer={async () => {
              if (!partie || !canal) return;
              const r = await enregistrer.lancer({ dossier, partie, canal, texte: texte.trim() }, "Recours enregistré.");
              if (r?.ok) fermer();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Examiner un recours : recevable, le dossier se rouvre ; irrecevable, la décision tient. */
export function BoutonExaminerRecours({ recours, rang, taille = "sm" }: { recours: string; rang: number; taille?: Taille }) {
  const [ouvert, setOuvert] = useState(false);
  const [issue, setIssue] = useState<"recevable" | "irrecevable" | null>(null);
  const [motif, setMotif] = useState("");
  const examiner = useGeste(examinerRecours);
  const fermer = () => {
    setOuvert(false);
    setIssue(null);
    setMotif("");
  };
  return (
    <>
      <Button size={taille} onClick={() => setOuvert(true)}>
        <Gavel /> Examiner le recours
      </Button>
      <Dialog open={ouvert} onOpenChange={(o) => (o ? setOuvert(true) : fermer())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Examiner le recours contre la décision n°{rang}</DialogTitle>
            <DialogDescription>Les parties sont prévenues de l’issue ; votre motif reste interne.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Choix
              etiquette="Issue"
              colonnes={1}
              options={[
                {
                  valeur: "recevable",
                  libelle: "Recevable",
                  detail: "Le dossier se rouvre ; une décision suivante sera rendue.",
                },
                {
                  valeur: "irrecevable",
                  libelle: "Irrecevable",
                  detail: "La décision tient ; la partie qui conteste en est prévenue.",
                },
              ]}
              valeur={issue}
              surChoix={setIssue}
            />
            <div className="grid gap-2">
              <Label htmlFor="motif-examen">Motif</Label>
              <Textarea id="motif-examen" value={motif} onChange={(e) => setMotif(e.target.value)} rows={3} />
            </div>
          </div>
          <Pied
            enCours={examiner.enCours}
            valide={issue !== null && motif.trim().length >= 5}
            libelle="Enregistrer l’examen"
            surAnnuler={fermer}
            surConfirmer={async () => {
              if (!issue) return;
              const r = await examiner.lancer(
                { recours, recevable: issue === "recevable", motif: motif.trim() },
                issue === "recevable" ? "Recours recevable : le dossier est rouvert." : "Recours irrecevable.",
              );
              if (r?.ok) fermer();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Ouvrir une enquête chez le transporteur tiers de la commande. */
export function BoutonEnquete({ dossier, transporteur, taille = "sm" }: {
  dossier: string;
  transporteur: string;
  taille?: Taille;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [reference, setReference] = useState("");
  const [echeance, setEcheance] = useState("");
  const [note, setNote] = useState("");
  const ouvrir = useGeste(ouvrirEnquete);
  const aujourdhui = aujourdhuiParis();
  const fermer = () => {
    setOuvert(false);
    setReference("");
    setEcheance("");
    setNote("");
  };
  return (
    <>
      <Button variant="outline" size={taille} onClick={() => setOuvert(true)}>
        <FileSearch /> Enquête transporteur
      </Button>
      <Dialog open={ouvert} onOpenChange={(o) => (o ? setOuvert(true) : fermer())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enquête chez {transporteur}</DialogTitle>
            <DialogDescription>
              Notez la référence que le transporteur a donnée à votre demande, et le jour où sa réponse est attendue.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="reference-enquete">Référence chez le transporteur</Label>
              <Input id="reference-enquete" value={reference} onChange={(e) => setReference(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="echeance-enquete">Réponse attendue le (facultatif)</Label>
              <Input
                id="echeance-enquete"
                type="date"
                min={aujourdhui}
                value={echeance}
                onChange={(e) => setEcheance(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note-enquete">Note (facultatif)</Label>
              <Textarea id="note-enquete" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
            </div>
          </div>
          <Pied
            enCours={ouvrir.enCours}
            valide={reference.trim().length >= 3 && (echeance === "" || echeance >= aujourdhui)}
            libelle="Ouvrir l’enquête"
            surAnnuler={fermer}
            surConfirmer={async () => {
              const r = await ouvrir.lancer(
                {
                  dossier,
                  reference: reference.trim(),
                  echeance: echeance ? instantParis(echeance) : null,
                  note: note.trim(),
                },
                "Enquête ouverte.",
              );
              if (r?.ok) fermer();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Conclure l'enquête : son issue précise le motif du dossier. */
export function BoutonConclureEnquete({ enquete, reference, taille = "sm" }: {
  enquete: string;
  reference: string;
  taille?: Taille;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [issue, setIssue] = useState<IssueEnquete | null>(null);
  const [conclusion, setConclusion] = useState("");
  const conclure = useGeste(conclureEnquete);
  const fermer = () => {
    setOuvert(false);
    setIssue(null);
    setConclusion("");
  };
  return (
    <>
      <Button variant="outline" size={taille} onClick={() => setOuvert(true)}>
        <FileCheck2 /> Conclure l’enquête
      </Button>
      <Dialog open={ouvert} onOpenChange={(o) => (o ? setOuvert(true) : fermer())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conclure l’enquête {reference}</DialogTitle>
            <DialogDescription>
              La conclusion précise le motif du dossier : perte, livraison, dommage ou retard. « Sans suite » ne le
              change pas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Choix
              etiquette="Le transporteur conclut"
              colonnes={1}
              options={ISSUES.map((i) => ({ valeur: i.issue, libelle: i.libelle }))}
              valeur={issue}
              surChoix={setIssue}
            />
            <div className="grid gap-2">
              <Label htmlFor="conclusion-enquete">Sa réponse</Label>
              <Textarea
                id="conclusion-enquete"
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <Pied
            enCours={conclure.enCours}
            valide={issue !== null && conclusion.trim().length >= 5}
            libelle="Conclure"
            surAnnuler={fermer}
            surConfirmer={async () => {
              if (!issue) return;
              const r = await conclure.lancer({ enquete, issue, conclusion: conclusion.trim() }, "Enquête conclue.");
              if (r?.ok) fermer();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
