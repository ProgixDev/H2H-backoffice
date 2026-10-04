import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { FicheAnnonceVue } from "@/components/annonces/FicheAnnonce";
import { lireAnnonce } from "@/lib/annonces/lectures";
import type { Fiche } from "@/lib/annonces/types";
import { RefusBO } from "@/lib/db/rpc";
import { peut } from "@/lib/equipe/types";
import { rubriqueObligatoire } from "@/lib/navigation";
import { lireSignalementsCible } from "@/lib/signalements/lectures";
import type { SignalementsCible } from "@/lib/signalements/types";

const rubrique = rubriqueObligatoire("/annonces");
export const metadata: Metadata = { title: rubrique.titre };

const IDENTIFIANT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * La fiche d'une annonce ou d'une recherche « Je cherche » (§9), à son adresse :
 * son identifiant. Une seule porte pour les deux — le tableau de bord y mène
 * par le même identifiant.
 *
 * ⚠️ UN IDENTIFIANT INCONNU OU UNE ANNONCE DE L'AUTRE MONDE (test ou réel)
 * donnent la même réponse : « introuvable ».
 */
export default async function PageAnnonce({ params }: { params: Promise<{ id: string }> }) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const id = decodeURIComponent((await params).id).trim();

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let fiche: Fiche | null = null;
  let signalements: SignalementsCible | null = null;
  let introuvable = !IDENTIFIANT.test(id);
  if (!introuvable) {
    try {
      fiche = await lireAnnonce(id);
    } catch (e) {
      introuvable = e instanceof RefusBO && e.indice === "BO_INTROUVABLE";
    }
  }
  if (fiche) {
    try {
      signalements = await lireSignalementsCible(fiche.nature, id);
    } catch {
      // La fiche le dit à leur place : « Les signalements ne se lisent pas ».
    }
  }

  return (
    <div className="mx-auto grid max-w-[1400px] gap-4">
      <Link
        href={fiche?.nature === "recherche" ? "/annonces?vue=recherches" : "/annonces"}
        className="inline-flex w-fit items-center gap-1.5 text-legende font-semibold text-h2h-primary hover:underline"
      >
        <ArrowLeft className="size-3.5" />
        {fiche?.nature === "recherche" ? "Je cherche" : "Annonces"}
      </Link>
      {fiche ? (
        <FicheAnnonceVue f={fiche} signalements={signalements} lienOption={peut(moi, "visibilite.lire")} />
      ) : introuvable ? (
        <LectureEchouee
          titre="Cette annonce est introuvable"
          message="L’identifiant ne désigne aucune annonce ni aucune recherche — ou elle appartient à l’autre monde (test ou réel)."
        />
      ) : (
        <LectureEchouee />
      )}
    </div>
  );
}
