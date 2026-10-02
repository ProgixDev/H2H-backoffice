import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { FicheAvisVue } from "@/components/avis/FicheAvis";
import { lireAvis } from "@/lib/avis/lectures";
import type { FicheAvis } from "@/lib/avis/types";
import { RefusBO } from "@/lib/db/rpc";
import { peut } from "@/lib/equipe/types";
import { rubriqueObligatoire } from "@/lib/navigation";

const rubrique = rubriqueObligatoire("/avis-utilisateurs");
export const metadata: Metadata = { title: rubrique.titre };

const IDENTIFIANT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * La fiche d'un avis (§19) : qui, quoi, l'effet sur la moyenne affichée, les
 * signalements, les décisions — et le retirer ou le rétablir (R19.2).
 *
 * ⚠️ UN IDENTIFIANT INCONNU OU UN AVIS DE L'AUTRE MONDE (test ou réel) donnent la
 * même réponse : « introuvable ».
 */
export default async function PageAvis({ params }: { params: Promise<{ id: string }> }) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const id = decodeURIComponent((await params).id).trim();

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let fiche: FicheAvis | null = null;
  let introuvable = !IDENTIFIANT.test(id);
  if (!introuvable) {
    try {
      fiche = await lireAvis(id);
    } catch (e) {
      introuvable = e instanceof RefusBO && e.indice === "BO_INTROUVABLE";
    }
  }

  return (
    <div className="mx-auto grid max-w-[1400px] gap-4">
      <Link
        href="/avis-utilisateurs"
        className="inline-flex w-fit items-center gap-1.5 text-legende font-semibold text-h2h-primary hover:underline"
      >
        <ArrowLeft className="size-3.5" />
        Avis utilisateurs
      </Link>
      {fiche ? (
        <FicheAvisVue f={fiche} lienCompte={peut(moi, "utilisateurs.lire")} lienFiche={peut(moi, "activite.lire")} />
      ) : introuvable ? (
        <LectureEchouee
          titre="Cet avis est introuvable"
          message="L’identifiant ne désigne aucun avis — ou il appartient à l’autre monde (test ou réel)."
        />
      ) : (
        <LectureEchouee />
      )}
    </div>
  );
}
