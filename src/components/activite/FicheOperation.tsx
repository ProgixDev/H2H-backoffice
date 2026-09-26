"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { QuatreQuestions } from "@/components/bo/QuatreQuestions";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { ActionsTicket } from "@/components/operations/ActionsTicket";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { euros } from "@/lib/litiges/types";
import { LIBELLE_SERVICE, LIBELLE_TYPE, type Operation, type ReponseEvenements } from "@/lib/activite/types";
import { cheminFiche } from "@/lib/operations/types";
import { lireActivite } from "./commun";
import { FilEvenements } from "./FilEvenements";

/**
 * Une opération, ouverte depuis la liste : les quatre questions (§1), puis la
 * chronologie. Tant qu'elle est ouverte, la liste derrière ne bouge pas.
 *
 * ⚠️ LES ACTIONS SENSIBLES NE SE FONT PAS ICI (§4) : elles passent par la fiche
 * complète. D'ici, on l'ouvre, on crée un ticket ou on prend le dossier.
 */
export function FicheOperation({
  operation: o,
  inclureTest,
  peutTraiter,
  maintenant,
  surFermeture,
}: {
  operation: Operation | null;
  inclureTest: boolean;
  peutTraiter: boolean;
  maintenant: number;
  surFermeture: () => void;
}) {
  const chrono = useQuery({
    queryKey: ["activite-chronologie", o?.objet_id, inclureTest],
    queryFn: ({ signal }) =>
      lireActivite<ReponseEvenements>(
        new URLSearchParams({ vue: "evenements", objet: o!.objet_id, test: String(inclureTest) }),
        signal,
      ),
    // Un travail planifié n'a pas de chronologie d'événements : son journal est dans l'onglet des travaux.
    enabled: o !== null && o.objet_table !== "taches",
    refetchInterval: 15_000,
  });
  const avecFiche = o !== null && o.objet_table !== "taches";

  return (
    <Sheet open={o !== null} onOpenChange={(ouvert) => !ouvert && surFermeture()}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-lg">
        {o && (
          <>
            <SheetHeader className="border-b">
              <SheetTitle className="flex flex-wrap items-center gap-2 pr-8">
                {LIBELLE_TYPE[o.type] ?? o.type} {o.ref}
                {o.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
              </SheetTitle>
              <SheetDescription>
                {LIBELLE_SERVICE[o.service]}
                {o.bien_titre ? ` · ${o.bien_titre}` : ""}
                {o.montant_cents !== null ? ` · ${euros(o.montant_cents)}` : ""}
              </SheetDescription>
            </SheetHeader>

            <div className="grid gap-3 p-4">
              <QuatreQuestions operation={o} participants={o.participants} maintenant={maintenant} />

              {avecFiche && peutTraiter ? (
                <ActionsTicket key={o.objet_id} o={o}>
                  <OuvrirFiche reference={o.ref} />
                </ActionsTicket>
              ) : (
                <div className="grid gap-2">
                  {avecFiche && (
                    <div>
                      <OuvrirFiche reference={o.ref} />
                    </div>
                  )}
                  {!peutTraiter && (
                    <p className="text-legende text-muted-foreground">Votre rôle permet de lire, pas de traiter.</p>
                  )}
                </div>
              )}

              <h3 className="mt-2 text-h3 font-semibold">Chronologie</h3>
              {o.objet_table === "taches" ? (
                <p className="text-corps text-muted-foreground">
                  Les passages de ce travail et leurs erreurs sont dans l’onglet « Travaux automatiques ».
                </p>
              ) : chrono.isPending ? (
                <div className="grid gap-2">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </div>
              ) : chrono.isError && !chrono.data ? (
                <LectureEchouee message={chrono.error.message} />
              ) : chrono.data.evenements.length === 0 ? (
                <p className="text-corps text-muted-foreground">
                  Aucun changement d’état journalisé depuis la mise en service du journal (26/09/2026). La
                  chronologie complète, reconstituée depuis les dates de l’application, est dans la fiche.
                </p>
              ) : (
                <FilEvenements evenements={chrono.data.evenements} maintenant={maintenant} avecReference={false} />
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/** La fiche complète (§6) : tous les onglets, en pleine page. */
function OuvrirFiche({ reference }: { reference: string }) {
  return (
    <Button variant="outline" size="sm" asChild>
      <Link href={cheminFiche(reference)}>
        <FileText /> Ouvrir la fiche complète
      </Link>
    </Button>
  );
}
