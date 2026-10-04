"use client";

import { useState } from "react";
import { DialogueMotif } from "@/components/bo/DialogueMotif";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { Button } from "@/components/ui/button";
import { dateHeure } from "@/lib/dates";
import { useGeste } from "@/lib/db/useGeste";
import { annulerVersionReglage } from "@/lib/parametres/actions";
import { valeurDite, type GroupeReglages, type TableReglage } from "@/lib/parametres/types";
import { Ecarts } from "./Ecarts";
import { GesteChangement } from "./GesteChangement";

/**
 * Les réglages de la plateforme (R20.3, R20.4) : chacun avec sa valeur en vigueur, ses bornes, s'il
 * se change d'ici — sinon pourquoi —, les versions programmées, les demandes qui attendent et
 * l'histoire de chaque changement : l'avant, l'après, qui, quand, pourquoi.
 *
 * 🔴 JAMAIS RÉTROACTIF : une nouvelle version gouverne ce qui naît à partir de sa date ; ce qui
 * existe déjà garde la sienne. La base le tient ; l'écran le dit (la portée de chaque groupe).
 */
export function ListeParametres({ groupes }: { groupes: GroupeReglages[] }) {
  const [annulation, setAnnulation] = useState<{ table: TableReglage; version: number } | null>(null);
  const annuler = useGeste(annulerVersionReglage);

  return (
    <div className="grid gap-4">
      {groupes.map((g) => (
        <section key={g.table} className="grid gap-3 rounded-xl border p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid max-w-3xl gap-0.5">
              <h3 className="text-h3 font-semibold">{g.libelle}</h3>
              <span className="text-legende text-muted-foreground">{g.portee}</span>
            </div>
            {g.possible.demander ? (
              <GesteChangement groupe={g} />
            ) : (
              g.possible.raison && <span className="max-w-sm text-legende text-muted-foreground">{g.possible.raison}</span>
            )}
          </div>

          {g.demandes.map((d) => (
            <div key={d.validation} className="rounded-lg border border-h2h-primary/30 bg-h2h-primary/5 p-3 text-legende">
              <p>
                Changement demandé par {d.demandeur ?? "—"} le {dateHeure(d.demande_le)} —{" "}
                {d.effet ? `en vigueur le ${dateHeure(d.effet)}` : "en vigueur dès la validation"} · « {d.motif} ». Il
                attend une seconde validation de la Direction (Équipe et journal d’audit → Validations).
              </p>
              <Ecarts ecarts={d.changements} />
            </div>
          ))}

          {g.programmees.map((p) => (
            <div key={p.version} className="flex flex-wrap items-start justify-between gap-3 rounded-lg border p-3 text-legende">
              <div className="grid gap-1">
                <span className="flex items-center gap-2">
                  <StatutPastille ton="attention">Programmée</StatutPastille>
                  <span className="tabular-nums">en vigueur le {dateHeure(p.effet)} · version {p.version}</span>
                </span>
                {p.changement ? (
                  <>
                    <Ecarts ecarts={p.changement.changements} />
                    <span className="text-muted-foreground">
                      Demandée par {p.changement.demandeur ?? "—"}, validée par {p.changement.valideur ?? "—"} · «{" "}
                      {p.changement.motif} »
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Publiée par migration</span>
                )}
              </div>
              {p.annulable && (
                <Button size="sm" variant="outline" onClick={() => setAnnulation({ table: g.table, version: p.version })}>
                  Annuler
                </Button>
              )}
            </div>
          ))}

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[860px] text-corps">
              <thead className="bg-muted/40 text-left text-legende text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Réglage</th>
                  <th className="px-3 py-2 font-medium">En vigueur</th>
                  <th className="px-3 py-2 font-medium">Bornes</th>
                  <th className="px-3 py-2 font-medium">Se change d’ici</th>
                </tr>
              </thead>
              <tbody>
                {g.champs.map((c) => (
                  <tr key={c.colonne} className="border-t align-top">
                    <td className="px-3 py-2">
                      <span className="font-medium">{c.libelle}</span>
                      <span className="block text-legende text-muted-foreground">{c.description}</span>
                    </td>
                    <td className="px-3 py-2 font-semibold tabular-nums">
                      {valeurDite(c.unite, g.en_vigueur?.valeurs[c.colonne] as number | null | undefined)}
                    </td>
                    <td className="px-3 py-2 text-legende tabular-nums text-muted-foreground">
                      {valeurDite(c.unite, c.minimum)} – {valeurDite(c.unite, c.maximum)}
                      {c.facultatif && <span className="block">ou aucun</span>}
                    </td>
                    <td className="max-w-sm px-3 py-2 text-legende">
                      {c.modifiable ? (
                        <StatutPastille ton="marque">Oui</StatutPastille>
                      ) : (
                        <span className="text-muted-foreground">{c.raison_figee}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {g.en_vigueur && (
            <p className="text-legende text-muted-foreground tabular-nums">
              Version {g.en_vigueur.version}, en vigueur depuis le {dateHeure(g.en_vigueur.depuis)}.
            </p>
          )}

          {g.historique.length > 0 && (
            <details className="text-legende">
              <summary className="cursor-pointer font-medium">Historique des versions</summary>
              <ol className="mt-2 grid gap-2">
                {g.historique.map((h) => (
                  <li key={h.version} className="rounded-lg border p-2">
                    <span className="tabular-nums">
                      Version {h.version} — depuis le {dateHeure(h.depuis)}
                    </span>
                    {h.changement ? (
                      <>
                        <Ecarts ecarts={h.changement.changements} />
                        <span className="block text-muted-foreground">
                          Demandée par {h.changement.demandeur ?? "—"}, validée par {h.changement.valideur ?? "—"} · «{" "}
                          {h.changement.motif} »
                        </span>
                      </>
                    ) : (
                      <span className="block text-muted-foreground">Publiée par migration</span>
                    )}
                  </li>
                ))}
              </ol>
            </details>
          )}
        </section>
      ))}
      <DialogueMotif
        ouvert={annulation !== null}
        surFermeture={() => setAnnulation(null)}
        enCours={annuler.enCours}
        destructif
        longueurMin={5}
        titre="Annuler cette version programmée ?"
        description="Elle ne prendra pas effet : les règles en vigueur continuent."
        libelleAction="Annuler la version"
        surConfirmation={async (motif) => {
          if (annulation) await annuler.lancer({ ...annulation, motif }, "Version annulée.");
          setAnnulation(null);
        }}
      />
    </div>
  );
}
