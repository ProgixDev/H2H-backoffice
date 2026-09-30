"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { DialogueMotif } from "@/components/bo/DialogueMotif";
import { StatutPastille, type Ton } from "@/components/bo/StatutPastille";
import { Button } from "@/components/ui/button";
import { dateHeure } from "@/lib/dates";
import { useGeste } from "@/lib/db/useGeste";
import { cheminFiche } from "@/lib/operations/types";
import { expliquerEcart } from "@/lib/paiements/actions";
import {
  euros,
  type EcartRapprochement,
  type PassageRapprochement,
  type Rapprochement,
  type StatutEcart,
} from "@/lib/paiements/types";

// ⚠️ UNE ISSUE DÉFAVORABLE N'EST JAMAIS VERTE : un écart ouvert est rouge ; résolu
// (disparu d'un passage suivant) est vert ; expliqué est neutre — rien n'a été corrigé.
const TON_ECART: Record<StatutEcart, Ton> = { ouvert: "erreur", resolu: "succes", explique: "neutre" };
const LIBELLE_ECART: Record<StatutEcart, string> = { ouvert: "Ouvert", resolu: "Résolu", explique: "Expliqué" };

const compte = (livemode: boolean) => (livemode ? "Compte réel" : "Compte de test");

/** Où en est un passage : en cours, en échec, ou son bilan. */
function EtatPassage({ p }: { p: PassageRapprochement }) {
  if (p.erreur) return <StatutPastille ton="erreur">Échec</StatutPastille>;
  if (!p.fini_le) return <StatutPastille ton="actif">En cours</StatutPastille>;
  if (p.bilan && p.bilan.tronques.length > 0) return <StatutPastille ton="attention">Liste coupée</StatutPastille>;
  return <StatutPastille ton="succes">Terminé</StatutPastille>;
}

/**
 * Le rapprochement avec Stripe (§21.4) : chaque nuit, les paiements, les
 * remboursements et les virements de Stripe comparés à la base. Un écart ouvre
 * un dossier à la Finance ; il se résout quand un passage suivant ne le
 * retrouve plus, ou la Finance l'explique.
 *
 * 🔴 RIEN NE SE CORRIGE D'ICI : ni Stripe, ni le grand livre. Corriger passe par
 * les procédures (un remboursement se demande, une retenue se pose).
 */
