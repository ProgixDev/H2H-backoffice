"use client";

import { useState } from "react";
import { cn } from "cn";
import { DialogueExamenRecours, type ExamenSaisi } from "@/components/bo/DialogueExamenRecours";
import { DialogueMotif } from "@/components/bo/DialogueMotif";
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
import { useGeste } from "@/lib/db/useGeste";
import {
  autoriserPublication,
  demanderCorrection,
  examinerRecoursModeration,
  masquerAnnonce,
  refuserPublication,
  retablirAnnonce,
  retirerAnnonce,
} from "@/lib/annonces/actions";
import {
  MOTIFS_CORRECTION,
  type ModerationFiche,
  type MotifCorrection,
  type NatureAnnonce,
} from "@/lib/annonces/types";

// Les longueurs que la base exige : le message dit à l'auteur, le motif gardé par l'équipe.
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;
const MOTIF_MIN = 5;

type Geste = "masquer" | "retirer" | "corriger" | "refuser";
type Saisie = { correction: MotifCorrection | null; message: string; motif: string };

const TITRE: Record<Geste, string> = {
  masquer: "Masquer",
  retirer: "Retirer",
  corriger: "Demander une correction",
  refuser: "Refuser la publication",
};

/** Le titre de la fenêtre : le geste, et ce qu'il vise quand il le nomme. */
const titre = (g: Geste, quoi: string) => (g === "masquer" || g === "retirer" ? `${TITRE[g]} ${quoi}` : TITRE[g]);

function description(g: Geste, quoi: string, enVerification: boolean): string {
  const Quoi = `${quoi.charAt(0).toUpperCase()}${quoi.slice(1)}`;
  switch (g) {
    case "masquer":
      return `Personne d’autre que son auteur ne verra plus ${quoi} : elle ne s’achète, ne s’offre ni ne se discute plus. Ce qui est déjà engagé autour d’elle va au bout. L’auteur reçoit votre message ; l’équipe peut la rétablir.`;
    case "retirer":
      return `C’est définitif : ${quoi} ne reviendra pas, sauf si un recours est accepté, et elle ne se modifie plus. Ce qui est déjà engagé autour d’elle va au bout. L’auteur reçoit votre message.`;
    case "corriger":
      return enVerification
        ? `${Quoi} attend toujours sa vérification. L’auteur reçoit votre demande ; la modification qu’il fait ensuite ne lui est pas facturée, et elle arrive au dossier « À traiter ».`
        : `${Quoi} reste en ligne. L’auteur reçoit votre demande, et la modification qu’il fait ensuite ne lui est pas facturée.`;
    case "refuser":
      return `${Quoi} ne sera pas publiée : elle ne se montrera pas et ne se modifie plus. Seul un recours accepté la publierait. L’auteur reçoit votre message, avec la manière de contester.`;
  }
}

/**
 * Les gestes de modération d'une annonce ou d'une recherche : masquer,
 * rétablir, retirer, demander une correction — et, pour une annonce qui attend
 * sa vérification (D25), autoriser ou refuser sa publication.
 *
 * ⚠️ L'ÉCRAN MONTRE CE QUE LA BASE PERMET (`possibles`) — et la base décide
 * encore : la permission, l'identité reconfirmée pour masquer, retirer et
 * refuser, un motif, un message, l'état, jamais sa propre annonce.
 */
