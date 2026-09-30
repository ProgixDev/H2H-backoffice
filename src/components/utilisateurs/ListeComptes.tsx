import Link from "next/link";
import { cn } from "cn";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dateHeure, jour } from "@/lib/dates";
import {
  FILTRES_COMPTES,
  LIBELLE_FILTRE_COMPTES,
  LIBELLE_PORTEE,
  LIBELLE_ROLE,
  LIBELLE_STATUT_ROLE,
  LIBELLE_TYPE_COMPTE,
  adresseComptes,
  cheminCompte,
  type CompteListe,
  type FiltreComptes,
  type FiltresComptes,
} from "@/lib/utilisateurs/types";

const NOTE = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
/** « 4,8 / 5 (12 avis) », ou « — » tant que personne n'a noté. */
export function noteDite(note: number | null, avis: number): string {
  if (note === null || avis === 0) return "—";
  return `${NOTE.format(Number(note))} / 5 (${avis} avis)`;
}

/**
 * La recherche et le filtre des comptes : lus par le serveur, gardés dans
 * l'adresse.
 *
 * ⚠️ UN E-MAIL NE SE CHERCHE PAS ICI : il ne trouverait personne, et resterait
 * dans l'adresse de la page. Il se cherche par la consultation d'à côté.
 */
export function FiltresComptes({ f, testVisible }: { f: FiltresComptes; testVisible: boolean }) {
  return (
    <div className="grid gap-3">
      <nav className="flex flex-wrap gap-2" aria-label="Filtrer les comptes">
        {([null, ...FILTRES_COMPTES] as (FiltreComptes | null)[]).map((x) => (
          <Link
            key={x ?? "tous"}
            href={adresseComptes({ ...f, filtre: x })}
            className={cn(
              "rounded-full border px-3 py-1 text-legende font-medium transition-colors",
              x === f.filtre
                ? "border-h2h-primary bg-h2h-primary/10 text-h2h-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {x ? LIBELLE_FILTRE_COMPTES[x] : "Tous"}
          </Link>
        ))}
      </nav>
      <form method="get" action="/utilisateurs" className="flex flex-wrap items-end gap-2">
        {f.filtre && <input type="hidden" name="filtre" value={f.filtre} />}
        <label className="grid min-w-64 flex-1 gap-1 text-legende text-muted-foreground">
          Recherche
          <Input name="q" defaultValue={f.q ?? ""} placeholder="Pseudonyme, ville ou identifiant du compte" maxLength={80} />
        </label>
        {testVisible && (
          <label className="flex h-9 items-center gap-2 text-corps">
            <input type="checkbox" name="test" value="1" defaultChecked={f.test} />
            Inclure le monde du test
          </label>
        )}
        <Button type="submit" size="sm" className="h-9">
          Chercher
        </Button>
        {(f.q || f.test) && (
          <Link
            href={adresseComptes({ ...f, q: null, test: false })}
            className="flex h-9 items-center text-legende text-muted-foreground hover:text-foreground"
          >
            Effacer
          </Link>
        )}
      </form>
    </div>
  );
}

/** Ce qui pèse sur un compte : suspendu, restreint (et sur quoi), averti. */
export function PastillesSanctions({ s }: { s: CompteListe["sanctions"] }) {
  if (!s) return null;
  return (
    <>
      {s.suspendu && <StatutPastille ton="erreur">Suspendu</StatutPastille>}
      {!s.suspendu && s.portees.length > 0 && (
        <StatutPastille ton="attention">Restreint · {s.portees.map((p) => LIBELLE_PORTEE[p] ?? p).join(", ")}</StatutPastille>
      )}
      {s.avertissements > 0 && (
        <StatutPastille ton="neutre">
          {s.avertissements} avertissement{s.avertissements > 1 ? "s" : ""}
        </StatutPastille>
      )}
    </>
  );
}

/**
 * Les comptes (§8) : le pseudonyme, ce que la personne fait, ce qui est
 * vérifié, ce qui a été dit d'elle, ce qui pèse sur elle. Chaque ligne ouvre
 * la fiche.
 *
 * 🔴 LE PSEUDONYME SEUL : ni nom, ni e-mail, ni téléphone dans cette liste.
 */
export function ListeComptes({ comptes, filtree }: { comptes: CompteListe[]; filtree: boolean }) {
  if (comptes.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <AnimationH2H nom="recherche" taille={96} />
        <p className="mt-3 font-semibold">{filtree ? "Aucun compte ne correspond" : "Aucun compte"}</p>
        <p className="text-corps text-muted-foreground">
          {filtree
            ? "La recherche porte sur le pseudonyme, la ville ou l’identifiant. Pour un e-mail, utilisez « Retrouver par e-mail »."
            : "Les comptes créés dans les applications apparaîtront ici."}
        </p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full min-w-[980px] text-corps">
        <thead className="text-legende text-muted-foreground">
          <tr className="border-b text-left">
            <th className="px-3 py-2 font-medium">Compte</th>
            <th className="px-3 py-2 font-medium">Inscrit le</th>
            <th className="px-3 py-2 font-medium">Rôles</th>
            <th className="px-3 py-2 font-medium">Vérifications</th>
            <th className="px-3 py-2 text-right font-medium">Annonces</th>
            <th className="px-3 py-2 text-right font-medium">Achats</th>
            <th className="px-3 py-2 text-right font-medium">Ventes</th>
            <th className="px-3 py-2 font-medium">Note</th>
            <th className="px-3 py-2 font-medium">Signalements</th>
            <th className="px-3 py-2 font-medium">Dernière ouverture</th>
          </tr>
        </thead>
        <tbody>
          {comptes.map((c) => (
            <tr key={c.id} className="border-b align-top last:border-0">
              <td className="px-3 py-2">
                <div className="grid gap-1">
                  <Link href={cheminCompte(c.id)} className="font-semibold text-h2h-primary hover:underline">
                    {c.pseudo ? `@${c.pseudo}` : "Sans pseudonyme"}
                  </Link>
                  <span className="text-legende text-muted-foreground">
                    {[LIBELLE_TYPE_COMPTE[c.type_compte], c.ville].filter(Boolean).join(" · ")}
                  </span>
                  {(c.est_test || c.vitrine || c.efface || c.sanctions) && (
                    <span className="flex flex-wrap gap-1">
                      {c.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
                      {c.vitrine && <StatutPastille ton="neutre">Vitrine</StatutPastille>}
                      {c.efface && <StatutPastille ton="muet">Compte effacé</StatutPastille>}
                      <PastillesSanctions s={c.sanctions} />
                    </span>
                  )}
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-2 tabular-nums">{jour(c.inscrit_le)}</td>
              <td className="px-3 py-2">
                {c.roles.length === 0 ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  <ul className="grid gap-1">
                    {c.roles.map((r) => (
                      <li key={r.role} className="text-legende">
                        <span className="font-medium">{LIBELLE_ROLE[r.role] ?? r.role}</span>
                        <span className="text-muted-foreground"> · {LIBELLE_STATUT_ROLE[r.statut] ?? r.statut}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </td>
              <td className="px-3 py-2 text-legende">
                <div className="grid gap-0.5">
                  <span>{c.identite_verifiee ? "Identité vérifiée" : <span className="text-muted-foreground">Identité non vérifiée</span>}</span>
                  <span className={c.compte_versement ? undefined : "text-muted-foreground"}>
                    {c.compte_versement === "payable"
                      ? "Compte de versement payable"
                      : c.compte_versement === "incomplet"
                        ? "Compte de versement incomplet"
                        : "Pas de compte de versement"}
                  </span>
                </div>
              </td>
              <td className="px-3 py-2 text-right tabular-nums">{c.annonces}</td>
              <td className="px-3 py-2 text-right tabular-nums">{c.achats}</td>
              <td className="px-3 py-2 text-right tabular-nums">{c.ventes}</td>
              <td className="whitespace-nowrap px-3 py-2">{noteDite(c.note, c.avis)}</td>
              <td className="px-3 py-2">
                {c.signalements > 0 ? (
                  <StatutPastille ton="erreur">
                    {c.signalements} en 90 jours
                  </StatutPastille>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="whitespace-nowrap px-3 py-2 tabular-nums">{dateHeure(c.derniere_ouverture)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
