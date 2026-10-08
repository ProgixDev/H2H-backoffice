"use client";

import { useState } from "react";
import { DialogueExamenRecours, type ExamenSaisi } from "@/components/bo/DialogueExamenRecours";
import { Button } from "@/components/ui/button";
import { examinerRefusColis } from "@/lib/colivraisons/actions";
import { useGeste } from "@/lib/db/useGeste";

/**
 * Examiner la contestation d'un refus du colis (CGU H2H Logistic § 5.6.3) : l'accepter — le refus n'était pas
 * justifié — ou la rejeter — le refus est maintenu —, avec une réponse aux deux participants et un motif pour
 * l'équipe.
 *
 * ⚠️ LA BASE DÉCIDE ENCORE : la permission (trancher les incidents de co-livraison), l'identité reconfirmée, jamais
 * un équipier partie à la co-livraison, une seule fois. Le bouton n'apparaît que si la fiche le permet (`examinable`).
 */
export function ExaminerRefusColis({
  contestation,
  reference,
  operation,
}: {
  contestation: string;
  reference: string;
  operation: string;
}) {
  const [ouvert, setOuvert] = useState(false);
  const examiner = useGeste(examinerRefusColis);

  async function confirmer(s: ExamenSaisi) {
    const r = await examiner.lancer(
      { contestation, operation, ...s },
      s.decision === "accepte"
        ? "Refus dit injustifié : la co-livraison s’annule dans la minute, le vendeur et le cotransporteur sont prévenus."
        : "Refus maintenu : la co-livraison s’annule dans la minute, le vendeur et le cotransporteur sont prévenus.",
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
        description="Le vendeur et le cotransporteur reçoivent votre réponse, chacun dans son application. Le dossier « À traiter » se clôt."
        aides={{
          accepte:
            "Le refus n’était pas justifié : la co-livraison et la vente sont annulées sans frais pour le vendeur, dont la part des frais est rendue ; le refus compte comme une annulation tardive du cotransporteur.",
          rejete:
            "Le refus est maintenu : la co-livraison et la vente sont annulées, l’acheteur intégralement remboursé ; les frais du refus restent au vendeur, dont la compensation du cotransporteur.",
        }}
        enCours={examiner.enCours}
        surConfirmation={confirmer}
      />
    </>
  );
}