export function RapprochementStripe({ donnees, peutExpliquer }: { donnees: Rapprochement; peutExpliquer: boolean }) {
  const ouverts = donnees.ecarts.filter((e) => e.statut === "ouvert");
  const dernier = donnees.passages[0];

  return (
    <div className="grid gap-6">
      <section className="grid gap-3">
        <h2 className="text-h3 font-semibold">
          Écarts {ouverts.length > 0 ? `ouverts (${ouverts.length})` : ""}
        </h2>
        {donnees.ecarts.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <AnimationH2H nom="coin" taille={96} />
            <p className="mt-3 font-semibold">Aucun écart</p>
            <p className="text-corps text-muted-foreground">
              {dernier
                ? "Ce que Stripe a fait concorde avec ce que la base en sait."
                : "Aucun rapprochement n’a encore eu lieu : le premier passe cette nuit à 4 h 17."}
            </p>
          </div>
        ) : (
          <ul className="grid gap-3">
            {donnees.ecarts.map((e) => (
              <LigneEcart key={e.id} e={e} peutExpliquer={peutExpliquer} />
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="text-h3 font-semibold">Passages des dernières nuits</h2>
        {donnees.passages.length === 0 ? (
          <p className="text-corps text-muted-foreground">Aucun passage pour l’instant.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-corps">
              <thead className="text-legende text-muted-foreground">
                <tr className="border-b text-left">
                  <th className="px-3 py-2 font-medium">Commencé</th>
                  <th className="px-3 py-2 font-medium">Compte</th>
                  <th className="px-3 py-2 font-medium">État</th>
                  <th className="px-3 py-2 text-right font-medium">Lus chez Stripe</th>
                  <th className="px-3 py-2 text-right font-medium">Écarts</th>
                  <th className="px-3 py-2 text-right font-medium">Nouveaux</th>
                  <th className="px-3 py-2 text-right font-medium">Résolus</th>
                </tr>
              </thead>
              <tbody>
                {donnees.passages.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 align-top">
                    <td className="px-3 py-2 tabular-nums">{dateHeure(p.demarre_le)}</td>
                    <td className="px-3 py-2">{compte(p.livemode)}</td>
                    <td className="px-3 py-2">
                      <div className="grid gap-1">
                        <EtatPassage p={p} />
                        {p.erreur && <span className="text-legende text-h2h-error">{p.erreur}</span>}
                        {p.bilan && p.bilan.tronques.length > 0 && (
                          <span className="text-legende text-muted-foreground">
                            Coupée : {p.bilan.tronques.join(", ")} — rien n’y est conclu sur ce qui manquerait.
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {p.bilan
                        ? `${p.bilan.paiements} paiements · ${p.bilan.remboursements} remb. · ${p.bilan.transferts} virements`
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{p.bilan?.ecarts ?? "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{p.bilan?.nouveaux ?? "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{p.bilan?.resolus ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function LigneEcart({ e, peutExpliquer }: { e: EcartRapprochement; peutExpliquer: boolean }) {
  const montants = e.montant_stripe_cents !== null || e.montant_base_cents !== null;
  return (
    <li className="rounded-xl border bg-card p-4" style={{ boxShadow: "var(--ombre-carte)" }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid min-w-0 flex-1 gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{e.libelle}</span>
            <StatutPastille ton={TON_ECART[e.statut]}>{LIBELLE_ECART[e.statut]}</StatutPastille>
            <StatutPastille ton="neutre">{compte(e.livemode)}</StatutPastille>
            {e.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
          </div>
          <span className="text-corps">{e.detail}</span>
          <span className="text-legende text-muted-foreground">
            <span className="font-mono">{e.objet_stripe}</span>
            {e.commande_ref && (
              <>
                {" · commande "}
                <Link href={cheminFiche(e.commande_ref, "paiements")} className="font-medium hover:underline">
                  {e.commande_ref}
                </Link>
              </>
            )}
            {montants && (
              <>
                {" · base "}
                {e.montant_base_cents !== null ? euros(e.montant_base_cents) : "—"}
                {", Stripe "}
                {e.montant_stripe_cents !== null ? euros(e.montant_stripe_cents) : "—"}
              </>
            )}
          </span>
          <span className="text-legende text-muted-foreground">
            Constaté le {dateHeure(e.constate_le)} · revu le {dateHeure(e.vu_le)}
            {e.statut === "resolu" && e.resolu_le && ` · disparu au passage du ${dateHeure(e.resolu_le)}`}
          </span>
          {e.statut === "explique" && (
            <span className="text-legende text-muted-foreground">
              Expliqué par {e.explique_par ?? "—"} le {dateHeure(e.explique_le)} · « {e.motif} »
            </span>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {e.dossier && (
            <Link
              href={`/a-traiter?dossier=${e.dossier}`}
              className="text-legende font-semibold text-h2h-primary hover:underline"
            >
              Dossier
            </Link>
          )}
          {peutExpliquer && e.statut === "ouvert" && <BoutonExpliquer ecart={e.id} />}
        </div>
      </div>
    </li>
  );
}

/** Expliquer un écart : il n'appelle pas de correction. Le dossier se clôt. */
function BoutonExpliquer({ ecart }: { ecart: string }) {
  const [ouvert, setOuvert] = useState(false);
  const expliquer = useGeste(expliquerEcart);
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOuvert(true)}>
        <MessageSquareText /> Expliquer
      </Button>
      <DialogueMotif
        ouvert={ouvert}
        surFermeture={() => setOuvert(false)}
        titre="Expliquer l’écart"
        description="Dites pourquoi cet écart n’appelle pas de correction (un remboursement fait à la main et vérifié, un paiement de démonstration…). Le dossier se clôt, et le même constat ne le rouvrira pas. Rien ne bouge chez Stripe ni au grand livre."
        libelleAction="Expliquer"
        longueurMin={5}
        enCours={expliquer.enCours}
        surConfirmation={async (motif) => {
          const r = await expliquer.lancer({ ecart, motif }, "Écart expliqué.");
          if (r?.ok) setOuvert(false);
        }}
      />
    </>
  );
}
