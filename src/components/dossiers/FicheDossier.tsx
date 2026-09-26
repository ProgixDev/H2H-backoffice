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
  EQUIPES,
  LIBELLE_EQUIPE,
  LIBELLE_PRIORITE,
  type DetailDossier,
  type EvenementDossier,
  type Priorite,
} from "@/lib/dossiers/types";
import { TON_CATEGORIE, TON_PRIORITE } from "./tons";

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
                  {d.statut === "clos" ? "Clos" : (CATEGORIES[d.categorie] ?? d.categorie)}
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
                {d.objet_table && d.objet_table !== "taches" && (
                  <Link href={`/activite-en-direct?q=${encodeURIComponent(d.objet_ref ?? "")}`} className="text-legende font-semibold text-h2h-primary">
                    Voir l’opération dans Activité en direct
                  </Link>
                )}
              </Bloc>

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

                  {d.source === "manuel" && (
                    <Bloc titre="Clore le ticket">
                      <div className="flex gap-2">
                        <Input value={motifCloture} onChange={(e) => setMotifCloture(e.target.value)} placeholder="Comment il a été réglé" aria-label="Motif de clôture" />
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={motifCloture.trim().length < 3 || clore.enCours}
                          onClick={() => faire(clore.lancer({ dossier: d.id, motif: motifCloture.trim() }, "Ticket clos."))}
                        >
                          Clore
                        </Button>
                      </div>
                    </Bloc>
                  )}
                  {d.source !== "manuel" && (
                    <p className="text-legende text-muted-foreground">
                      Ce dossier se clôt tout seul quand l’opération n’attend plus l’équipe.
                    </p>
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

// Les libellés courts des groupes, pour la pastille (le bandeau a les longs).
const CATEGORIES: Record<string, string> = {
  urgence_securite: "Urgence sécurité",
  echec: "En échec",
  contestation: "Contestation",
  echeance_depassee: "Échéance dépassée",
  reponse_recue: "Réponse reçue",
  echeance_proche: "Échéance proche",
  sans_responsable: "Sans responsable",
  pret_decision: "Prêt pour décision",
};
