import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "cn";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { JournalAudit } from "@/components/equipe/JournalAudit";
import { ListeValidations } from "@/components/equipe/ListeValidations";
import { TableauEquipe } from "@/components/equipe/TableauEquipe";
import { listerEquipe, listerJournal, listerValidations } from "@/lib/equipe/lectures";
import { peut } from "@/lib/equipe/types";
import { rubriqueObligatoire } from "@/lib/navigation";

const rubrique = rubriqueObligatoire("/equipe-et-audit");
export const metadata: Metadata = { title: rubrique.titre };

type Onglet = "equipe" | "validations" | "journal";

/**
 * Équipe et journal d'audit (§2, §21) : qui a accès à quoi, ce qui attend une
 * seconde clé, et tout ce qui a été fait.
 *
 * ⚠️ CHAQUE ONGLET EXIGE SA PERMISSION, ET LA BASE AUSSI : l'équipe se lit
 * avec `equipe.lire`, le journal avec `journal.lire`. Une Finance voit le
 * journal sans voir l'équipe ; un Analyste ne voit ni l'un ni l'autre.
 */
export default async function PageEquipe({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const p = await searchParams;
  const un = (k: string) => (typeof p[k] === "string" ? (p[k] as string) : undefined);
  const voitEquipe = peut(moi, "equipe.lire");
  const voitJournal = peut(moi, "journal.lire");
  const onglets: { id: Onglet; libelle: string }[] = [
    ...(voitEquipe ? [{ id: "equipe" as const, libelle: "Équipe" }] : []),
    ...(voitEquipe ? [{ id: "validations" as const, libelle: "Validations" }] : []),
    ...(voitJournal ? [{ id: "journal" as const, libelle: "Journal d’audit" }] : []),
  ];
  const demande = un("onglet") as Onglet | undefined;
  const onglet: Onglet = onglets.some((o) => o.id === demande) ? (demande as Onglet) : onglets[0].id;

  // On LIT dans le try, on construit l'écran après : une erreur de rendu ne se
  // rattrape pas par un try/catch (règle `react-hooks/error-boundaries`).
  const filtres = { genre: un("genre"), action: un("action") };
  const avant = un("avant") ? Number(un("avant")) : undefined;
  let donnees:
    | { onglet: "equipe"; equipe: Awaited<ReturnType<typeof listerEquipe>> }
    | { onglet: "validations"; validations: Awaited<ReturnType<typeof listerValidations>> }
    | { onglet: "journal"; lignes: Awaited<ReturnType<typeof listerJournal>> }
    | { onglet: "echec" };
  try {
    donnees =
      onglet === "equipe"
        ? { onglet, equipe: await listerEquipe() }
        : onglet === "validations"
          ? { onglet, validations: await listerValidations() }
          : { onglet, lignes: await listerJournal(filtres, avant) };
  } catch {
    donnees = { onglet: "echec" };
  }

  const contenu =
    donnees.onglet === "equipe" ? (
      <TableauEquipe equipe={donnees.equipe} moi={moi.profil} peutGerer={peut(moi, "equipe.gerer")} />
    ) : donnees.onglet === "validations" ? (
      <ListeValidations validations={donnees.validations} />
    ) : donnees.onglet === "journal" ? (
      <JournalAudit lignes={donnees.lignes} filtres={filtres} />
    ) : (
      <LectureEchouee />
    );

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <nav className="flex gap-1 border-b" aria-label="Onglets">
        {onglets.map((o) => (
          <Link
            key={o.id}
            href={`/equipe-et-audit?onglet=${o.id}`}
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
