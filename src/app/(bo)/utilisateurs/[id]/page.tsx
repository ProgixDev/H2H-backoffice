import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { FicheCompte } from "@/components/utilisateurs/FicheCompte";
import { RefusBO } from "@/lib/db/rpc";
import { peut } from "@/lib/equipe/types";
import { rubriqueObligatoire } from "@/lib/navigation";
import { lireCompte } from "@/lib/utilisateurs/lectures";
import type { FicheCompte as Fiche } from "@/lib/utilisateurs/types";

const rubrique = rubriqueObligatoire("/utilisateurs");
export const metadata: Metadata = { title: rubrique.titre };

const IDENTIFIANT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * La fiche d'un compte (§8), à son adresse : son identifiant permanent.
 *
 * ⚠️ UN COMPTE DE L'ÉQUIPE, UN COMPTE DE L'AUTRE MONDE (test ou réel) OU UN
 * IDENTIFIANT INCONNU donnent la même réponse : « introuvable ». La base ne dit
 * pas lequel, et la page non plus.
 */
export default async function PageCompte({ params }: { params: Promise<{ id: string }> }) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const id = decodeURIComponent((await params).id).trim();

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let fiche: Fiche | null = null;
  let introuvable = !IDENTIFIANT.test(id);
  if (!introuvable) {
    try {
      fiche = await lireCompte(id);
    } catch (e) {
      introuvable = e instanceof RefusBO && e.indice === "BO_INTROUVABLE";
    }
  }

  return (
    <div className="mx-auto grid max-w-[1400px] gap-4">
      <Link
        href="/utilisateurs"
        className="inline-flex w-fit items-center gap-1.5 text-legende font-semibold text-h2h-primary hover:underline"
      >
        <ArrowLeft className="size-3.5" />
        Utilisateurs
      </Link>
      {fiche ? (
        <FicheCompte f={fiche} peutReveler={peut(moi, "donnees.reveler")} peutOuvrirFiche={peut(moi, "activite.lire")} />
      ) : introuvable ? (
        <LectureEchouee
          titre="Ce compte est introuvable"
          message="L’identifiant ne désigne aucun compte client — ou il appartient à l’autre monde (test ou réel)."
        />
      ) : (
        <LectureEchouee />
      )}
    </div>
  );
}
