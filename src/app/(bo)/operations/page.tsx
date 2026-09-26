import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { FicheFermee } from "@/components/operations/FicheFermee";
import { ListeTrouvees } from "@/components/operations/ListeTrouvees";
import { RechercheOperation } from "@/components/operations/RechercheOperation";
import { chargerMoi } from "@/lib/equipe/moi";
import { peut } from "@/lib/equipe/types";
import { RefusBO } from "@/lib/db/rpc";
import { trouverOperation } from "@/lib/operations/lectures";
import { cheminFiche, type Trouvee } from "@/lib/operations/types";

export const metadata: Metadata = { title: "Rechercher une opération" };

/**
 * Ouvrir une opération par l'une de ses références (R6.1) : une seule
 * correspondance mène droit à sa fiche, plusieurs se choisissent.
 */
export default async function PageRechercheOperation({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const moi = await chargerMoi();
  if (!moi.membre) redirect("/acces");
  if (!peut(moi, "activite.lire")) return <FicheFermee />;

  const brut = (await searchParams).q;
  const q = typeof brut === "string" ? brut.trim().slice(0, 120) : "";

  // On LIT dans le try, on redirige et on construit l'écran après.
  let trouvees: Trouvee[] | null = null;
  let echec: string | null = null;
  if (q.length >= 3) {
    try {
      trouvees = await trouverOperation(q);
    } catch (e) {
      echec = e instanceof RefusBO ? e.message : "Un souci est survenu. Réessayez dans un instant.";
    }
  }
  if (trouvees?.length === 1) redirect(cheminFiche(trouvees[0].ref));

  return (
    <div className="mx-auto grid max-w-4xl gap-4">
      <p className="text-corps text-muted-foreground">
        Numéro de commande (entier ou ses six derniers caractères), FLASH-…, LIVE-…, DOS-…, identifiant, paiement ou
        remboursement Stripe, numéro de suivi, reçu, facture — ou le pseudo d’un utilisateur, pour ses opérations.
      </p>
      <RechercheOperation initiale={q} />
      {q.length > 0 && q.length < 3 ? (
        <p className="text-corps text-muted-foreground">Tapez au moins trois caractères.</p>
      ) : echec ? (
        <LectureEchouee message={echec} />
      ) : trouvees === null ? null : trouvees.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <AnimationH2H nom="recherche" taille={112} />
          <p className="mt-2 font-semibold">Aucune opération ne répond à « {q} »</p>
          <p className="text-corps text-muted-foreground">Vérifiez la référence, ou cherchez par le pseudo d’un participant.</p>
        </div>
      ) : (
        <>
          <p className="text-corps text-muted-foreground">
            {trouvees.length} opération{trouvees.length > 1 ? "s" : ""} répondent à « {q} »
            {trouvees.length === 50 ? " — les 50 plus récentes" : ""}.
          </p>
          <ListeTrouvees trouvees={trouvees} />
        </>
      )}
    </div>
  );
}
