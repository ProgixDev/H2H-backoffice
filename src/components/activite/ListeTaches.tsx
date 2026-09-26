import { StatutPastille, type Ton } from "@/components/bo/StatutPastille";
import { dateCourte, ilYA } from "@/lib/activite/temps";
import type { Tache } from "@/lib/activite/types";

const ETAT: Record<Tache["etat"], { ton: Ton; libelle: string }> = {
  ok: { ton: "succes", libelle: "Tourne normalement" },
  erreur: { ton: "erreur", libelle: "En échec" },
  muette: { ton: "erreur", libelle: "Ne tourne plus" },
};

const periode = (m: number) =>
  m >= 1440 ? "chaque nuit" : m >= 60 ? "chaque heure" : m === 1 ? "chaque minute" : `toutes les ${m} minutes`;

/**
 * Les travaux planifiés de la plateforme et leur santé (§4 : « opérations
 * automatiques en échec », A10 : une panne se voit).
 *
 * ⚠️ « NE TOURNE PLUS » : aucun passage depuis trois périodes. C'est souvent
 * plus grave qu'une erreur — rien ne se plaint d'un travail qui ne s'exécute pas.
 */
export function ListeTaches({ taches, maintenant }: { taches: Tache[]; maintenant: number }) {
  return (
    <ul className="grid gap-2">
      {taches.map((t) => (
        <li key={t.code} className="grid gap-1.5 rounded-xl border bg-card p-4" style={{ boxShadow: "var(--ombre-carte)" }}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{t.libelle}</span>
              <StatutPastille ton={ETAT[t.etat].ton}>{ETAT[t.etat].libelle}</StatutPastille>
            </span>
            <span className="text-legende text-muted-foreground tabular-nums">
              {t.code} · {periode(t.periode_minutes)}
            </span>
          </div>
          <p className="text-corps text-muted-foreground">{t.description}</p>
          <p className="text-legende text-muted-foreground">
            {t.dernier_passage ? `Dernier passage ${ilYA(t.dernier_passage, maintenant)}` : "Aucun passage enregistré"}
            {t.dernier_succes && t.etat !== "ok" ? ` · dernier succès ${ilYA(t.dernier_succes, maintenant)}` : ""}
            {` · ${t.executions_24h} passage${t.executions_24h > 1 ? "s" : ""} sur 24 h`}
            {t.erreurs_24h > 0 ? `, dont ${t.erreurs_24h} en échec` : ""}
          </p>
          {t.derniere_erreur && t.derniere_erreur_le && (
            <p className="rounded-lg bg-h2h-error-light px-3 py-2 text-legende text-h2h-error">
              {dateCourte(t.derniere_erreur_le, maintenant)} — {t.derniere_erreur}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
