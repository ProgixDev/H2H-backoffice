"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { DialogueMotif } from "@/components/bo/DialogueMotif";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { Button } from "@/components/ui/button";
import { deciderValidation } from "@/lib/equipe/actions";
import { LIBELLE_ROLE, type Role, type Validation } from "@/lib/equipe/types";
import { useGeste } from "@/lib/db/useGeste";
import { euros } from "@/lib/paiements/types";

const quand = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function detail(v: Validation): string {
  const p = v.parametres as { role?: Role; roles?: Role[]; montant_cents?: number };
  if (p.role) return LIBELLE_ROLE[p.role];
  if (p.roles) return p.roles.map((r) => LIBELLE_ROLE[r]).join(" · ");
  // Un remboursement (ordre financier) : son montant.
  if (typeof p.montant_cents === "number") return euros(p.montant_cents);
  return "";
}

/**
 * Les demandes qui attendent une seconde clé.
 *
 * ⚠️ LE DEMANDEUR VOIT SA DEMANDE, IL NE LA TRANCHE PAS. `peut_decider` vient
 * de la base, qui refuse de toute façon (`BO_QUATRE_YEUX`).
 */
export function ListeValidations({ validations }: { validations: Validation[] }) {
  const [refus, setRefus] = useState<Validation | null>(null);
  const [approbation, setApprobation] = useState<Validation | null>(null);
  const { lancer, enCours } = useGeste(deciderValidation);

  if (validations.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <AnimationH2H nom="vault-shield" taille={96} />
        <p className="mt-3 font-semibold">Aucune demande en attente</p>
        <p className="text-corps text-muted-foreground">Les demandes à deux clés apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-3">
      {validations.map((v) => (
        <li key={v.id} className="rounded-xl border bg-card p-4" style={{ boxShadow: "var(--ombre-carte)" }}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{v.libelle}</span>
                {detail(v) && <StatutPastille ton="marque">{detail(v)}</StatutPastille>}
                {v.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
              </div>
              {v.cible && <span className="text-corps">{v.cible}</span>}
              <span className="text-legende text-muted-foreground">
                Demandé par {v.demandeur_email ?? "—"} le {quand(v.demande_le)} · « {v.motif} »
              </span>
              <span className="text-legende text-muted-foreground">Expire le {quand(v.expire_le)}</span>
            </div>
            {v.peut_decider ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setRefus(v)} disabled={enCours}>
                  <X /> Refuser
                </Button>
                <Button onClick={() => setApprobation(v)} disabled={enCours}>
                  <Check /> Valider
                </Button>
              </div>
            ) : (
              <StatutPastille ton="neutre">En attente d’une seconde personne</StatutPastille>
            )}
          </div>
        </li>
      ))}
      <DialogueMotif
        ouvert={approbation !== null}
        surFermeture={() => setApprobation(null)}
        enCours={enCours}
        motifObligatoire={false}
        titre="Valider la demande"
        description="Votre validation exécute la demande tout de suite, si la situation n’a pas changé depuis."
        libelleAction="Valider"
        surConfirmation={async (motif) => {
          if (approbation) await lancer({ validation: approbation.id, approuver: true, motif }, "Demande validée.");
          setApprobation(null);
        }}
      />
      <DialogueMotif
        ouvert={refus !== null}
        surFermeture={() => setRefus(null)}
        enCours={enCours}
        destructif
        titre="Refuser la demande"
        description="Un refus se motive : le demandeur le lira au journal."
        libelleAction="Refuser"
        surConfirmation={async (motif) => {
          if (refus) await lancer({ validation: refus.id, approuver: false, motif }, "Demande refusée.");
          setRefus(null);
        }}
      />
    </ul>
  );
}
