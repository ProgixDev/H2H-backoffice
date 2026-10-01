"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGeste } from "@/lib/db/useGeste";
import { deciderNomReserve, deciderProfessionnel } from "@/lib/utilisateurs/actions";
import {
  MOTIF_VERIFICATION_MAX,
  MOTIF_VERIFICATION_MIN,
  PSEUDO_FORME,
  PSEUDO_MAX,
  PSEUDO_MIN,
  type FicheCompte,
} from "@/lib/utilisateurs/types";

type Verifications = FicheCompte["verifications"];

/** Ce que l'écran peut dire d'un pseudonyme avant de l'envoyer ; la base juge le reste (insultes, doublons). */
export function pseudoMalForme(p: string): string | null {
  const v = p.trim();
  if (v.length < PSEUDO_MIN) return `${PSEUDO_MIN} caractères au moins.`;
  if (v.length > PSEUDO_MAX) return `${PSEUDO_MAX} caractères au plus.`;
  if (!PSEUDO_FORME.test(v)) return "Lettres sans accent, chiffres, point ou tiret bas.";
  return null;
}

/**
 * Les vérifications qu'un équipier décide sur une fiche de compte (§8) : la
 * mention de vendeur professionnel, et l'autorisation d'un terme réservé dans
 * le pseudonyme. Les documents du cotransporteur n'ont pas de bouton : ils
 * suivent la décision sur son rôle.
 *
 * ⚠️ L'ÉCRAN MONTRE CE QUE LA BASE PERMET (`possibles`), et la base décide
 * encore : la permission, l'identité reconfirmée, un motif, jamais son propre
 * compte — et jamais une décision qui changerait les règles d'une vente en cours.
 */
export function GestesVerification({ profil, v }: { profil: string; v: Verifications }) {
  const [ouvert, setOuvert] = useState<"professionnel" | "nom" | null>(null);
  const professionnel = useGeste(deciderProfessionnel);

  if (!v.possibles.verifier) {
    return <p className="text-legende text-muted-foreground">{v.possibles.raison}</p>;
  }

  const retirer = v.professionnel_verifie;
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setOuvert("professionnel")}>
          {retirer ? "Retirer la mention professionnelle" : "Reconnaître vendeur professionnel"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setOuvert("nom")}>
          {v.pseudo_autorise ? "Retirer le terme réservé" : "Autoriser un terme réservé"}
        </Button>
      </div>
      <DialogueMotif
        ouvert={ouvert === "professionnel"}
        surFermeture={() => setOuvert(null)}
        titre={retirer ? "Retirer la mention professionnelle ?" : "Reconnaître un vendeur professionnel ?"}
        description={
          retirer
            ? "Ses annonces le présenteront comme particulier, et la personne en est prévenue. Une vente en cours garde ses règles : si la décision les changeait, elle attendrait la fin de la vente. Ce motif reste au journal de l’équipe."
            : "Ses annonces le présenteront comme professionnel vérifié, et la personne en est prévenue. Ses prochaines ventes ne relèveront plus de l’attestation entre particuliers ; une vente en cours garde ses règles. Ce motif reste au journal de l’équipe."
        }
        libelleAction={retirer ? "Retirer" : "Reconnaître"}
        longueurMin={MOTIF_VERIFICATION_MIN}
        enCours={professionnel.enCours}
        surConfirmation={async (motif) => {
          const r = await professionnel.lancer(
            { profil, professionnel: !retirer, motif },
            retirer ? "Mention professionnelle retirée." : "Vendeur professionnel reconnu.",
          );
          if (r?.ok) setOuvert(null);
        }}
      />
      <DialogueNomReserve
        profil={profil}
        ouvert={ouvert === "nom"}
        retirer={v.pseudo_autorise}
        pseudoReserve={v.possibles.pseudo_reserve}
        surFermeture={() => setOuvert(null)}
      />
    </>
  );
}

/**
 * Autoriser un terme réservé, avec le pseudonyme convenu avec la personne — ou
 * retirer l'autorisation, avec un pseudonyme ordinaire quand l'actuel emploie un
 * terme réservé.
 */
function DialogueNomReserve({
  profil,
  ouvert,
  retirer,
  pseudoReserve,
  surFermeture,
}: {
  profil: string;
  ouvert: boolean;
  retirer: boolean;
  pseudoReserve: boolean;
  surFermeture: () => void;
}) {
  const nom = useGeste(deciderNomReserve);
  const [pseudo, setPseudo] = useState("");
  const [motif, setMotif] = useState("");
  // Un pseudonyme : toujours pour autoriser ; pour retirer, quand l'actuel emploie un terme réservé.
  const avecPseudo = !retirer || pseudoReserve;
  const forme = avecPseudo ? pseudoMalForme(pseudo) : null;
  const longueurMotif = motif.trim().length;
  const valide =
    forme === null && longueurMotif >= MOTIF_VERIFICATION_MIN && longueurMotif <= MOTIF_VERIFICATION_MAX;

  const fermer = () => {
    setPseudo("");
    setMotif("");
    surFermeture();
  };

  async function confirmer() {
    const r = await nom.lancer(
      { profil, autoriser: !retirer, pseudo: avecPseudo ? pseudo.trim() : null, motif: motif.trim() },
      retirer ? "Autorisation retirée." : "Terme réservé autorisé.",
    );
    if (r?.ok) fermer();
  }

  return (
    <Dialog open={ouvert} onOpenChange={(o) => !o && fermer()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{retirer ? "Retirer le terme réservé ?" : "Autoriser un terme réservé ?"}</DialogTitle>
          <DialogDescription>
            {retirer
              ? pseudoReserve
                ? "Le pseudonyme actuel emploie un terme réservé : indiquez celui qui le remplace. La personne en est prévenue."
                : "Le compte ne pourra plus employer de terme réservé à la plateforme. La personne en est prévenue."
              : "Pour un compte officiel — une marque, un partenaire. Le pseudonyme convenu avec la personne est posé tout de suite, et elle en est prévenue. Les insultes et les pseudonymes déjà pris restent refusés."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          {avecPseudo && (
            <div className="grid gap-2">
              <Label htmlFor="pseudo-reserve">{retirer ? "Nouveau pseudonyme, sans terme réservé" : "Pseudonyme convenu"}</Label>
              <Input
                id="pseudo-reserve"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder={retirer ? "ex. maison_durand" : "ex. maison_durand_officiel"}
                autoComplete="off"
              />
              {pseudo.trim() !== "" && forme && <span className="text-legende text-h2h-error">{forme}</span>}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="motif-nom-reserve">Motif interne</Label>
            <Textarea
              id="motif-nom-reserve"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Il reste au journal d'audit : la personne ne le lit pas."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={fermer} disabled={nom.enCours}>
            Annuler
          </Button>
          <Button disabled={!valide || nom.enCours} onClick={confirmer}>
            {nom.enCours ? "Un instant…" : retirer ? "Retirer" : "Autoriser"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
