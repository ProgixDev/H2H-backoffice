"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "cn";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { Tableau } from "@/components/operations/commun";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { dateHeure } from "@/lib/dates";
import { useGeste } from "@/lib/db/useGeste";
import { cloreVerification, demanderVerification } from "@/lib/utilisateurs/actions";
import {
  MESSAGE_DEMANDE_MAX,
  MESSAGE_DEMANDE_MIN,
  MODELES_DEMANDE,
  MOTIF_VERIFICATION_MAX,
  MOTIF_VERIFICATION_MIN,
  type DemandeVerification,
  type FicheCompte,
  type ObjetVerification,
} from "@/lib/utilisateurs/types";

type Verifications = FicheCompte["verifications"];

/** L'état d'une demande, en une pastille : une issue défavorable n'est jamais verte. */
function EtatDemande({ d }: { d: DemandeVerification }) {
  if (d.statut === "en_attente") return <StatutPastille ton="attention">En attente de sa réponse</StatutPastille>;
  if (d.statut === "repondue") return <StatutPastille ton="actif">Réponse reçue</StatutPastille>;
  return d.issue === "verifiee" ? (
    <StatutPastille ton="succes">Close — vérification faite</StatutPastille>
  ) : (
    <StatutPastille ton="muet">Close — sans suite</StatutPastille>
  );
}

/**
 * Les vérifications demandées à un compte (§8 R8.2) : ce qui a été demandé, par
 * quel équipier, où en est la réponse, et comment la demande s'est close — avec
 * les gestes pour en demander une, ou clore celles qui attendent.
 *
 * ⚠️ LA DEMANDE PART AU NOM DE HANDTOHAND, dans le fil de la personne avec le
 * support ; sa réponse arrive dans ce fil. L'écran montre ce que la base permet
 * (`possibles.demander`), et la base décide encore.
 */
