"use client";

import { useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { DialogueMotif } from "@/components/bo/DialogueMotif";
import { Button } from "@/components/ui/button";
import { euros } from "@/lib/litiges/types";
import { useConsultation } from "@/lib/db/useConsultation";
import { LIBELLE_ROLE_PARTICIPANT } from "@/lib/operations/libelles";
import { lireEchanges } from "@/lib/operations/sensibles";
import type { EchangesLus, MessageLu } from "@/lib/operations/types";
import { Quand } from "./commun";
import { BoutonPiece, useCadreConsultations } from "./sensibles";

const OFFRE: Record<NonNullable<MessageLu["statut_offre"]>, string> = {
  pending: "en attente",
  accepted: "acceptée",
  rejected: "refusée",
};

/**
 * Les messages d'une conversation liée à l'achat, lus pour un motif.
 *
 * 🔴 SEULEMENT AVEC LE LITIGE DE L'ACHETEUR : en le déposant, il a autorisé
 * HandtoHand à consulter les échanges de la transaction. Sans litige, rien ne
 * se lit — la base le refuse de toute façon.
 * ⚠️ LUS POUR CET ÉCRAN SEULEMENT : les fermer les efface ; les relire est une
 * nouvelle consultation, avec un nouveau motif.
 */
export function LectureEchanges({
  conversation,
  libelle,
  consentie,
  maintenant,
}: {
  conversation: string;
  libelle: string;
  consentie: boolean;
  maintenant: number;
}) {
  const cadre = useCadreConsultations();
  const [demande, setDemande] = useState(false);
  const [lus, setLus] = useState<EchangesLus | null>(null);
  const { consulter, enCours } = useConsultation(lireEchanges);

  if (!cadre?.peutReveler) return null;
  if (!consentie) {
    return (
      <span className="text-legende text-muted-foreground">
        Sans litige ouvert par l’acheteur, ces échanges ne se lisent pas.
      </span>
    );
  }
  if (lus) {
    return (
      <div className="grid w-full gap-2 rounded-lg bg-muted/40 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-legende font-semibold text-muted-foreground">
            {lus.messages.length} message{lus.messages.length > 1 ? "s" : ""} lu{lus.messages.length > 1 ? "s" : ""}
            {lus.tronquee ? " — les cinq cents derniers" : ""} · consultation journalisée
          </span>
          <button
            type="button"
            onClick={() => setLus(null)}
            className="text-legende text-muted-foreground underline underline-offset-2"
          >
            Fermer
          </button>
        </div>
        <ol className="grid gap-2">
          {lus.messages.map((m) => (
            <li key={m.id} className="grid gap-0.5 rounded-lg border bg-card p-2.5">
              <span className="text-legende text-muted-foreground">
                {m.role ? LIBELLE_ROLE_PARTICIPANT[m.role] : "Autre participant"}
                {m.auteur ? ` · ${m.auteur}` : ""} · <Quand iso={m.le} maintenant={maintenant} />
              </span>
              {m.type === "offer" && m.montant_cents !== null && (
                <span className="font-medium">
                  Offre de {euros(m.montant_cents)}
                  {m.statut_offre ? ` · ${OFFRE[m.statut_offre]}` : ""}
                </span>
              )}
              {m.type === "call_summary" && <span className="italic">Appel{m.duree_appel ? ` · ${m.duree_appel}` : ""}</span>}
              {m.texte && (
                <span className={m.type === "system" ? "whitespace-pre-line italic text-muted-foreground" : "whitespace-pre-line"}>
                  {m.texte}
                </span>
              )}
              {m.image && (
                <span>
                  <BoutonPiece
                    nature="image_message"
                    piece={m.id}
                    libelle={`Image envoyée par ${m.auteur ?? "un participant"}`}
                  />
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    );
  }
  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setDemande(true)} disabled={enCours}>
        {enCours ? <Loader2 className="animate-spin" /> : <BookOpen />}
        Lire les messages
      </Button>
      <DialogueMotif
        ouvert={demande}
        surFermeture={() => setDemande(false)}
        titre={`Lire : ${libelle}`}
        description="L’acheteur a autorisé cette consultation en ouvrant son litige. Elle est inscrite au journal d’audit, avec votre nom et votre motif."
        libelleAction="Lire"
        longueurMin={5}
        enCours={enCours}
        surConfirmation={async (motif) => {
          const r = await consulter({ objet: cadre.objet, conversation, motif });
          if (r) {
            setLus(r);
            setDemande(false);
          }
        }}
      />
    </>
  );
}
