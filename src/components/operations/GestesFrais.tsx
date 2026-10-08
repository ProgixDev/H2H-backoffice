"use client";

import { useState } from "react";
import { DialogueExamenRecours, type ExamenSaisi } from "@/components/bo/DialogueExamenRecours";
import { Button } from "@/components/ui/button";
import { examinerRecoursFrais } from "@/lib/colivraisons/actions";
import { useGeste } from "@/lib/db/useGeste";

/**
 * Examiner une contestation de frais d'annulation tardive : la lever ou la maintenir, avec une réponse à la
 * personne et un motif pour l'équipe.
 *
 * ⚠️ LA BASE DÉCIDE ENCORE : la permission (trancher les incidents de co-livraison), l'identité reconfirmée,
 * jamais un équipier partie à la co-livraison, une seule fois. Le bouton n'apparaît que si la fiche le permet
 * (`examinable`).
 */
export function ExaminerRecoursFrais({ recours, reference, operation }: { recours: string; reference: string; operation: string }) {
  const [ouvert, setOuvert] = useState(false);
  const examiner = useGeste(examinerRecoursFrais);

  async function confirmer(s: ExamenSaisi) {
    const r = await examiner.lancer(
      { recours, operation, ...s },
      s.decision === "accepte"
        ? "Contestation acceptée : les frais sont levés, la personne est prévenue."
        : "Contestation rejetée : la personne est prévenue.",
    );
    if (r?.ok) setOuvert(false);
  }

  return (
    <>
      <Button size="sm" onClick={() => setOuvert(true)}>
        Examiner la contestation
      </Button>
      {/* Remontée à chaque ouverture : une saisie abandonnée ne revient pas. */}
      <DialogueExamenRecours
        key={ouvert ? "ouvert" : "ferme"}
        ouvert={ouvert}
        surFermeture={() => setOuvert(false)}
        reference={reference}
        description="La personne reçoit votre réponse dans son application. Le dossier « À traiter » se clôt."
        aides={{
          accepte:
            "Les frais sont levés : ce qui en a été retenu revient à la personne au virement suivant, et rien n’est plus retenu. HandtoHand les supporte.",
          rejete: "Les frais sont maintenus : ils se retiennent de nouveau sur les prochains virements de la personne.",
        }}
        enCours={examiner.enCours}
        surConfirmation={confirmer}
      />
    </>
  );
}
