"use client";

import Link from "next/link";
import { cn } from "cn";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { StatutPastille, type Ton } from "@/components/bo/StatutPastille";
import { cheminFiche } from "@/lib/operations/types";
import {
  FILTRES_FONDS,
  LIBELLE_ATTENTE,
  LIBELLE_ETAT_FONDS,
  LIBELLE_FILTRE_FONDS,
  LIBELLE_ROLE_FONDS,
  euros,
  quand,
  type EtatFonds,
  type FiltreFonds,
  type FondsAVerser as Ligne,
} from "@/lib/paiements/types";
import { BoutonLever, BoutonRetenir } from "./GestesFonds";

// ⚠️ UNE ISSUE DÉFAVORABLE N'EST JAMAIS VERTE : retenu est ambre, versé vert.
export const TON_FONDS: Record<EtatFonds, Ton> = {
  verse: "succes",
  retenu: "attention",
  versable: "marque",
  en_attente: "neutre",
  rien: "muet",
  annule: "muet",
};

/**
 * Les fonds à verser (§16.1 : « disponible, versé ») : ce que chaque commande
 * doit à chaque personne qu'elle paie, et ce qui le retient.
 *
 * 🔴 « VERSABLE » EST CE QUE LE VERSEMENT PAIERAIT si la personne le demandait
 * maintenant : la base interroge le versement lui-même, jamais une estimation.
 */
export function FondsAVerser({
  lignes,
  filtre,
  peutRetenir,
  peutLiberer,
}: {
  lignes: Ligne[];
  filtre: FiltreFonds | null;
  peutRetenir: boolean;
  peutLiberer: boolean;
}) {
  const lien = (f: FiltreFonds | null) => `/paiements-et-comptabilite?onglet=fonds${f ? `&etat=${f}` : ""}`;

  return (
    <div className="grid gap-4">
      <nav className="flex flex-wrap gap-2" aria-label="Filtrer les fonds">
        {[null, ...FILTRES_FONDS].map((f) => (
          <Link
            key={f ?? "tous"}
            href={lien(f)}
            className={cn(
              "rounded-full border px-3 py-1 text-legende font-medium transition-colors",
              f === filtre
                ? "border-h2h-primary bg-h2h-primary/10 text-h2h-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f ? LIBELLE_FILTRE_FONDS[f] : "Tous"}
          </Link>
        ))}
      </nav>

      {lignes.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <AnimationH2H nom="coin" taille={96} />
          <p className="mt-3 font-semibold">
            {filtre ? `Aucun fonds ${LIBELLE_FILTRE_FONDS[filtre].toLowerCase()}` : "Rien n’attend de versement"}
          </p>
          <p className="text-corps text-muted-foreground">
            Chaque vente encaissée apparaît ici, pour son vendeur et son cotransporteur, jusqu’à son versement.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[900px] text-corps">
            <thead className="bg-muted/40 text-left text-legende text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Commande</th>
                <th className="px-3 py-2 font-medium">Bénéficiaire</th>
                <th className="px-3 py-2 text-right font-medium">Dû</th>
                <th className="px-3 py-2 font-medium">État</th>
                <th className="px-3 py-2 font-medium">Pourquoi</th>
                <th className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {lignes.map((l) => {
                const equipe = l.retenues.filter((r) => r.retenue !== null);
                const sienne = equipe.length > 0;
                return (
                  <tr key={`${l.order_id}:${l.beneficiaire_id}`} className="border-t align-top">
                    <td className="px-3 py-2">
                      <Link href={cheminFiche(l.reference)} className="font-medium tabular-nums hover:underline">
                        {l.reference}
                      </Link>
                      {l.est_test && (
                        <StatutPastille ton="attention" className="ml-2">
                          TEST
                        </StatutPastille>
                      )}
                      {l.bien && <span className="block text-legende text-muted-foreground">{l.bien}</span>}
                    </td>
                    <td className="px-3 py-2">
                      <span className="block">{l.pseudo ?? "Compte effacé"}</span>
                      <span className="text-legende text-muted-foreground">{LIBELLE_ROLE_FONDS[l.role]}</span>
                    </td>
                    <td className="px-3 py-2 text-right font-semibold tabular-nums">{euros(l.du_cents)}</td>
                    <td className="px-3 py-2">
                      <StatutPastille ton={TON_FONDS[l.etat]}>{LIBELLE_ETAT_FONDS[l.etat]}</StatutPastille>
                    </td>
                    <td className="px-3 py-2">
                      {l.etat === "retenu" ? (
                        <ul className="grid gap-1">
                          {l.retenues.map((r, i) => (
                            <li key={i} className="flex flex-wrap items-center gap-2">
                              <span>{r.libelle}</span>
                              <span className="text-legende text-muted-foreground">depuis le {quand(r.depuis)}</span>
                              {r.retenue && peutLiberer && <BoutonLever retenue={r.retenue} taille="xs" />}
                            </li>
                          ))}
                        </ul>
                      ) : l.etat === "en_attente" ? (
                        <span className="text-muted-foreground">
                          {l.attente ? LIBELLE_ATTENTE[l.attente] : "En attente"}
                          {l.attente === "fenetre" && l.versable_le ? ` — jusqu’au ${quand(l.versable_le)}` : ""}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">La personne peut demander son versement.</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {peutRetenir && !sienne && (
                        <BoutonRetenir
                          commande={l.order_id}
                          beneficiaire={l.beneficiaire_id}
                          qui={`${LIBELLE_ROLE_FONDS[l.role].toLowerCase()} ${l.pseudo ?? ""}`.trim()}
                          taille="xs"
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
