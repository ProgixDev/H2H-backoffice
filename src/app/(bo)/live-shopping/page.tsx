import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { FiltresLivesVue } from "@/components/lives/FiltresLives";
import { ListeLives } from "@/components/lives/ListeLives";
import { ListePlaces } from "@/components/lives/ListePlaces";
import { peut } from "@/lib/equipe/types";
import { compterLives, listerLives, listerPlaces } from "@/lib/lives/lectures";
import {
  ONGLETS_LIVE,
  adresseLives,
  type CompteursLives,
  type FiltresLives,
  type LiveLigne,
  type OngletLive,
  type PlaceLive,
} from "@/lib/lives/types";
import { rubriqueObligatoire } from "@/lib/navigation";

const rubrique = rubriqueObligatoire("/live-shopping");
export const metadata: Metadata = { title: rubrique.titre };

type Params = Record<string, string | string[] | undefined>;
const texte = (v: string | string[] | undefined) => (typeof v === "string" ? v.trim() : "");
const IDENTIFIANT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Les filtres lus dans l'adresse ; une valeur inconnue est ignorée, pas transmise. */
function lireFiltres(p: Params, testPermis: boolean): FiltresLives {
  const onglet = texte(p.zone);
  const live = texte(p.live);
  const q = texte(p.q).slice(0, 80);
  return {
    onglet: (ONGLETS_LIVE as string[]).includes(onglet) ? (onglet as OngletLive) : null,
    q: q || null,
    test: testPermis && texte(p.test) === "1",
    live: IDENTIFIANT.test(live) ? live : null,
  };
}

/**
 * Live Shopping (§14).
 *
 * - Les lives programmés, en direct, terminés, les rediffusions (R14.1) : le
 *   format, l'hôte, le moment du déroulé lu sur l'horloge du live, les
 *   articles, les accès et paiements encore ouverts, les places (R14.2).
 * - Les réservations et les accès (R14.3) : chaque place sous l'état du cahier
 *   des charges, et son accès — complet ou spectateur seulement.
 *
 * ⚠️ CETTE PAGE LIT. Autoriser ou refuser un live (D24), arrêter une
 * diffusion, retirer un article, désactiver une rediffusion : la suite de la
 * phase 5.
 */
export default async function PageLiveShopping({ searchParams }: { searchParams: Promise<Params> }) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const f = lireFiltres(await searchParams, !moi.est_test);

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let compteurs: CompteursLives | null;
  try {
    compteurs = await compterLives(f);
  } catch {
    compteurs = null;
  }

  const intro = (
    <p className="max-w-4xl text-corps text-muted-foreground">
      Les lives programmés, en direct et terminés, les rediffusions, les réservations et les accès. Le moment de chaque
      live se lit sur son horloge : l’introduction, chaque article — présentation, offres, choix de l’hôte, pause —, puis
      la conclusion. Pas de discussion publique en live : les spectateurs participent par des offres de prix.
    </p>
  );

  if (f.onglet === "reservations") {
    let places: PlaceLive[] | null;
    try {
      places = await listerPlaces(f);
    } catch {
      places = null;
    }
    return (
      <div className="mx-auto grid max-w-7xl gap-6">
        {intro}
        <FiltresLivesVue f={f} compteurs={compteurs} testVisible={!moi.est_test} />
        {f.live && (
          <Link
            href={adresseLives({ ...f, live: null })}
            className="inline-flex w-fit items-center gap-1.5 text-legende font-semibold text-h2h-primary hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            Les réservations de tous les lives à venir ou en direct
          </Link>
        )}
        {places === null ? <LectureEchouee /> : <ListePlaces places={places} unLive={Boolean(f.live)} />}
      </div>
    );
  }

  let lives: LiveLigne[] | null;
  try {
    lives = await listerLives(f, f.onglet);
  } catch {
    lives = null;
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      {intro}
      <FiltresLivesVue f={f} compteurs={compteurs} testVisible={!moi.est_test} />
      {lives === null ? (
        <LectureEchouee />
      ) : (
        <>
          <ListeLives
            lives={lives}
            filtree={Boolean(f.onglet || f.q)}
            lienCompte={peut(moi, "utilisateurs.lire")}
            peutTraiter={peut(moi, "dossiers.traiter")}
            vide={
              f.onglet === "rediffusions" && !f.q
                ? { titre: "Aucune rediffusion", texte: "L’application n’enregistre pas encore de rediffusion de live." }
                : undefined
            }
          />
          {lives.length >= 300 && (
            <p className="text-legende text-muted-foreground">
              Les 300 premiers sont affichés. Précisez la recherche ou la zone pour en lire d’autres.
            </p>
          )}
        </>
      )}
    </div>
  );
}