export function DemandesVerification({ profil, v }: { profil: string; v: Verifications }) {
  const [demander, setDemander] = useState(false);
  const [aClore, setAClore] = useState<DemandeVerification | null>(null);
  const possibles = v.possibles.demander;

  return (
    <div className="grid gap-2">
      {v.demandes_equipe.length > 0 && (
        <Tableau entetes={["Vérification demandée", "Par", "État", "Dossier", ""]} largeur={640}>
          {v.demandes_equipe.map((d) => (
            <tr key={d.id}>
              <td>
                <span className="font-medium">{d.libelle}</span>
                <span className="block text-legende text-muted-foreground tabular-nums">{dateHeure(d.demandee_le)}</span>
              </td>
              <td>{d.par ?? "—"}</td>
              <td>
                <EtatDemande d={d} />
                {d.statut === "close" && d.motif_cloture && (
                  <span className="block text-legende text-muted-foreground">{d.motif_cloture}</span>
                )}
              </td>
              <td>
                {d.dossier ? (
                  <Link href={`/a-traiter?dossier=${d.dossier.id}`} className="font-semibold tabular-nums text-h2h-primary hover:underline">
                    {d.dossier.reference}
                  </Link>
                ) : (
                  "—"
                )}
              </td>
              <td className="text-right">
                {d.statut !== "close" && possibles.possible && (
                  <Button variant="outline" size="sm" onClick={() => setAClore(d)}>
                    Clore
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </Tableau>
      )}
      {possibles.possible ? (
        <div>
          <Button variant="outline" size="sm" onClick={() => setDemander(true)}>
            Demander une vérification
          </Button>
        </div>
      ) : (
        <p className="text-legende text-muted-foreground">{possibles.raison}</p>
      )}
      <DialogueDemande profil={profil} ouvert={demander} objets={possibles.objets} surFermeture={() => setDemander(false)} />
      <DialogueClore profil={profil} demande={aClore} surFermeture={() => setAClore(null)} />
    </div>
  );
}

/** Choisir ce qu'il faut vérifier ; le texte proposé s'ajuste avant l'envoi. */
function DialogueDemande({
  profil,
  ouvert,
  objets,
  surFermeture,
}: {
  profil: string;
  ouvert: boolean;
  objets: Verifications["possibles"]["demander"]["objets"];
  surFermeture: () => void;
}) {
  const envoi = useGeste(demanderVerification);
  const [objet, setObjet] = useState<ObjetVerification | null>(null);
  const [texte, setTexte] = useState("");
  const longueur = texte.trim().length;
  const valide = objet !== null && longueur >= MESSAGE_DEMANDE_MIN && longueur <= MESSAGE_DEMANDE_MAX;

  const fermer = () => {
    setObjet(null);
    setTexte("");
    surFermeture();
  };
  const choisir = (o: ObjetVerification) => {
    setObjet(o);
    setTexte(MODELES_DEMANDE[o]);
  };

  async function envoyer() {
    if (!objet) return;
    const r = await envoi.lancer({ profil, objet, texte: texte.trim() }, "Demande envoyée : la personne est prévenue.");
    if (r?.ok) fermer();
  }

  return (
    <Dialog open={ouvert} onOpenChange={(o) => !o && fermer()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Demander une vérification</DialogTitle>
          <DialogDescription>
            La demande part dans son fil avec le support, au nom de HandtoHand, avec un avis sur son téléphone. Un
            dossier « À traiter » attend sa réponse, à votre nom ; sans réponse, il vous revient dans sept jours.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2" role="radiogroup" aria-label="Ce qu’il faut vérifier">
            <Label>Ce qu’il faut vérifier</Label>
            {objets.map((o) => (
              <button
                key={o.objet}
                type="button"
                role="radio"
                aria-checked={objet === o.objet}
                disabled={o.raison !== null}
                onClick={() => choisir(o.objet)}
                className={cn(
                  "grid gap-0.5 rounded-lg border px-3 py-2 text-left text-corps transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                  objet === o.objet ? "border-h2h-primary bg-h2h-primary-light text-h2h-primary" : "hover:bg-muted",
                )}
              >
                <span className="font-semibold first-letter:uppercase">{o.libelle}</span>
                {o.raison && <span className="text-legende text-muted-foreground">{o.raison}</span>}
              </button>
            ))}
          </div>
          {objet && (
            <div className="grid gap-2">
              <Label htmlFor="texte-demande">Message à la personne</Label>
              <Textarea id="texte-demande" value={texte} onChange={(e) => setTexte(e.target.value)} rows={5} />
              <span className={cn("text-legende", longueur > MESSAGE_DEMANDE_MAX ? "text-h2h-error" : "text-muted-foreground")}>
                {longueur} / {MESSAGE_DEMANDE_MAX} caractères — elle le lit tel quel, sous « Support HandtoHand ».
              </span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={fermer} disabled={envoi.enCours}>
            Annuler
          </Button>
          <Button disabled={!valide || envoi.enCours} onClick={envoyer}>
            {envoi.enCours ? "Un instant…" : "Envoyer la demande"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Clore une demande : vérification faite, ou sans suite — et son dossier avec elle. */
function DialogueClore({
  profil,
  demande,
  surFermeture,
}: {
  profil: string;
  demande: DemandeVerification | null;
  surFermeture: () => void;
}) {
  const clore = useGeste(cloreVerification);
  const [issue, setIssue] = useState<"verifiee" | "sans_suite" | null>(null);
  const [motif, setMotif] = useState("");
  const longueur = motif.trim().length;
  const valide = issue !== null && longueur >= MOTIF_VERIFICATION_MIN && longueur <= MOTIF_VERIFICATION_MAX;

  const fermer = () => {
    setIssue(null);
    setMotif("");
    surFermeture();
  };

  async function confirmer() {
    if (!demande || !issue) return;
    const r = await clore.lancer({ demande: demande.id, profil, issue, motif: motif.trim() }, "Demande close.");
    if (r?.ok) fermer();
  }

  return (
    <Dialog open={demande !== null} onOpenChange={(o) => !o && fermer()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clore la demande ({demande?.libelle})</DialogTitle>
          <DialogDescription>
            Son dossier « À traiter » se clôt avec elle. Ce qui en découle — reconnaître un professionnel, valider un rôle
            — reste un geste à part, sur cette fiche. Ce motif reste au journal de l’équipe.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Issue">
            {(
              [
                ["verifiee", "Vérification faite"],
                ["sans_suite", "Sans suite"],
              ] as const
            ).map(([valeur, libelle]) => (
              <button
                key={valeur}
                type="button"
                role="radio"
                aria-checked={issue === valeur}
                onClick={() => setIssue(valeur)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-corps transition-colors",
                  issue === valeur ? "border-h2h-primary bg-h2h-primary-light text-h2h-primary" : "hover:bg-muted",
                )}
              >
                {libelle}
              </button>
            ))}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="motif-cloture">Motif interne</Label>
            <Textarea
              id="motif-cloture"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Il reste au journal d'audit : la personne ne le lit pas."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={fermer} disabled={clore.enCours}>
            Annuler
          </Button>
          <Button disabled={!valide || clore.enCours} onClick={confirmer}>
            {clore.enCours ? "Un instant…" : "Clore"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
