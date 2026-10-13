import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "cn";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { AnnuaireHubs, FiltresAnnuaireHubs } from "@/components/logistique/AnnuaireHubs";
import { FiltresListeColivraisons } from "@/components/logistique/FiltresColivraisons";
import { FiltresListeTrajets } from "@/components/logistique/FiltresTrajets";
import { GestePoserHub } from "@/components/logistique/FormulairePoint";
import { ListeCandidatures } from "@/components/logistique/ListeCandidatures";
import { ListeColivraisons } from "@/components/logistique/ListeColivraisons";
import { ListeHubs } from "@/components/logistique/ListeHubs";
import { ListeTrajets } from "@/components/logistique/ListeTrajets";
import { peut } from "@/lib/equipe/types";
import {
  compterColivraisons,
  compterHubs,
  compterTrajets,
  listerCandidaturesRelais,
  listerColivraisons,
  listerHubs,
  listerTrajets,
} from "@/lib/logistique/lectures";
import {
  FILTRES_COLIVRAISON,
  FILTRES_HUB,
  FILTRES_TRAJET,
  type Colivraison,
  type CompteursColivraisons,
  type CompteursHubs,
  type CompteursTrajets,
  type FiltreColivraison,
  type FiltreHub,
  type FiltreTrajet,
  type FiltresHubs,
  type Hub,
  type Trajet,
} from "@/lib/logistique/types";
import { rubriqueObligatoire } from "@/lib/navigation";

const rubrique = rubriqueObligatoire("/h2h-logistic");
export const metadata: Metadata = { title: rubrique.titre };

type Onglet = "colivraisons" | "trajets" | "points" | "relais";
const ONGLETS: { id: Onglet; libelle: string }[] = [
  { id: "colivraisons", libelle: "Co-livraisons" },
  { id: "trajets", libelle: "Trajets" },
  { id: "points", libelle: "Points de rendez-vous" },
  { id: "relais", libelle: "Candidatures relais" },
];

type Params = Record<string, string | string[] | undefined>;
const texte = (v: string | string[] | undefined) => (typeof v === "string" ? v.trim() : "");

/** Les filtres d'une liste lus dans l'adresse ; une valeur inconnue est ignorée, pas transmise. */
function lireFiltres<F extends string>(p: Params, connus: F[], testPermis: boolean) {
  const filtre = texte(p.filtre);
  const q = texte(p.q).slice(0, 80);
  return {
    filtre: (connus as string[]).includes(filtre) ? (filtre as F) : null,
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
 * - Les trajets (§ 12.2) : la liste, ses compteurs, et pour chacun son corridor,
 *   ses points, sa capacité, son prochain passage, et où il en est pour de
 *   nouvelles propositions. La fiche d'un trajet porte ses passages, ses
 *   co-livraisons, ce qui l'écarte des recherches ouvertes, et la suspension de
 *   ses nouvelles propositions.
 * - Les points de rendez-vous (§ 12.4) : l'annuaire entier — son état, ses
 *   signalements, ce qui y passe —, poser un point, et la fiche d'un point : le
 *   valider, le corriger tant que rien n'y est en cours, le fermer aux nouvelles
 *   recherches, le rouvrir. Les épingles à regarder en sont un filtre, avec leurs
 *   gestes sur la ligne.
 * - Les candidatures relais, reprises de l'écran mobile du support (P0b).
 *
 * ⚠️ LES RECHERCHES DE COTRANSPORTEURS SE SUIVENT DANS L'ACTIVITÉ EN DIRECT ET
 * LEUR FICHE. EXAMINER UN SIGNALEMENT ET LES INCIDENTS ARRIVENT AVEC LA SUITE DE
 * LA PHASE 4. Cette page dit ce qu'elle fait, pas davantage.
 */
export default async function PageLogistique({ searchParams }: { searchParams: Promise<Params> }) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const p = await searchParams;
  const onglet: Onglet = ONGLETS.find((o) => o.id === p.onglet)?.id ?? "colivraisons";
  const f = lireFiltres<FiltreColivraison>(p, FILTRES_COLIVRAISON, !moi.est_test);
  const ft = lireFiltres<FiltreTrajet>(p, FILTRES_TRAJET, !moi.est_test);
  // ⚠️ L'ANNUAIRE N'A PAS DE MONDE DU TEST : chaque point est réel.
  const fh: FiltresHubs = { ...lireFiltres<FiltreHub>(p, FILTRES_HUB, false), test: false };

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let donnees:
    | { onglet: "colivraisons"; colivraisons: Colivraison[]; compteurs: CompteursColivraisons | null }
    | { onglet: "trajets"; trajets: Trajet[]; compteurs: CompteursTrajets | null }
    | { onglet: "points"; hubs: Hub[]; compteurs: CompteursHubs | null }
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
    } else if (onglet === "trajets") {
      const trajets = await listerTrajets(ft);
      let compteurs: CompteursTrajets | null;
      try {
        compteurs = await compterTrajets(ft);
      } catch {
        compteurs = null;
      }
      donnees = { onglet, trajets, compteurs };
    } else if (onglet === "points") {
      const hubs = await listerHubs(fh);
      let compteurs: CompteursHubs | null;
      try {
        compteurs = await compterHubs(fh);
      } catch {
        compteurs = null;
      }
      donnees = { onglet, hubs, compteurs };
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
    ) : donnees.onglet === "trajets" ? (
      <ListeTrajets trajets={donnees.trajets} filtree={Boolean(ft.filtre || ft.q)} lienCompte={peut(moi, "utilisateurs.lire")} />
    ) : donnees.onglet === "points" ? (
      // Les épingles à regarder gardent leurs gestes sur la ligne ; le reste de l'annuaire s'ouvre par sa fiche.
      fh.filtre === "a_valider" ? (
        <ListeHubs hubs={donnees.hubs} peutGerer={peutGerer && !moi.est_test} filtree={Boolean(fh.q)} />
      ) : (
        <AnnuaireHubs hubs={donnees.hubs} filtree={Boolean(fh.filtre || fh.q)} />
      )
    ) : donnees.onglet === "relais" ? (
      <ListeCandidatures candidatures={donnees.candidatures} peutGerer={peutGerer} />
    ) : (
      <LectureEchouee />
    );

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <p className="text-corps text-muted-foreground">
        Suivez les co-livraisons et les trajets, tenez l’annuaire des points de rendez-vous et tranchez les candidatures
        relais. Les recherches de cotransporteurs se suivent dans l’Activité en direct ; examiner un signalement et les
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
      {onglet === "trajets" && (
        <FiltresListeTrajets
          f={ft}
          compteurs={donnees.onglet === "trajets" ? donnees.compteurs : null}
          testVisible={!moi.est_test}
        />
      )}
      {onglet === "points" && (
        <>
          {/* « Créer » : une épingle, jamais un point publié. Ni un lecteur ni l'instance de test n'en posent. */}
          {peutGerer && !moi.est_test && (
            <div className="flex justify-end">
              <GestePoserHub />
            </div>
          )}
          <FiltresAnnuaireHubs f={fh} compteurs={donnees.onglet === "points" ? donnees.compteurs : null} />
        </>
      )}
      {contenu}
    </div>
  );
}
