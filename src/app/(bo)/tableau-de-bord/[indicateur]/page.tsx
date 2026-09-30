import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { FiltresPeriode } from "@/components/tableau/FiltresPeriode";
import { LignesIndicateur } from "@/components/tableau/LignesIndicateur";
import { aujourdhuiParis, dateHeure } from "@/lib/dates";
import { RefusBO } from "@/lib/db/rpc";
import { peut } from "@/lib/equipe/types";
import { rubriqueObligatoire } from "@/lib/navigation";
import { lireDetailIndicateur } from "@/lib/tableau/lectures";
import { adresseTableau, lireFiltres } from "@/lib/tableau/periodes";
import type { DetailIndicateur } from "@/lib/tableau/types";

const rubrique = rubriqueObligatoire("/tableau-de-bord");
export const metadata: Metadata = { title: rubrique.titre };

type Params = Record<string, string | string[] | undefined>;

/**
 * Ce qui compose un chiffre du tableau de bord (§3) : les lignes que la base a
 * comptées pour cet indicateur, sur la même période.
 *
 * 🔴 LIRE LE CHIFFRE NE SUFFIT PAS POUR LIRE SES LIGNES : la base exige, en plus,
 * la permission de la rubrique qu'elles concernent (les comptes pour
 * « Utilisateurs », les paiements pour « Revenus »…). Un refus se dit tel quel.
 */
export default async function PageIndicateur({
  params,
  searchParams,
}: {
  params: Promise<{ indicateur: string }>;
  searchParams: Promise<Params>;
}) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const code = decodeURIComponent((await params).indicateur);
  const f = lireFiltres(await searchParams, !moi.est_test);
  const aujourdhui = aujourdhuiParis();

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let detail: DetailIndicateur | null = null;
  let refus: { indice: string | null; message: string } | null = null;
  // Un code qui n'a pas la forme d'un indicateur n'est pas envoyé à la base.
  if (/^[a-z_]{1,60}$/.test(code)) {
    try {
      detail = await lireDetailIndicateur(code, f);
    } catch (e) {
      refus = e instanceof RefusBO ? { indice: e.indice, message: e.message } : { indice: "BO_PANNE", message: "" };
    }
  } else {
    refus = { indice: "BO_INTROUVABLE", message: "" };
  }

  const retour = (
    <Link
      href={adresseTableau(detail ? { du: detail.periode.du, au: detail.periode.au, test: f.test } : f)}
      className="inline-flex w-fit items-center gap-1.5 text-legende font-semibold text-h2h-primary hover:underline"
    >
      <ArrowLeft className="size-3.5" />
      Tableau de bord
    </Link>
  );

  if (!detail) {
    return (
      <div className="mx-auto grid max-w-7xl gap-6">
        {retour}
        {refus?.indice === "BO_PERMISSION" ? (
          <div className="flex items-start gap-3 rounded-xl border border-dashed p-4 text-corps text-muted-foreground">
            <Lock className="mt-0.5 size-4 shrink-0" />
            <p>
              Votre rôle lit ce chiffre, pas ce qui le compose : ses lignes demandent l’accès à la rubrique qu’elles
              concernent. La Direction attribue les rôles.
            </p>
          </div>
        ) : refus?.indice === "BO_INTROUVABLE" ? (
          <LectureEchouee titre="Cet indicateur n’existe pas, ou pas encore" message="Revenez au tableau de bord pour choisir un indicateur." />
        ) : refus?.indice === "BO_PERIODE" ? (
          <>
            <FiltresPeriode f={f} periode={null} aujourdhui={aujourdhui} testVisible={!moi.est_test} indicateur={code} />
            <LectureEchouee
              titre="Cette période ne se lit pas"
              message={`${refus.message.charAt(0).toUpperCase()}${refus.message.slice(1)}.`}
            />
          </>
        ) : (
          <LectureEchouee />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      {retour}
      {/* Un instant se lit à la lecture : choisir une période n'y changerait rien. */}
      {detail.indicateur.portee === "periode" && (
        <FiltresPeriode
          f={f}
          periode={detail.periode}
          aujourdhui={aujourdhui}
          testVisible={!moi.est_test}
          indicateur={code}
        />
      )}
      <LignesIndicateur
        detail={detail}
        peutOuvrirFiche={peut(moi, "activite.lire")}
        peutOuvrirAnnonce={peut(moi, "annonces.lire")}
      />
      <p className="text-legende text-muted-foreground">Lu le {dateHeure(detail.lu_le)}.</p>
    </div>
  );
}
