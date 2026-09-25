"use client";

import { useState } from "react";
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
import { inviterEquipier } from "@/lib/equipe/actions";
import { LIBELLE_ROLE, ROLES, type Role } from "@/lib/equipe/types";
import { useGeste } from "@/lib/db/useGeste";

/**
 * Inviter une adresse DÉDIÉE à l'équipe (décision du 25/09/2026) : jamais le
 * compte personnel de la personne, qui reste un compte client ordinaire.
 */
export function DialogueInvitation({ ouvert, surFermeture }: { ouvert: boolean; surFermeture: () => void }) {
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [motif, setMotif] = useState("");
  const { lancer, enCours } = useGeste(inviterEquipier);

  const valide = /^\S+@\S+\.\S+$/.test(email.trim()) && roles.length > 0 && motif.trim().length >= 3;

  function fermer() {
    setEmail("");
    setRoles([]);
    setMotif("");
    surFermeture();
  }

  async function envoyer() {
    const r = await lancer(
      { email: email.trim(), roles, motif: motif.trim() },
      "Invitation créée : un autre membre de la Direction doit la valider.",
    );
    if (r?.ok) fermer();
  }

  return (
    <Dialog open={ouvert} onOpenChange={(o) => !o && fermer()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inviter un équipier</DialogTitle>
          <DialogDescription>
            Utilisez une adresse dédiée à l’équipe (par exemple prenom@handtohand.pro). L’invitation part en
            validation auprès d’un autre membre de la Direction.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Adresse de l’équipier</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom@handtohand.pro" />
          </div>
          <fieldset className="grid gap-2">
            <legend className="mb-1 text-sm font-medium">Rôles</legend>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <label key={r} className="flex items-center gap-2 text-corps">
                  <input
                    type="checkbox"
                    className="size-4 accent-[var(--h2h-primary)]"
                    checked={roles.includes(r)}
                    onChange={(e) => setRoles(e.target.checked ? [...roles, r] : roles.filter((x) => x !== r))}
                  />
                  {LIBELLE_ROLE[r]}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-2">
            <Label htmlFor="motif-invitation">Motif</Label>
            <Textarea id="motif-invitation" rows={2} value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Conservé au journal d’audit." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={fermer} disabled={enCours}>
            Annuler
          </Button>
          <Button onClick={envoyer} disabled={!valide || enCours}>
            {enCours ? "Un instant…" : "Envoyer en validation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
