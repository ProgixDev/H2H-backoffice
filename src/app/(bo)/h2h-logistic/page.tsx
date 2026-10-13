import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "cn";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { FiltresListeColivraisons } from "@/components/logistique/FiltresColivraisons";
import { ListeCandidatures } from "@/components/logistique/ListeCandidatures";
import { ListeColivraisons } from "@/components/logistique/ListeColivraisons";
import { ListeHubs } from "@/components/logistique/ListeHubs";
import { peut } from "@/lib/equipe/types";
import {
  compterColivraisons,
  listerCandidaturesRelais,
  listerColivraisons,
  listerHubsAValider,
} from "@/lib/logistique/lectures";
import {
  FILTRES_COLIVRAISON,
  type Colivraison,
  type CompteursColivraisons,
  type FiltreColivraison,
  type FiltresColivraisons,
} from "@/lib/logistique/types";
import { rubriqueObligatoire } from "@/lib/navigation";

const rubrique = rubriqueObligatoire("/h2h-logistic");
export const metadata: Metadata = { title: rubrique.titre };

type Onglet = "colivraisons" | "points" | "relais";
const ONGLETS: { id: Onglet; libelle: string }[] = [
  { id: "colivraisons", libelle: "Co-livraisons" },
  { id: "points", libelle: "Points de rendez-vous" },
  { id: "relais", libelle: "Candidatures relais" },
];

type Params = Record<string, string | string[] | undefined>;
const texte = (v: string | string[] | undefined) => (typeof v === "string" ? v.trim() : "");

/** Les filtres des co-livraisons lus dans l'adresse ; une valeur inconnue est ignorée, pas transmise. */
function lireFiltres(p: Params, testPermis: boolean): FiltresColivraisons {
  const filtre = texte(p.filtre);
  const q = texte(p.q).slice(0, 80);
  return {
    filtre: (FILTRES_COLIVRAISON as string[]).includes(filtre) ? (filtre as FiltreColivraison) : null,
    q: q || null,
    test: testPermis && texte(p.test) === "1",
  };
}

/**
 * H2H Logistic (§12).
 *
 * - Les co-livraisons (§ 12.3) : la liste, ses compteurs — qui comptent ce que la
 *   liste montre —, et pour chacune ses participants, ses rendez-vous, qui
 *   détient le colis, la prochaine action, ses incidents ouverts. La fiche de
 *   l'opération porte le détail : présences, scans, ce qu'un incident retient.
 * - Les deux procédures reprises de l'écran mobile du support (P0b) : l'annuaire
 *   des points de rendez-vous et les candidatures relais.
 *
 * ⚠️ LES RECHERCHES DE COTRANSPORTEURS SE SUIVENT DANS L'ACTIVITÉ EN DIRECT ET
 * LEUR FICHE. LES TRAJETS, LA GESTION DES POINTS DE RENDEZ-VOUS ET LES INCIDENTS
 * ARRIVENT AVEC LA SUITE DE LA PHASE 4. Cette page dit ce qu'elle fait, pas
 * davantage.
 */
export default async function PageLogistique({ searchParams }: { searchParams: Promise<Params> }) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const p = await searchParams;
  const onglet: Onglet = p.onglet === "relais" ? "relais" : p.onglet === "points" ? "points" : "colivraisons";
  const f = lireFiltres(p, !moi.est_test);

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let donnees:
    | { onglet: "colivraisons"; colivraisons: Colivraison[]; compteurs: CompteursColivraisons | null }
    | { onglet: "points"; hubs: Awaited<ReturnType<typeof listerHubsAValider>> }
    | { onglet: "relais"; candidatures: Awaited<ReturnType<typeof listerCandidaturesRelais>> }
    | { onglet: "echec" };
  try {
    if (onglet === "colivraisons") {
      const colivraisons = await listerColivraisons(f);
      // ⚠️ DES COMPTEURS ILLISIBLES NE CACHENT PAS LA LISTE : les pastilles s'affichent alors sans leur nombre.
      let compteurs: CompteursColivraisons | null;
      try {
        compteurs = await compterColivraisons(f);
      } catch {
        compteurs = null;
      }
      donnees = { onglet, colivraisons, compteurs };
    } else if (onglet === "points") {
      donnees = { onglet, hubs: await listerHubsAValider() };
    } else {
      donnees = { onglet, candidatures: await listerCandidaturesRelais() };
    }
  } catch {
    donnees = { onglet: "echec" };
  }

  const peutGerer = peut(moi, "hubs.gerer");
  const contenu =
    donnees.onglet === "colivraisons" ? (
      <ListeColivraisons colivraisons={donnees.colivraisons} filtree={Boolean(f.filtre || f.q)} />
    ) : donnees.onglet === "points" ? (
      <ListeHubs hubs={donnees.hubs} peutGerer={peutGerer} />
    ) : donnees.onglet === "relais" ? (
      <ListeCandidatures candidatures={donnees.candidatures} peutGerer={peutGerer} />
    ) : (
      <LectureEchouee />
    );

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <p className="text-corps text-muted-foreground">
        Suivez les co-livraisons, validez les points de rendez-vous et tranchez les candidatures relais. Les recherches de
        cotransporteurs se suivent dans l’Activité en direct ; les trajets, la gestion des points de rendez-vous et les
        incidents arriveront avec la suite de la phase 4.
      </p>
      <nav className="flex gap-1 border-b" aria-label="Onglets">
        {ONGLETS.map((o) => (
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
      {onglet === "colivraisons" && (
        <FiltresListeColivraisons
          f={f}
          compteurs={donnees.onglet === "colivraisons" ? donnees.compteurs : null}
          testVisible={!moi.est_test}
        />
      )}
      {contenu}
    </div>
  );
}
