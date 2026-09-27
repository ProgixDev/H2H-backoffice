"use client";

import { useState } from "react";
import { BellRing, FileWarning } from "lucide-react";
import { DialogueConfirmation } from "@/components/bo/DialogueConfirmation";
import { DialogueMotif } from "@/components/bo/DialogueMotif";
import { Button } from "@/components/ui/button";
import { demanderRemplacement, relancerAttestation } from "@/lib/attestations/actions";
import { LIBELLE_ATTENDU, type AttestationLigne } from "@/lib/attestations/types";
import { useGeste } from "@/lib/db/useGeste";

const DOUZE_HEURES = 12 * 60 * 60 * 1000;

/** Pourquoi un bouton reste grisé (R6.4) ; `null` : il est permis. */
export function relanceBloquee(a: AttestationLigne, maintenant: number): string | null {
  if (!a.attendu) return "L’attestation n’attend aucune partie.";
  if (a.derniere_relance === "rappel" && a.derniere_relance_le
      && maintenant - Date.parse(a.derniere_relance_le) < DOUZE_HEURES) {
    return "Une relance est partie il y a moins de douze heures.";
  }
  return null;
}

export function remplacementBloque(a: AttestationLigne): string | null {
  if (a.statut !== "final_available" && a.statut !== "signed_by_both") {
    return "Seule une attestation signée des deux côtés se remplace ; avant, les parties la corrigent en cours de route.";
  }
  if (a.remplacement_demande_le) return "Le remplacement de cette version est déjà demandé.";
  return null;
}

/**
 * Relancer la partie attendue (R11.3). ⚠️ UN RAPPEL NE DÉPLACE RIEN : il
 * prévient, sans toucher à l'attestation ni à une échéance.
 */
export function BoutonRelancer({ a, maintenant }: { a: AttestationLigne; maintenant: number }) {
  const [ouvert, setOuvert] = useState(false);
  const relancer = useGeste(relancerAttestation);
  const bloque = relanceBloquee(a, maintenant);
  return (
    <div className="grid gap-1">
      <Button variant="outline" size="sm" className="justify-self-start" disabled={bloque !== null} onClick={() => setOuvert(true)}>
        <BellRing /> Relancer
      </Button>
      {bloque && <p className="text-legende text-muted-foreground">{bloque}</p>}
      <DialogueConfirmation
        ouvert={ouvert}
        surFermeture={() => setOuvert(false)}
        titre="Relancer la partie attendue"
        description={
          <>
            {a.attendu ? LIBELLE_ATTENDU[a.attendu] : "La partie attendue"} reçoit un rappel : ce qu’il lui reste à
            faire sur l’attestation de la commande {a.numero}. Rien d’autre ne change.
          </>
        }
        libelleAction="Envoyer le rappel"
        enCours={relancer.enCours}
        surConfirmation={async () => {
          const r = await relancer.lancer({ attestation: a.attestation_id }, "Rappel envoyé.");
          if (r?.ok) setOuvert(false);
        }}
      />
    </div>
  );
}

/**
 * Demander le remplacement d'une version signée (R11.3, R11.4) : l'acheteur la
 * remplace depuis l'application, le vendeur la signe à nouveau. Le motif reste
 * interne ; les parties lisent ce qu'elles ont à faire.
 */
export function BoutonRemplacement({ a }: { a: AttestationLigne }) {
  const [ouvert, setOuvert] = useState(false);
  const demander = useGeste(demanderRemplacement);
  const bloque = remplacementBloque(a);
  return (
    <div className="grid gap-1">
      <Button variant="outline" size="sm" className="justify-self-start" disabled={bloque !== null} onClick={() => setOuvert(true)}>
        <FileWarning /> Demander le remplacement
      </Button>
      {bloque && <p className="text-legende text-muted-foreground">{bloque}</p>}
      <DialogueMotif
        ouvert={ouvert}
        surFermeture={() => setOuvert(false)}
        titre={`Remplacer l’attestation de ${a.numero}`}
        description={
          <>
            Les deux parties sont prévenues : l’acheteur remplace l’attestation depuis l’application (« Signaler une
            erreur — annuler et remplacer »), le vendeur photographie, déclare et signe la nouvelle version. La
            version signée reste au dossier ; l’équipe n’y écrit rien. Votre motif reste au journal d’audit.
          </>
        }
        libelleAction="Demander le remplacement"
        longueurMin={5}
        enCours={demander.enCours}
        surConfirmation={async (motif) => {
          const r = await demander.lancer({ attestation: a.attestation_id, motif }, "Remplacement demandé aux parties.");
          if (r?.ok) setOuvert(false);
        }}
      />
    </div>
  );
}
