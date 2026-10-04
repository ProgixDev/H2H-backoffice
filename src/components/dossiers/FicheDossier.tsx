"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "cn";
import { Lock, Send } from "lucide-react";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { Echeance } from "@/components/activite/Echeance";
import { lireActivite } from "@/components/activite/commun";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { dateCourte } from "@/lib/activite/temps";
import { useGeste } from "@/lib/db/useGeste";
import {
  attribuerDossier,
  cloreDossier,
  demanderPreuve,
  escaladerDossier,
  noterDossier,
  prioriserDossier,
} from "@/lib/dossiers/actions";
import {
  CATEGORIE_COURTE,
  CLOTURE_AUTOMATIQUE,
  EQUIPES,
  LIBELLE_EQUIPE,
  LIBELLE_PRIORITE,
  type DetailDossier,
  type EvenementDossier,
  type Priorite,
} from "@/lib/dossiers/types";
import { cheminAnnonce } from "@/lib/annonces/types";
import { cheminLive } from "@/lib/lives/types";
import { cheminFiche } from "@/lib/operations/types";
import { cheminCompte } from "@/lib/utilisateurs/types";
import { RemboursementOption } from "@/components/visibilite/RemboursementOption";
import { TON_CATEGORIE, TON_PRIORITE } from "./tons";

/** Les dossiers qui portent une opération : ceux-là s'ouvrent sur sa fiche complète. */
const OPERATIONS: readonly string[] = ["orders", "courtage_listings", "live_sessions"];

const GENRE: Record<EvenementDossier["genre"], string> = {
  ouverture: "Dossier ouvert",
  reouverture: "Dossier rouvert",
  cloture: "Dossier clos",
  attribution: "Attribué",
  priorite: "Priorité changée",
  note: "Note interne",
  demande_preuve: "Preuve demandée",
  escalade: "Escaladé",
  reponse: "Réponse reçue",
};

const champ =
  "h-9 rounded-lg border bg-background px-2 text-corps focus-visible:outline-2 focus-visible:outline-h2h-primary";

function Bloc({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-2 rounded-xl border p-3">
      <h3 className="text-legende font-semibold text-muted-foreground">{titre}</h3>
      {children}
    </section>
  );
}

/**
 * Un dossier ouvert depuis la file : ce qui attend, le journal, et les gestes
 * du §5.2.
 *
 * 🔴 LA NOTE INTERNE ET LA DEMANDE DE PREUVE NE SE CONFONDENT PAS (R6.3) : la
 * première reste ici, la seconde part chez l'utilisateur — les deux formulaires
 * le disent, et le journal les distingue.
 */
