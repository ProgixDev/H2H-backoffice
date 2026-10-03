"use client";

import { useState } from "react";
import { RotateCw } from "lucide-react";
import { DialogueMotif } from "@/components/bo/DialogueMotif";
import { Button } from "@/components/ui/button";
import { renvoyerNotification } from "@/lib/activite/actions";
import type { NotificationSuivie } from "@/lib/activite/types";
import { useGeste } from "@/lib/db/useGeste";

/**
 * « Renvoyer » : le même avis repart vers les appareils du destinataire — une
 * nouvelle tentative sur la même notification (R20.6).
 */
export function GesteRenvoi({ notification, surRenvoi }: { notification: NotificationSuivie; surRenvoi?: () => void }) {
  const [ouvert, setOuvert] = useState(false);
  const { lancer, enCours } = useGeste(renvoyerNotification);

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOuvert(true)} disabled={enCours}>
        <RotateCw /> Renvoyer
      </Button>
      <DialogueMotif
        ouvert={ouvert}
        surFermeture={() => setOuvert(false)}
        enCours={enCours}
        longueurMin={5}
        titre="Renvoyer cette notification ?"
        description={
          <>
            « {notification.titre} » repart vers les appareils de {notification.destinataire ?? "la personne"}, telle
            quelle. C’est une nouvelle tentative sur la même notification : sa date ne change pas, et aucune échéance ne
            repart.
          </>
        }
        libelleAction="Renvoyer"
        surConfirmation={async (motif) => {
          const r = await lancer(
            { notification: notification.id, motif },
            "Notification renvoyée : elle repart vers le téléphone.",
          );
          setOuvert(false);
          if (r?.ok) surRenvoi?.();
        }}
      />
    </>
  );
}
