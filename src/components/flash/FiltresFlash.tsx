import Link from "next/link";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FILTRES_FLASH,
  LIBELLE_FILTRE_FLASH,
  adresseFlash,
  type CompteursFlash,
  type FiltreFlash,
  type FiltresFlash,
} from "@/lib/flash/types";

/**
 * Les filtres : l'étape (des pastilles, chacune avec son compteur — le même
 * prédicat que la liste), puis la recherche (un formulaire simple, lu par le
 * serveur). « Litiges » ne se montre que s'il y en a.
 */
export function FiltresOffresFlash({
  f,
  compteurs,
  testVisible,
}: {
  f: FiltresFlash;
  compteurs: CompteursFlash | null;
  testVisible: boolean;
}) {
  const pastilles: (FiltreFlash | null)[] = [
    null,
    ...FILTRES_FLASH.filter((x) => x !== "litige" || x === f.filtre || (compteurs?.litige ?? 0) > 0),
  ];
  return (
    <div className="grid gap-3">
      <nav className="flex flex-wrap gap-2" aria-label="Filtrer par étape">
        {pastilles.map((x) => {
          const nb = compteurs ? compteurs[x ?? "toutes"] : null;
          const actif = x === f.filtre;
          return (
            <Link
              key={x ?? "toutes"}
              href={adresseFlash({ ...f, filtre: x })}
              aria-current={actif ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-legende font-medium transition-colors",
                actif
                  ? "border-h2h-primary bg-h2h-primary/10 text-h2h-primary"
                  : x === "anomalie" && (nb ?? 0) > 0
                    ? "border-[#B45309]/40 text-[#B45309] hover:bg-[#B45309]/5"
                    : "text-muted-foreground hover:text-foreground",
              )}
            >
              {x ? LIBELLE_FILTRE_FLASH[x] : "Toutes"}
              {nb !== null && <span className="tabular-nums">{nb}</span>}
            </Link>
          );
        })}
      </nav>
      <form method="get" action="/offres-flash" className="flex flex-wrap items-end gap-2">
        {f.filtre && <input type="hidden" name="filtre" value={f.filtre} />}
        <label className="grid min-w-56 flex-1 gap-1 text-legende text-muted-foreground">
          Recherche
          <Input name="q" defaultValue={f.q ?? ""} placeholder="Titre, pseudonyme, référence FLASH-…, numéro d’achat" />
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
            href={adresseFlash({ ...f, q: null, test: false })}
            className="flex h-9 items-center text-legende text-muted-foreground hover:text-foreground"
          >
            Effacer
          </Link>
        )}
      </form>
    </div>
  );
}
