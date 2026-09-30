"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { StatutPastille } from "@/components/bo/StatutPastille";
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
import { useConsultation } from "@/lib/db/useConsultation";
import { trouverCompteParEmail } from "@/lib/utilisateurs/sensibles";
import { cheminCompte, type CompteTrouve } from "@/lib/utilisateurs/types";

// La forme que la base exige aussi : quelque chose, une arobase, un domaine avec un point.
const ADRESSE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Retrouver un compte par son e-mail : l'adresse exacte, un motif, et la base
 * inscrit la consultation au journal — sans l'adresse cherchée.
 *
 * ⚠️ RIEN DANS L'ADRESSE DE LA PAGE : l'e-mail part dans l'action, et un seul
 * compte trouvé s'ouvre directement.
 */
export function RechercheParEmail() {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [email, setEmail] = useState("");
  const [motif, setMotif] = useState("");
  const [trouves, setTrouves] = useState<CompteTrouve[] | null>(null);
  const { consulter, enCours } = useConsultation(trouverCompteParEmail);
  const valide = ADRESSE.test(email.trim()) && motif.trim().length >= 5;

  const fermer = () => {
    setOuvert(false);
    setEmail("");
    setMotif("");
    setTrouves(null);
  };

  return (
    <>
      <Button type="button" variant="outline" size="sm" className="h-9" onClick={() => setOuvert(true)}>
        <Mail /> Retrouver par e-mail
      </Button>
      <Dialog open={ouvert} onOpenChange={(o) => (o ? setOuvert(true) : fermer())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retrouver un compte par son e-mail</DialogTitle>
            <DialogDescription>
              L’adresse exacte du compte. Cette recherche est inscrite au journal d’audit, avec votre nom et votre motif —
              sans l’adresse cherchée.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="email-cherche">E-mail du compte</Label>
              <Input
                id="email-cherche"
                type="email"
                autoComplete="off"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setTrouves(null);
                }}
                placeholder="prenom@exemple.fr"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="motif-recherche">Motif</Label>
              <Textarea
                id="motif-recherche"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Par exemple : le client nous a écrit à propos de sa commande."
                rows={2}
              />
            </div>
            {trouves !== null &&
              (trouves.length === 0 ? (
                <p role="status" className="rounded-lg border border-dashed p-3 text-corps text-muted-foreground">
                  Aucun compte client n’utilise cette adresse.
                </p>
              ) : (
                <ul role="status" className="grid gap-2">
                  {trouves.map((c) => (
                    <li key={c.profil} className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
                      <Link href={cheminCompte(c.profil)} className="font-semibold text-h2h-primary hover:underline">
                        {c.pseudo ? `@${c.pseudo}` : "Sans pseudonyme"}
                      </Link>
                      {c.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
                    </li>
                  ))}
                </ul>
              ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={fermer} disabled={enCours}>
              Fermer
            </Button>
            <Button
              disabled={!valide || enCours}
              onClick={async () => {
                const r = await consulter({ email: email.trim(), motif: motif.trim() });
                if (!r) return;
                // Un seul compte : on l'ouvre. Plusieurs (rare) ou aucun : on le dit ici.
                if (r.trouves.length === 1) {
                  fermer();
                  router.push(cheminCompte(r.trouves[0].profil));
                } else {
                  setTrouves(r.trouves);
                }
              }}
            >
              {enCours ? <Loader2 className="animate-spin" /> : null}
              Chercher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
