"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "cn";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { StatutPastille, type Ton } from "@/components/bo/StatutPastille";
import { useMaintenant } from "@/components/activite/commun";
import { Quand } from "@/components/operations/commun";
import { BoutonPiece, CadreConsultations } from "@/components/operations/sensibles";
import {
  FILTRES_ATTESTATION,
  LIBELLE_ATTENDU,
  LIBELLE_DOCUMENT_IDENTITE,
  LIBELLE_FILTRE_ATTESTATION,
  LIBELLE_METHODE_IDENTITE,
  type AttestationLigne,
  type FiltreAttestation,
  type VersionAttestation,
} from "@/lib/attestations/types";
import { dateHeure } from "@/lib/dates";
import { LIBELLE_DECISION_ACHETEUR } from "@/lib/operations/libelles";
import { cheminFiche } from "@/lib/operations/types";
import { BoutonRelancer, BoutonRemplacement } from "./GestesAttestation";

// ⚠️ UNE ISSUE DÉFAVORABLE N'EST JAMAIS VERTE : l'erreur est rouge, la version remplacée muette.
function tonVersion(v: Pick<VersionAttestation, "statut" | "erreur">): Ton {
  if (v.erreur) return "erreur";
  if (v.statut === "final_available" || v.statut === "signed_by_both") return "succes";
  if (v.statut === "cancelled_or_replaced") return "muet";
  if (v.statut === "refused_by_buyer") return "attention";
  return "marque";
}

/** « 8/8 confirmées » : les déclarations du vendeur, sans rien réécrire. */
function declarations(d: Record<string, unknown> | null): string {
  const valeurs = Object.values(d ?? {});
  if (valeurs.length === 0) return "—";
  return `${valeurs.filter((x) => x === true).length}/${valeurs.length} confirmées`;
}

/** « 2 accessoires · 1 identifiant » : ce que le vendeur a confirmé, compté. */
function elements(e: Record<string, unknown> | null): string {
  const n = (k: string) => (Array.isArray(e?.[k]) ? (e?.[k] as unknown[]).length : 0);
  const parts = [
    [n("accessories"), "accessoire"],
    [n("documents"), "document"],
    [n("identifiers"), "identifiant"],
  ]
    .filter(([c]) => (c as number) > 0)
    .map(([c, m]) => `${c} ${m}${(c as number) > 1 ? "s" : ""}`);
  return parts.length ? parts.join(" · ") : "—";
}

