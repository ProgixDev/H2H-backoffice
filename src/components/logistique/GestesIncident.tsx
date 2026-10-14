"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "cn";
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
import { deciderValidation } from "@/lib/equipe/actions";
import { cloreDeclaration, preparerDecisionIncident } from "@/lib/logistique/actions";
import {
  LIBELLE_ROLE_INCIDENT,
  PHRASE_ISSUE_INCIDENT,
  type IssueIncident,
  type RoleIncident,
} from "@/lib/logistique/types";

// Les longueurs que la base exige.
const REPONSE_MIN = 10;
const REPONSE_MAX = 2000;
const MOTIF_MIN = 5;

const ISSUES: { valeur: IssueIncident; libelle: string; aide: string }[] = [
  {
    valeur: "retenue",
    libelle: "Retenue",
    aide: "Ce que la déclaration affirme est établi — l’absence, le blocage, le refus. Sa contestation est rejetée.",
  },
  {
    valeur: "ecartee",
    libelle: "Non retenue",
    aide: "Ce que la déclaration affirme n’est pas établi. Sa contestation est acceptée.",
  },
  {
    valeur: "classee",
    libelle: "Classée sans suite",
    aide: "Rien ne permet de trancher : ni la déclaration ni sa contestation ne l’emporte.",
  },
];

type Saisie = { issue: IssueIncident | null; responsables: RoleIncident[]; reponse: string; motif: string };

/** Un blocage retenu dit à qui il est imputé — et lui seul : la base refuse toute autre imputation. */
export const imputationDemandee = (issue: IssueIncident | null, imputables: RoleIncident[]) =>
  issue === "retenue" && imputables.length > 0;

/** Ce qui part à la base : aucun responsable hors d'un blocage retenu, même si une case est restée cochée. */
export const responsablesEnvoyes = (s: Pick<Saisie, "issue" | "responsables">, imputables: RoleIncident[]) =>
  imputationDemandee(s.issue, imputables) ? imputables.filter((r) => s.responsables.includes(r)) : [];

const texteValide = (reponse: string, motif: string) => {
  const longueur = reponse.trim().length;
  return longueur >= REPONSE_MIN && longueur <= REPONSE_MAX && motif.trim().length >= MOTIF_MIN;
};

/** La saisie est complète — un confort : la base refuse de toute façon ce qui manque (`BO_MOTIF`). */
export const decisionValide = (s: Saisie, imputables: RoleIncident[]) =>
  s.issue !== null &&
  texteValide(s.reponse, s.motif) &&
  (!imputationDemandee(s.issue, imputables) || responsablesEnvoyes(s, imputables).length > 0);

/** Une réponse à son auteur et un motif interne, aux longueurs que la base exige. */
export const clotureValide = (reponse: string, motif: string) => texteValide(reponse, motif);

function Reponse({
  id,
  libelle,
  aide,
  valeur,
  surSaisie,
}: {
  id: string;
  libelle: string;
  aide: string | null;
  valeur: string;
  surSaisie: (v: string) => void;
}) {
  const longueur = valeur.trim().length;
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{libelle}</Label>
      {aide && <p className="text-legende text-muted-foreground">{aide}</p>}
      <Textarea
        id={id}
        value={valeur}
        onChange={(e) => surSaisie(e.target.value)}
        placeholder="Ce que l’équipe a constaté. Elle est envoyée telle quelle."
        rows={4}
      />
      <span className={cn("text-legende", longueur > REPONSE_MAX ? "text-h2h-error" : "text-muted-foreground")}>
        {longueur} / {REPONSE_MAX} caractères
      </span>
    </div>
  );
}

function Motif({ id, valeur, surSaisie }: { id: string; valeur: string; surSaisie: (v: string) => void }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>Motif interne</Label>
      <Textarea
        id={id}
        value={valeur}
        onChange={(e) => surSaisie(e.target.value)}
        placeholder="Il reste au journal d’audit : les participants ne le lisent pas."
        rows={2}
      />
    </div>
  );
}

/**
 * « Préparer une décision » (§ 12.5) : l'issue, à qui un blocage retenu est
 * imputé, la réponse que les trois participants recevront, le motif interne.
 *
 * ⚠️ CE GESTE NE DÉCIDE RIEN : il dépose une demande, qu'un AUTRE membre de la
 * Logistique ou de la Direction valide — depuis cette même fiche.
 * 🔴 À QUI UN BLOCAGE PEUT S'IMPUTER EST DIT PAR LA BASE (`imputables`) : l'écran
 * n'en décide pas.
 */
