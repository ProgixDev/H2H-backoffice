import Link from "next/link";
import { Star } from "lucide-react";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { dateHeure } from "@/lib/dates";
import { LIBELLE_ROLE_AVIS, LIBELLE_STATUT_AVIS, cheminAvis, type AvisLigne } from "@/lib/avis/types";

/**
 * Les avis : qui a noté qui, en tant que quoi, la note et le commentaire, l'état,
 * les signalements. Chaque ligne ouvre la fiche de l'avis, où il se retire ou se
 * rétablit.
 *
 * ⚠️ UN AVIS RETIRÉ N'EST JAMAIS VERT : c'est une décision contre son auteur.
 */
export function ListeAvis({ avis, filtree }: { avis: AvisLigne[]; filtree: boolean }) {
  if (avis.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <AnimationH2H nom="recherche" taille={96} />
        <p className="mt-3 font-semibold">{filtree ? "Aucun avis pour ces filtres" : "Aucun avis"}</p>
        <p className="text-corps text-muted-foreground">Chaque avis apparaît ici dès qu’il est déposé.</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[960px] text-corps">
        <thead className="bg-muted/40 text-left text-legende text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Avis</th>
            <th className="px-3 py-2 font-medium">Note</th>
            <th className="px-3 py-2 font-medium">Auteur → personne notée</th>
            <th className="px-3 py-2 font-medium">Commentaire</th>
            <th className="px-3 py-2 font-medium">État</th>
            <th className="px-3 py-2 font-medium">Signalements</th>
          </tr>
        </thead>
        <tbody>
          {avis.map((a) => (
            <tr key={a.id} className="border-t align-top hover:bg-muted/30">
              <td className="px-3 py-2">
                <Link href={cheminAvis(a.id)} className="font-medium tabular-nums text-h2h-primary hover:underline">
                  {a.ref}
                </Link>
                <span className="block text-legende text-muted-foreground tabular-nums">{dateHeure(a.depose_le)}</span>
                {a.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
              </td>
              <td className="px-3 py-2">
                <span className="inline-flex items-center gap-1 font-semibold">
                  <Star className="size-3.5" aria-hidden />
                  {a.note} / 5
                </span>
              </td>
              <td className="px-3 py-2">
                {a.auteur ?? "Compte effacé"} → {a.destinataire ?? "Compte effacé"}
                <span className="block text-legende text-muted-foreground">
                  noté comme {LIBELLE_ROLE_AVIS[a.role]}
                  {a.commande_ref ? ` · ${a.commande_ref}` : ""}
                </span>
              </td>
              <td className="max-w-md px-3 py-2">
                {a.commentaire ? <span className="line-clamp-2">« {a.commentaire} »</span> : <span className="text-muted-foreground">Sans commentaire</span>}
              </td>
              <td className="px-3 py-2">
                <StatutPastille ton={a.statut === "retire" ? "erreur" : "neutre"}>{LIBELLE_STATUT_AVIS[a.statut]}</StatutPastille>
              </td>
              <td className="px-3 py-2 tabular-nums">
                {a.signalements_ouverts > 0 ? (
                  <StatutPastille ton="attention">{a.signalements_ouverts} à examiner</StatutPastille>
                ) : a.signalements > 0 ? (
                  a.signalements
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
