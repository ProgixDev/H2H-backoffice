import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { FicheIncidentVue } from "@/components/logistique/FicheIncident";
import { RefusBO } from "@/lib/db/rpc";
import { lireIncident } from "@/lib/logistique/lectures";
import { adresseIncidents, type FicheIncident } from "@/lib/logistique/types";
import { rubriqueObligatoire } from "@/lib/navigation";

const rubrique = rubriqueObligatoire("/h2h-logistic");
export const metadata: Metadata = { title: rubrique.titre };

const IDENTIFIANT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * La fiche d'un incident de co-livraison (§ 12.5) : sa déclaration, les
 * tolérances et délais propres au cas, les présences déclarées, sa contestation,
 * ce que le protocole prévoit et ce qui a été exécuté, ce qu'il retient.
 *
 * ⚠️ EN LECTURE : la décision d'un incident arrive avec la suite du § 12.5. Le
 * refus du colis d'une co-livraison du § 5 s'examine déjà, dans l'onglet
 * Livraison de sa commande.
 */
export default async function PageIncident({ params }: { params: Promise<{ id: string }> }) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const id = decodeURIComponent((await params).id).trim();

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let fiche: FicheIncident | null = null;
  let introuvable = !IDENTIFIANT.test(id);
  if (!introuvable) {
    try {
      fiche = await lireIncident(id);
    } catch (e) {
      introuvable = e instanceof RefusBO && e.indice === "BO_INTROUVABLE";
    }
  }

  return (
    <div className="mx-auto grid max-w-[1400px] gap-4">
      <Link
        href={adresseIncidents({ filtre: null, formulaire: null, q: null, test: false })}
        className="inline-flex w-fit items-center gap-1.5 text-legende font-semibold text-h2h-primary hover:underline"
      >
        <ArrowLeft className="size-3.5" />
        Incidents
      </Link>
      {fiche ? (
        <FicheIncidentVue f={fiche} />
      ) : introuvable ? (
        <LectureEchouee
          titre="Cet incident est introuvable"
          message="L’identifiant ne désigne aucun incident de co-livraison — ou une contestation, qui se lit dans la fiche de l’incident qu’elle conteste."
        />
      ) : (
        <LectureEchouee />
      )}
    </div>
  );
}
