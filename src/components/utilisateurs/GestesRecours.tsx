"use client";

import { useState } from "react";
import { FileSearch, Loader2 } from "lucide-react";
import { cn } from "cn";
import { DialogueMotif } from "@/components/bo/DialogueMotif";
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
import { useConsultation } from "@/lib/db/useConsultation";
import { useGeste } from "@/lib/db/useGeste";
import type { PieceOuverte } from "@/lib/operations/types";
import { examinerRecours } from "@/lib/utilisateurs/actions";
import { ouvrirPieceRecours } from "@/lib/utilisateurs/sensibles";
import type { DecisionRecours } from "@/lib/utilisateurs/types";

// Les longueurs que la base exige : la réponse dite à la personne, le motif gardé par l'équipe.
const REPONSE_MIN = 10;
const REPONSE_MAX = 2000;
const MOTIF_MIN = 5;

const DECISIONS: { valeur: DecisionRecours; libelle: string; aide: string }[] = [
  {
    valeur: "accepte",
    libelle: "Accepter le recours",
    aide: "La décision est annulée : levée si elle court encore, et elle ne compte plus dans le dossier du compte.",
  },
  {
    valeur: "rejete",
    libelle: "Rejeter le recours",
    aide: "La décision est maintenue. La personne en connaît la raison par votre réponse.",
  },
];

/**
 * Examiner un recours : l'accepter ou le rejeter, avec une réponse à la
 * personne et un motif pour l'équipe.
 *
 * ⚠️ LA BASE DÉCIDE ENCORE : la permission, l'identité reconfirmée, jamais par
 * l'auteur de la décision, jamais sur son propre compte, une seule fois. Le
 * bouton n'apparaît que si la fiche le permet (`examinable`).
 */
export function ExaminerRecours({ recours, profil, reference }: { recours: string; profil: string; reference: string }) {
  const [ouvert, setOuvert] = useState(false);
  const [decision, setDecision] = useState<DecisionRecours | null>(null);
  const [reponse, setReponse] = useState("");
  const [motif, setMotif] = useState("");
  const examiner = useGeste(examinerRecours);

  const longueur = reponse.trim().length;
  const valide =
    decision !== null && longueur >= REPONSE_MIN && longueur <= REPONSE_MAX && motif.trim().length >= MOTIF_MIN;

  const fermer = () => {
    setOuvert(false);
    setDecision(null);
    setReponse("");
    setMotif("");
  };

  async function confirmer() {
    if (!decision) return;
    const r = await examiner.lancer(
      { recours, profil, decision, reponse: reponse.trim(), motif: motif.trim() },
      decision === "accepte" ? "Recours accepté : la personne est prévenue." : "Recours rejeté : la personne est prévenue.",
    );
    if (r?.ok) fermer();
  }

  return (
    <>
      <Button size="sm" onClick={() => setOuvert(true)}>
        Examiner le recours
      </Button>
      <Dialog open={ouvert} onOpenChange={(o) => !o && fermer()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Examiner le recours {reference}</DialogTitle>
            <DialogDescription>
              La personne reçoit votre réponse, avec ce qui s’ensuit pour son compte. Le dossier « À traiter » se clôt.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2" role="radiogroup" aria-label="Décision">
              {DECISIONS.map((d) => (
                <button
                  key={d.valeur}
                  type="button"
                  role="radio"
                  aria-checked={decision === d.valeur}
                  onClick={() => setDecision(d.valeur)}
                  className={cn(
                    "grid gap-0.5 rounded-lg border px-3 py-2 text-left text-corps transition-colors",
                    decision === d.valeur ? "border-h2h-primary bg-h2h-primary-light text-h2h-primary" : "hover:bg-muted",
                  )}
                >
                  <span className="font-medium">{d.libelle}</span>
                  <span className="text-legende text-muted-foreground">{d.aide}</span>
                </button>
              ))}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reponse-recours">Réponse à la personne</Label>
              <Textarea
                id="reponse-recours"
                value={reponse}
                onChange={(e) => setReponse(e.target.value)}
                placeholder="Ce que l’équipe a vérifié, et pourquoi elle décide ainsi. Elle lui est envoyée telle quelle."
                rows={4}
              />
              <span className={cn("text-legende", longueur > REPONSE_MAX ? "text-h2h-error" : "text-muted-foreground")}>
                {longueur} / {REPONSE_MAX} caractères
              </span>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="motif-recours">Motif interne</Label>
              <Textarea
                id="motif-recours"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Il reste au journal d’audit : la personne ne le lit pas."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={fermer} disabled={examiner.enCours}>
              Annuler
            </Button>
            <Button disabled={!valide || examiner.enCours} onClick={confirmer}>
              {examiner.enCours ? "Un instant…" : decision === "rejete" ? "Rejeter" : "Accepter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Une pièce jointe au recours : un motif, un ticket de cinq minutes pris par la
 * base et inscrit au journal, puis l'aperçu dans une adresse qui ne vaut
 * qu'une minute.
 */
export function PieceRecours({ recours, rang }: { recours: string; rang: number }) {
  const [demande, setDemande] = useState(false);
  const [ouverte, setOuverte] = useState<PieceOuverte | null>(null);
  const { consulter, enCours } = useConsultation(ouvrirPieceRecours);
  const libelle = `Pièce ${rang}`;
  return (
    <>
      <Button type="button" variant="outline" size="sm" className="h-7 px-2" onClick={() => setDemande(true)} disabled={enCours}>
        {enCours ? <Loader2 className="animate-spin" /> : <FileSearch />}
        {libelle}
      </Button>
      <DialogueMotif
        ouvert={demande}
        surFermeture={() => setDemande(false)}
        titre={`Ouvrir la ${libelle.toLowerCase()} du recours`}
        description="Un accès de cinq minutes vous est ouvert, pour ce fichier seulement ; l’ouverture est inscrite au journal d’audit, avec votre motif."
        libelleAction="Ouvrir"
        longueurMin={5}
        enCours={enCours}
        surConfirmation={async (motif) => {
          const r = await consulter({ recours, rang, motif });
          if (r) {
            setOuverte(r);
            setDemande(false);
          }
        }}
      />
      <Dialog open={ouverte !== null} onOpenChange={(o) => !o && setOuverte(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{libelle}</DialogTitle>
            <DialogDescription>
              L’adresse de ce fichier ne vaut qu’une minute. Fermez cette fenêtre quand vous avez terminé.
            </DialogDescription>
          </DialogHeader>
          {ouverte && (
            // Une adresse signée, éphémère : `next/image` voudrait la déclarer et la mettre en cache.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ouverte.url} alt={libelle} className="max-h-[70vh] w-full rounded-lg object-contain" />
          )}
          {ouverte && (
            <a href={ouverte.url} target="_blank" rel="noreferrer" className="text-legende font-semibold text-h2h-primary">
              Ouvrir dans un nouvel onglet (une pièce PDF s’y lit)
            </a>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
