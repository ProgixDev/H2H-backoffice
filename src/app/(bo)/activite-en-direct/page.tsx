import type { Metadata } from "next";
import { ActiviteEnDirect } from "@/components/activite/ActiviteEnDirect";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { compterOperations, listerOperations } from "@/lib/activite/lectures";
import { filtresDepuis, type ReponseOperations } from "@/lib/activite/types";
import { peut } from "@/lib/equipe/types";
import { rubriqueObligatoire } from "@/lib/navigation";

const rubrique = rubriqueObligatoire("/activite-en-direct");
export const metadata: Metadata = { title: rubrique.titre };

/**
 * Activité en direct (§4) — le poste de supervision.
 *
 * La première lecture se fait ici, côté serveur, pour les filtres de
 * l'adresse ; l'écran prend ensuite le relais et relit toutes les quinze
 * secondes (`/api/activite`).
 */
export default async function PageActivite({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const brut = await searchParams;
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(brut)) if (typeof v === "string") p.set(k, v);
  const filtres = filtresDepuis(p);
  // Un équipier de test ne voit que le test : la base l'impose, l'écran ne propose pas l'inverse.
  const peutInclureTest = !moi.est_test;
  if (!peutInclureTest) filtres.inclureTest = false;

  // La clé que l'écran recalculera pour les mêmes filtres (même ordre de paramètres).
  const cle = new URLSearchParams();
  if (filtres.compteur) cle.set("compteur", filtres.compteur);
  if (filtres.service) cle.set("service", filtres.service);
  if (filtres.recherche) cle.set("q", filtres.recherche);
  if (filtres.termines) cle.set("termines", "true");
  if (filtres.inclureTest) cle.set("test", "true");

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  // Seule la vue « Opérations en cours » s'ouvre sur cette lecture : les autres lisent la leur.
  let initial: ReponseOperations | null = null;
  const vue = p.get("vue");
  if (!vue || vue === "operations") {
    try {
      const [compteurs, operations] = await Promise.all([
        compterOperations(filtres.inclureTest),
        listerOperations(filtres),
      ]);
      initial = { compteurs, operations };
    } catch {
      // L'écran relira lui-même, et dira l'échec s'il persiste.
      initial = null;
    }
  }

  return (
    <div className="mx-auto grid max-w-[1600px] gap-4">
      <p className="text-corps text-muted-foreground">
        Toutes les opérations en cours, relues toutes les quinze secondes. Cliquez un compteur pour filtrer la liste
        sur ce qu’il compte, une ligne pour voir qui doit agir, avant quand, et ce qui s’est passé.
      </p>
      <ActiviteEnDirect
        initial={initial}
        initialCle={cle.toString()}
        peutInclureTest={peutInclureTest}
        peutTraiter={peut(moi, "dossiers.traiter")}
      />
    </div>
  );
}
