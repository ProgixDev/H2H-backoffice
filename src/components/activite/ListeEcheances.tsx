"use client";

import { useState } from "react";
import { StatutPastille, type Ton } from "@/components/bo/StatutPastille";
import type { Echeance, RegleDelai } from "@/lib/activite/types";
import { Echeance as Fin } from "./Echeance";

const STATUT: Record<Echeance["statut"], { ton: Ton; libelle: string }> = {
  non_executee: { ton: "erreur", libelle: "Non exécutée" },
  echue: { ton: "actif", libelle: "Échue" },
  a_venir: { ton: "neutre", libelle: "À venir" },
};

const GENRE: Record<Echeance["genre"], string> = {
  utilisateur: "Délai laissé à un utilisateur",
  interne: "Cible de traitement interne",
  prestataire: "Délai d’un prestataire",
};

const UNITE: Record<NonNullable<RegleDelai["unite"]>, [string, string]> = {
  minutes: ["minute", "minutes"],
  heures: ["heure", "heures"],
  jours_calendaires: ["jour calendaire", "jours calendaires"],
  jours_ouvres: ["jour ouvré", "jours ouvrés"],
};

const duree = (r: RegleDelai) =>
  r.duree !== null && r.unite ? `${r.duree} ${UNITE[r.unite][r.duree > 1 ? 1 : 0]}` : `Réglée par ${r.parametre}`;

/**
 * Les échéances en cours et le registre des règles (§7).
 *
 * 🔴 « NON EXÉCUTÉE » : l'échéance est passée au-delà de la cadence de son
 * exécutant, et rien n'a bougé. Le dossier de l'opération est alors dans « À
 * traiter », groupe « Opérations en échec ».
 */
export function ListeEcheances({
  echeances,
  regles,
  maintenant,
}: {
  echeances: Echeance[];
  regles: RegleDelai[];
  maintenant: number;
}) {
  const [statut, setStatut] = useState<Echeance["statut"] | null>(null);
  const parRegle = new Map(regles.map((r) => [r.code, r]));
  const visibles = statut ? echeances.filter((e) => e.statut === statut) : echeances;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-2">
        {(["non_executee", "echue", "a_venir"] as const).map((s) => {
          const nb = echeances.filter((e) => e.statut === s).length;
          return (
            <button
              key={s}
              type="button"
              aria-pressed={statut === s}
              onClick={() => setStatut(statut === s ? null : s)}
              className={
                "rounded-full border px-3 py-1.5 text-legende font-semibold transition-colors " +
                (statut === s ? "border-h2h-primary bg-h2h-primary-light text-h2h-primary" : "hover:bg-muted")
              }
            >
              {STATUT[s].libelle} · {nb}
            </button>
          );
        })}
      </div>

      {visibles.length === 0 ? (
        <p className="text-corps text-muted-foreground">Aucune échéance dans cet état.</p>
      ) : (
        <ul className="grid gap-2">
          {visibles.map((e) => {
            const r = parRegle.get(e.regle);
            return (
              <li
                key={`${e.regle}:${e.objet_id}:${e.fin}`}
                className="grid gap-1 rounded-xl border bg-card p-3 md:grid-cols-[1fr_auto]"
                style={{ boxShadow: "var(--ombre-carte)" }}
              >
                <span className="grid min-w-0 gap-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold tabular-nums">{e.ref}</span>
                    <StatutPastille ton={STATUT[e.statut].ton}>{STATUT[e.statut].libelle}</StatutPastille>
                    {e.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
                  </span>
                  <span>{e.regle_libelle}</span>
                  <span className="text-legende text-muted-foreground">
                    {GENRE[e.genre]}
                    {r ? ` · ${duree(r)} · à l’échéance : ${r.action_echeance}` : ""}
                    {e.executeur ? ` · exécuté par ${e.executeur}` : " · personne n’agit à l’heure dite"}
                  </span>
                </span>
                <Fin iso={e.fin} maintenant={maintenant} />
              </li>
            );
          })}
        </ul>
      )}

      <section className="grid gap-2">
        <h2 className="text-h3 font-semibold">Registre des règles de délai</h2>
        <p className="text-corps text-muted-foreground">
          Chaque délai de la plateforme, avec son déclencheur, sa durée et son mode de calcul, ses rappels, ce qui
          l’arrête, ce qui se passe à l’échéance et qui l’exécute. Une durée réglée par un paramètre versionné le nomme.
        </p>
        <div className="overflow-x-auto rounded-xl border bg-card" style={{ boxShadow: "var(--ombre-carte)" }}>
          <table className="w-full min-w-[900px] text-corps">
            <thead className="border-b text-left text-legende text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Délai</th>
                <th className="px-3 py-2 font-medium">Durée</th>
                <th className="px-3 py-2 font-medium">Déclencheur · arrêt</th>
                <th className="px-3 py-2 font-medium">Rappels</th>
                <th className="px-3 py-2 font-medium">À l’échéance</th>
                <th className="px-3 py-2 font-medium">Exécutant</th>
              </tr>
            </thead>
            <tbody>
              {regles.map((r) => (
                <tr key={r.code} className="border-b align-top last:border-0">
                  <td className="px-3 py-2">
                    <span className="grid">
                      <span className="font-medium">{r.libelle}</span>
                      <span className="text-legende text-muted-foreground">
                        {GENRE[r.genre]} · v{r.version}
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-2">{duree(r)}</td>
                  <td className="px-3 py-2">
                    <span className="grid">
                      <span>{r.declencheur}</span>
                      {r.arret && <span className="text-legende text-muted-foreground">Arrêt : {r.arret}</span>}
                    </span>
                  </td>
                  <td className="px-3 py-2">{r.rappels ?? "—"}</td>
                  <td className="px-3 py-2">{r.action_echeance}</td>
                  <td className="px-3 py-2">{r.executeur ?? "Personne à l’heure dite"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