export function GestePreparerDecision({
  incident,
  libelle,
  imputables,
}: {
  incident: string;
  /** Le libellé du formulaire, tel que les participants le lisent. */
  libelle: string;
  imputables: RoleIncident[];
}) {
  const [ouvert, setOuvert] = useState(false);
  const [issue, setIssue] = useState<IssueIncident | null>(null);
  const [responsables, setResponsables] = useState<RoleIncident[]>([]);
  const [reponse, setReponse] = useState("");
  const [motif, setMotif] = useState("");
  const preparer = useGeste(preparerDecisionIncident);

  const saisie = { issue, responsables, reponse, motif };
  const imputer = imputationDemandee(issue, imputables);

  return (
    <>
      <Button
        size="sm"
        className="w-fit"
        onClick={() => {
          // Une saisie abandonnée ne revient pas.
          setIssue(null);
          setResponsables([]);
          setReponse("");
          setMotif("");
          setOuvert(true);
        }}
      >
        Préparer une décision
      </Button>
      <Dialog open={ouvert} onOpenChange={(o) => !o && setOuvert(false)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Préparer une décision</DialogTitle>
            <DialogDescription>
              Rien n’est décidé à cette étape : un autre membre de la Logistique ou de la Direction valide votre
              proposition. À sa validation, les trois participants reçoivent la réponse, l’incident et ses
              contestations sont clos — ils ne retiennent plus les versements de la commande.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2" role="radiogroup" aria-label="Issue">
              {ISSUES.map((d) => (
                <button
                  key={d.valeur}
                  type="button"
                  role="radio"
                  aria-checked={issue === d.valeur}
                  onClick={() => setIssue(d.valeur)}
                  className={cn(
                    "grid gap-0.5 rounded-lg border px-3 py-2 text-left text-corps transition-colors",
                    issue === d.valeur ? "border-h2h-primary bg-h2h-primary-light text-h2h-primary" : "hover:bg-muted",
                  )}
                >
                  <span className="font-medium">{d.libelle}</span>
                  <span className="text-legende text-muted-foreground">{d.aide}</span>
                </button>
              ))}
            </div>
            {imputer && (
              <div className="grid gap-2" role="group" aria-label="Imputé à">
                <Label>Ce blocage est imputé à</Label>
                <p className="text-legende text-muted-foreground">
                  Un blocage ne vise personne : retenu, il s’impute à ceux qui avaient rendez-vous — l’un, l’autre, ou
                  les deux. Sinon, classez-le sans suite.
                </p>
                {imputables.map((r) => (
                  <button
                    key={r}
                    type="button"
                    role="checkbox"
                    aria-checked={responsables.includes(r)}
                    onClick={() => setResponsables((c) => (c.includes(r) ? c.filter((x) => x !== r) : [...c, r]))}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left text-corps font-medium transition-colors",
                      responsables.includes(r) ? "border-h2h-primary bg-h2h-primary-light text-h2h-primary" : "hover:bg-muted",
                    )}
                  >
                    {LIBELLE_ROLE_INCIDENT[r]}
                  </button>
                ))}
              </div>
            )}
            <Reponse
              id={`reponse-decision-${incident}`}
              libelle="Réponse aux trois participants"
              aide={issue ? `Elle est suivie de : « La déclaration « ${libelle} » ${PHRASE_ISSUE_INCIDENT[issue]}. »` : null}
              valeur={reponse}
              surSaisie={setReponse}
            />
            <Motif id={`motif-decision-${incident}`} valeur={motif} surSaisie={setMotif} />
            <p className="rounded-lg border border-dashed px-3 py-2 text-legende text-muted-foreground">
              Cette décision ne déplace aucun argent : elle n’annule rien, ne rembourse rien, ne prélève rien. Une
              annulation ou un remboursement se fait par sa propre procédure, sur la commande.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOuvert(false)} disabled={preparer.enCours}>
              Annuler
            </Button>
            <Button
              disabled={!decisionValide(saisie, imputables) || preparer.enCours}
              onClick={async () => {
                if (!issue) return;
                const r = await preparer.lancer(
                  {
                    incident,
                    issue,
                    responsables: responsablesEnvoyes(saisie, imputables),
                    reponse: reponse.trim(),
                    motif: motif.trim(),
                  },
                  "Décision préparée : elle attend la validation d’un autre membre de l’équipe.",
                );
                if (r?.ok) setOuvert(false);
              }}
            >
              {preparer.enCours ? "Un instant…" : "Préparer la décision"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * La seconde clé d'une décision préparée : la valider, ou la refuser.
 *
 * ⚠️ LA BASE DIT QUI LE PEUT (`peut_valider`) ET REFUSE DE TOUTE FAÇON : celui qui
 * a préparé (`BO_QUATRE_YEUX`), un rôle qui ne valide pas, une partie à la
 * co-livraison, un incident qui a changé depuis la demande.
 */
export function GesteSecondeCle({ validation }: { validation: string }) {
  const [choix, setChoix] = useState<"valider" | "refuser" | null>(null);
  const decider = useGeste(deciderValidation);
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => setChoix("refuser")} disabled={decider.enCours}>
        <X /> Refuser
      </Button>
      <Button size="sm" onClick={() => setChoix("valider")} disabled={decider.enCours}>
        <Check /> Valider la décision
      </Button>
      <DialogueMotif
        ouvert={choix !== null}
        surFermeture={() => setChoix(null)}
        destructif={choix === "refuser"}
        motifObligatoire={choix === "refuser"}
        titre={choix === "refuser" ? "Refuser la décision préparée" : "Valider la décision"}
        description={
          choix === "refuser"
            ? "La demande s’annule : l’incident attend de nouveau sa décision. Un refus se motive : la personne qui l’a préparée le lira au journal."
            : "La décision est rendue tout de suite : les trois participants reçoivent la réponse, l’incident et ses contestations sont clos, et ne retiennent plus les versements. Si l’incident a changé depuis la demande, rien n’est décidé."
        }
        libelleAction={choix === "refuser" ? "Refuser" : "Valider"}
        enCours={decider.enCours}
        surConfirmation={async (motif) => {
          const r = await decider.lancer(
            { validation, approuver: choix === "valider", motif },
            choix === "refuser"
              ? "Décision refusée : l’incident attend de nouveau sa décision."
              : "Décision rendue : les trois participants sont prévenus.",
          );
          if (r) setChoix(null);
        }}
      />
    </div>
  );
}

