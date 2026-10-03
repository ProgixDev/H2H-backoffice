"use client";

import { useState } from "react";
import { DialogueMotif } from "@/components/bo/DialogueMotif";
import { StatutPastille, type Ton } from "@/components/bo/StatutPastille";
import { Button } from "@/components/ui/button";
import { dateHeure } from "@/lib/dates";
import { useGeste } from "@/lib/db/useGeste";
import { annulerVersion } from "@/lib/documents/actions";
import {
  LIBELLE_APPLICATION,
  LIBELLE_STATUT_VERSION,
  type StatutVersion,
  type Texte,
  type VersionTexte,
} from "@/lib/documents/types";
import { GestePublication } from "./GestePublication";

const TON_VERSION: Record<StatutVersion, Ton> = { programmee: "attention", en_vigueur: "marque", remplacee: "muet" };

function LigneVersion({ texte, v, surAnnuler }: { texte: Texte; v: VersionTexte; surAnnuler: () => void }) {
  return (
    <tr className="border-t align-top">
      <td className="px-3 py-2">
        <span className="font-medium tabular-nums">{v.version}</span>
        <span className="block text-legende text-muted-foreground">{v.titre}</span>
      </td>
      <td className="px-3 py-2">
        <StatutPastille ton={TON_VERSION[v.statut]}>{LIBELLE_STATUT_VERSION[v.statut]}</StatutPastille>
        <span className="block text-legende text-muted-foreground tabular-nums">
          {v.statut === "programmee" ? "à partir du " : "depuis le "}
          {dateHeure(v.en_vigueur_le)}
        </span>
      </td>
      <td className="px-3 py-2 text-legende">
        {LIBELLE_APPLICATION[v.application]}
        <span className="block text-muted-foreground">
          {texte.acceptable ? (v.obligatoire ? "se fait accepter" : "ne se fait pas accepter") : "se versionne seulement"}
        </span>
      </td>
      <td className="px-3 py-2 tabular-nums">{texte.acceptable ? v.acceptations : "—"}</td>
      <td className="max-w-xs px-3 py-2 text-legende">
        <a href={v.url} target="_blank" rel="noreferrer" className="break-all text-h2h-primary hover:underline">
          {v.url}
        </a>
        <code className="block break-all text-muted-foreground">sha-256 {v.empreinte}</code>
      </td>
      <td className="px-3 py-2 text-legende text-muted-foreground">
        {v.changement ? (
          <>
            Demandée par {v.changement.demandeur ?? "—"}, validée par {v.changement.valideur ?? "—"}
            <span className="block">« {v.changement.motif} »</span>
          </>
        ) : (
          "Inscrite par migration"
        )}
      </td>
      <td className="px-3 py-2">
        {v.annulable && (
          <Button size="sm" variant="outline" onClick={surAnnuler}>
            Annuler
          </Button>
        )}
      </td>
    </tr>
  );
}

/**
 * Les textes du cahier des charges (R20.1) : chacun avec ses versions, les
 * acceptations, qui les a demandées et validées, les demandes qui attendent — et
 * « Publier une version », que valide une autre personne de la Direction.
 */
export function ListeTextes({ textes }: { textes: Texte[] }) {
  const [annulation, setAnnulation] = useState<{ code: string; version: string } | null>(null);
  const annuler = useGeste(annulerVersion);

  return (
    <div className="grid gap-4">
      {textes.map((t) => (
        <section key={t.code} className="grid gap-3 rounded-xl border p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid gap-0.5">
              <h3 className="text-h3 font-semibold">{t.libelle}</h3>
              <span className="text-legende text-muted-foreground">
                {t.acceptable ? "Les personnes l’acceptent" : "Se versionne sans se faire accepter"}
                {t.application ? ` · ${LIBELLE_APPLICATION[t.application]}` : ""}
              </span>
            </div>
            {t.possible.demander ? (
              <GestePublication texte={t} />
            ) : (
              t.possible.raison && <span className="text-legende text-muted-foreground">{t.possible.raison}</span>
            )}
          </div>
          {t.demandes.map((d) => (
            <p key={d.validation} className="rounded-lg border border-h2h-primary/30 bg-h2h-primary/5 p-3 text-legende">
              Version {d.version} demandée par {d.demandeur ?? "—"} le {dateHeure(d.demande_le)} —{" "}
              {d.effet ? `en vigueur le ${dateHeure(d.effet)}` : "en vigueur dès la validation"} · « {d.motif} ». Elle
              attend une seconde validation de la Direction (Équipe et journal d’audit → Validations).
            </p>
          ))}
          {t.versions.length === 0 ? (
            <p className="text-corps text-muted-foreground">
              Aucune version publiée : {t.acceptable ? "rien n’est demandé aux personnes." : "rien n’est versionné."}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[960px] text-corps">
                <thead className="bg-muted/40 text-left text-legende text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Version</th>
                    <th className="px-3 py-2 font-medium">État</th>
                    <th className="px-3 py-2 font-medium">Pour</th>
                    <th className="px-3 py-2 font-medium">Acceptations</th>
                    <th className="px-3 py-2 font-medium">Texte</th>
                    <th className="px-3 py-2 font-medium">Publication</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {t.versions.map((v) => (
                    <LigneVersion
                      key={v.version}
                      texte={t}
                      v={v}
                      surAnnuler={() => setAnnulation({ code: t.code, version: v.version })}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}
      <DialogueMotif
        ouvert={annulation !== null}
        surFermeture={() => setAnnulation(null)}
        enCours={annuler.enCours}
        destructif
        titre="Annuler cette version programmée ?"
        description="Elle ne prendra pas effet : la version en vigueur continue. Personne ne l’a encore acceptée."
        libelleAction="Annuler la version"
        surConfirmation={async (motif) => {
          if (annulation) await annuler.lancer({ ...annulation, motif }, "Version annulée.");
          setAnnulation(null);
        }}
      />
    </div>
  );
}
