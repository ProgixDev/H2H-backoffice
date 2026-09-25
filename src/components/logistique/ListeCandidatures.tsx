"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { DialogueMotif } from "@/components/bo/DialogueMotif";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { Button } from "@/components/ui/button";
import { useGeste } from "@/lib/db/useGeste";
import { trancherCandidature } from "@/lib/logistique/actions";
import { LIBELLE_CATEGORIE, lienCarte, quand, type CandidatureRelais } from "@/lib/logistique/types";

type Props = { candidatures: CandidatureRelais[]; peutGerer: boolean };

/**
 * Les candidatures pour devenir point relais : accepter fait naître le point
 * relais ; refuser répond à quelqu'un qui a donné son adresse et son téléphone.
 *
 * ⚠️ UN MOTIF DANS LES DEUX SENS, ET LA BASE L'EXIGE : ouvrir un point relais
 * engage la plateforme autant que le refuser.
 */
export function ListeCandidatures({ candidatures, peutGerer }: Props) {
  const [decision, setDecision] = useState<{ c: CandidatureRelais; approuver: boolean } | null>(null);
  const trancher = useGeste(trancherCandidature);

  if (candidatures.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <AnimationH2H nom="recherche" taille={96} />
        <p className="mt-3 font-semibold">Aucune candidature en attente</p>
        <p className="text-corps text-muted-foreground">Les demandes pour devenir point relais apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <>
      <ul className="grid gap-3">
        {candidatures.map((c) => (
          <li key={c.id} className="rounded-xl border bg-card p-4" style={{ boxShadow: "var(--ombre-carte)" }}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="grid min-w-0 flex-1 gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{c.nom}</span>
                  <StatutPastille ton="neutre">{LIBELLE_CATEGORIE[c.categorie] ?? c.categorie}</StatutPastille>
                  {c.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
                </div>
                <span className="text-legende text-muted-foreground">
                  Par {c.candidat ?? "—"} · déposée le {quand(c.depose_le)}
                </span>
                <span className="text-corps">
                  {c.adresse}, {c.ville}
                  {c.region ? ` (${c.region})` : ""}
                </span>
                <span className="text-legende text-muted-foreground">
                  Horaires : {c.horaires ?? "non précisés"} · capacité : {c.capacite ?? "—"} colis
                  {c.telephone_masque ? ` · téléphone ${c.telephone_masque}` : ""}
                </span>
                {c.message && <p className="text-corps text-muted-foreground">« {c.message} »</p>}
                <a
                  href={lienCarte(c.latitude, c.longitude)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-legende text-h2h-primary hover:underline"
                >
                  Voir l’adresse sur la carte <ExternalLink className="size-3" />
                </a>
              </div>
              {peutGerer && (
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setDecision({ c, approuver: false })}>
                    Refuser
                  </Button>
                  <Button onClick={() => setDecision({ c, approuver: true })}>Accepter</Button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      <DialogueMotif
        ouvert={decision !== null}
        surFermeture={() => setDecision(null)}
        titre={decision?.approuver ? "Accepter la candidature ?" : "Refuser la candidature ?"}
        description={
          decision?.approuver
            ? "Le point relais est créé au nom du candidat ; il posera ses horaires depuis son application."
            : "Le candidat recevra ce motif : il a donné son adresse et son téléphone, il mérite une réponse."
        }
        libelleAction={decision?.approuver ? "Accepter" : "Refuser"}
        destructif={decision ? !decision.approuver : false}
        enCours={trancher.enCours}
        surConfirmation={async (motif) => {
          if (!decision) return;
          const r = await trancher.lancer(
            { candidature: decision.c.id, approuver: decision.approuver, motif },
            decision.approuver ? "Point relais créé." : "Candidature refusée.",
          );
          if (r?.ok) setDecision(null);
        }}
      />
    </>
  );
}
