"use client";

import { useQuery } from "@tanstack/react-query";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { euros } from "@/lib/litiges/types";
import { LIBELLE_ACTEUR, LIBELLE_SERVICE, LIBELLE_TYPE, type Operation, type ReponseEvenements } from "@/lib/activite/types";
import { lireActivite, tonEtape, TON_ALERTE } from "./commun";
import { Echeance } from "./Echeance";
import { FilEvenements } from "./FilEvenements";

const ROLE = { acheteur: "Acheteur", vendeur: "Vendeur", cotransporteur: "Cotransporteur" } as const;

function Question({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-1 rounded-xl border p-3">
      <h3 className="text-legende font-semibold text-muted-foreground">{titre}</h3>
      <div className="text-corps">{children}</div>
    </section>
  );
}

/**
 * Une opération, ouverte depuis la liste : les quatre questions (§1), puis la
 * chronologie. Tant qu'elle est ouverte, la liste derrière ne bouge pas.
 *
 * ⚠️ LES ACTIONS SENSIBLES NE SE FONT PAS ICI (§4) : elles passent par la fiche
 * complète, qui arrive avec la tranche suivante. Les boutons le disent.
 */
export function FicheOperation({
  operation: o,
  inclureTest,
  maintenant,
  surFermeture,
}: {
  operation: Operation | null;
  inclureTest: boolean;
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
              <Question titre="Que se passe-t-il ?">
                <span className="flex flex-wrap items-center gap-2">
                  <StatutPastille ton={tonEtape(o)}>{o.etape_libelle}</StatutPastille>
                  {o.alerte && <StatutPastille ton={TON_ALERTE[o.alerte]}>{o.alerte_libelle}</StatutPastille>}
                </span>
                <p className="mt-1 text-muted-foreground">
                  {o.finance_libelle}
                  {o.localisation ? ` · ${o.localisation}` : ""}
                </p>
              </Question>
              <Question titre="Qui est concerné ?">
                <ul className="grid gap-0.5">
                  {o.participants.map((p) => (
                    <li key={p.role}>
                      <span className="text-muted-foreground">{ROLE[p.role]} :</span> {p.pseudo ?? "(compte effacé)"}
                    </li>
                  ))}
                </ul>
              </Question>
              <Question titre="Quelle action est attendue ?">
                {o.action_attendue ?? "Aucune : l’opération est terminée."}
                {o.acteur_attendu && <p className="text-muted-foreground">{LIBELLE_ACTEUR[o.acteur_attendu]}</p>}
              </Question>
              <Question titre="Avant quelle échéance ?">
                <Echeance iso={o.echeance} maintenant={maintenant} />
              </Question>

              <div className="flex flex-wrap gap-2">
                {["Ouvrir le dossier", "Créer un ticket", "M’attribuer le dossier"].map((a) => (
                  <Button key={a} variant="outline" size="sm" disabled>
                    {a}
                  </Button>
                ))}
              </div>
              <p className="text-legende text-muted-foreground">
                La fiche complète, les tickets et l’attribution arrivent avec la tranche suivante (« À traiter »).
              </p>

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
                  Aucun événement enregistré depuis la mise en service du journal (26/09/2026). Dernière mise à
                  jour : {o.dernier_evenement_le ? new Date(o.dernier_evenement_le).toLocaleString("fr-FR") : "—"}.
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
