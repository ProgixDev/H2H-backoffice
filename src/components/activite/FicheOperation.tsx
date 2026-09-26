"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useGeste } from "@/lib/db/useGeste";
import { ouvrirDossier } from "@/lib/dossiers/actions";
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
 * complète, qui arrive avec une tranche suivante. D'ici, on crée un ticket ou
 * on prend le dossier — dans « À traiter ».
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

              {peutTraiter ? (
                <ActionsTicket key={o.objet_id} o={o} />
              ) : (
                <p className="text-legende text-muted-foreground">Votre rôle permet de lire, pas de traiter.</p>
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

/**
 * « Créer un ticket » et « M'attribuer le dossier » (§4). La base rend le
 * dossier déjà ouvert sur l'opération plutôt qu'un doublon ; on y va ensuite.
 */
function ActionsTicket({ o }: { o: Operation }) {
  const router = useRouter();
  const ouvrir = useGeste(ouvrirDossier);
  const [motif, setMotif] = useState("");
  const [saisie, setSaisie] = useState(false);

  async function aller(attribuer: boolean, texte: string, succes: string) {
    const r = await ouvrir.lancer(
      {
        objetTable: o.objet_table,
        objetId: o.objet_id,
        titre: null,
        motif: texte,
        priorite: "normale",
        securite: false,
        attribuer,
      },
      succes,
    );
    if (r?.ok) router.push(`/a-traiter?dossier=${(r.donnees as { dossier: string }).dossier}`);
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" disabled title="La fiche complète arrive avec une tranche suivante.">
          Ouvrir le dossier
        </Button>
        <Button variant="outline" size="sm" disabled={ouvrir.enCours} onClick={() => setSaisie((s) => !s)}>
          Créer un ticket
        </Button>
        <Button
          size="sm"
          disabled={ouvrir.enCours}
          onClick={() =>
            aller(true, o.alerte_libelle ?? o.action_attendue ?? o.etape_libelle, "Le dossier vous est attribué.")
          }
        >
          M’attribuer le dossier
        </Button>
      </div>
      {saisie && (
        <div className="flex gap-2">
          <Input value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Pourquoi ce ticket ?" aria-label="Motif du ticket" />
          <Button
            size="sm"
            disabled={motif.trim().length < 3 || ouvrir.enCours}
            onClick={() => aller(false, motif.trim(), "Ticket créé.")}
          >
            Créer
          </Button>
        </div>
      )}
    </div>
  );
}