/**
 * « Clôturer le traitement interne » (§ 12.5) d'une déclaration transmise à
 * l'équipe qui n'est pas un incident : une annulation déposée par formulaire, la
 * contestation d'une décision. Une clé : une réponse à son auteur, un motif.
 */
export function GesteCloreDeclaration({
  declaration,
  operation,
  libelle,
  surGeste,
}: {
  declaration: string;
  /** La référence de l'opération : sa fiche est relue après le geste. */
  operation: string;
  libelle: string;
  /** La fiche complète relit ce qu'elle montre : elle ne vient pas du rendu serveur. */
  surGeste?: () => void;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [reponse, setReponse] = useState("");
  const [motif, setMotif] = useState("");
  const clore = useGeste(cloreDeclaration);

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="w-fit"
        onClick={() => {
          setReponse("");
          setMotif("");
          setOuvert(true);
        }}
      >
        Clôturer le traitement
      </Button>
      <Dialog open={ouvert} onOpenChange={(o) => !o && setOuvert(false)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Clôturer le traitement — {libelle}</DialogTitle>
            <DialogDescription>
              Son auteur reçoit votre réponse dans son application — jamais le motif interne. La déclaration est close :
              elle ne retient plus les versements de la commande. Ce geste n’annule rien et ne rembourse rien : une
              annulation se fait par sa propre procédure.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Reponse
              id={`reponse-cloture-${declaration}`}
              libelle="Réponse à l’auteur de la déclaration"
              aide={`Elle est suivie de : « Votre déclaration « ${libelle} » a été traitée par l’équipe H2H Logistic. »`}
              valeur={reponse}
              surSaisie={setReponse}
            />
            <Motif id={`motif-cloture-${declaration}`} valeur={motif} surSaisie={setMotif} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOuvert(false)} disabled={clore.enCours}>
              Annuler
            </Button>
            <Button
              disabled={!clotureValide(reponse, motif) || clore.enCours}
              onClick={async () => {
                const r = await clore.lancer(
                  { declaration, operation, reponse: reponse.trim(), motif: motif.trim() },
                  "Déclaration close : son auteur est prévenu.",
                );
                if (r?.ok) {
                  setOuvert(false);
                  surGeste?.();
                }
              }}
            >
              {clore.enCours ? "Un instant…" : "Clôturer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
