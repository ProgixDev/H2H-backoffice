"use client";

import { useState } from "react";
import { Ban } from "lucide-react";
import { DialogueMotif } from "@/components/bo/DialogueMotif";
import { Button } from "@/components/ui/button";
import { useGeste } from "@/lib/db/useGeste";
import { euros } from "@/lib/paiements/types";
import { annulerTransaction } from "@/lib/transactions/actions";
import type { Transaction } from "@/lib/transactions/types";

/**
 * « Annuler selon la procédure » (R10.3). Avant l'encaissement seulement ;
 * après, le bouton reste visible, grisé, et dit pourquoi (R6.4).
 *
 * ⚠️ LE MOTIF RESTE INTERNE : les parties lisent celui de la procédure,
 * « le support HandtoHand a annulé la transaction ».
 */
export function BoutonAnnulerTransaction({ t }: { t: Transaction }) {
  const [ouvert, setOuvert] = useState(false);
  const annuler = useGeste(annulerTransaction);

  if (!t.annulable) {
    return (
      <div className="grid gap-1">
        <Button variant="outline" size="sm" disabled className="justify-self-start">
          <Ban /> Annuler selon la procédure
        </Button>
        {t.annulation_bloquee && <p className="text-legende text-muted-foreground">{t.annulation_bloquee}</p>}
      </div>
    );
  }
  return (
    <>
      <Button variant="outline" size="sm" className="justify-self-start" onClick={() => setOuvert(true)}>
        <Ban /> Annuler selon la procédure
      </Button>
      <DialogueMotif
        ouvert={ouvert}
        surFermeture={() => setOuvert(false)}
        titre={`Annuler la transaction ${t.numero}`}
        description={
          <>
            Le paiement n’est pas encaissé : l’autorisation de l’acheteur est levée chez Stripe, sans aucun débit, la
            part des frais déjà payée par le vendeur lui est rendue, et l’annonce revient en vente. Les deux parties
            lisent « le support HandtoHand a annulé la transaction », le montant ({euros(t.total_cents)}) et le
            statut. Votre motif reste au journal d’audit.
          </>
        }
        libelleAction="Annuler la transaction"
        destructif
        longueurMin={5}
        enCours={annuler.enCours}
        surConfirmation={async (motif) => {
          const r = await annuler.lancer(
            { commande: t.id, motif, statutAttendu: t.statut },
            "Annulation demandée : la procédure suit son cours.",
          );
          if (r?.ok) setOuvert(false);
        }}
      />
    </>
  );
}
