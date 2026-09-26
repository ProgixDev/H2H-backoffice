"use client";

import { useRef, useState } from "react";
import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { parseAsBoolean, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { cn } from "cn";
import { Pause, Play, Search } from "lucide-react";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { etatSynchro, ilYA } from "@/lib/activite/temps";
import {
  LIBELLE_SERVICE,
  SERVICES,
  type Operation,
  type ReponseEvenements,
  type ReponseOperations,
  type ReponseTaches,
} from "@/lib/activite/types";
import { BandeauCompteurs } from "./BandeauCompteurs";
import { lireActivite, useMaintenant } from "./commun";
import { FicheOperation } from "./FicheOperation";
import { FilEvenements } from "./FilEvenements";
import { ListeOperations } from "./ListeOperations";
import { ListeTaches } from "./ListeTaches";

// Les filtres vivent dans l'adresse : ils survivent à l'actualisation (§4).
const PARSEURS = {
  vue: parseAsStringLiteral(["operations", "evenements", "taches"] as const).withDefault("operations"),
  compteur: parseAsString,
  service: parseAsStringLiteral(SERVICES),
  q: parseAsString,
  termines: parseAsBoolean.withDefault(false),
  test: parseAsBoolean.withDefault(false),
};

const RYTHME = 15_000;

type Props = {
  /** La première lecture, faite par le serveur pour les filtres de l'adresse. */
  initial: ReponseOperations | null;
  initialCle: string;
  /** Un équipier réel peut demander à voir aussi le test ; un équipier de test ne voit que lui. */
  peutInclureTest: boolean;
  /** Créer un ticket, s'attribuer un dossier : `dossiers.traiter`. */
  peutTraiter: boolean;
};

const enAttente = (gele: Operation[], vivant: Operation[]) => {
  const avant = new Map(gele.map((o) => [o.objet_id, `${o.etape}|${o.dernier_evenement_le}|${o.alerte}`]));
  const apres = new Set(vivant.map((o) => o.objet_id));
  let n = vivant.filter((o) => avant.get(o.objet_id) !== `${o.etape}|${o.dernier_evenement_le}|${o.alerte}`).length;
  for (const id of avant.keys()) if (!apres.has(id)) n += 1;
  return n;
};

/**
 * Activité en direct (§4) : le bandeau, les opérations en cours, les derniers
 * événements — relus toutes les quinze secondes, sans recharger la page.
 *
 * ⚠️ SUSPENDRE L'AFFICHAGE GÈLE L'ÉCRAN, PAS LES OPÉRATIONS. La lecture
 * continue derrière et compte ce qui a changé ; les comptes à rebours
 * continuent de tourner. Ouvrir une opération gèle aussi la liste : la ligne
 * sur laquelle on intervient ne se déplace pas sous le curseur.
 */
export function ActiviteEnDirect({ initial, initialCle, peutInclureTest, peutTraiter }: Props) {
  const [f, setF] = useQueryStates(PARSEURS, { history: "replace" });
  const [saisie, setSaisie] = useState(f.q ?? "");
  const minuteur = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pause, setPause] = useState(false);
  const [gele, setGele] = useState<ReponseOperations | null>(null);
  const [geleEv, setGeleEv] = useState<ReponseEvenements[] | null>(null);
  const [selection, setSelection] = useState<Operation | null>(null);
  const maintenantLocal = useMaintenant();

  const inclureTest = peutInclureTest && f.test;
  const params = new URLSearchParams();
  if (f.compteur) params.set("compteur", f.compteur);
  if (f.service) params.set("service", f.service);
  if (f.q) params.set("q", f.q);
  if (f.termines) params.set("termines", "true");
  if (inclureTest) params.set("test", "true");
  const cle = params.toString();

  const operations = useQuery({
    queryKey: ["activite", cle],
    queryFn: ({ signal }) => lireActivite<ReponseOperations>(params, signal),
    enabled: f.vue === "operations",
    refetchInterval: RYTHME,
    refetchIntervalInBackground: true,
    placeholderData: keepPreviousData,
    initialData: cle === initialCle && initial ? initial : undefined,
    initialDataUpdatedAt: cle === initialCle && initial ? () => Date.now() : undefined,
  });

  const evenements = useInfiniteQuery({
    queryKey: ["activite-evenements", inclureTest],
    queryFn: ({ pageParam, signal }) =>
      lireActivite<ReponseEvenements>(
        new URLSearchParams({
          vue: "evenements",
          test: String(inclureTest),
          ...(pageParam ? { avant: String(pageParam) } : {}),
        }),
        signal,
      ),
    initialPageParam: 0,
    getNextPageParam: (derniere) =>
      derniere.evenements.length === 100 ? derniere.evenements[derniere.evenements.length - 1].id : undefined,
    enabled: f.vue === "evenements",
    refetchInterval: RYTHME,
    refetchIntervalInBackground: true,
  });

  const taches = useQuery({
    queryKey: ["activite-taches"],
    queryFn: ({ signal }) => lireActivite<ReponseTaches>(new URLSearchParams({ vue: "taches" }), signal),
    enabled: f.vue === "taches",
    refetchInterval: RYTHME,
    refetchIntervalInBackground: true,
  });

  // L'horloge de la base : les comptes à rebours s'y calent, pas sur celle du poste.
  const calcule = operations.data?.compteurs[0]?.calcule_le;
  const decalage = calcule && operations.dataUpdatedAt ? Date.parse(calcule) - operations.dataUpdatedAt : 0;
  const maintenant = maintenantLocal + decalage;

  const lecture = f.vue === "operations" ? operations : f.vue === "taches" ? taches : evenements;
  const etat = etatSynchro(lecture.dataUpdatedAt, lecture.isError, maintenantLocal);

  const affichees = gele ?? operations.data;
  const pagesAffichees = geleEv ?? evenements.data?.pages;
  const nonLus =
    gele && operations.data ? enAttente(gele.operations, operations.data.operations) : 0;

  const figer = () => {
    setGele((g) => g ?? operations.data ?? null);
    setGeleEv((g) => g ?? evenements.data?.pages ?? null);
  };
  const degeler = () => {
    setGele(null);
    setGeleEv(null);
  };
  const basculerPause = () => {
    if (pause) {
      setPause(false);
      if (!selection) degeler();
    } else {
      setPause(true);
      figer();
    }
  };
  const ouvrir = (o: Operation) => {
    figer();
    setSelection(o);
  };
  const fermer = () => {
    setSelection(null);
    if (!pause) degeler();
  };

  const chercher = (texte: string) => {
    setSaisie(texte);
    if (minuteur.current) clearTimeout(minuteur.current);
    minuteur.current = setTimeout(() => setF({ q: texte.trim() || null }), 350);
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={f.vue} onValueChange={(v) => setF({ vue: v as typeof f.vue })}>
          <TabsList>
            <TabsTrigger value="operations">Opérations en cours</TabsTrigger>
            <TabsTrigger value="evenements">Derniers événements</TabsTrigger>
            <TabsTrigger value="taches">Travaux automatiques</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-wrap items-center gap-3">
          <IndicateurSynchro etat={etat} derniere={lecture.dataUpdatedAt} maintenant={maintenantLocal} />
          <Button variant={pause ? "default" : "outline"} size="sm" onClick={basculerPause} aria-pressed={pause}>
            {pause ? <Play /> : <Pause />}
            {pause ? `Reprendre${nonLus ? ` (${nonLus} changement${nonLus > 1 ? "s" : ""})` : ""}` : "Suspendre l’affichage"}
          </Button>
        </div>
      </div>

      {pause && (
        <p className="text-legende text-muted-foreground">
          L’affichage est suspendu : les opérations et leurs délais continuent, eux.
        </p>
      )}
      {etat === "perime" && lecture.dataUpdatedAt > 0 && (
        <div
          role="alert"
          className="rounded-xl border p-3 text-corps"
          style={{
            backgroundColor: "color-mix(in srgb, var(--h2h-error) 6%, transparent)",
            borderColor: "color-mix(in srgb, var(--h2h-error) 25%, transparent)",
          }}
        >
          <span className="font-semibold">Ces données ne sont plus à jour.</span> Dernière lecture réussie{" "}
          {ilYA(lecture.dataUpdatedAt, maintenantLocal)} — nouvelle tentative en cours.
          {lecture.error ? ` (${lecture.error.message})` : ""}
        </div>
      )}

      {f.vue === "operations" ? (
        <>
          {affichees ? (
            <BandeauCompteurs
              compteurs={affichees.compteurs}
              actif={f.compteur}
              surChoix={(code) => setF({ compteur: code, termines: false })}
            />
          ) : operations.isError ? null : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
              {Array.from({ length: 12 }, (_, i) => (
                <Skeleton key={i} className="h-[76px] rounded-xl" />
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={saisie}
                onChange={(e) => chercher(e.target.value)}
                placeholder="Référence, titre ou pseudonyme"
                className="pl-8"
                aria-label="Rechercher une opération"
              />
            </div>
            <Puce actif={!f.service} surClic={() => setF({ service: null })}>
              Tous les services
            </Puce>
            {SERVICES.map((s) => (
              <Puce key={s} actif={f.service === s} surClic={() => setF({ service: f.service === s ? null : s })}>
                {LIBELLE_SERVICE[s]}
              </Puce>
            ))}
            <Puce actif={f.termines} surClic={() => setF({ termines: !f.termines, compteur: null })}>
              Récemment terminées
            </Puce>
            {peutInclureTest && (
              <Puce actif={f.test} surClic={() => setF({ test: !f.test })}>
                Inclure le test
              </Puce>
            )}
          </div>

          {!affichees ? (
            operations.isError ? (
              <LectureEchouee message={operations.error.message} />
            ) : (
              <div className="grid gap-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            )
          ) : affichees.operations.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <AnimationH2H nom="handoff" taille={96} />
              <p className="mt-3 font-semibold">
                {f.termines ? "Aucune opération terminée ces sept derniers jours" : "Aucune opération ne correspond"}
              </p>
              <p className="text-corps text-muted-foreground">
                {f.compteur || f.service || f.q ? "Retirez un filtre pour élargir la liste." : "Tout est calme."}
              </p>
            </div>
          ) : (
            <>
              <ListeOperations
                operations={affichees.operations}
                maintenant={maintenant}
                selection={selection?.objet_id ?? null}
                surOuverture={ouvrir}
              />
              {affichees.operations.length === 500 && (
                <p className="text-legende text-muted-foreground">
                  Les 500 premières opérations sont affichées : affinez avec un compteur, un service ou une recherche.
                </p>
              )}
            </>
          )}
        </>
      ) : f.vue === "taches" ? (
        !taches.data ? (
          taches.isError ? (
            <LectureEchouee message={taches.error.message} />
          ) : (
            <div className="grid gap-2">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          )
        ) : (
          <ListeTaches taches={taches.data.taches} maintenant={maintenantLocal} />
        )
      ) : !pagesAffichees ? (
        evenements.isError ? (
          <LectureEchouee message={evenements.error.message} />
        ) : (
          <div className="grid gap-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        )
      ) : (
        <div className="rounded-xl border bg-card px-4 py-1" style={{ boxShadow: "var(--ombre-carte)" }}>
          {pagesAffichees.every((p) => p.evenements.length === 0) ? (
            <p className="py-8 text-center text-corps text-muted-foreground">
              Aucun événement depuis la mise en service du journal.
            </p>
          ) : (
            <FilEvenements evenements={pagesAffichees.flatMap((p) => p.evenements)} maintenant={maintenantLocal} />
          )}
          {evenements.hasNextPage && !geleEv && (
            <div className="border-t py-3 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => evenements.fetchNextPage()}
                disabled={evenements.isFetchingNextPage}
              >
                {evenements.isFetchingNextPage ? "Un instant…" : "Événements plus anciens"}
              </Button>
            </div>
          )}
        </div>
      )}

      <FicheOperation
        operation={selection}
        inclureTest={inclureTest}
        peutTraiter={peutTraiter}
        maintenant={maintenant}
        surFermeture={fermer}
      />
    </div>
  );
}

function Puce({ actif, surClic, children }: { actif: boolean; surClic: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={actif}
      onClick={surClic}
      className={cn(
        "rounded-full border px-3 py-1.5 text-legende font-semibold transition-colors",
        actif ? "border-h2h-primary bg-h2h-primary-light text-h2h-primary" : "hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

const COULEUR_SYNCHRO = { a_jour: "var(--h2h-success)", degrade: "var(--h2h-warning)", perime: "var(--h2h-error)" };
const LIBELLE_SYNCHRO = { a_jour: "À jour", degrade: "Lecture ralentie", perime: "Plus à jour" };

/** La dernière synchronisation, toujours visible (§4). */
function IndicateurSynchro({
  etat,
  derniere,
  maintenant,
}: {
  etat: keyof typeof COULEUR_SYNCHRO;
  derniere: number;
  maintenant: number;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-legende text-muted-foreground" aria-live="polite">
      <span className="size-2 rounded-full" style={{ backgroundColor: COULEUR_SYNCHRO[etat] }} aria-hidden />
      <span>
        <span className="font-semibold text-foreground">{LIBELLE_SYNCHRO[etat]}</span>
        {derniere > 0 && ` · synchronisé ${ilYA(derniere, maintenant)}`}
      </span>
    </span>
  );
}
