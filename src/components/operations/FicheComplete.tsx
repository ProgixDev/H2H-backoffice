"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { Activity } from "lucide-react";
import { lireActivite, useMaintenant } from "@/components/activite/commun";
import { IndicateurSynchro } from "@/components/bo/IndicateurSynchro";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { QuatreQuestions } from "@/components/bo/QuatreQuestions";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { etatSynchro } from "@/lib/activite/temps";
import { LIBELLE_SERVICE, LIBELLE_TYPE } from "@/lib/activite/types";
import { euros } from "@/lib/litiges/types";
import {
  LIBELLE_ONGLET,
  ONGLETS,
  ongletsDe,
  type BienAchat,
  type BienFlash,
  type BienLive,
  type Fiche,
  type ObjetFiche,
} from "@/lib/operations/types";
import { Reserve } from "./commun";
import { BienDuneOffre, BienDunAchat, BienDunLive } from "./onglets/Bien";
import { ListeFaits } from "./onglets/Chronologie";
import { OngletDocuments } from "./onglets/Documents";
import { OngletEchanges } from "./onglets/Echanges";
import { OngletLitiges } from "./onglets/Litiges";
import { OngletLivraison } from "./onglets/Livraison";
import { OngletNotes } from "./onglets/Notes";
import { OngletPaiements } from "./onglets/Paiements";
import { OngletResume } from "./onglets/Resume";

const parseurOnglet = parseAsStringLiteral(ONGLETS).withDefault("resume");

/**
 * La fiche complète d'une opération (§6) : les quatre questions, puis ses
 * onglets (R6.2). Relue toutes les quinze secondes, comme Activité en direct ;
 * l'onglet choisi reste dans l'adresse, qu'on partage telle quelle.
 *
 * ⚠️ UN ONGLET FERMÉ DIT POURQUOI : la base rend `null` pour ce que le rôle ne
 * permet pas de lire, et l'écran le dit au lieu d'afficher un vide trompeur.
 */
export function FicheComplete({ initial, table, id }: { initial: Fiche; table: ObjetFiche; id: string }) {
  const client = useQueryClient();
  const maintenant = useMaintenant();
  const [onglet, setOnglet] = useQueryState("onglet", parseurOnglet.withOptions({ history: "replace" }));
  const cle = ["fiche", table, id];
  const lecture = useQuery({
    queryKey: cle,
    queryFn: ({ signal }) => lireActivite<Fiche>(new URLSearchParams({ table, id }), signal, "/api/operations"),
    refetchInterval: 15_000,
    refetchIntervalInBackground: true,
    initialData: initial,
    initialDataUpdatedAt: () => Date.now(),
  });
  const f = lecture.data;
  const o = f.operation;
  const etat = etatSynchro(lecture.dataUpdatedAt, lecture.isError, maintenant);
  const onglets = ongletsDe(table);
  const actif = onglets.includes(onglet) ? onglet : "resume";
  const relire = () => void client.invalidateQueries({ queryKey: cle });

  return (
    <div className="grid gap-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h2 className="flex flex-wrap items-center gap-2 text-h2 font-semibold">
            <span>{LIBELLE_TYPE[o.type] ?? o.type}</span>
            <span className="tabular-nums">{o.ref}</span>
            {o.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
          </h2>
          <p className="text-corps text-muted-foreground">
            {LIBELLE_SERVICE[o.service]}
            {o.bien_titre ? ` · ${o.bien_titre}` : ""}
            {o.montant_cents !== null ? ` · ${euros(o.montant_cents)}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <IndicateurSynchro etat={etat} derniere={lecture.dataUpdatedAt} maintenant={maintenant} />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/activite-en-direct?q=${encodeURIComponent(o.ref)}&termines=true${o.est_test ? "&test=true" : ""}`}>
              <Activity /> Dans Activité en direct
            </Link>
          </Button>
        </div>
      </header>

      {lecture.isError && (
        <LectureEchouee
          titre="La fiche n’est plus à jour"
          message={`${lecture.error.message} Ce qui s’affiche est la dernière lecture réussie.`}
        />
      )}

      <QuatreQuestions operation={o} participants={f.participants} maintenant={maintenant} grille />

      <Tabs value={actif} onValueChange={(v) => void setOnglet(v as typeof onglet)}>
        <div className="overflow-x-auto">
          <TabsList>
            {onglets.map((x) => (
              <TabsTrigger key={x} value={x}>
                {LIBELLE_ONGLET[x]}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="resume" className="pt-2">
          <OngletResume f={f} maintenant={maintenant} />
        </TabsContent>

        <TabsContent value="bien-et-accord" className="pt-2">
          {f.bien === null ? (
            table === "orders" ? (
              <Reserve quoi="au détail de la transaction" permission="transactions.lire" />
            ) : table === "courtage_listings" ? (
              <Reserve quoi="au détail des offres Flash" permission="flash.lire" />
            ) : (
              <Reserve quoi="au détail des lives" permission="live.lire" />
            )
          ) : table === "orders" ? (
            <BienDunAchat b={f.bien as BienAchat} maintenant={maintenant} />
          ) : table === "courtage_listings" ? (
            <BienDuneOffre b={f.bien as BienFlash} maintenant={maintenant} />
          ) : (
            <BienDunLive b={f.bien as BienLive} maintenant={maintenant} />
          )}
        </TabsContent>

        <TabsContent value="chronologie" className="pt-2">
          <ListeFaits faits={f.chronologie} tronquee={f.chronologie_tronquee} maintenant={maintenant} />
        </TabsContent>

        {table === "orders" && (
          <>
            <TabsContent value="paiements" className="pt-2">
              {f.paiements ? (
                <OngletPaiements p={f.paiements} maintenant={maintenant} />
              ) : (
                <Reserve quoi="aux paiements" permission="paiements.lire" />
              )}
            </TabsContent>
            <TabsContent value="livraison" className="pt-2">
              {f.livraison ? (
                <OngletLivraison
                  l={f.livraison}
                  parcours={f.chronologie.filter((x) => x.source === "remise")}
                  maintenant={maintenant}
                />
              ) : (
                <Reserve quoi="à la livraison" permission="logistique.lire ou transactions.lire" />
              )}
            </TabsContent>
            <TabsContent value="documents" className="pt-2">
              {f.documents && <OngletDocuments d={f.documents} maintenant={maintenant} />}
            </TabsContent>
            <TabsContent value="echanges" className="pt-2">
              {f.echanges ? (
                <OngletEchanges e={f.echanges} maintenant={maintenant} />
              ) : (
                <Reserve quoi="aux échanges" permission="litiges.lire" />
              )}
            </TabsContent>
            <TabsContent value="litiges" className="pt-2">
              {f.litiges ? (
                <OngletLitiges l={f.litiges} maintenant={maintenant} />
              ) : (
                <Reserve quoi="aux litiges" permission="litiges.lire" />
              )}
            </TabsContent>
          </>
        )}

        <TabsContent value="notes-internes" className="pt-2">
          {f.notes ? (
            <OngletNotes n={f.notes} f={f} maintenant={maintenant} surGeste={relire} />
          ) : (
            <Reserve quoi="aux notes internes" permission="dossiers.lire" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
