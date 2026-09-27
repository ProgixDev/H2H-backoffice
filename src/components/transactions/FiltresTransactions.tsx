import Link from "next/link";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LIBELLE_MODE } from "@/lib/operations/libelles";
import {
  ETATS_TRANSACTION,
  LIBELLE_ETAT_TRANSACTION,
  type EtatTransaction,
  type FiltresTransactions,
} from "@/lib/transactions/types";

/** L'adresse d'une liste filtrée : les filtres restent dans l'adresse (R4.10), on la partage telle quelle. */
export function adresseTransactions(f: FiltresTransactions): string {
  const p = new URLSearchParams();
  if (f.etat) p.set("etat", f.etat);
  if (f.mode) p.set("mode", f.mode);
  if (f.du) p.set("du", f.du);
  if (f.au) p.set("au", f.au);
  if (f.q) p.set("q", f.q);
  if (f.test) p.set("test", "1");
  const s = p.toString();
  return s ? `/transactions?${s}` : "/transactions";
}

const CHAMP = "h-9 rounded-md border border-input bg-transparent px-3 text-corps";

/**
 * Les filtres : l'état (des pastilles), puis le mode, la période et la
 * recherche (un formulaire simple, lu par le serveur).
 */
export function FiltresTransactions({ f, testVisible }: { f: FiltresTransactions; testVisible: boolean }) {
  return (
    <div className="grid gap-3">
      <nav className="flex flex-wrap gap-2" aria-label="Filtrer par état">
        {([null, ...ETATS_TRANSACTION] as (EtatTransaction | null)[]).map((e) => (
          <Link
            key={e ?? "toutes"}
            href={adresseTransactions({ ...f, etat: e })}
            className={cn(
              "rounded-full border px-3 py-1 text-legende font-medium transition-colors",
              e === f.etat
                ? "border-h2h-primary bg-h2h-primary/10 text-h2h-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {e ? LIBELLE_ETAT_TRANSACTION[e] : "Toutes"}
          </Link>
        ))}
      </nav>
      <form method="get" action="/transactions" className="flex flex-wrap items-end gap-2">
        {f.etat && <input type="hidden" name="etat" value={f.etat} />}
        <label className="grid gap-1 text-legende text-muted-foreground">
          Mode
          <select name="mode" defaultValue={f.mode ?? ""} className={CHAMP}>
            <option value="">Tous les modes</option>
            {Object.entries(LIBELLE_MODE).map(([code, libelle]) => (
              <option key={code} value={code}>
                {libelle}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-legende text-muted-foreground">
          Du
          <input type="date" name="du" defaultValue={f.du ?? ""} className={CHAMP} />
        </label>
        <label className="grid gap-1 text-legende text-muted-foreground">
          Au
          <input type="date" name="au" defaultValue={f.au ?? ""} className={CHAMP} />
        </label>
        <label className="grid min-w-56 flex-1 gap-1 text-legende text-muted-foreground">
          Recherche
          <Input name="q" defaultValue={f.q ?? ""} placeholder="Numéro, pseudonyme, titre" />
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
        {(f.mode || f.du || f.au || f.q || f.test) && (
          <Link
            href={adresseTransactions({ ...f, mode: null, du: null, au: null, q: null, test: false })}
            className="flex h-9 items-center text-legende text-muted-foreground hover:text-foreground"
          >
            Effacer
          </Link>
        )}
      </form>
    </div>
  );
}
