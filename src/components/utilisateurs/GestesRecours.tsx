"use client";

import { useState } from "react";
import { FileSearch, Loader2 } from "lucide-react";
import { DialogueExamenRecours, type ExamenSaisi } from "@/components/bo/DialogueExamenRecours";
import { DialogueMotif } from "@/components/bo/DialogueMotif";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConsultation } from "@/lib/db/useConsultation";
import { useGeste } from "@/lib/db/useGeste";
import type { PieceOuverte } from "@/lib/operations/types";
import { examinerRecours } from "@/lib/utilisateurs/actions";
import { ouvrirPieceRecours } from "@/lib/utilisateurs/sensibles";

/**
 * Examiner un recours contre une sanction : l'accepter ou le rejeter, avec une
 * réponse à la personne et un motif pour l'équipe.
 *
 * ⚠️ LA BASE DÉCIDE ENCORE : la permission, l'identité reconfirmée, jamais par
 * l'auteur de la décision, jamais sur son propre compte, une seule fois. Le
 * bouton n'apparaît que si la fiche le permet (`examinable`).
 */
export function ExaminerRecours({ recours, profil, reference }: { recours: string; profil: string; reference: string }) {
  const [ouvert, setOuvert] = useState(false);
  const examiner = useGeste(examinerRecours);

  async function confirmer(s: ExamenSaisi) {
    const r = await examiner.lancer(
      { recours, profil, ...s },
      s.decision === "accepte" ? "Recours accepté : la personne est prévenue." : "Recours rejeté : la personne est prévenue.",
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
        description="La personne reçoit votre réponse, avec ce qui s’ensuit pour son compte. Le dossier « À traiter » se clôt."
        aides={{
          accepte: "La décision est annulée : levée si elle court encore, et elle ne compte plus dans le dossier du compte.",
          rejete: "La décision est maintenue. La personne en connaît la raison par votre réponse.",
        }}
        enCours={examiner.enCours}
        surConfirmation={confirmer}
      />
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
