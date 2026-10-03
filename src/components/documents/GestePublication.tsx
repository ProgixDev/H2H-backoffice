"use client";

import { useState } from "react";
import { cn } from "cn";
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
import { calculerEmpreinte, demanderPublication } from "@/lib/documents/actions";
import {
  EMPREINTE_VALIDE,
  LIBELLE_APPLICATION,
  VERSION_VALIDE,
  type ApplicationTexte,
  type Texte,
} from "@/lib/documents/types";

const MOTIF_MIN = 5;
const KILO = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const champ =
  "h-9 rounded-lg border bg-background px-2 text-corps focus-visible:outline-2 focus-visible:outline-h2h-primary";

/**
 * « Publier une version » : la demande, que valide une autre personne de la
 * Direction. L'adresse est celle du texte publié, qui ne changera plus ; son
 * empreinte se calcule ici et se relit à la validation.
 *
 * 🔴 UNE VERSION OBLIGATOIRE SE FAIT ACCEPTER PAR CHAQUE PERSONNE À SA PROCHAINE
 * OUVERTURE DE L'APPLICATION : la fenêtre le dit avant d'envoyer.
 */
export function GestePublication({ texte }: { texte: Texte }) {
  const [ouvert, setOuvert] = useState(false);
  const [version, setVersion] = useState("");
  const [titre, setTitre] = useState(texte.libelle);
  const [url, setUrl] = useState("");
  const [empreinte, setEmpreinte] = useState("");
  const [calcul, setCalcul] = useState<{ enCours: boolean; message: string | null }>({ enCours: false, message: null });
  const [effet, setEffet] = useState("");
  const [application, setApplication] = useState<ApplicationTexte>(texte.application ?? "toutes");
  const [obligatoire, setObligatoire] = useState(texte.acceptable);
  const [motif, setMotif] = useState("");
  const demander = useGeste(demanderPublication);

  const valide =
    VERSION_VALIDE.test(version.trim()) &&
    titre.trim().length >= 3 &&
    titre.trim().length <= 120 &&
    url.trim().startsWith("https://") &&
    EMPREINTE_VALIDE.test(empreinte) &&
    motif.trim().length >= MOTIF_MIN;

  const fermer = () => {
    setVersion("");
    setTitre(texte.libelle);
    setUrl("");
    setEmpreinte("");
    setCalcul({ enCours: false, message: null });
    setEffet("");
    setMotif("");
    setOuvert(false);
  };

  async function empreinteDeLAdresse() {
    setCalcul({ enCours: true, message: null });
    const r = await calculerEmpreinte(url);
    if (r.ok) {
      setEmpreinte(r.empreinte);
      setCalcul({ enCours: false, message: `${KILO.format(r.octets / 1024)} Ko lus.` });
    } else {
      setEmpreinte("");
      setCalcul({ enCours: false, message: r.erreur });
    }
  }

  async function confirmer() {
    const r = await demander.lancer(
      {
        code: texte.code,
        version: version.trim(),
        titre: titre.trim(),
        url: url.trim(),
        empreinte,
        effet: effet ? new Date(effet).toISOString() : null,
        application: texte.application ? null : application,
        obligatoire: texte.acceptable && obligatoire,
        motif: motif.trim(),
      },
      "Demande envoyée : une autre personne de la Direction la valide dans « Validations ».",
    );
    if (r?.ok) fermer();
  }

  return (
    <>
      <Button size="sm" onClick={() => setOuvert(true)}>
        Publier une version
      </Button>
      <Dialog open={ouvert} onOpenChange={(o) => !o && fermer()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Publier une version — {texte.libelle}</DialogTitle>
            <DialogDescription>
              Rien ne se publie avant qu’une autre personne de la Direction valide la demande. Une version publiée ne
              change plus ; une version programmée s’annule avant sa date.
            </DialogDescription>
          </DialogHeader>
          {texte.acceptable && obligatoire && (
            <p className="rounded-lg border border-[#B45309]/30 bg-[#B45309]/5 p-3 text-legende">
              Dès qu’elle sera en vigueur, chaque personne devra l’accepter à sa prochaine ouverture de l’application.
              {(texte.application === "logistic" || (!texte.application && application !== "marketplace")) &&
                " L’application H2H Logistic ne la demande pas encore : seule la place de marché la fera accepter."}
            </p>
          )}
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-legende text-muted-foreground">
                Version
                <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="2026.10" />
              </label>
              <label className="grid gap-1 text-legende text-muted-foreground">
                Date d’effet
                <input type="datetime-local" className={champ} value={effet} onChange={(e) => setEffet(e.target.value)} />
                <span>Vide : dès la validation.</span>
              </label>
            </div>
            <label className="grid gap-1 text-legende text-muted-foreground">
              Titre
              <Input value={titre} onChange={(e) => setTitre(e.target.value)} />
            </label>
            <div className="grid gap-1">
              <Label htmlFor="url-texte">Adresse définitive du texte</Label>
              <div className="flex gap-2">
                <Input
                  id="url-texte"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setEmpreinte("");
                  }}
                  placeholder="https://handtohand.pro/legal/…"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  disabled={!url.trim().startsWith("https://") || calcul.enCours}
                  onClick={empreinteDeLAdresse}
                >
                  {calcul.enCours ? "Lecture…" : "Calculer l’empreinte"}
                </Button>
              </div>
              {empreinte && <code className="break-all text-legende">sha-256 {empreinte}</code>}
              {calcul.message && (
                <span className={cn("text-legende", empreinte ? "text-muted-foreground" : "text-h2h-error")}>
                  {calcul.message}
                </span>
              )}
            </div>
            {!texte.application && (
              <label className="grid gap-1 text-legende text-muted-foreground">
                Application
                <select
                  className={champ}
                  value={application}
                  onChange={(e) => setApplication(e.target.value as ApplicationTexte)}
                >
                  {(Object.keys(LIBELLE_APPLICATION) as ApplicationTexte[]).map((a) => (
                    <option key={a} value={a}>
                      {LIBELLE_APPLICATION[a]}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {texte.acceptable && (
              <label className="flex items-center gap-2 text-corps">
                <input type="checkbox" checked={obligatoire} onChange={(e) => setObligatoire(e.target.checked)} />
                Chaque personne doit l’accepter
              </label>
            )}
            <div className="grid gap-1">
              <Label htmlFor="motif-texte">Motif</Label>
              <Textarea
                id="motif-texte"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Pourquoi cette version — la personne qui valide le lira."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={fermer} disabled={demander.enCours}>
              Annuler
            </Button>
            <Button disabled={!valide || demander.enCours} onClick={confirmer}>
              {demander.enCours ? "Un instant…" : "Demander la publication"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
