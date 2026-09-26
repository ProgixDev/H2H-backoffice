"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { parseAsBoolean, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { cn } from "cn";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { Echeance } from "@/components/activite/Echeance";
import { lireActivite, useMaintenant } from "@/components/activite/commun";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { etatSynchro, ilYA } from "@/lib/activite/temps";
import {
  LIBELLE_EQUIPE,
  LIBELLE_PERIMETRE,
  LIBELLE_PRIORITE,
  PERIMETRES,
  type Dossier,
  type ReponseFile,
} from "@/lib/dossiers/types";
import { FicheDossier } from "./FicheDossier";
import { TON_CATEGORIE, TON_PRIORITE } from "./tons";

const PARSEURS = {
  perimetre: parseAsStringLiteral(PERIMETRES).withDefault("tous"),
  categorie: parseAsString,
  clos: parseAsBoolean.withDefault(false),
  test: parseAsBoolean.withDefault(false),
  dossier: parseAsString,
};

type Props = {
  initial: ReponseFile | null;
  initialCle: string;
  moi: string;
  peutTraiter: boolean;
  peutInclureTest: boolean;
};

/**
 * À traiter (§5) : les dossiers qui attendent un humain, rangés en huit
 * groupes, sur trois périmètres (§5.3), relus toutes les quinze secondes.
 *
 * ⚠️ LE GROUPE D'UN DOSSIER EST CALCULÉ PAR LA BASE, et le compteur du groupe
 * aussi : l'écran ne refiltre rien.
 */
export function FileATraiter({ initial, initialCle, moi, peutTraiter, peutInclureTest }: Props) {
  const [f, setF] = useQueryStates(PARSEURS, { history: "replace" });
  const maintenant = useMaintenant();
  const inclureTest = peutInclureTest && f.test;

  const params = new URLSearchParams({ perimetre: f.perimetre });
  if (f.categorie) params.set("categorie", f.categorie);
  if (f.clos) params.set("clos", "true");
  if (inclureTest) params.set("test", "true");
  const cle = params.toString();

  const file = useQuery({
    queryKey: ["file", cle],
    queryFn: ({ signal }) => lireActivite<ReponseFile>(params, signal, "/api/dossiers"),
    refetchInterval: 15_000,
    refetchIntervalInBackground: true,
    placeholderData: keepPreviousData,
    initialData: cle === initialCle && initial ? initial : undefined,
    initialDataUpdatedAt: cle === initialCle && initial ? () => Date.now() : undefined,
  });
  const etat = etatSynchro(file.dataUpdatedAt, file.isError, maintenant);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={f.perimetre} onValueChange={(v) => setF({ perimetre: v as typeof f.perimetre, categorie: null })}>
          <TabsList>
            {PERIMETRES.map((p) => (
              <TabsTrigger key={p} value={p}>
                {LIBELLE_PERIMETRE[p]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <span className="inline-flex items-center gap-2 text-legende text-muted-foreground" aria-live="polite">
          <span
            className="size-2 rounded-full"
            style={{
              backgroundColor:
                etat === "a_jour" ? "var(--h2h-success)" : etat === "degrade" ? "var(--h2h-warning)" : "var(--h2h-error)",
            }}
            aria-hidden
          />
          {file.dataUpdatedAt > 0 ? `Synchronisé ${ilYA(file.dataUpdatedAt, maintenant)}` : "Lecture…"}
        </span>
      </div>

      {etat === "perime" && file.dataUpdatedAt > 0 && (
        <div role="alert" className="rounded-xl border border-h2h-error/30 bg-h2h-error-light p-3 text-corps">
          <span className="font-semibold">Cette file n’est plus à jour.</span> Dernière lecture réussie{" "}
          {ilYA(file.dataUpdatedAt, maintenant)} — nouvelle tentative en cours.
        </div>
      )}

      {file.data ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {file.data.compteurs.map((c) => {
            const choisi = f.categorie === c.code;
            return (
              <button
                key={c.code}
                type="button"
                aria-pressed={choisi}
                title={c.description}
                onClick={() => setF({ categorie: choisi ? null : c.code, clos: false })}
                className={cn(
                  "flex min-h-[76px] flex-col justify-between rounded-xl border bg-card p-3 text-left transition-colors hover:bg-muted",
                  choisi && "border-h2h-primary bg-h2h-primary-light hover:bg-h2h-primary-light",
                )}
                style={{ boxShadow: "var(--ombre-carte)" }}
              >
                <span className="text-legende text-muted-foreground">{c.libelle}</span>
                <span className={cn("text-h2 font-bold tabular-nums", choisi && "text-h2h-primary")}>{c.nombre}</span>
              </button>
            );
          })}
        </div>
      ) : (
        !file.isError && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-[76px] rounded-xl" />
            ))}
          </div>
        )
      )}

      <div className="flex flex-wrap gap-2">
        <Puce actif={f.clos} surClic={() => setF({ clos: !f.clos, categorie: null })}>
          Dossiers clos compris
        </Puce>
        {peutInclureTest && (
          <Puce actif={f.test} surClic={() => setF({ test: !f.test })}>
            Inclure le test
          </Puce>
        )}
      </div>

      {!file.data ? (
        file.isError ? (
          <LectureEchouee message={file.error.message} />
        ) : (
          <div className="grid gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        )
      ) : file.data.dossiers.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <AnimationH2H nom="handoff" taille={96} />
          <p className="mt-3 font-semibold">Rien n’attend dans ce groupe</p>
          <p className="text-corps text-muted-foreground">
            {f.perimetre === "miens" ? "Aucun dossier ne vous est attribué." : "La file est vide pour ce filtre."}
          </p>
        </div>
      ) : (
        <ul className="grid gap-2">
          {file.data.dossiers.map((d) => (
            <li key={d.id}>
              <LigneDossier d={d} maintenant={maintenant} choisi={f.dossier === d.id} surOuverture={() => setF({ dossier: d.id })} />
            </li>
          ))}
        </ul>
      )}

      <FicheDossier
        id={f.dossier}
        moi={moi}
        peutTraiter={peutTraiter}
        maintenant={maintenant}
        surFermeture={() => setF({ dossier: null })}
      />
    </div>
  );
}

