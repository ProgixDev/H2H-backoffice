"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
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
import { corrigerHub, poserHub } from "@/lib/logistique/actions";
import {
  LIBELLE_LIEU,
  POINT_VIDE,
  cheminHub,
  lienCarte,
  lireCoordonnees,
  nomDuPoint,
  saisieDe,
  versPoint,
  type Hub,
  type PointSaisi,
} from "@/lib/logistique/types";

const champ =
  "h-9 rounded-lg border bg-background px-2 text-corps focus-visible:outline-2 focus-visible:outline-h2h-primary";

// La longueur que la base exige du motif d'une correction.
const MOTIF_CORRECTION_MIN = 5;

/**
 * Ce qui se pose et se corrige d'un point : son type et son repère (qui font son
 * nom), où se présenter, sa ville, son épingle, son rayon. Le nom se lit pendant
 * la saisie, tel que la base le calculera ; l'épingle se regarde sur la carte
 * AVANT d'être envoyée.
 */
export function ChampsPoint({ id, p, surChangement }: { id: string; p: PointSaisi; surChangement: (p: PointSaisi) => void }) {
  const point = lireCoordonnees(p.coordonnees);
  const poser =
    (k: keyof PointSaisi) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      surChangement({ ...p, [k]: e.target.value });
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-[12rem_1fr]">
        <div className="grid gap-1.5">
          <Label htmlFor={`type-${id}`}>Type de lieu</Label>
          <select id={`type-${id}`} className={champ} value={p.type_lieu} onChange={poser("type_lieu")}>
            <option value="">Choisir…</option>
            {Object.entries(LIBELLE_LIEU).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`repere-${id}`}>Repère</Label>
          <Input id={`repere-${id}`} value={p.repere} onChange={poser("repere")} maxLength={60} placeholder="La Roubine, Gare Fréjus…" />
        </div>
      </div>
      <p className="text-legende text-muted-foreground">
        {p.type_lieu && p.repere.trim() ? (
          <>
            Le point s’appellera <span className="font-semibold text-foreground">{nomDuPoint(p.type_lieu, p.repere)}</span>.{" "}
          </>
        ) : null}
        Le repère nomme un lieu connu — jamais une adresse postale, ni le domicile de quelqu’un.
      </p>
      <div className="grid gap-1.5">
        <Label htmlFor={`detail-${id}`}>Détail affiché</Label>
        <Textarea
          id={`detail-${id}`}
          value={p.detail}
          onChange={poser("detail")}
          maxLength={120}
          rows={2}
          placeholder="Où se présenter : parking ouvert, côté entrée principale"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor={`ville-${id}`}>Ville</Label>
          <Input id={`ville-${id}`} value={p.ville} onChange={poser("ville")} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`region-${id}`}>Région (facultatif)</Label>
          <Input id={`region-${id}`} value={p.region} onChange={poser("region")} />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`adresse-${id}`}>Adresse du lieu (facultatif)</Label>
        <Input id={`adresse-${id}`} value={p.adresse} onChange={poser("adresse")} />
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
        <div className="grid gap-1.5">
          <Label htmlFor={`coordonnees-${id}`}>Épingle : latitude, longitude</Label>
          <Input
            id={`coordonnees-${id}`}
            value={p.coordonnees}
            onChange={poser("coordonnees")}
            inputMode="decimal"
            placeholder="43.7046, 7.2619"
          />
          {point ? (
            <a
              href={lienCarte(point.latitude, point.longitude)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1 text-legende text-h2h-primary hover:underline"
            >
              Regarder cette épingle sur la carte <ExternalLink className="size-3" />
            </a>
          ) : p.coordonnees.trim() ? (
            <span className="text-legende text-h2h-error">Latitude puis longitude, avec un point décimal : 43.7046, 7.2619</span>
          ) : (
            <span className="text-legende text-muted-foreground">Copiez-les depuis une carte en ligne, sur le point exact du rendez-vous.</span>
          )}
        </div>
        <div className="grid content-start gap-1.5">
          <Label htmlFor={`rayon-${id}`}>Rayon de la zone (m)</Label>
          <Input id={`rayon-${id}`} value={p.rayon_m} onChange={poser("rayon_m")} inputMode="numeric" placeholder="60" />
        </div>
      </div>
    </div>
  );
}

