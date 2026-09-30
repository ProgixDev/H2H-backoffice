import Link from "next/link";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { dateHeure } from "@/lib/dates";
import { cheminFiche, type Onglet } from "@/lib/operations/types";
import {
  chiffre,
  entier,
  lignesComptees,
  valeurEnUnite,
  type DetailIndicateur,
  type LigneTableau,
} from "@/lib/tableau/types";

// L'onglet de la fiche où se lit ce que l'indicateur compte.
const ONGLET: Record<string, Onglet> = {
  ventes: "paiements",
  revenus: "paiements",
  frais_paiement: "paiements",
  remboursements: "paiements",
  transactions_finalisees: "livraison",
  colivraisons: "livraison",
  litiges_ouverts: "litiges",
  litiges_delai: "litiges",
};

function Reference({ l, code, lien }: { l: LigneTableau; code: string; lien: boolean }) {
  if (!l.reference) return <span className="text-muted-foreground">—</span>;
  if (!l.cible || !lien) return <span className="tabular-nums">{l.reference}</span>;
  return (
    <Link href={cheminFiche(l.cible, ONGLET[code])} className="font-medium tabular-nums text-h2h-primary hover:underline">
      {l.reference}
    </Link>
  );
}

/**
 * Ce qui compose le chiffre d'un indicateur (§3 : « ouvrir les dossiers qui
 * composent le chiffre affiché ») : les lignes que la base a comptées, les
 * plus récentes d'abord.
 *
 * 🔴 LA LISTE EST CELLE DU CHIFFRE : même période, même monde, et la vitrine
 * mise à part n'y figure pas — comme elle ne figure pas dans le chiffre.
 */
export function LignesIndicateur({
  detail: d,
  peutOuvrirFiche,
}: {
  detail: DetailIndicateur;
  /** `activite.lire` : la référence d'une ligne ouvre la fiche de son opération. */
  peutOuvrirFiche: boolean;
}) {
  const i = d.indicateur;
  const comptees = lignesComptees(i);
  const avecReference = d.lignes.some((l) => l.reference);
  const avecValeur = i.unite !== "aucune" && d.lignes.some((l) => l.valeur !== null);
  const avecDetail = d.lignes.some((l) => l.detail);

  return (
    <div className="grid gap-4">
      <section className="grid gap-2 rounded-xl border bg-card p-4" style={{ boxShadow: "var(--ombre-carte)" }}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="text-h3 font-semibold">{i.libelle}</h2>
          {i.portee === "instant" && <StatutPastille ton="neutre">À l’instant</StatutPastille>}
        </div>
        <div>
          <p className="text-h1 font-bold">{chiffre(i)}</p>
          {comptees && <p className="text-legende text-muted-foreground">{comptees}</p>}
        </div>
        <p className="max-w-3xl text-corps text-muted-foreground">
          {i.definition}
          {i.a_confirmer && <span className="font-medium"> Définition proposée, à confirmer.</span>}
        </p>
        {i.a_part > 0 && (
          <p className="text-legende text-muted-foreground">
            {entier(i.a_part)} de vitrine, à part : hors du chiffre, et hors de cette liste.
          </p>
        )}
      </section>

      {d.lignes.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <AnimationH2H nom="recherche" taille={96} />
          <p className="mt-3 font-semibold">
            {i.portee === "instant" ? "Rien en ce moment" : "Rien sur cette période"}
          </p>
          <p className="text-corps text-muted-foreground">Aucune ligne ne compose ce chiffre.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-corps">
            <thead className="text-legende text-muted-foreground">
              <tr className="border-b text-left">
                <th className="px-3 py-2 font-medium">{i.portee === "instant" ? "Depuis" : "Date"}</th>
                {avecReference && <th className="px-3 py-2 font-medium">Référence</th>}
                <th className="px-3 py-2 font-medium">Libellé</th>
                {avecDetail && <th className="px-3 py-2 font-medium">Détail</th>}
                {avecValeur && (
                  <th className="px-3 py-2 text-right font-medium">{i.unite === "secondes" ? "Durée" : "Montant"}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {d.lignes.map((l) => (
                <tr key={l.id} className="border-b align-top last:border-0">
                  <td className="whitespace-nowrap px-3 py-2 tabular-nums">{dateHeure(l.le)}</td>
                  {avecReference && (
                    <td className="whitespace-nowrap px-3 py-2">
                      <Reference l={l} code={i.code} lien={peutOuvrirFiche} />
                    </td>
                  )}
                  <td className="px-3 py-2">
                    <span className="flex flex-wrap items-center gap-2">
                      {l.libelle}
                      {l.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
                    </span>
                  </td>
                  {avecDetail && <td className="px-3 py-2 text-muted-foreground">{l.detail ?? "—"}</td>}
                  {avecValeur && (
                    <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">
                      {valeurEnUnite(l.valeur, i.unite)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {d.tronquee && (
        <p className="text-legende text-muted-foreground">
          Les {entier(d.lignes.length)} lignes les plus récentes sont affichées, sur {entier(i.nombre)} : le chiffre,
          lui, les compte toutes. Resserrez la période pour lire les autres.
        </p>
      )}
    </div>
  );
}
