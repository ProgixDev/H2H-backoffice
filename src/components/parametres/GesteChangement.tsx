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
import { useGeste } from "@/lib/db/useGeste";
import { demanderChangement } from "@/lib/parametres/actions";
import { UNITE_SAISIE, valeurDite, versLaBase, type GroupeReglages } from "@/lib/parametres/types";

const MOTIF_MIN = 5;
const champDate =
  "h-9 rounded-lg border bg-background px-2 text-corps focus-visible:outline-2 focus-visible:outline-h2h-primary";

type Saisie = { texte: string; aucun: boolean };

/**
 * « Demander un changement » : des valeurs nouvelles pour les réglages ouverts de ce groupe, une
 * date d'effet (vide : dès la validation), un motif. Une autre personne de la Direction valide ;
 * rien ne change avant.
 *
 * ⚠️ L'ÉQUIPE SAISIT DES EUROS ET DES POURCENTAGES ; la base garde des centimes et des fractions
 * (`versLaBase`). Seules les valeurs saisies partent : les autres restent celles en vigueur.
 */
export function GesteChangement({ groupe }: { groupe: GroupeReglages }) {
  const ouverts = groupe.champs.filter((c) => c.modifiable);
  const [ouvert, setOuvert] = useState(false);
  const [saisies, setSaisies] = useState<Record<string, Saisie>>({});
  const [effet, setEffet] = useState("");
  const [motif, setMotif] = useState("");
  const demander = useGeste(demanderChangement);

  const changements: Record<string, number | null> = {};
  let invalide = false;
  for (const c of ouverts) {
    const s = saisies[c.colonne];
    if (!s) continue;
    if (c.facultatif && s.aucun) {
      changements[c.colonne] = null;
      continue;
    }
    if (s.texte.trim() === "") continue;
    const n = Number(s.texte.replace(",", "."));
    if (!Number.isFinite(n)) {
      invalide = true;
      continue;
    }
    changements[c.colonne] = versLaBase(c.unite, n);
  }
  const valide = !invalide && Object.keys(changements).length > 0 && motif.trim().length >= MOTIF_MIN;

  const fermer = () => {
    setSaisies({});
    setEffet("");
    setMotif("");
    setOuvert(false);
  };
  const saisir = (colonne: string, s: Partial<Saisie>) =>
    setSaisies((x) => ({ ...x, [colonne]: { ...(x[colonne] ?? { texte: "", aucun: false }), ...s } }));

  async function confirmer() {
    const r = await demander.lancer(
      {
        table: groupe.table,
        changements,
        effet: effet ? new Date(effet).toISOString() : null,
        motif: motif.trim(),
      },
      "Demande envoyée : une autre personne de la Direction la valide dans « Validations ».",
    );
    if (r?.ok) fermer();
  }

  return (
    <>
      <Button size="sm" onClick={() => setOuvert(true)}>
        Demander un changement
      </Button>
      <Dialog open={ouvert} onOpenChange={(o) => !o && fermer()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Changer — {groupe.libelle}</DialogTitle>
            <DialogDescription>
              Rien ne change avant qu’une autre personne de la Direction valide la demande. {groupe.portee}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            {ouverts.map((c) => {
              const actuel = groupe.en_vigueur?.valeurs[c.colonne] as number | null | undefined;
              const s = saisies[c.colonne];
              return (
                <div key={c.colonne} className="grid gap-1">
                  <Label htmlFor={`reglage-${c.colonne}`}>{c.libelle}</Label>
                  <span className="text-legende text-muted-foreground">
                    En vigueur : {valeurDite(c.unite, actuel)} · entre {valeurDite(c.unite, c.minimum)} et{" "}
                    {valeurDite(c.unite, c.maximum)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Input
                      id={`reglage-${c.colonne}`}
                      inputMode="decimal"
                      value={s?.texte ?? ""}
                      disabled={s?.aucun}
                      onChange={(e) => saisir(c.colonne, { texte: e.target.value })}
                      placeholder="Inchangé"
                      className="max-w-40"
                    />
                    <span className="text-legende text-muted-foreground">{UNITE_SAISIE[c.unite]}</span>
                    {c.facultatif && (
                      <label className="flex items-center gap-1 text-legende">
                        <input
                          type="checkbox"
                          checked={s?.aucun ?? false}
                          onChange={(e) => saisir(c.colonne, { aucun: e.target.checked })}
                        />
                        Aucun
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
            <label className="grid gap-1 text-legende text-muted-foreground">
              Date d’effet
              <input type="datetime-local" className={champDate} value={effet} onChange={(e) => setEffet(e.target.value)} />
              <span>Vide : dès la validation. Jamais dans le passé.</span>
            </label>
            <div className="grid gap-1">
              <Label htmlFor="motif-reglage">Motif</Label>
              <Textarea
                id="motif-reglage"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Pourquoi ce changement — la personne qui valide le lira."
                rows={2}
              />
            </div>
            {invalide && <span className="text-legende text-h2h-error">Une valeur saisie n’est pas un nombre.</span>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={fermer} disabled={demander.enCours}>
              Annuler
            </Button>
            <Button disabled={!valide || demander.enCours} onClick={confirmer}>
              {demander.enCours ? "Un instant…" : "Demander le changement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
