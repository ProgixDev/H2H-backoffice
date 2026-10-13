import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { FicheTrajetVue } from "@/components/logistique/FicheTrajet";
import { RefusBO } from "@/lib/db/rpc";
import { peut } from "@/lib/equipe/types";
import { lireTrajet } from "@/lib/logistique/lectures";
import { adresseTrajets, type FicheTrajet } from "@/lib/logistique/types";
import { rubriqueObligatoire } from "@/lib/navigation";

const rubrique = rubriqueObligatoire("/h2h-logistic");
export const metadata: Metadata = { title: rubrique.titre };

const IDENTIFIANT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * La fiche d'un trajet (§ 12.2) : consulter, suspendre les nouvelles
 * propositions, examiner une incompatibilité, voir les missions associées.
 *
 * ⚠️ UN IDENTIFIANT INCONNU, UN TRAJET RETIRÉ PAR SON COTRANSPORTEUR OU UN TRAJET
 * DE L'AUTRE MONDE (test ou réel) donnent la même réponse : « introuvable ».
 */
export default async function PageTrajet({ params }: { params: Promise<{ id: string }> }) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const id = decodeURIComponent((await params).id).trim();

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let fiche: FicheTrajet | null = null;
  let introuvable = !IDENTIFIANT.test(id);
  if (!introuvable) {
    try {
      fiche = await lireTrajet(id);
    } catch (e) {
      introuvable = e instanceof RefusBO && e.indice === "BO_INTROUVABLE";
    }
  }

  return (
    <div className="mx-auto grid max-w-[1400px] gap-4">
      <Link
        href={adresseTrajets({ filtre: null, q: null, test: false })}
        className="inline-flex w-fit items-center gap-1.5 text-legende font-semibold text-h2h-primary hover:underline"
      >
        <ArrowLeft className="size-3.5" />
        Trajets
      </Link>
      {fiche ? (
        <FicheTrajetVue f={fiche} lienCompte={peut(moi, "utilisateurs.lire")} />
      ) : introuvable ? (
        <LectureEchouee
          titre="Ce trajet est introuvable"
          message="L’identifiant ne désigne aucun trajet : son cotransporteur l’a peut-être retiré — ou il appartient à l’autre monde (test ou réel)."
        />
      ) : (
        <LectureEchouee />
      )}
    </div>
  );
}
