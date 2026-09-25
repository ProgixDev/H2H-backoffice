"use client";

import { useState } from "react";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { DialogueMotif } from "@/components/bo/DialogueMotif";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { Button } from "@/components/ui/button";
import { useGeste } from "@/lib/db/useGeste";
import { trancherDemandeDeRole } from "@/lib/utilisateurs/actions";
import {
  CE_QUE_LE_ROLE_OUVRE,
  LIBELLE_METHODE,
  LIBELLE_ROLE,
  LIBELLE_STATUT_ROLE,
  quand,
  type DemandeRole,
} from "@/lib/utilisateurs/types";

type Props = { demandes: DemandeRole[]; peutTrancher: boolean };

const test = (modeTest: boolean | null) => (modeTest ? " (mode test)" : "");

/**
 * Les demandes de rôle : accorder ouvre un métier, refuser répond à quelqu'un
 * qui a remis des pièces.
 *
 * ⚠️ UN MOTIF DANS LES DEUX SENS, ET LA BASE L'EXIGE. Celui d'un refus part à la
 * personne ; celui d'une acceptation reste au journal de l'équipe (R6.3) — la
 * fenêtre le dit avant qu'on l'écrive.
 */
export function ListeDemandesDeRole({ demandes, peutTrancher }: Props) {
  const [decision, setDecision] = useState<{ d: DemandeRole; approuver: boolean } | null>(null);
  const trancher = useGeste(trancherDemandeDeRole);

  if (demandes.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <AnimationH2H nom="recherche" taille={96} />
        <p className="mt-3 font-semibold">Aucune demande de rôle en attente</p>
        <p className="text-corps text-muted-foreground">
          Les demandes pour devenir vendeur, cotransporteur particulier ou point relais apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="grid gap-3">
        {demandes.map((d) => {
          const avecConvention = d.role === "transporter" || d.role === "relais";
          return (
            <li key={d.id} className="rounded-xl border bg-card p-4" style={{ boxShadow: "var(--ombre-carte)" }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="grid min-w-0 flex-1 gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">@{d.pseudo ?? "—"}</span>
                    <StatutPastille ton="neutre">{LIBELLE_ROLE[d.role] ?? d.role}</StatutPastille>
                    <StatutPastille ton="actif">{LIBELLE_STATUT_ROLE[d.statut] ?? d.statut}</StatutPastille>
                    {d.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
                  </div>
                  <span className="text-legende text-muted-foreground">
                    Demandée le {quand(d.demande_le)}
                    {d.ville ? ` · ${d.ville}` : ""}
                  </span>
                  <dl className="mt-1 grid gap-1 text-corps">
                    <Fait
                      titre="Identité"
                      bon={d.identite_verifiee}
                      valeur={
                        d.identite_verifiee
                          ? `vérifiée par Stripe — ${LIBELLE_METHODE[d.identite_methode ?? ""] ?? "moyen inconnu"}${test(d.identite_mode_test)}`
                          : "non vérifiée par Stripe"
                      }
                    />
                    <Fait
                      titre="Compte de versement"
                      bon={d.compte_versement === "payable"}
                      valeur={
                        d.compte_versement === null
                          ? "aucun"
                          : `${d.compte_versement === "payable" ? "payable" : "incomplet"}${test(d.compte_versement_mode_test)}`
                      }
                    />
                    {avecConvention && (
                      <Fait
                        titre="Convention"
                        bon={d.convention_signee_le !== null}
                        valeur={
                          d.convention_signee_le
                            ? `signée le ${quand(d.convention_signee_le)} (${d.convention_version ?? "version inconnue"})`
                            : "non signée"
                        }
                      />
                    )}
                  </dl>
                  <p className="mt-1 text-legende text-muted-foreground">
                    Accorder ce rôle ouvre un métier : {CE_QUE_LE_ROLE_OUVRE[d.role] ?? "agir dans ce rôle."}
                  </p>
                </div>
                {peutTrancher && (
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button variant="outline" onClick={() => setDecision({ d, approuver: false })}>
                      Refuser
                    </Button>
                    <Button onClick={() => setDecision({ d, approuver: true })}>Accorder</Button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <DialogueMotif
        ouvert={decision !== null}
        surFermeture={() => setDecision(null)}
        titre={decision?.approuver ? "Accorder ce rôle ?" : "Refuser cette demande ?"}
        description={
          decision?.approuver
            ? "Le rôle s’active aussitôt et la personne en est prévenue. Ce motif reste au journal de l’équipe : il ne lui est pas envoyé."
            : "La personne recevra ce motif dans sa notification : elle a remis des pièces, elle mérite une réponse."
        }
        libelleAction={decision?.approuver ? "Accorder" : "Refuser"}
        destructif={decision ? !decision.approuver : false}
        enCours={trancher.enCours}
        surConfirmation={async (motif) => {
          if (!decision) return;
          const r = await trancher.lancer(
            { demande: decision.d.id, approuver: decision.approuver, motif },
            decision.approuver ? "Rôle accordé." : "Demande refusée.",
          );
          if (r?.ok) setDecision(null);
        }}
      />
    </>
  );
}

function Fait({ titre, valeur, bon }: { titre: string; valeur: string; bon: boolean }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <dt className="text-muted-foreground">{titre} :</dt>
      <dd className={bon ? "font-medium text-h2h-success" : "text-muted-foreground"}>{valeur}</dd>
    </div>
  );
}