/**
 * « Créer » (§ 12.4) : poser une épingle. Elle n'est proposée à personne — la
 * valider reste le geste de quelqu'un qui a regardé la carte. Une fois posée, on
 * arrive sur sa fiche, qui dit ses voisins : un doublon se voit avant d'être validé.
 */
export function GestePoserHub() {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [p, setP] = useState<PointSaisi>(POINT_VIDE);
  const poser = useGeste(poserHub);
  const lu = versPoint(p);
  return (
    <>
      <Button
        onClick={() => {
          setP(POINT_VIDE);
          setOuvert(true);
        }}
      >
        Poser un point
      </Button>
      <Dialog open={ouvert} onOpenChange={(o) => !o && setOuvert(false)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Poser un point de rendez-vous</DialogTitle>
            <DialogDescription>
              Le point n’est proposé à personne tant qu’il n’est pas validé : une fois posé, regardez son épingle et ses
              voisins sur sa fiche, puis validez-le.
            </DialogDescription>
          </DialogHeader>
          <ChampsPoint id="nouveau" p={p} surChangement={setP} />
          {"manque" in lu && <p className="text-legende text-muted-foreground">{lu.manque}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOuvert(false)} disabled={poser.enCours}>
              Annuler
            </Button>
            <Button
              disabled={"manque" in lu || poser.enCours}
              onClick={async () => {
                if ("manque" in lu) return;
                const r = await poser.lancer(lu.point, "Épingle posée : elle attend d’être validée.");
                if (r?.ok) {
                  setOuvert(false);
                  router.push(cheminHub((r.donnees as { hub: string }).hub));
                }
              }}
            >
              {poser.enCours ? "Un instant…" : "Poser l’épingle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * « Corriger » (§ 12.4). La base refuse tant qu'un rendez-vous est confirmé à ce
 * point ou qu'une proposition en cours peut y aboutir — ce bouton n'est alors pas
 * dessiné, et la fiche dit pourquoi. Chaque correction garde son histoire.
 */
export function GesteCorrectionHub({ hub }: { hub: Hub }) {
  const [ouvert, setOuvert] = useState(false);
  const [p, setP] = useState<PointSaisi>(() => saisieDe(hub));
  const [motif, setMotif] = useState("");
  const corriger = useGeste(corrigerHub);
  const lu = versPoint(p);
  const inchange = JSON.stringify(p) === JSON.stringify(saisieDe(hub));
  const motifValide = motif.trim().length >= MOTIF_CORRECTION_MIN;
  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          setP(saisieDe(hub));
          setMotif("");
          setOuvert(true);
        }}
      >
        Corriger
      </Button>
      <Dialog open={ouvert} onOpenChange={(o) => !o && setOuvert(false)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Corriger ce point</DialogTitle>
            <DialogDescription>
              La correction s’applique tout de suite, et reste dans l’histoire du point.{" "}
              {hub.etat === "actif" && hub.trajets > 0
                ? `${hub.trajets > 1 ? `Les cotransporteurs de ${hub.trajets} trajets` : "Le cotransporteur d’un trajet"} qui y ${hub.trajets > 1 ? "passent seront prévenus" : "passe sera prévenu"}. `
                : ""}
              Si vous déplacez l’épingle, regardez d’abord le nouveau point sur la carte
              {hub.valide_le ? " : au-delà de 500 mètres, ce n’est plus le même lieu — posez un nouveau point." : "."}
            </DialogDescription>
          </DialogHeader>
          <ChampsPoint id={hub.id} p={p} surChangement={setP} />
          <div className="grid gap-1.5">
            <Label htmlFor={`motif-${hub.id}`}>Motif de la correction</Label>
            <Textarea
              id={`motif-${hub.id}`}
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              rows={2}
              placeholder="Il sera conservé avec la correction."
            />
          </div>
          {"manque" in lu ? (
            <p className="text-legende text-muted-foreground">{lu.manque}</p>
          ) : inchange ? (
            <p className="text-legende text-muted-foreground">Rien n’est encore modifié.</p>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOuvert(false)} disabled={corriger.enCours}>
              Annuler
            </Button>
            <Button
              disabled={"manque" in lu || inchange || !motifValide || corriger.enCours}
              onClick={async () => {
                if ("manque" in lu) return;
                const r = await corriger.lancer(
                  { hub: hub.id, version: hub.version, ...lu.point, motif: motif.trim() },
                  "Point corrigé.",
                );
                if (r?.ok) setOuvert(false);
              }}
            >
              {corriger.enCours ? "Un instant…" : "Corriger"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