export function FicheDossier({
  id,
  moi,
  peutTraiter,
  maintenant,
  surFermeture,
}: {
  id: string | null;
  moi: string;
  peutTraiter: boolean;
  maintenant: number;
  surFermeture: () => void;
}) {
  const client = useQueryClient();
  const lecture = useQuery({
    queryKey: ["dossier", id],
    queryFn: ({ signal }) => lireActivite<DetailDossier>(new URLSearchParams({ id: id! }), signal, "/api/dossiers"),
    enabled: id !== null,
    refetchInterval: 15_000,
  });
  const relire = () => {
    void client.invalidateQueries({ queryKey: ["dossier", id] });
    void client.invalidateQueries({ queryKey: ["file"] });
  };

  const attribuer = useGeste(attribuerDossier);
  const prioriser = useGeste(prioriserDossier);
  const noter = useGeste(noterDossier);
  const preuve = useGeste(demanderPreuve);
  const escalader = useGeste(escaladerDossier);
  const clore = useGeste(cloreDossier);

  const [note, setNote] = useState("");
  const [priorite, setPriorite] = useState<Priorite>("haute");
  const [motifPriorite, setMotifPriorite] = useState("");
  const [destinataire, setDestinataire] = useState("acheteur");
  const [message, setMessage] = useState("");
  const [vers, setVers] = useState("direction");
  const [motifEscalade, setMotifEscalade] = useState("");
  const [motifCloture, setMotifCloture] = useState("");
  const [confie, setConfie] = useState("");

  const d = lecture.data?.dossier;
  const ouvert = d?.statut === "ouvert";
  const agir = peutTraiter && ouvert;

  async function faire(p: Promise<unknown>, vider?: () => void) {
    const r = (await p) as { ok?: boolean } | null;
    if (r?.ok) vider?.();
    relire();
  }

  return (
    <Sheet open={id !== null} onOpenChange={(o) => !o && surFermeture()}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-xl">
        {!d ? (
          <div className="grid gap-3 p-4">
            <SheetHeader className="p-0">
              <SheetTitle>Dossier</SheetTitle>
              <SheetDescription>Lecture du dossier…</SheetDescription>
            </SheetHeader>
            {lecture.isError ? <LectureEchouee message={lecture.error.message} /> : <Skeleton className="h-40" />}
          </div>
        ) : (
          <>
            <SheetHeader className="border-b">
              <SheetTitle className="flex flex-wrap items-center gap-2 pr-8">
                <span className="tabular-nums">{d.ref}</span>
                <StatutPastille ton={TON_CATEGORIE[d.categorie] ?? "neutre"}>
                  {d.statut === "clos" ? "Clos" : (CATEGORIE_COURTE[d.categorie] ?? d.categorie)}
                </StatutPastille>
                <StatutPastille ton={TON_PRIORITE[d.priorite]}>{LIBELLE_PRIORITE[d.priorite]}</StatutPastille>
                {d.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
              </SheetTitle>
              <SheetDescription>{d.titre}</SheetDescription>
            </SheetHeader>

            <div className="grid gap-3 p-4">
              <Bloc titre="Ce qui attend">
                <p className="text-corps">{d.motif ?? "—"}</p>
                {d.objet_ref && (
                  <p className="text-corps text-muted-foreground">
                    {d.objet_ref}
                    {d.etape_libelle ? ` · ${d.etape_libelle}` : ""}
                    {d.action_attendue ? ` · ${d.action_attendue}` : ""}
                  </p>
                )}
                <div className="flex flex-wrap gap-6 text-corps">
                  <span>
                    <span className="block text-legende text-muted-foreground">Délai de traitement</span>
                    <Echeance iso={d.echeance_traitement} maintenant={maintenant} />
                  </span>
                  {d.echeance && (
                    <span>
                      <span className="block text-legende text-muted-foreground">Échéance de l’opération</span>
                      <Echeance iso={d.echeance} maintenant={maintenant} />
                    </span>
                  )}
                </div>
                <p className="text-legende text-muted-foreground">
                  Équipe : {LIBELLE_EQUIPE[d.equipe] ?? d.equipe}
                  {d.escalade_vers ? ` · escaladé vers ${LIBELLE_EQUIPE[d.escalade_vers] ?? d.escalade_vers}` : ""}
                  {" · "}Responsable : {d.responsable_nom ?? "personne"}
                </p>
                {/* ⚠️ PAS POUR UN RECOURS : sa référence est celle du recours (REC-…), pas celle d'une
                    opération — même quand il porte un live (20261002007000). */}
                {d.source !== "recours" && d.objet_table && OPERATIONS.includes(d.objet_table) && d.objet_ref && (
                  <Link href={cheminFiche(d.objet_ref)} className="text-legende font-semibold text-h2h-primary">
                    Ouvrir la fiche complète de l’opération
                  </Link>
                )}
                {/* Un recours s'examine là où est la décision contestée : le dossier porte le compte
                    (une sanction) ou l'annonce (une décision de modération) — ou le live dont les
                    signalements ont été jugés non fondés (20261002007000). */}
                {d.source === "recours" && d.objet_id && (
                  d.objet_table === "live_sessions" ? (
                    <Link href={cheminLive(d.objet_id)} className="text-legende font-semibold text-h2h-primary">
                      Examiner le recours sur la fiche du live
                    </Link>
                  ) : d.objet_table === "products" || d.objet_table === "je_cherche_demandes" ? (
                    <Link href={cheminAnnonce(d.objet_id)} className="text-legende font-semibold text-h2h-primary">
                      Examiner le recours sur la fiche de {d.objet_table === "products" ? "l’annonce" : "la recherche"}
                    </Link>
                  ) : (
                    <Link href={cheminCompte(d.objet_id)} className="text-legende font-semibold text-h2h-primary">
                      Examiner le recours sur la fiche du compte
                    </Link>
                  )
                )}
                {/* Une publication qui attend l'équipe s'autorise ou se refuse sur la fiche de l'annonce. */}
                {d.source === "verification" && d.objet_id && (
                  <Link href={cheminAnnonce(d.objet_id)} className="text-legende font-semibold text-h2h-primary">
                    Vérifier l’annonce sur sa fiche
                  </Link>
                )}
                {/* Un message au support se lit et se répond sur la fiche du compte. */}
                {d.source === "support" && d.objet_id && (
                  <Link href={cheminCompte(d.objet_id)} className="text-legende font-semibold text-h2h-primary">
                    Répondre sur la fiche du compte
                  </Link>
                )}
                {/* Une demande de vérification se lit, se décide et se clôt sur la fiche du compte. */}
                {d.source === "verification_compte" && d.objet_id && (
                  <Link href={cheminCompte(d.objet_id)} className="text-legende font-semibold text-h2h-primary">
                    Ouvrir la fiche du compte
                  </Link>
                )}
                {/* L'opposition bancaire d'un paiement de service porte ce qu'il a acheté : l'annonce, la
                    recherche, le live. */}
                {d.source === "contestation" && d.objet_id && (
                  <Link
                    href={d.objet_table === "live_sessions" ? cheminLive(d.objet_id) : cheminAnnonce(d.objet_id)}
                    className="text-legende font-semibold text-h2h-primary"
                  >
                    Ouvrir la fiche {d.objet_table === "live_sessions" ? "du live"
                      : d.objet_table === "je_cherche_demandes" ? "de la recherche" : "de l’annonce"}
                  </Link>
                )}
                {/* Une rétractation porte l'annonce (ou la recherche) dont l'option est arrêtée. */}
                {d.source === "retractation" && d.objet_id && (
                  <Link href={cheminAnnonce(d.objet_id)} className="text-legende font-semibold text-h2h-primary">
                    Ouvrir la fiche de {d.objet_table === "je_cherche_demandes" ? "la recherche" : "l’annonce"}
                  </Link>
                )}
                {/* Des signalements s'examinent sur la fiche de ce qu'ils visent : l'annonce, la recherche, le compte,
                    le live (20261002007000). */}
                {d.source === "signalement" && d.objet_id && (
                  <Link
                    href={
                      d.objet_table === "products" || d.objet_table === "je_cherche_demandes"
                        ? cheminAnnonce(d.objet_id)
                        : d.objet_table === "live_sessions"
                          ? cheminLive(d.objet_id)
                          : cheminCompte(d.objet_id)
                    }
                    className="text-legende font-semibold text-h2h-primary"
                  >
                    Examiner les signalements sur la fiche{" "}
                    {d.objet_table === "products"
                      ? "de l’annonce"
                      : d.objet_table === "je_cherche_demandes"
                        ? "de la recherche"
                        : d.objet_table === "live_sessions"
                          ? "du live"
                          : "du compte"}
                  </Link>
                )}
              </Bloc>

              {/* Une rétractation se rembourse d'ici : à deux clés, avec son avoir à la réussite. */}
              {d.source === "retractation" && (
                <Bloc titre="Remboursement de l’option">
                  <RemboursementOption dossier={d.id} peutAgir={agir} maintenant={maintenant} surGeste={relire} />
                </Bloc>
              )}

              {agir && (
                <>
                  <Bloc titre="Responsable">
                    <div className="flex flex-wrap items-center gap-2">
                      {d.responsable !== moi && (
                        <Button
                          size="sm"
                          disabled={attribuer.enCours}
                          onClick={() =>
                            faire(attribuer.lancer({ dossier: d.id, responsable: null, attendu: d.responsable }, "Le dossier vous est attribué."))
                          }
                        >
                          M’attribuer le dossier
                        </Button>
                      )}
                      <select className={champ} value={confie} onChange={(e) => setConfie(e.target.value)} aria-label="Réattribuer à">
                        <option value="">Réattribuer à…</option>
                        {lecture.data!.equipiers
                          .filter((e) => e.profil !== d.responsable)
                          .map((e) => (
                            <option key={e.profil} value={e.profil}>
                              {e.nom}
                            </option>
                          ))}
                      </select>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!confie || attribuer.enCours}
                        onClick={() =>
                          faire(
                            attribuer.lancer({ dossier: d.id, responsable: confie, attendu: d.responsable }, "Dossier réattribué."),
                            () => setConfie(""),
                          )
                        }
                      >
                        Réattribuer
                      </Button>
                    </div>
                  </Bloc>

                  <Bloc titre="Note interne — reste dans le dossier, aucun utilisateur ne la lit">
                    <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Ce que l’équipe doit savoir." />
                    <Button
                      size="sm"
                      variant="outline"
                      className="justify-self-start"
                      disabled={note.trim().length < 3 || noter.enCours}
                      onClick={() => faire(noter.lancer({ dossier: d.id, texte: note.trim() }, "Note ajoutée."), () => setNote(""))}
                    >
                      <Lock /> Ajouter la note interne
                    </Button>
                  </Bloc>

                  {d.objet_table === "orders" && (
                    <Bloc titre="Demander une preuve — ce message PART à l’utilisateur">
                      <div className="flex flex-wrap gap-2">
                        <select className={champ} value={destinataire} onChange={(e) => setDestinataire(e.target.value)} aria-label="Destinataire">
                          <option value="acheteur">À l’acheteur</option>
                          <option value="vendeur">Au vendeur</option>
                          <option value="cotransporteur">Au cotransporteur</option>
                        </select>
                      </div>
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={2}
                        placeholder="Par exemple : une photo du colis à réception et du bordereau."
                      />
                      <Button
                        size="sm"
                        className="justify-self-start"
                        disabled={message.trim().length < 10 || preuve.enCours}
                        onClick={() =>
                          faire(
                            preuve.lancer({ dossier: d.id, destinataire, message: message.trim() }, "La demande est partie."),
                            () => setMessage(""),
                          )
                        }
                      >
                        <Send /> Envoyer la demande
                      </Button>
                    </Bloc>
                  )}

                  <Bloc titre="Priorité et escalade">
                    <div className="grid gap-2 sm:grid-cols-[auto_1fr_auto]">
                      <select className={champ} value={priorite} onChange={(e) => setPriorite(e.target.value as Priorite)} aria-label="Priorité">
                        {(["normale", "haute", "urgence"] as const).map((p) => (
                          <option key={p} value={p}>
                            {LIBELLE_PRIORITE[p]}
                          </option>
                        ))}
                      </select>
                      <Input value={motifPriorite} onChange={(e) => setMotifPriorite(e.target.value)} placeholder="Motif" aria-label="Motif de la priorité" />
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={motifPriorite.trim().length < 3 || priorite === d.priorite || prioriser.enCours}
                        onClick={() =>
                          faire(
                            prioriser.lancer({ dossier: d.id, priorite, motif: motifPriorite.trim() }, "Priorité changée."),
                            () => setMotifPriorite(""),
                          )
                        }
                      >
                        Changer
                      </Button>
                      <select className={champ} value={vers} onChange={(e) => setVers(e.target.value)} aria-label="Escalader vers">
                        {EQUIPES.map((e) => (
                          <option key={e} value={e}>
                            {LIBELLE_EQUIPE[e]}
                          </option>
                        ))}
                      </select>
                      <Input value={motifEscalade} onChange={(e) => setMotifEscalade(e.target.value)} placeholder="Motif" aria-label="Motif de l'escalade" />
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={motifEscalade.trim().length < 3 || escalader.enCours}
                        onClick={() =>
                          faire(
                            escalader.lancer({ dossier: d.id, vers, motif: motifEscalade.trim() }, "Dossier escaladé."),
                            () => setMotifEscalade(""),
                          )
                        }
                      >
                        Escalader
                      </Button>
                    </div>
                  </Bloc>

                  {(d.source === "manuel" || d.source === "securite") && (
                    <Bloc titre={d.source === "securite" ? "Clore l’alerte" : "Clore le ticket"}>
                      <div className="flex gap-2">
                        <Input value={motifCloture} onChange={(e) => setMotifCloture(e.target.value)} placeholder="Comment il a été réglé" aria-label="Motif de clôture" />
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={motifCloture.trim().length < 3 || clore.enCours}
                          onClick={() =>
                            faire(
                              clore.lancer(
                                { dossier: d.id, motif: motifCloture.trim() },
                                d.source === "securite" ? "Alerte close." : "Ticket clos.",
                              ),
                            )
                          }
                        >
                          Clore
                        </Button>
                      </div>
                    </Bloc>
                  )}
                  {d.source !== "manuel" && d.source !== "securite" && (
                    <p className="text-legende text-muted-foreground">{CLOTURE_AUTOMATIQUE[d.source]}</p>
                  )}
                </>
              )}

              <h3 className="mt-2 text-h3 font-semibold">Journal du dossier</h3>
              <ol className="grid">
                {[...lecture.data!.evenements].reverse().map((e) => (
                  <li
                    key={e.id}
                    className={cn(
                      "grid gap-0.5 border-b py-2.5 last:border-0",
                      e.genre === "note" && "rounded-lg border-0 bg-h2h-surface-elevated px-3",
                    )}
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{GENRE[e.genre]}</span>
                      {e.genre === "note" && <StatutPastille ton="neutre">Interne</StatutPastille>}
                      {e.genre === "demande_preuve" && <StatutPastille ton="marque">Envoyé à l’utilisateur</StatutPastille>}
                    </span>
                    {e.texte && <span className="whitespace-pre-wrap text-corps">{e.texte}</span>}
                    <span className="text-legende text-muted-foreground">
                      {e.acteur} · {dateCourte(e.le, maintenant)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
