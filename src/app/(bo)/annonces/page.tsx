import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "cn";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { FiltresListe, ListeAnnonces } from "@/components/annonces/ListeAnnonces";
import { listerAnnonces, listerCategories } from "@/lib/annonces/lectures";
import {
  FILTRES_ANNONCES,
  FILTRES_RECHERCHES,
  adresseAnnonces,
  type AnnonceListe,
  type CategorieFiltre,
  type FiltreAnnonces,
  type FiltreRecherches,
  type FiltresAnnonces,
} from "@/lib/annonces/types";
import { peut } from "@/lib/equipe/types";
import { rubriqueObligatoire } from "@/lib/navigation";

const rubrique = rubriqueObligatoire("/annonces");
export const metadata: Metadata = { title: rubrique.titre };

type Params = Record<string, string | string[] | undefined>;
const texte = (v: string | string[] | undefined) => (typeof v === "string" ? v.trim() : "");

/** Les filtres lus dans l'adresse ; une valeur inconnue est ignorée, pas transmise. */
function lireFiltres(p: Params, testPermis: boolean): FiltresAnnonces {
  const vue = texte(p.vue) === "recherches" ? "recherches" : "annonces";
  const filtre = texte(p.filtre);
  const permis = (vue === "recherches" ? FILTRES_RECHERCHES : FILTRES_ANNONCES) as readonly string[];
  const q = texte(p.q).slice(0, 80);
  const categorie = texte(p.categorie).slice(0, 60);
  return {
    vue,
    q: q || null,
    filtre: permis.includes(filtre) ? (filtre as FiltreAnnonces | FiltreRecherches) : null,
    categorie: /^[a-z0-9_-]+$/i.test(categorie) ? categorie : null,
    test: testPermis && texte(p.test) === "1",
  };
}

/**
 * Annonces Marketplace (§9).
 *
 * - « Annonces » : ce qui est publié — ou en brouillon, réservé, vendu, expiré —,
 *   cherché par titre, ville, pseudonyme ou identifiant, par statut, par type,
 *   par catégorie. Chaque ligne ouvre la fiche : ce que l'acheteur voit, ce que
 *   la base permet, les transactions avec leur propre état.
 * - « Je cherche » : les recherches des acheteurs.
 *
 * ⚠️ CETTE PAGE LIT. Masquer, retirer, demander une correction, autoriser ou
 * refuser une publication : la suite de la phase 2b.
 */
export default async function PageAnnonces({ searchParams }: { searchParams: Promise<Params> }) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const f = lireFiltres(await searchParams, !moi.est_test);

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let annonces: AnnonceListe[] | null;
  let categories: CategorieFiltre[] | null;
  try {
    annonces = await listerAnnonces(f);
  } catch {
    annonces = null;
  }
  try {
    categories = await listerCategories();
  } catch {
    categories = null;
  }

  const vues = [
    { code: "annonces", libelle: "Annonces", chemin: adresseAnnonces({ ...f, vue: "annonces", filtre: null }) },
    { code: "recherches", libelle: "Je cherche", chemin: adresseAnnonces({ ...f, vue: "recherches", filtre: null }) },
  ];

  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      <nav className="flex gap-1 border-b" aria-label="Vues">
        {vues.map((v) => (
          <Link
            key={v.code}
            href={v.chemin}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-corps font-medium transition-colors",
              v.code === f.vue ? "border-h2h-primary text-h2h-primary" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {v.libelle}
          </Link>
        ))}
      </nav>
      <p className="max-w-4xl text-corps text-muted-foreground">
        {f.vue === "recherches"
          ? "Les recherches « Je cherche » des acheteurs : leur budget, leur échéance, les annonces qu’on leur a proposées."
          : "Les annonces, les plus récentes d’abord. Le statut d’une annonce dit si elle se montre ; l’état de ses transactions se lit dans sa fiche, à part."}
      </p>
      <FiltresListe f={f} categories={categories} testVisible={!moi.est_test} />
      {annonces === null ? (
        <LectureEchouee />
      ) : (
        <>
          <ListeAnnonces
            annonces={annonces}
            filtree={Boolean(f.q || f.filtre || f.categorie)}
            lienCompte={peut(moi, "utilisateurs.lire")}
          />
          {annonces.length >= 300 && (
            <p className="text-legende text-muted-foreground">
              Les 300 plus récentes sont affichées. Précisez la recherche ou le filtre pour en lire d’autres.
            </p>
          )}
        </>
      )}
    </div>
  );
}
