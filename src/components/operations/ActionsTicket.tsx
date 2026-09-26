"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGeste } from "@/lib/db/useGeste";
import { ouvrirDossier } from "@/lib/dossiers/actions";

type Cible = {
  objet_table: string;
  objet_id: string;
  alerte_libelle: string | null;
  action_attendue: string | null;
  etape_libelle: string;
};

/**
 * « Créer un ticket » et « M'attribuer le dossier » (§4, §5). La base rend le
 * dossier déjà ouvert sur l'opération plutôt qu'un doublon ; on y va ensuite,
 * dans « À traiter ».
 */
export function ActionsTicket({ o, children }: { o: Cible; children?: React.ReactNode }) {
  const router = useRouter();
  const ouvrir = useGeste(ouvrirDossier);
  const [motif, setMotif] = useState("");
  const [saisie, setSaisie] = useState(false);

  async function aller(attribuer: boolean, texte: string, succes: string) {
    const r = await ouvrir.lancer(
      {
        objetTable: o.objet_table,
        objetId: o.objet_id,
        titre: null,
        motif: texte,
        priorite: "normale",
        securite: false,
        attribuer,
      },
      succes,
    );
    if (r?.ok) router.push(`/a-traiter?dossier=${(r.donnees as { dossier: string }).dossier}`);
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        {children}
        <Button variant="outline" size="sm" disabled={ouvrir.enCours} onClick={() => setSaisie((s) => !s)}>
          Créer un ticket
        </Button>
        <Button
          size="sm"
          disabled={ouvrir.enCours}
          onClick={() => aller(true, o.alerte_libelle ?? o.action_attendue ?? o.etape_libelle, "Le dossier vous est attribué.")}
        >
          M’attribuer le dossier
        </Button>
      </div>
      {saisie && (
        <div className="flex gap-2">
          <Input value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Pourquoi ce ticket ?" aria-label="Motif du ticket" />
          <Button size="sm" disabled={motif.trim().length < 3 || ouvrir.enCours} onClick={() => aller(false, motif.trim(), "Ticket créé.")}>
            Créer
          </Button>
        </div>
      )}
    </div>
  );
}
