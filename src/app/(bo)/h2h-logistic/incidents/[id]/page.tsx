import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { FicheIncidentVue } from "@/components/logistique/FicheIncident";
import { FicheFermee } from "@/components/operations/FicheFermee";
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
 * ce que le protocole prévoit et ce qui a été exécuté, ce qu'il retient — et sa
 * décision : préparée par l'un, validée par un autre, depuis cette fiche.
 *
 * 🔴 QUI PREND PART À LA CO-LIVRAISON NE LIT PAS CETTE FICHE : la base la refuse
 * (`BO_CONFLIT`), comme la fiche de sa commande. L'écran dit pourquoi.
 * ⚠️ Le refus du colis d'une co-livraison du § 5 s'examine dans l'onglet
 * Livraison de sa commande.
 */
export default async function PageIncident({ params }: { params: Promise<{ id: string }> }) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const id = decodeURIComponent((await params).id).trim();

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let fiche: FicheIncident | null = null;
  let introuvable = !IDENTIFIANT.test(id);
  let reservee: string | null = null;
  if (!introuvable) {
    try {
      fiche = await lireIncident(id);
    } catch (e) {
      introuvable = e instanceof RefusBO && e.indice === "BO_INTROUVABLE";
      if (e instanceof RefusBO && e.indice === "BO_CONFLIT") reservee = e.message;
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
      ) : reservee ? (
        <FicheFermee titre="Fiche d’incident" message={reservee} />
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