export function GestesModeration({
  id,
  nature,
  possibles,
  enVerification = false,
}: {
  id: string;
  nature: NatureAnnonce;
  possibles: ModerationFiche["possibles"];
  /** Elle attend sa vérification : une correction demandée ne la met pas en ligne. */
  enVerification?: boolean;
}) {
  const [geste, setGeste] = useState<Geste | null>(null);
  const [aRetablir, setARetablir] = useState(false);
  const [aAutoriser, setAAutoriser] = useState(false);
  const masquer = useGeste(masquerAnnonce);
  const retirer = useGeste(retirerAnnonce);
  const corriger = useGeste(demanderCorrection);
  const refuser = useGeste(refuserPublication);
  const retablirGeste = useGeste(retablirAnnonce);
  const autoriserGeste = useGeste(autoriserPublication);
  const enCours = masquer.enCours || retirer.enCours || corriger.enCours || refuser.enCours;
  const quoi = nature === "annonce" ? "cette annonce" : "cette recherche";

  if (!possibles.moderer) {
    return <p className="text-legende text-muted-foreground">{possibles.raison}</p>;
  }

  async function confirmer(s: Saisie) {
    if (!geste) return;
    const commun = { annonce: id, message: s.message, motif: s.motif };
    const r =
      geste === "masquer"
        ? await masquer.lancer(commun, "Masquée : l’auteur est prévenu.")
        : geste === "retirer"
          ? await retirer.lancer(commun, "Retirée : l’auteur est prévenu.")
          : geste === "refuser"
            ? await refuser.lancer(commun, "Publication refusée : l’auteur est prévenu.")
            : s.correction
            ? await corriger.lancer({ ...commun, correction: s.correction }, "Correction demandée : l’auteur est prévenu.")
            : null;
    if (r?.ok) setGeste(null);
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {possibles.autoriser && <Button onClick={() => setAAutoriser(true)}>Autoriser la publication</Button>}
        {possibles.refuser && (
          <Button variant="destructive" onClick={() => setGeste("refuser")}>
            Refuser la publication
          </Button>
        )}
        {possibles.corriger && (
          <Button variant="outline" onClick={() => setGeste("corriger")}>
            Demander une correction
          </Button>
        )}
        {possibles.masquer && (
          <Button variant="outline" onClick={() => setGeste("masquer")}>
            Masquer
          </Button>
        )}
        {possibles.retablir && (
          <Button variant="outline" onClick={() => setARetablir(true)}>
            Rétablir
          </Button>
        )}
        {possibles.retirer && (
          <Button variant="destructive" onClick={() => setGeste("retirer")}>
            Retirer
          </Button>
        )}
      </div>
      <DialogueModeration
        geste={geste}
        quoi={quoi}
        enVerification={enVerification}
        enCours={enCours}
        surFermeture={() => setGeste(null)}
        surConfirmation={confirmer}
      />
      <DialogueMotif
        ouvert={aRetablir}
        surFermeture={() => setARetablir(false)}
        titre={`Rétablir ${quoi} ?`}
        description="Elle se montre de nouveau à tous, et son auteur en est prévenu. Ce motif reste au journal de l’équipe."
        libelleAction="Rétablir"
        longueurMin={MOTIF_MIN}
        enCours={retablirGeste.enCours}
        surConfirmation={async (motif) => {
          const r = await retablirGeste.lancer({ annonce: id, motif }, "Rétablie : l’auteur est prévenu.");
          if (r?.ok) setARetablir(false);
        }}
      />
      <DialogueMotif
        ouvert={aAutoriser}
        surFermeture={() => setAAutoriser(false)}
        titre={`Autoriser la publication de ${quoi} ?`}
        description="Elle se montre à tous dès maintenant, et son auteur en est prévenu ; une Offre Flash commence sa fenêtre d’offres, entière. Ce motif reste au journal de l’équipe."
        libelleAction="Autoriser"
        longueurMin={MOTIF_MIN}
        enCours={autoriserGeste.enCours}
        surConfirmation={async (motif) => {
          const r = await autoriserGeste.lancer({ annonce: id, motif }, "Publication autorisée : l’auteur est prévenu.");
          if (r?.ok) setAAutoriser(false);
        }}
      />
    </>
  );
}

