"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CirclePause, LockOpen } from "lucide-react";
import { DialogueMotif } from "@/components/bo/DialogueMotif";
import { Button } from "@/components/ui/button";
import { useGeste } from "@/lib/db/useGeste";
import { leverRetenue, retenirFonds } from "@/lib/paiements/actions";

/**
 * Retenir les fonds d'une commande — ceux d'une personne, ou de tous (`beneficiaire`
 * nul). Le motif reste interne : la personne lit « versement suspendu par le
 * support ».
 */
export function BoutonRetenir({
  commande,
  beneficiaire,
  qui,
  surGeste,
  taille = "sm",
}: {
  commande: string;
  beneficiaire: string | null;
  /** « le vendeur vendeuse_fr », « tous les bénéficiaires ». */
  qui: string;
  surGeste?: () => void;
  taille?: "sm" | "xs";
}) {
  const [ouvert, setOuvert] = useState(false);
  const retenir = useGeste(retenirFonds);
  return (
    <>
      <Button variant="outline" size={taille} onClick={() => setOuvert(true)}>
        <CirclePause /> Retenir
      </Button>
      <DialogueMotif
        ouvert={ouvert}
        surFermeture={() => setOuvert(false)}
        titre="Retenir les fonds"
        description={
          <>
            Les fonds de {qui} ne partiront plus tant que la retenue n’est pas levée — par la Finance ou la
            Direction. Le motif reste interne.
          </>
        }
        libelleAction="Retenir les fonds"
        longueurMin={5}
        enCours={retenir.enCours}
        surConfirmation={async (motif) => {
          const r = await retenir.lancer({ commande, beneficiaire, motif }, "Fonds retenus.");
          if (r?.ok) {
            setOuvert(false);
            surGeste?.();
          }
        }}
      />
    </>
  );
}

/**
 * Lever UNE retenue de l'équipe. Ce qui retient encore ces fonds (une
 * réclamation, un incident…) est dit tel quel : rien d'autre ne se libère.
 */
export function BoutonLever({
  retenue,
  surGeste,
  taille = "sm",
}: {
  retenue: string;
  surGeste?: () => void;
  taille?: "sm" | "xs";
}) {
  const [ouvert, setOuvert] = useState(false);
  const lever = useGeste(leverRetenue);
  return (
    <>
      <Button variant="outline" size={taille} onClick={() => setOuvert(true)}>
        <LockOpen /> Lever
      </Button>
      <DialogueMotif
        ouvert={ouvert}
        surFermeture={() => setOuvert(false)}
        titre="Lever la retenue"
        description={
          <>
            Seule cette retenue est levée. Une réclamation, une opposition ou un incident encore ouverts
            continuent de retenir les fonds. Votre identité peut vous être redemandée.
          </>
        }
        libelleAction="Lever la retenue"
        longueurMin={5}
        enCours={lever.enCours}
        surConfirmation={async (motif) => {
          const r = await lever.lancer({ retenue, motif }, "Retenue levée.");
          if (r?.ok) {
            setOuvert(false);
            const restent = (r.donnees as { toujours_retenus?: string[] }).toujours_retenus ?? [];
            if (restent.length > 0) {
              toast.message("Les fonds restent retenus", { description: restent.join(" · ") });
            }
            surGeste?.();
          }
        }}
      />
    </>
  );
}
