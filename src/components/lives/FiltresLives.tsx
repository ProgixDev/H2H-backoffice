import Link from "next/link";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LIBELLE_ONGLET_LIVE,
  ONGLETS_LIVE,
  adresseLives,
  type CompteursLives,
  type FiltresLives,
  type OngletLive,
} from "@/lib/lives/types";

/**
 * Les onglets (R14.1) — chaque zone avec son compteur, le même prédicat que la
 * liste ; « Réservations et accès » compte dans sa propre vue — puis la
 * recherche (un formulaire simple, lu par le serveur).
 */
export function FiltresLivesVue({
  f,
  compteurs,
  testVisible,
}: {
  f: FiltresLives;
  compteurs: CompteursLives | null;
  testVisible: boolean;
}) {
  const onglets: (OngletLive | null)[] = [null, ...ONGLETS_LIVE];
  return (
    <div className="grid gap-3">
      <nav className="flex flex-wrap gap-1 border-b" aria-label="Zones">
        {onglets.map((o) => {
          const nb = compteurs && o !== "reservations" ? compteurs[o ?? "tous"] : null;
          const actif = o === f.onglet;
          return (
            <Link
              key={o ?? "tous"}
              href={adresseLives({ ...f, onglet: o, live: null })}
              aria-current={actif ? "page" : undefined}
              className={cn(
                "-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-corps font-medium transition-colors",
                actif
                  ? "border-h2h-primary text-h2h-primary"
                  : o === "anomalie" && (nb ?? 0) > 0
                    ? "border-transparent text-[#B45309] hover:text-[#92400E]"
                    : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {o ? LIBELLE_ONGLET_LIVE[o] : "Tous"}
              {nb !== null && <span className="text-legende tabular-nums">{nb}</span>}
            </Link>
          );
        })}
      </nav>
      <form method="get" action="/live-shopping" className="flex flex-wrap items-end gap-2">
        {f.onglet && <input type="hidden" name="zone" value={f.onglet} />}
        {f.live && <input type="hidden" name="live" value={f.live} />}
        <label className="grid min-w-56 flex-1 gap-1 text-legende text-muted-foreground">
          Recherche
          <Input
            name="q"
            defaultValue={f.q ?? ""}
            placeholder={f.onglet === "reservations" ? "Pseudonyme, titre du live, référence LIVE-…" : "Titre, hôte, référence LIVE-…"}
          />
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
        {(f.q || f.test || f.live) && (
          <Link
            href={adresseLives({ ...f, q: null, test: false, live: null })}
            className="flex h-9 items-center text-legende text-muted-foreground hover:text-foreground"
          >
            Effacer
          </Link>
        )}
      </form>
    </div>
  );
}
