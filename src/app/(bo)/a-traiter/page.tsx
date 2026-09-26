import type { Metadata } from "next";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { FileATraiter } from "@/components/dossiers/FileATraiter";
import { peut } from "@/lib/equipe/types";
import { compterDossiers, listerDossiers } from "@/lib/dossiers/lectures";
import { filtresFileDepuis, type ReponseFile } from "@/lib/dossiers/types";
import { rubriqueObligatoire } from "@/lib/navigation";

const rubrique = rubriqueObligatoire("/a-traiter");
export const metadata: Metadata = { title: rubrique.titre };

/**
 * À traiter (§5) — la file de travail de l'équipe. Les dossiers naissent et se
 * closent tout seuls selon l'état des opérations ; l'équipe peut aussi en
 * ouvrir (« Créer un ticket »).
 */
export default async function PageATraiter({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const brut = await searchParams;
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(brut)) if (typeof v === "string") p.set(k, v);
  const f = filtresFileDepuis(p);
  const peutInclureTest = !moi.est_test;
  if (!peutInclureTest) f.inclureTest = false;

  // La clé que l'écran recalculera pour les mêmes filtres (même ordre de paramètres).
  const cle = new URLSearchParams({ perimetre: f.perimetre });
  if (f.categorie) cle.set("categorie", f.categorie);
  if (f.clos) cle.set("clos", "true");
  if (f.inclureTest) cle.set("test", "true");

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let initial: ReponseFile | null = null;
  try {
    const [compteurs, dossiers] = await Promise.all([compterDossiers(f), listerDossiers(f)]);
    initial = { compteurs, dossiers };
  } catch {
    initial = null;
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-4">
      <p className="text-corps text-muted-foreground">
        Ce qui attend l’équipe, rangé par urgence. Un dossier s’ouvre tout seul quand une opération attend le support,
        échoue ou dépasse son échéance, et se clôt quand elle n’attend plus personne.
      </p>
      <FileATraiter
        initial={initial}
        initialCle={cle.toString()}
        moi={moi.profil}
        peutTraiter={peut(moi, "dossiers.traiter")}
        peutInclureTest={peutInclureTest}
      />
    </div>
  );
}