function identite(i: VersionAttestation["identites"]["vendeur"]): string {
  if (!i.verifiee) return "Non vérifiée";
  return [
    i.methode ? (LIBELLE_METHODE_IDENTITE[i.methode] ?? i.methode) : null,
    i.document ? (LIBELLE_DOCUMENT_IDENTITE[i.document] ?? i.document) : null,
    i.verifiee_le ? `le ${dateHeure(i.verifiee_le)}` : null,
    i.mode_test ? "mode test" : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

type Ligne = [libelle: string, cle: (v: VersionAttestation) => string, rendu?: (v: VersionAttestation) => React.ReactNode];

/**
 * La comparaison des versions (R11.3) : une colonne par version, une case
 * surlignée quand elle diffère de la version précédente. Les preuves de
 * signature sont celles que le dossier porte — dates, empreinte, identité
 * figée ; ni adresse IP, ni appareil, ni texte consenti ne sont enregistrés.
 */
function Comparaison({ versions, maintenant }: { versions: VersionAttestation[]; maintenant: number }) {
  const lignes: Ligne[] = [
    ["État", (v) => v.libelle + (v.erreur ?? ""), (v) => (
      <span className="grid gap-1">
        <StatutPastille ton={tonVersion(v)} className="justify-self-start">{v.libelle}</StatutPastille>
        {v.erreur && <span className="text-legende text-[var(--h2h-error)]">{v.erreur}</span>}
      </span>
    )],
    ["Ouverte", (v) => v.creee_le, (v) => <Quand iso={v.creee_le} maintenant={maintenant} />],
    ["Données figées", (v) => v.figee_le ?? "", (v) => <Quand iso={v.figee_le} maintenant={maintenant} />],
    ["Photos", (v) => v.photos.map((p) => p.emplacement).join(","), (v) =>
      v.photos.length === 0 ? "—" : (
        <ul className="grid gap-1">
          {v.photos.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-2">
              <span>{p.emplacement}{p.lisibilite_confirmee ? " · lisibilité confirmée" : ""}</span>
              <BoutonPiece nature="photo_attestation" piece={p.id} libelle={`Photo « ${p.emplacement} », version ${v.version}`} />
            </li>
          ))}
        </ul>
      )],
    ["Déclarations du vendeur", (v) => declarations(v.declarations)],
    ["Éléments confirmés", (v) => elements(v.elements_confirmes)],
    ["Signée par le vendeur", (v) => v.signee_vendeur_le ?? "", (v) => <Quand iso={v.signee_vendeur_le} maintenant={maintenant} />],
    ["Décision de l’acheteur", (v) => v.decision_acheteur ?? "", (v) =>
      v.decision_acheteur ? LIBELLE_DECISION_ACHETEUR[v.decision_acheteur] : "—"],
    ["Signée par l’acheteur", (v) => v.signee_acheteur_le ?? "", (v) => <Quand iso={v.signee_acheteur_le} maintenant={maintenant} />],
    ["Empreinte", (v) => v.empreinte ?? "", (v) => (v.empreinte ? <code className="text-legende">{v.empreinte}…</code> : "—")],
    ["Exemplaire durable", (v) => String(v.document), (v) =>
      v.document ? (
        <span className="inline-flex items-center gap-2">
          Déposé
          <BoutonPiece nature="document_attestation" piece={v.id} libelle={`Attestation, version ${v.version}`} format="document" />
        </span>
      ) : v.statut === "final_available" ? "Pas déposé" : "—"],
    ["Identités exigées", (v) => `${v.identites.exigees}${v.identites.figees_le ?? ""}`, (v) =>
      v.identites.exigees ? `Oui${v.identites.figees_le ? `, figées le ${dateHeure(v.identites.figees_le)}` : ""}` : "Non"],
    ["Identité du vendeur", (v) => identite(v.identites.vendeur)],
    ["Identité de l’acheteur", (v) => identite(v.identites.acheteur)],
  ];
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-corps" style={{ minWidth: 200 + versions.length * 240 }}>
        <thead className="border-b bg-muted/40 text-left text-legende text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium" />
            {versions.map((v) => (
              <th key={v.id} className="px-3 py-2 font-medium">Version {v.version}</th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr]:border-b [&>tr:last-child]:border-0 [&_td]:px-3 [&_td]:py-2 [&_td]:align-top">
          {lignes.map(([libelle, cle, rendu]) => (
            <tr key={libelle}>
              <td className="text-legende text-muted-foreground">{libelle}</td>
              {versions.map((v, i) => (
                <td key={v.id} className={cn(i > 0 && cle(v) !== cle(versions[i - 1]) && "bg-[var(--h2h-warning)]/10")}>
                  {rendu ? rendu(v) : cle(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Les attestations de vente (§11) : une ligne par achat, sa version courante
 * sous les mots du cahier des charges, qui est attendu ; dépliée, la
 * comparaison de ses versions, ses photos, ses preuves de signature, son
 * exemplaire durable, et les gestes : relancer, demander le remplacement.
 *
 * 🔴 UNE VERSION SIGNÉE NE SE MODIFIE JAMAIS (R11.4) : aucun geste de cet écran
 * n'écrit une attestation.
 */
export function ListeAttestations({
  lignes,
  filtre,
  test,
  peutRelancer,
  peutReveler,
}: {
  lignes: AttestationLigne[];
  filtre: FiltreAttestation | null;
  test: boolean;
  peutRelancer: boolean;
  peutReveler: boolean;
}) {
  const maintenant = useMaintenant(60_000);
  const [ouverte, setOuverte] = useState<string | null>(null);
  const lien = (f: FiltreAttestation | null) =>
    `/transactions?vue=attestations${f ? `&filtre=${f}` : ""}${test ? "&test=1" : ""}`;

  return (
    <div className="grid gap-4">
      <nav className="flex flex-wrap gap-2" aria-label="Filtrer les attestations">
        {([null, ...FILTRES_ATTESTATION] as (FiltreAttestation | null)[]).map((f) => (
          <Link
            key={f ?? "toutes"}
            href={lien(f)}
            className={cn(
              "rounded-full border px-3 py-1 text-legende font-medium transition-colors",
              f === filtre
                ? "border-h2h-primary bg-h2h-primary/10 text-h2h-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f ? LIBELLE_FILTRE_ATTESTATION[f] : "Toutes"}
          </Link>
        ))}
      </nav>

      {lignes.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <AnimationH2H nom="vault-shield" taille={96} />
          <p className="mt-3 font-semibold">{filtre ? "Aucune attestation pour ce filtre" : "Aucune attestation"}</p>
          <p className="text-corps text-muted-foreground">
            Une attestation s’ouvre pour une vente entre particuliers de plus de 1 500 €, envoyée par Mondial Relay.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[960px] text-corps">
            <thead className="bg-muted/40 text-left text-legende text-muted-foreground">
              <tr>
                <th className="w-8 px-2 py-2" />
                <th className="px-3 py-2 font-medium">Achat</th>
                <th className="px-3 py-2 font-medium">Vendeur → acheteur</th>
                <th className="px-3 py-2 font-medium">Version</th>
                <th className="px-3 py-2 font-medium">État</th>
                <th className="px-3 py-2 font-medium">Attendu</th>
                <th className="px-3 py-2 font-medium">Dernière relance</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((a) => {
                const deplie = ouverte === a.commande_id;
                return (
                  <Fragment key={a.commande_id}>
                    <tr
                      className={cn("cursor-pointer border-t align-top hover:bg-muted/30", deplie && "bg-muted/30")}
                      onClick={() => setOuverte(deplie ? null : a.commande_id)}
                    >
                      <td className="px-2 py-2">
                        <button type="button" aria-expanded={deplie} aria-label={deplie ? "Replier" : "Déplier"} className="text-muted-foreground">
                          {deplie ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        <Link href={cheminFiche(a.numero, "documents")} className="font-medium tabular-nums hover:underline"
                          onClick={(e) => e.stopPropagation()}>
                          {a.numero}
                        </Link>
                        {a.est_test && <StatutPastille ton="attention" className="ml-2">TEST</StatutPastille>}
                      </td>
                      <td className="px-3 py-2">{a.vendeur ?? "Compte effacé"} → {a.acheteur ?? "Compte effacé"}</td>
                      <td className="px-3 py-2 tabular-nums">
                        v{a.version}
                        {a.versions > 1 && <span className="text-legende text-muted-foreground"> · {a.versions} versions</span>}
                      </td>
                      <td className="px-3 py-2">
                        <span className="grid gap-1">
                          <StatutPastille ton={tonVersion(a)} className="justify-self-start">
                            {a.erreur ? "Erreur technique" : a.libelle}
                          </StatutPastille>
                          {a.erreur && <span className="text-legende text-muted-foreground">{a.erreur}</span>}
                        </span>
                      </td>
                      <td className="px-3 py-2">{a.attendu ? LIBELLE_ATTENDU[a.attendu] : <span className="text-muted-foreground">Personne</span>}</td>
                      <td className="px-3 py-2">
                        {a.derniere_relance_le ? (
                          <span className="grid">
                            <Quand iso={a.derniere_relance_le} maintenant={maintenant} />
                            <span className="text-legende text-muted-foreground">
                              {a.derniere_relance === "remplacement" ? "remplacement demandé" : "rappel"}
                            </span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                    {deplie && (
                      <tr className="border-t">
                        <td colSpan={7} className="p-0">
                          <CadreConsultations objet={a.commande_id} peutReveler={peutReveler}>
                            <div className="grid gap-4 bg-muted/20 px-4 py-4">
                              <Comparaison versions={a.historique} maintenant={maintenant} />
                              <p className="text-legende text-muted-foreground">
                                La preuve de signature, ce sont les dates, l’empreinte et l’identité vérifiée figée dans
                                la version : ni adresse IP, ni appareil, ni version du texte consenti ne sont
                                enregistrés. Les noms légaux se révèlent un à un depuis la fiche, onglet Documents.
                              </p>
                              <div className="flex flex-wrap items-start gap-4">
                                {peutRelancer && <BoutonRelancer a={a} maintenant={maintenant} />}
                                {peutRelancer && <BoutonRemplacement a={a} />}
                                <Link href={cheminFiche(a.numero, "documents")} className="text-corps font-medium text-h2h-primary hover:underline">
                                  Ouvrir la fiche, onglet Documents
                                </Link>
                              </div>
                              {a.relances.length > 0 && (
                                <div className="grid gap-1">
                                  <span className="text-legende font-semibold text-muted-foreground">Ce que l’équipe a demandé</span>
                                  <ul className="grid gap-1 text-corps">
                                    {a.relances.map((r, i) => (
                                      <li key={i}>
                                        {r.nature === "remplacement" ? "Remplacement demandé" : "Rappel"}
                                        {r.version ? ` · version ${r.version}` : ""} ·{" "}
                                        {r.destinataires.filter(Boolean).join(" et ")} ·{" "}
                                        <Quand iso={r.le} maintenant={maintenant} />
                                        {r.par ? ` · ${r.par}` : ""}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </CadreConsultations>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
