import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "cn";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { FondsAVerser } from "@/components/paiements/FondsAVerser";
import { OrdresFinanciers } from "@/components/paiements/OrdresFinanciers";
import { ReglementTransporteurs } from "@/components/paiements/ReglementTransporteurs";
import { peut } from "@/lib/equipe/types";
import { listerFondsAVerser, listerOrdres, listerTransporteursARegler } from "@/lib/paiements/lectures";
import { FILTRES_FONDS, STATUTS_ORDRE, type FiltreFonds, type StatutOrdre } from "@/lib/paiements/types";
import { rubriqueObligatoire } from "@/lib/navigation";

const rubrique = rubriqueObligatoire("/paiements-et-comptabilite");
export const metadata: Metadata = { title: rubrique.titre };

type Onglet = "fonds" | "remboursements" | "transporteurs";

/**
 * Paiements et comptabilité (§16).
 *
 * - « Fonds à verser » : ce que chaque vente doit à son vendeur et à son
 *   cotransporteur, versable ou retenu — et pourquoi (P2a). Les retenues de
 *   l'équipe s'y posent et s'y lèvent.
 * - « Remboursements » : les ordres financiers — demandés, validés par une
 *   seconde personne s'il le faut, exécutés par `stripe-ordres` (§16.5).
 * - « Transporteurs tiers » : le règlement des factures des transporteurs
 *   (procédure reprise de l'écran mobile du support, P0b).
 *
 * ⚠️ LES COMPENSATIONS, LE RAPPROCHEMENT AVEC STRIPE ET LES JUSTIFICATIFS
 * ARRIVENT AVEC LA SUITE DE LA PHASE 2a. Cette page dit ce qu'elle fait, pas
 * davantage.
 */
export default async function PagePaiements({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const p = await searchParams;
  const onglet: Onglet =
    p.onglet === "transporteurs" ? "transporteurs" : p.onglet === "remboursements" ? "remboursements" : "fonds";
  const filtre = FILTRES_FONDS.find((f) => f === p.etat) ?? null;
  const statut = STATUTS_ORDRE.find((s) => s === p.statut) ?? null;
  const onglets: { id: Onglet; libelle: string }[] = [
    { id: "fonds", libelle: "Fonds à verser" },
    { id: "remboursements", libelle: "Remboursements" },
    { id: "transporteurs", libelle: "Transporteurs tiers" },
  ];

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let donnees:
    | { onglet: "fonds"; lignes: Awaited<ReturnType<typeof listerFondsAVerser>>; filtre: FiltreFonds | null }
    | { onglet: "remboursements"; ordres: Awaited<ReturnType<typeof listerOrdres>>; statut: StatutOrdre | null }
    | { onglet: "transporteurs"; dus: Awaited<ReturnType<typeof listerTransporteursARegler>> }
    | { onglet: "echec" };
  try {
    donnees =
      onglet === "fonds"
        ? { onglet, lignes: await listerFondsAVerser(filtre), filtre }
        : onglet === "remboursements"
          ? { onglet, ordres: await listerOrdres(statut), statut }
          : { onglet, dus: await listerTransporteursARegler() };
  } catch {
    donnees = { onglet: "echec" };
  }

  const contenu =
    donnees.onglet === "fonds" ? (
      <FondsAVerser
        lignes={donnees.lignes}
        filtre={donnees.filtre}
        peutRetenir={peut(moi, "fonds.retenir")}
        peutLiberer={peut(moi, "fonds.liberer")}
      />
    ) : donnees.onglet === "remboursements" ? (
      <OrdresFinanciers ordres={donnees.ordres} filtre={donnees.statut} peutPreparer={peut(moi, "remboursements.preparer")} />
    ) : donnees.onglet === "transporteurs" ? (
      <ReglementTransporteurs dus={donnees.dus} peutRegler={peut(moi, "versements.gerer")} />
    ) : (
      <LectureEchouee />
    );

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <p className="text-corps text-muted-foreground">
        {onglet === "remboursements"
          ? "Chaque remboursement, de sa demande à son issue chez Stripe : demandé, en cours, réussi ou échoué. Au-delà de 100 € dans un litige, et toujours hors litige, une seconde personne valide avant tout envoi. Un ordre en échec se relance ou s’annule ; un ordre parti chez Stripe ne s’annule plus."
          : onglet === "fonds"
          ? "Ce que chaque vente doit à son vendeur et à son cotransporteur : versable, en attente, ou retenu — et par quoi. Une réclamation, une opposition bancaire, un incident de co-livraison ou une retenue de l’équipe suspendent le versement ; lever une retenue ne libère qu’elle."
          : "Enregistrez le règlement des factures des transporteurs tiers : cochez les commandes couvertes et nommez la facture."}
      </p>
      <nav className="flex gap-1 border-b" aria-label="Onglets">
        {onglets.map((o) => (
          <Link
            key={o.id}
            href={`/paiements-et-comptabilite?onglet=${o.id}`}
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
