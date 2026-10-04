import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { FicheOptionVue } from "@/components/visibilite/FicheOption";
import { RefusBO } from "@/lib/db/rpc";
import { peut } from "@/lib/equipe/types";
import { rubriqueObligatoire } from "@/lib/navigation";
import { lireOption } from "@/lib/visibilite/lectures";
import type { FicheOption } from "@/lib/visibilite/types";

const rubrique = rubriqueObligatoire("/visibilite-et-publicite");
export const metadata: Metadata = { title: rubrique.titre };

const IDENTIFIANT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * La fiche d'une option de visibilité (§17, R17.1) : voir son exécution,
 * examiner une anomalie, traiter une rétractation, calculer un remboursement —
 * l'avoir s'émet à sa réussite — et l'arrêter.
 *
 * ⚠️ UN IDENTIFIANT INCONNU OU UNE OPTION DE L'AUTRE MONDE (test ou réel) donnent
 * la même réponse : « introuvable ».
 */
export default async function PageOption({ params }: { params: Promise<{ id: string }> }) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const id = decodeURIComponent((await params).id).trim();

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let fiche: FicheOption | null = null;
  let introuvable = !IDENTIFIANT.test(id);
  if (!introuvable) {
    try {
      fiche = await lireOption(id);
    } catch (e) {
      introuvable = e instanceof RefusBO && e.indice === "BO_INTROUVABLE";
    }
  }

  return (
    <div className="mx-auto grid max-w-[1400px] gap-4">
      <Link
        href="/visibilite-et-publicite"
        className="inline-flex w-fit items-center gap-1.5 text-legende font-semibold text-h2h-primary hover:underline"
      >
        <ArrowLeft className="size-3.5" />
        Visibilité et publicité
      </Link>
      {fiche ? (
        <FicheOptionVue
          f={fiche}
          lienAnnonce={peut(moi, "annonces.lire")}
          lienCompte={peut(moi, "utilisateurs.lire")}
          lienDossier={peut(moi, "dossiers.lire")}
        />
      ) : introuvable ? (
        <LectureEchouee
          titre="Cette option est introuvable"
          message="L’identifiant ne désigne aucune option — ou elle appartient à l’autre monde (test ou réel)."
        />
      ) : (
        <LectureEchouee />
      )}
    </div>
  );
}
