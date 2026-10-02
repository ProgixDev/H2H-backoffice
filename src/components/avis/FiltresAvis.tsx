import Link from "next/link";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FILTRES_AVIS,
  LIBELLE_FILTRE_AVIS,
  adresseAvis,
  type CompteursAvis,
  type FiltreAvis,
  type FiltresAvis,
} from "@/lib/avis/types";

/**
 * Les filtres : l'état (des pastilles, chacune avec son compteur — le même
 * prédicat que la liste), puis la recherche (un formulaire simple, lu par le
 * serveur).
 */
export function FiltresListeAvis({
  f,
  compteurs,
  testVisible,
}: {
  f: FiltresAvis;
  compteurs: CompteursAvis | null;
  testVisible: boolean;
}) {
  const pastilles: (FiltreAvis | null)[] = [null, ...FILTRES_AVIS];
  return (
    <div className="grid gap-3">
      <nav className="flex flex-wrap gap-2" aria-label="Filtrer les avis">
        {pastilles.map((x) => {
          const nb = compteurs ? compteurs[x ?? "tous"] : null;
          const actif = x === f.filtre;
          return (
            <Link
              key={x ?? "tous"}
              href={adresseAvis({ ...f, filtre: x })}
              aria-current={actif ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-legende font-medium transition-colors",
                actif
                  ? "border-h2h-primary bg-h2h-primary/10 text-h2h-primary"
                  : x === "signales" && (nb ?? 0) > 0
                    ? "border-[#B45309]/40 text-[#B45309] hover:bg-[#B45309]/5"
                    : "text-muted-foreground hover:text-foreground",
              )}
            >
              {x ? LIBELLE_FILTRE_AVIS[x] : "Tous"}
              {nb !== null && <span className="tabular-nums">{nb}</span>}
            </Link>
          );
        })}
      </nav>
      <form method="get" action="/avis-utilisateurs" className="flex flex-wrap items-end gap-2">
        {f.filtre && <input type="hidden" name="filtre" value={f.filtre} />}
        <label className="grid min-w-56 flex-1 gap-1 text-legende text-muted-foreground">
          Recherche
          <Input name="q" defaultValue={f.q ?? ""} placeholder="Pseudonyme, mot du commentaire, AVIS-…, numéro d’achat" />
        </label>
        {testVisible && (
          <label className="flex h-9 items-center gap-2 text-corps">
            <input type="checkbox" name="test" value="1" defaultChecked={f.test} />
            Inclure le monde du test
          </label>
        )}
        <Button type="submit" size="sm" className="h-9">
          Filtrer
        </Button>
        {(f.q || f.test) && (
          <Link
            href={adresseAvis({ ...f, q: null, test: false })}
            className="flex h-9 items-center text-legende text-muted-foreground hover:text-foreground"
          >
            Effacer
          </Link>
        )}
      </form>
    </div>
  );
}
