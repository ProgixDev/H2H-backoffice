import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { FicheComplete } from "@/components/operations/FicheComplete";
import { FicheFermee } from "@/components/operations/FicheFermee";
import { ListeTrouvees } from "@/components/operations/ListeTrouvees";
import { RechercheOperation } from "@/components/operations/RechercheOperation";
import { RefusBO } from "@/lib/db/rpc";
import { chargerMoi } from "@/lib/equipe/moi";
import { peut } from "@/lib/equipe/types";
import { lireOperation, trouverOperation } from "@/lib/operations/lectures";
import { cheminFiche, type Fiche, type Trouvee } from "@/lib/operations/types";

type Params = { params: Promise<{ reference: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return { title: decodeURIComponent((await params).reference) };
}

/**
 * La fiche complète d'une opération (§6), à son adresse : sa référence.
 *
 * ⚠️ L'ADRESSE EST LA RÉFÉRENCE QUE L'ÉQUIPE SE TRANSMET (« HTH-2026-C2D477 »).
 * Toute autre référence qui ne désigne qu'une opération (un paiement, un
 * numéro de suivi) y renvoie ; plusieurs se choisissent.
 */
export default async function PageFiche({ params }: Params) {
  const moi = await chargerMoi();
  if (!moi.membre) redirect("/acces");
  if (!peut(moi, "activite.lire")) return <FicheFermee />;

  const reference = decodeURIComponent((await params).reference).trim();

  // On LIT dans les try, on redirige et on construit l'écran après.
  let trouvees: Trouvee[] = [];
  let fiche: Fiche | null = null;
  let refus: { indice: string | null; message: string } | null = null;
  try {
    trouvees = await trouverOperation(reference);
  } catch (e) {
    refus = e instanceof RefusBO ? { indice: e.indice, message: e.message } : { indice: "BO_PANNE", message: "" };
  }
  const exactes = trouvees.filter((t) => t.ref.toUpperCase() === reference.toUpperCase());
  const cible = exactes.length === 1 ? exactes[0] : trouvees.length === 1 ? trouvees[0] : null;
  if (cible && cible.ref.toUpperCase() !== reference.toUpperCase()) redirect(cheminFiche(cible.ref));
  if (cible) {
    try {
      fiche = await lireOperation(cible.objet_table, cible.objet_id);
    } catch (e) {
      refus = e instanceof RefusBO ? { indice: e.indice, message: e.message } : { indice: "BO_PANNE", message: "" };
    }
  }

  if (fiche && cible) {
    return (
      <div className="mx-auto grid max-w-[1400px] gap-4">
        <FicheComplete
          initial={fiche}
          table={cible.objet_table}
          id={cible.objet_id}
          peutReveler={peut(moi, "donnees.reveler")}
        />
      </div>
    );
  }
  if (refus?.indice === "BO_CONFLIT") return <FicheFermee titre={reference} message={refus.message} />;
  if (refus && refus.indice !== "BO_INTROUVABLE") {
    return (
      <div className="mx-auto grid max-w-4xl gap-4">
        <LectureEchouee message={refus.message || undefined} />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-4">
      <RechercheOperation initiale={reference} />
      {trouvees.length > 1 ? (
        <>
          <p className="text-corps text-muted-foreground">
            « {reference} » désigne {trouvees.length} opérations : choisissez la bonne.
          </p>
          <ListeTrouvees trouvees={trouvees} />
        </>
      ) : (
        <p className="text-corps text-muted-foreground">
          Aucune opération ne répond à « {reference} » — ou elle appartient à l’autre monde (test ou réel).
        </p>
      )}
    </div>
  );
}
