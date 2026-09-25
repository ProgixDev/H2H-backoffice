import Link from "next/link";
import { StatutPastille, type Ton } from "@/components/bo/StatutPastille";
import { Button } from "@/components/ui/button";
import type { LigneJournal } from "@/lib/equipe/types";

const GENRES: { valeur: LigneJournal["genre"]; libelle: string }[] = [
  { valeur: "action", libelle: "Action" },
  { valeur: "decision", libelle: "Décision" },
  { valeur: "acces", libelle: "Accès" },
  { valeur: "consultation", libelle: "Consultation" },
  { valeur: "financier", libelle: "Financier" },
  { valeur: "parametre", libelle: "Paramètre" },
];

const TON_RESULTAT: Record<string, Ton> = {
  ok: "succes",
  executee: "succes",
  en_validation: "actif",
  rejetee: "neutre",
  expiree: "muet",
  echec: "erreur",
};

const quand = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

/**
 * Le journal d'audit : qui a fait quoi, quand, pourquoi, avec quel résultat.
 *
 * ⚠️ LECTURE SEULE, ET PAS SEULEMENT À L'ÉCRAN : la base refuse toute
 * modification ou suppression d'une ligne, même à un administrateur SQL.
 * Les filtres voyagent dans l'adresse : un lien partagé montre la même vue.
 */
export function JournalAudit({
  lignes,
  filtres,
}: {
  lignes: LigneJournal[];
  filtres: { genre?: string; action?: string };
}) {
  const derniere = lignes.at(-1);
  const suite = new URLSearchParams({ onglet: "journal", ...filtres, avant: String(derniere?.id ?? "") });

  return (
    <div className="grid gap-4">
      <form className="flex flex-wrap items-end gap-3" action="/equipe-et-audit">
        <input type="hidden" name="onglet" value="journal" />
        <label className="grid gap-1 text-legende text-muted-foreground">
          Genre
          <select
            name="genre"
            defaultValue={filtres.genre ?? ""}
            className="h-9 rounded-lg border bg-background px-2 text-corps text-foreground"
          >
            <option value="">Tous</option>
            {GENRES.map((g) => (
              <option key={g.valeur} value={g.valeur}>
                {g.libelle}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-legende text-muted-foreground">
          Action commençant par
          <input
            name="action"
            defaultValue={filtres.action ?? ""}
            placeholder="equipe."
            className="h-9 rounded-lg border bg-background px-2 text-corps text-foreground"
          />
        </label>
        <Button type="submit" variant="outline">
          Filtrer
        </Button>
      </form>

      {lignes.length === 0 ? (
        <p className="py-10 text-center text-corps text-muted-foreground">Aucune ligne pour ces filtres.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[720px] text-corps">
            <thead className="bg-muted/60 text-left text-legende text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Quand</th>
                <th className="px-4 py-2.5 font-medium">Qui</th>
                <th className="px-4 py-2.5 font-medium">Quoi</th>
                <th className="px-4 py-2.5 font-medium">Motif</th>
                <th className="px-4 py-2.5 font-medium">Résultat</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l) => (
                <tr key={l.id} className="border-t align-top">
                  <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground tabular-nums">{quand(l.le)}</td>
                  <td className="px-4 py-2.5">{l.acteur_email ?? "Par la plateforme"}</td>
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{l.action}</div>
                    <div className="text-legende text-muted-foreground">
                      {GENRES.find((g) => g.valeur === l.genre)?.libelle} · {l.entite_ref ?? l.entite}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{l.motif ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    {l.resultat && <StatutPastille ton={TON_RESULTAT[l.resultat] ?? "neutre"}>{l.resultat}</StatutPastille>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {lignes.length >= 50 && (
        <div className="flex justify-center">
          <Button variant="outline" asChild>
            <Link href={`/equipe-et-audit?${suite.toString()}`}>Plus ancien</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
