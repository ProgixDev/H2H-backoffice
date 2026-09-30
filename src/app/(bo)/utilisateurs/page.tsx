import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "cn";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { FiltresComptes, ListeComptes } from "@/components/utilisateurs/ListeComptes";
import { ListeDemandesDeRole } from "@/components/utilisateurs/ListeDemandesDeRole";
import { ListeRecours } from "@/components/utilisateurs/ListeRecours";
import { RechercheParEmail } from "@/components/utilisateurs/RechercheParEmail";
import { peut } from "@/lib/equipe/types";
import { rubriqueObligatoire } from "@/lib/navigation";
import { listerComptes, listerDemandesDeRole, listerRecours } from "@/lib/utilisateurs/lectures";
import {
  FILTRES_COMPTES,
  FILTRES_RECOURS,
  type CompteListe,
  type DemandeRole,
  type FiltreComptes,
  type FiltreRecours,
  type FiltresComptes as Filtres,
  type RecoursListe,
} from "@/lib/utilisateurs/types";

const rubrique = rubriqueObligatoire("/utilisateurs");
export const metadata: Metadata = { title: rubrique.titre };

type Params = Record<string, string | string[] | undefined>;
const texte = (v: string | string[] | undefined) => (typeof v === "string" ? v.trim() : "");

/** Les filtres lus dans l'adresse ; une valeur inconnue est ignorée, pas transmise. */
function lireFiltres(p: Params, testPermis: boolean): Filtres {
  const filtre = texte(p.filtre);
  const q = texte(p.q).slice(0, 80);
  return {
    q: q || null,
    filtre: (FILTRES_COMPTES as readonly string[]).includes(filtre) ? (filtre as FiltreComptes) : null,
    test: testPermis && texte(p.test) === "1",
  };
}

/**
 * Utilisateurs (§8).
 *
 * - « Comptes » : la liste des comptes clients, cherchée par pseudonyme, ville
 *   ou identifiant ; chaque ligne ouvre la fiche du compte. Un e-mail se
 *   cherche à part, par une consultation inscrite au journal.
 * - « Demandes de rôle » : la procédure reprise de l'écran mobile du support
 *   (P0b) — trancher les demandes pour devenir vendeur, cotransporteur
 *   particulier ou point relais.
 * - « Recours » : les recours que les personnes déposent depuis l'application
 *   contre une décision de l'équipe. Chacun s'examine sur la fiche du compte.
 *
 * Avertir, restreindre, suspendre et lever se font depuis la fiche d'un compte.
 */
export default async function PageUtilisateurs({ searchParams }: { searchParams: Promise<Params> }) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const p = await searchParams;
  const vue = texte(p.vue) === "demandes" ? "demandes" : texte(p.vue) === "recours" ? "recours" : "comptes";
  const f = lireFiltres(p, !moi.est_test);
  const statut = texte(p.statut);
  const filtreRecours: FiltreRecours = (FILTRES_RECOURS as readonly string[]).includes(statut)
    ? (statut as FiltreRecours)
    : "a_examiner";

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  // Les demandes se lisent dans les deux vues : leur nombre se dit sur l'onglet.
  // Les recours qui attendent se lisent aussi dans toutes les vues : leur nombre se dit sur l'onglet.
  let demandes: DemandeRole[] | null;
  let comptes: CompteListe[] | null = null;
  let aExaminer: RecoursListe[] | null;
  let recours: RecoursListe[] | null = null;
  try {
    demandes = await listerDemandesDeRole();
  } catch {
    demandes = null;
  }
  try {
    aExaminer = await listerRecours("a_examiner", f.test);
  } catch {
    aExaminer = null;
  }
  if (vue === "recours") {
    try {
      recours = filtreRecours === "a_examiner" ? aExaminer : await listerRecours(filtreRecours, f.test);
    } catch {
      recours = null;
    }
  }
  if (vue === "comptes") {
    try {
      comptes = await listerComptes(f);
    } catch {
      comptes = null;
    }
  }

  const vues = [
    { code: "comptes", libelle: "Comptes", chemin: "/utilisateurs" },
    {
      code: "demandes",
      libelle: demandes && demandes.length > 0 ? `Demandes de rôle (${demandes.length})` : "Demandes de rôle",
      chemin: "/utilisateurs?vue=demandes",
    },
    {
      code: "recours",
      libelle: aExaminer && aExaminer.length > 0 ? `Recours (${aExaminer.length})` : "Recours",
      chemin: "/utilisateurs?vue=recours",
    },
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
              v.code === vue ? "border-h2h-primary text-h2h-primary" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {v.libelle}
          </Link>
        ))}
      </nav>

      {vue === "recours" ? (
        <>
          <p className="max-w-4xl text-corps text-muted-foreground">
            Les recours contre une décision de l’équipe, déposés par les personnes depuis l’application. Un autre membre
            de l’équipe que l’auteur de la décision les examine, sur la fiche du compte : accepté, la décision est
            annulée ; rejeté, elle est maintenue. La réponse part à la personne.
          </p>
          {recours === null ? (
            <LectureEchouee />
          ) : (
            <ListeRecours recours={recours} filtre={filtreRecours} test={f.test} />
          )}
        </>
      ) : vue === "demandes" ? (
        <>
          <p className="text-corps text-muted-foreground">
            Tranchez les demandes pour devenir vendeur, cotransporteur particulier ou point relais. Chaque décision
            demande un motif et une double authentification récente.
          </p>
          {demandes === null ? (
            <LectureEchouee />
          ) : (
            <ListeDemandesDeRole demandes={demandes} peutTrancher={peut(moi, "roles.trancher")} />
          )}
        </>
      ) : (
        <>
          <p className="max-w-4xl text-corps text-muted-foreground">
            Les comptes clients, les inscriptions les plus récentes d’abord. Cette liste ne porte que le pseudonyme :
            l’identité et les coordonnées se révèlent depuis la fiche, une à la fois, pour un motif.
          </p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <FiltresComptes f={f} testVisible={!moi.est_test} />
            </div>
            {peut(moi, "donnees.reveler") && <RechercheParEmail />}
          </div>
          {comptes === null ? (
            <LectureEchouee />
          ) : (
            <>
              <ListeComptes comptes={comptes} filtree={Boolean(f.q || f.filtre)} />
              {comptes.length >= 300 && (
                <p className="text-legende text-muted-foreground">
                  Les 300 comptes les plus récents sont affichés. Précisez la recherche ou le filtre pour en lire d’autres.
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