function LigneDossier({
  d,
  maintenant,
  choisi,
  surOuverture,
}: {
  d: Dossier;
  maintenant: number;
  choisi: boolean;
  surOuverture: () => void;
}) {
  const libelle = CATEGORIE_COURTE[d.categorie] ?? d.categorie;
  return (
    <button
      type="button"
      onClick={surOuverture}
      className={cn(
        "grid w-full gap-2 rounded-xl border bg-card p-3 text-left transition-colors hover:bg-muted/60 md:grid-cols-[1fr_auto]",
        choisi && "border-h2h-primary",
      )}
      style={{ boxShadow: "var(--ombre-carte)" }}
    >
      <span className="grid min-w-0 gap-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-semibold tabular-nums">{d.ref}</span>
          <StatutPastille ton={TON_CATEGORIE[d.categorie] ?? "neutre"}>{d.statut === "clos" ? "Clos" : libelle}</StatutPastille>
          {d.priorite !== "normale" && <StatutPastille ton={TON_PRIORITE[d.priorite]}>{LIBELLE_PRIORITE[d.priorite]}</StatutPastille>}
          {d.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
        </span>
        <span className="truncate">{d.titre}</span>
        <span className="truncate text-legende text-muted-foreground">
          {d.objet_ref ? `${d.objet_ref} · ` : ""}
          {LIBELLE_EQUIPE[d.equipe] ?? d.equipe}
          {d.escalade_vers ? ` → ${LIBELLE_EQUIPE[d.escalade_vers] ?? d.escalade_vers}` : ""}
          {" · "}
          {d.responsable_nom ?? "sans responsable"}
          {d.reponse_recue_le ? ` · réponse ${ilYA(d.reponse_recue_le, maintenant)}` : ""}
        </span>
      </span>
      <span className="text-corps md:text-right">
        <span className="block text-legende text-muted-foreground">À traiter avant</span>
        <Echeance iso={d.echeance && d.echeance < d.echeance_traitement ? d.echeance : d.echeance_traitement} maintenant={maintenant} />
      </span>
    </button>
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

const CATEGORIE_COURTE: Record<string, string> = {
  urgence_securite: "Urgence sécurité",
  echec: "En échec",
  contestation: "Contestation",
  echeance_depassee: "Échéance dépassée",
  reponse_recue: "Réponse reçue",
  echeance_proche: "Échéance proche",
  sans_responsable: "Sans responsable",
  pret_decision: "Prêt pour décision",
};