function DialogueModeration({
  geste,
  quoi,
  enVerification,
  enCours,
  surFermeture,
  surConfirmation,
}: {
  geste: Geste | null;
  quoi: string;
  enVerification: boolean;
  enCours: boolean;
  surFermeture: () => void;
  surConfirmation: (s: Saisie) => void;
}) {
  const [correction, setCorrection] = useState<MotifCorrection | null>(null);
  const [message, setMessage] = useState("");
  const [motif, setMotif] = useState("");

  const longueur = message.trim().length;
  const valide =
    geste !== null &&
    (geste !== "corriger" || correction !== null) &&
    longueur >= MESSAGE_MIN &&
    longueur <= MESSAGE_MAX &&
    motif.trim().length >= MOTIF_MIN;

  const fermer = () => {
    setCorrection(null);
    setMessage("");
    setMotif("");
    surFermeture();
  };

  return (
    <Dialog open={geste !== null} onOpenChange={(o) => !o && fermer()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{geste ? titre(geste, quoi) : ""}</DialogTitle>
          <DialogDescription>{geste ? description(geste, quoi, enVerification) : ""}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          {geste === "corriger" && (
            <div className="grid gap-2">
              <Label>Ce qui est à corriger</Label>
              <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Ce qui est à corriger">
                {MOTIFS_CORRECTION.map((m) => (
                  <button
                    key={m.code}
                    type="button"
                    role="radio"
                    aria-checked={correction === m.code}
                    onClick={() => setCorrection(m.code)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left text-corps font-medium transition-colors",
                      correction === m.code ? "border-h2h-primary bg-h2h-primary-light text-h2h-primary" : "hover:bg-muted",
                    )}
                  >
                    {m.libelle}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="message-moderation">Message à l’auteur</Label>
            <Textarea
              id="message-moderation"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                geste === "corriger"
                  ? "Ce qu’il faut changer, en une phrase au moins. Il lui est envoyé tel quel."
                  : "Ce qui ne va pas, en une phrase au moins. Il lui est envoyé tel quel."
              }
              rows={3}
            />
            <span className={cn("text-legende", longueur > MESSAGE_MAX ? "text-h2h-error" : "text-muted-foreground")}>
              {longueur} / {MESSAGE_MAX} caractères
            </span>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="motif-moderation">Motif interne</Label>
            <Textarea
              id="motif-moderation"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Il reste au journal d’audit : l’auteur ne le lit pas."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={fermer} disabled={enCours}>
            Annuler
          </Button>
          <Button
            variant={geste === "retirer" || geste === "refuser" ? "destructive" : "default"}
            disabled={!valide || enCours}
            onClick={() => surConfirmation({ correction, message: message.trim(), motif: motif.trim() })}
          >
            {enCours ? "Un instant…" : geste ? TITRE[geste] : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Examiner le recours de l'auteur contre un masquage ou un retrait : l'accepter
 * ou le rejeter, une réponse à l'auteur, un motif pour l'équipe.
 *
 * ⚠️ LA BASE DÉCIDE ENCORE : la permission de modérer, l'identité reconfirmée,
 * jamais par l'auteur de la décision, jamais sur son propre compte, une fois.
 * Le bouton n'apparaît que si la fiche le permet (`examinable`).
 */
export function ExaminerRecoursAnnonce({
  recours,
  annonce,
  reference,
}: {
  recours: string;
  annonce: string;
  reference: string;
}) {
  const [ouvert, setOuvert] = useState(false);
  const examiner = useGeste(examinerRecoursModeration);

  async function confirmer(s: ExamenSaisi) {
    const r = await examiner.lancer(
      { recours, annonce, ...s },
      s.decision === "accepte" ? "Recours accepté : l’auteur est prévenu." : "Recours rejeté : l’auteur est prévenu.",
    );
    if (r?.ok) setOuvert(false);
  }

  return (
    <>
      <Button size="sm" onClick={() => setOuvert(true)}>
        Examiner le recours
      </Button>
      {/* Remontée à chaque ouverture : une saisie abandonnée ne revient pas. */}
      <DialogueExamenRecours
        key={ouvert ? "ouvert" : "ferme"}
        ouvert={ouvert}
        surFermeture={() => setOuvert(false)}
        reference={reference}
        description="L’auteur reçoit votre réponse, avec ce qui s’ensuit pour son annonce. Le dossier « À traiter » se clôt."
        aides={{
          accepte:
            "La décision est annulée. Si elle s’applique encore, l’annonce se montre de nouveau — une annonce retirée comprise.",
          rejete: "La décision est maintenue. L’auteur en connaît la raison par votre réponse.",
        }}
        enCours={examiner.enCours}
        surConfirmation={confirmer}
      />
    </>
  );
}
