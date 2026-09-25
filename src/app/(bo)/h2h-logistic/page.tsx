import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "cn";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { ListeCandidatures } from "@/components/logistique/ListeCandidatures";
import { ListeHubs } from "@/components/logistique/ListeHubs";
import { peut } from "@/lib/equipe/types";
import { listerCandidaturesRelais, listerHubsAValider } from "@/lib/logistique/lectures";
import { rubriqueObligatoire } from "@/lib/navigation";

const rubrique = rubriqueObligatoire("/h2h-logistic");
export const metadata: Metadata = { title: rubrique.titre };

type Onglet = "points" | "relais";

/**
 * H2H Logistic (§12) — les deux procédures reprises de l'écran mobile du support
 * (P0b) : l'annuaire des points de rendez-vous et les candidatures relais.
 *
 * ⚠️ LES RECHERCHES DE COTRANSPORTEURS, LES TRAJETS, LES CO-LIVRAISONS ET LES
 * INCIDENTS ARRIVENT AVEC LA PHASE 4, après la refonte §12.1 (phase 3). Cette
 * page dit ce qu'elle fait, pas davantage.
 */
export default async function PageLogistique({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const p = await searchParams;
  const onglet: Onglet = p.onglet === "relais" ? "relais" : "points";
  const onglets: { id: Onglet; libelle: string }[] = [
    { id: "points", libelle: "Points de rendez-vous" },
    { id: "relais", libelle: "Candidatures relais" },
  ];

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let donnees:
    | { onglet: "points"; hubs: Awaited<ReturnType<typeof listerHubsAValider>> }
    | { onglet: "relais"; candidatures: Awaited<ReturnType<typeof listerCandidaturesRelais>> }
    | { onglet: "echec" };
  try {
    donnees =
      onglet === "points"
        ? { onglet, hubs: await listerHubsAValider() }
        : { onglet, candidatures: await listerCandidaturesRelais() };
  } catch {
    donnees = { onglet: "echec" };
  }

  const peutGerer = peut(moi, "hubs.gerer");
  const contenu =
    donnees.onglet === "points" ? (
      <ListeHubs hubs={donnees.hubs} peutGerer={peutGerer} />
    ) : donnees.onglet === "relais" ? (
      <ListeCandidatures candidatures={donnees.candidatures} peutGerer={peutGerer} />
    ) : (
      <LectureEchouee />
    );

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <p className="text-corps text-muted-foreground">
        Validez les points de rendez-vous et tranchez les candidatures relais. Les recherches de
        cotransporteurs, les trajets, les co-livraisons et les incidents arriveront avec la phase 4.
      </p>
      <nav className="flex gap-1 border-b" aria-label="Onglets">
        {onglets.map((o) => (
          <Link
            key={o.id}
            href={`/h2h-logistic?onglet=${o.id}`}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-corps font-medium transition-colors",
              o.id === onglet
                ? "border-h2h-primary text-h2h-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {o.libelle}
          </Link>
        ))}
      </nav>
      {contenu}
    </div>
  );
}
