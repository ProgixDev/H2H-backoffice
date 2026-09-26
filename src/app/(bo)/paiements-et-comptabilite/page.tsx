import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "cn";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { FondsAVerser } from "@/components/paiements/FondsAVerser";
import { ReglementTransporteurs } from "@/components/paiements/ReglementTransporteurs";
import { peut } from "@/lib/equipe/types";
import { listerFondsAVerser, listerTransporteursARegler } from "@/lib/paiements/lectures";
import { FILTRES_FONDS, type FiltreFonds } from "@/lib/paiements/types";
import { rubriqueObligatoire } from "@/lib/navigation";

const rubrique = rubriqueObligatoire("/paiements-et-comptabilite");
export const metadata: Metadata = { title: rubrique.titre };

type Onglet = "fonds" | "transporteurs";

/**
 * Paiements et comptabilité (§16).
 *
 * - « Fonds à verser » : ce que chaque vente doit à son vendeur et à son
 *   cotransporteur, versable ou retenu — et pourquoi (P2a). Les retenues de
 *   l'équipe s'y posent et s'y lèvent.
 * - « Transporteurs tiers » : le règlement des factures des transporteurs
 *   (procédure reprise de l'écran mobile du support, P0b).
 *
 * ⚠️ LES REMBOURSEMENTS HORS LITIGE, LES COMPENSATIONS, LE RAPPROCHEMENT AVEC
 * STRIPE ET LES JUSTIFICATIFS ARRIVENT AVEC LA SUITE DE LA PHASE 2a. Cette page
 * dit ce qu'elle fait, pas davantage.
 */
export default async function PagePaiements({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const p = await searchParams;
  const onglet: Onglet = p.onglet === "transporteurs" ? "transporteurs" : "fonds";
  const filtre = FILTRES_FONDS.find((f) => f === p.etat) ?? null;
  const onglets: { id: Onglet; libelle: string }[] = [
    { id: "fonds", libelle: "Fonds à verser" },
    { id: "transporteurs", libelle: "Transporteurs tiers" },
  ];

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let donnees:
    | { onglet: "fonds"; lignes: Awaited<ReturnType<typeof listerFondsAVerser>>; filtre: FiltreFonds | null }
    | { onglet: "transporteurs"; dus: Awaited<ReturnType<typeof listerTransporteursARegler>> }
    | { onglet: "echec" };
  try {
    donnees =
      onglet === "fonds"
        ? { onglet, lignes: await listerFondsAVerser(filtre), filtre }
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
    ) : donnees.onglet === "transporteurs" ? (
      <ReglementTransporteurs dus={donnees.dus} peutRegler={peut(moi, "versements.gerer")} />
    ) : (
      <LectureEchouee />
    );

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <p className="text-corps text-muted-foreground">
        {onglet === "fonds"
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
