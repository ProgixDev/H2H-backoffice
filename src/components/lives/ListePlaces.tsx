"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "cn";
import { Echeance } from "@/components/activite/Echeance";
import { useMaintenant } from "@/components/activite/commun";
import { StatutPastille, type Ton } from "@/components/bo/StatutPastille";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { dateHeure } from "@/lib/dates";
import {
  CATEGORIES_PLACE,
  LIBELLE_CATEGORIE_PLACE,
  type CategoriePlace,
  type PlaceLive,
} from "@/lib/lives/types";
import { LIBELLE_FORMAT_LIVE } from "@/lib/operations/libelles";
import { cheminFiche } from "@/lib/operations/types";

// ⚠️ UNE ISSUE DÉFAVORABLE N'EST JAMAIS VERTE : une place perdue est muette, une
// attente ambre ; seule une réservation confirmée est verte.
export const TON_CATEGORIE_PLACE: Record<CategoriePlace, Ton> = {
  confirmee: "succes",
  reservee: "marque",
  alertee: "actif",
  attente: "attention",
  liberee: "muet",
};

/**
 * Les réservations et les accès (R14.3) : une place par ligne, sous l'état du
 * cahier des charges, et son accès — complet ou spectateur seulement. Les
 * pastilles comptent les lignes de cette même liste : ce qu'elles comptent est
 * ce qu'elles montrent.
 */
export function ListePlaces({ places, unLive }: { places: PlaceLive[]; unLive: boolean }) {
  const [categorie, setCategorie] = useState<CategoriePlace | null>(null);
  const maintenant = useMaintenant();
  const lignes = categorie ? places.filter((p) => p.categorie === categorie) : places;

  if (places.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <AnimationH2H nom="live" taille={96} />
        <p className="mt-3 font-semibold">Aucune réservation</p>
        <p className="max-w-lg text-corps text-muted-foreground">
          {unLive
            ? "Personne n’a réservé de place pour ce live."
            : "Les places des lives Exclusif et VIP qui ne sont pas terminés apparaissent ici. Un live Classique est ouvert à tous, sans réservation."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <nav className="flex flex-wrap gap-2" aria-label="Filtrer par état">
        {([null, ...CATEGORIES_PLACE] as (CategoriePlace | null)[]).map((c) => (
          <button
            key={c ?? "toutes"}
            type="button"
            aria-pressed={c === categorie}
            onClick={() => setCategorie(c)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-legende font-medium transition-colors",
              c === categorie ? "border-h2h-primary bg-h2h-primary/10 text-h2h-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {c ? LIBELLE_CATEGORIE_PLACE[c] : "Toutes"}
            <span className="tabular-nums">{c ? places.filter((p) => p.categorie === c).length : places.length}</span>
          </button>
        ))}
      </nav>
      <p className="text-legende text-muted-foreground">
        La liste d’attente n’est pas un classement : une place libérée est proposée à toute la liste à la fois — premier
        arrivé, premier servi. Le rang dit l’ordre d’arrivée.
      </p>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[980px] text-corps">
          <thead className="bg-muted/40 text-left text-legende text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Live</th>
              <th className="px-3 py-2 font-medium">Personne</th>
              <th className="px-3 py-2 font-medium">Accès</th>
              <th className="px-3 py-2 font-medium">État</th>
              <th className="px-3 py-2 font-medium">Réservée le</th>
              <th className="px-3 py-2 font-medium">Confirmée ou libérée le</th>
              <th className="px-3 py-2 font-medium">Verrou</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((p) => (
              <tr key={p.id} className="border-t align-top">
                <td className="px-3 py-2">
                  <Link href={cheminFiche(p.live_ref)} className="font-medium tabular-nums hover:underline">
                    {p.live_ref}
                  </Link>
                  {p.est_test && (
                    <StatutPastille ton="attention" className="ml-2">
                      TEST
                    </StatutPastille>
                  )}
                  <span className="block line-clamp-1">{p.live_titre}</span>
                  <span className="text-legende text-muted-foreground">
                    {LIBELLE_FORMAT_LIVE[p.live_format]}
                    {p.programme_le && ` · ${dateHeure(p.programme_le)}`}
                  </span>
                </td>
                <td className="px-3 py-2">{p.pseudo ?? "Compte effacé"}</td>
                <td className="px-3 py-2">{p.acces_libelle}</td>
                <td className="px-3 py-2">
                  <StatutPastille ton={TON_CATEGORIE_PLACE[p.categorie]}>{p.categorie_libelle}</StatutPastille>
                  {p.rang !== null && (
                    <span className="mt-1 block text-legende text-muted-foreground">arrivé {p.rang === 1 ? "1er" : `${p.rang}e`}</span>
                  )}
                  {p.alerte_le && (
                    <span className="block text-legende text-muted-foreground">alerte le {dateHeure(p.alerte_le)}</span>
                  )}
                </td>
                <td className="px-3 py-2 tabular-nums">{p.reserve_le ? dateHeure(p.reserve_le) : "—"}</td>
                <td className="px-3 py-2 tabular-nums">
                  {p.confirme_le ? dateHeure(p.confirme_le) : p.libere_le ? dateHeure(p.libere_le) : "—"}
                </td>
                <td className="px-3 py-2">
                  {p.verrou_fin && p.categorie === "reservee" ? <Echeance iso={p.verrou_fin} maintenant={maintenant} /> : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {places.length >= 1000 && (
        <p className="text-legende text-muted-foreground">
          Les 1 000 premières sont affichées. Précisez la recherche, ou ouvrez les réservations d’un seul live.
        </p>
      )}
    </div>
  );
}
