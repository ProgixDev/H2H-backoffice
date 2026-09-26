"use client";

import { createContext, useContext, useState } from "react";
import { Eye, FileSearch, Loader2 } from "lucide-react";
import { DialogueMotif } from "@/components/bo/DialogueMotif";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useConsultation } from "@/lib/db/useConsultation";
import { LIBELLE_CHAMP_SENSIBLE } from "@/lib/operations/libelles";
import { ouvrirPiece, revelerDonnee } from "@/lib/operations/sensibles";
import type { ChampSensible, DonneeRevelee, NaturePiece, PieceOuverte } from "@/lib/operations/types";

// ── Le cadre ────────────────────────────────────────────────────────────────

type Cadre = { objet: string; peutReveler: boolean };
const CadreSensible = createContext<Cadre | null>(null);

/**
 * Le cadre des consultations d'un achat : l'achat, et si l'équipier tient
 * `donnees.reveler`.
 *
 * ⚠️ L'ÉCRAN NE FAIT QUE MONTRER LE BOUTON : c'est la base qui autorise, pour
 * un motif, et qui journalise. Un bouton affiché à tort serait refusé.
 */
export function CadreConsultations({ objet, peutReveler, children }: Cadre & { children: React.ReactNode }) {
  return <CadreSensible.Provider value={{ objet, peutReveler }}>{children}</CadreSensible.Provider>;
}

/** Le cadre des consultations, pour les écrans qui en ouvrent d'autres (les échanges). */
export function useCadreConsultations(): Cadre | null {
  return useContext(CadreSensible);
}

const MASQUEE = <span className="text-muted-foreground">Masquée</span>;

// ── Une donnée ──────────────────────────────────────────────────────────────

/**
 * Une donnée masquée, révélée à la demande, pour un motif.
 *
 * ⚠️ RÉVÉLÉE POUR CET ÉCRAN SEULEMENT : rien n'est gardé ailleurs. Une nouvelle
 * visite demande une nouvelle consultation — et un nouveau motif.
 */
export function DonneeMasquee({ champ, piece }: { champ: ChampSensible; piece?: string }) {
  const libelle = LIBELLE_CHAMP_SENSIBLE[champ];
  const cadre = useContext(CadreSensible);
  const [demande, setDemande] = useState(false);
  const [revelee, setRevelee] = useState<DonneeRevelee | null>(null);
  const { consulter, enCours } = useConsultation(revelerDonnee);

  if (revelee) {
    return (
      <span className="inline-flex flex-wrap items-baseline gap-x-2">
        <span className="whitespace-pre-line font-medium">{revelee.valeur ?? "Non renseignée"}</span>
        <button
          type="button"
          onClick={() => setRevelee(null)}
          className="text-legende text-muted-foreground underline underline-offset-2"
        >
          Masquer
        </button>
      </span>
    );
  }
  if (!cadre?.peutReveler) return MASQUEE;
  return (
    <>
      <span className="inline-flex items-center gap-2">
        <span className="tracking-widest text-muted-foreground" aria-label="Donnée masquée">
          ••••••
        </span>
        <Button type="button" variant="outline" size="sm" className="h-7 px-2" onClick={() => setDemande(true)} disabled={enCours}>
          {enCours ? <Loader2 className="animate-spin" /> : <Eye />}
          Révéler
        </Button>
      </span>
      <DialogueMotif
        ouvert={demande}
        surFermeture={() => setDemande(false)}
        titre={`Révéler : ${libelle}`}
        description="Cette consultation est inscrite au journal d’audit, avec votre nom et votre motif. La donnée ne s’affiche que sur cet écran."
        libelleAction="Révéler"
        longueurMin={5}
        enCours={enCours}
        surConfirmation={async (motif) => {
          const r = await consulter({ objet: cadre.objet, champ, motif, piece: piece ?? null });
          if (r) {
            setRevelee(r);
            setDemande(false);
          }
        }}
      />
    </>
  );
}

// ── Une pièce ───────────────────────────────────────────────────────────────

/**
 * Une pièce d'un achat : un motif, un ticket de cinq minutes, puis l'aperçu
 * dans une adresse signée qui ne vaut qu'une minute.
 */
export function BoutonPiece({
  nature,
  piece,
  rang,
  libelle,
  format = "image",
}: {
  nature: NaturePiece;
  piece: string;
  rang?: number;
  libelle: string;
  format?: "image" | "video" | "document";
}) {
  const cadre = useContext(CadreSensible);
  const [demande, setDemande] = useState(false);
  const [ouverte, setOuverte] = useState<PieceOuverte | null>(null);
  const { consulter, enCours } = useConsultation(ouvrirPiece);

  if (!cadre?.peutReveler) return null;
  return (
    <>
      <Button type="button" variant="outline" size="sm" className="h-7 px-2" onClick={() => setDemande(true)} disabled={enCours}>
        {enCours ? <Loader2 className="animate-spin" /> : <FileSearch />}
        Voir
      </Button>
      <DialogueMotif
        ouvert={demande}
        surFermeture={() => setDemande(false)}
        titre={`Ouvrir : ${libelle}`}
        description="Un accès de cinq minutes vous est ouvert, pour ce fichier seulement ; l’ouverture est inscrite au journal d’audit, avec votre motif."
        libelleAction="Ouvrir"
        longueurMin={5}
        enCours={enCours}
        surConfirmation={async (motif) => {
          const r = await consulter({ objet: cadre.objet, nature, piece, rang: rang ?? null, motif });
          if (r) {
            setOuverte(r);
            setDemande(false);
          }
        }}
      />
      <Dialog open={ouverte !== null} onOpenChange={(o) => !o && setOuverte(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{libelle}</DialogTitle>
            <DialogDescription>
              L’adresse de ce fichier ne vaut qu’une minute. Fermez cette fenêtre quand vous avez terminé.
            </DialogDescription>
          </DialogHeader>
          {ouverte && format === "image" && (
            // Une adresse signée, éphémère : `next/image` voudrait la déclarer et la mettre en cache.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ouverte.url} alt={libelle} className="max-h-[70vh] w-full rounded-lg object-contain" />
          )}
          {ouverte && format === "video" && (
            <video src={ouverte.url} controls className="max-h-[70vh] w-full rounded-lg" />
          )}
          {ouverte && (
            <a
              href={ouverte.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-legende font-semibold text-h2h-primary underline-offset-2 hover:underline"
            >
              Ouvrir dans un nouvel onglet
            </a>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
