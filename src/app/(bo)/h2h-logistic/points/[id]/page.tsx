import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { FicheHubVue } from "@/components/logistique/FicheHub";
import { RefusBO } from "@/lib/db/rpc";
import { lireHub } from "@/lib/logistique/lectures";
import { adresseHubs, type FicheHub } from "@/lib/logistique/types";
import { rubriqueObligatoire } from "@/lib/navigation";

const rubrique = rubriqueObligatoire("/h2h-logistic");
export const metadata: Metadata = { title: rubrique.titre };

const IDENTIFIANT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * La fiche d'un point de rendez-vous (§ 12.4) : sa localisation, son état, ses
 * signalements, les missions concernées, le motif de son indisponibilité — et
 * valider, fermer aux nouvelles recherches, rouvrir.
 */
export default async function PageHub({ params }: { params: Promise<{ id: string }> }) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const id = decodeURIComponent((await params).id).trim();

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let fiche: FicheHub | null = null;
  let introuvable = !IDENTIFIANT.test(id);
  if (!introuvable) {
    try {
      fiche = await lireHub(id);
    } catch (e) {
      introuvable = e instanceof RefusBO && e.indice === "BO_INTROUVABLE";
    }
  }

  return (
    <div className="mx-auto grid max-w-[1400px] gap-4">
      <Link
        href={adresseHubs({ filtre: null, q: null })}
        className="inline-flex w-fit items-center gap-1.5 text-legende font-semibold text-h2h-primary hover:underline"
      >
        <ArrowLeft className="size-3.5" />
        Points de rendez-vous
      </Link>
      {fiche ? (
        <FicheHubVue f={fiche} />
      ) : introuvable ? (
        <LectureEchouee
          titre="Ce point de rendez-vous est introuvable"
          message="L’identifiant ne désigne aucun point de l’annuaire."
        />
      ) : (
        <LectureEchouee />
      )}
    </div>
  );
}
