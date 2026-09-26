"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useGeste } from "@/lib/db/useGeste";
import { noterDossier } from "@/lib/dossiers/actions";
import type { Fiche, Notes } from "@/lib/operations/types";
import { ActionsTicket } from "../ActionsTicket";
import { Aucun, Bloc, Quand } from "../commun";

/**
 * Notes internes (R6.3) : ce que l'équipe s'écrit sur l'opération. Aucune ne
 * part à un utilisateur — les messages envoyés, eux, sont dans la chronologie.
 *
 * ⚠️ UNE NOTE S'ÉCRIT DANS LE DOSSIER OUVERT DE L'OPÉRATION : c'est là que
 * l'équipe la retrouve, et qu'elle est tracée. Sans dossier, on en ouvre un.
 */
export function OngletNotes({
  n,
  f,
  maintenant,
  surGeste,
}: {
  n: Notes;
  f: Fiche;
  maintenant: number;
  surGeste: () => void;
}) {
  const noter = useGeste(noterDossier);
  const [texte, setTexte] = useState("");
  const ouvert = n.dossier_ouvert;

  async function ajouter() {
    if (!ouvert) return;
    const r = await noter.lancer({ dossier: ouvert.id, texte: texte.trim() }, "Note ajoutée.");
    if (r?.ok) {
      setTexte("");
      surGeste();
    }
  }

  return (
    <div className="grid gap-4">
      {f.droits.traiter &&
        (ouvert ? (
          <Bloc
            titre="Ajouter une note interne"
            aside={
              <Link href={`/a-traiter?dossier=${ouvert.id}`} className="text-legende font-semibold text-h2h-primary">
                dans le dossier {ouvert.ref}
              </Link>
            }
          >
            <Textarea
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              rows={3}
              placeholder="Ce que l’équipe doit savoir. Aucun utilisateur ne lit cette note."
              aria-label="Note interne"
            />
            <Button size="sm" variant="outline" className="justify-self-start" disabled={texte.trim().length < 3 || noter.enCours} onClick={ajouter}>
              <Lock /> Ajouter la note interne
            </Button>
          </Bloc>
        ) : (
          <Bloc titre="Ajouter une note interne">
            <p className="text-corps text-muted-foreground">
              Une note s’écrit dans le dossier de l’opération, et aucun n’est ouvert : créez un ticket ou attribuez-vous
              le dossier, puis revenez ici.
            </p>
            <ActionsTicket o={f.operation} />
          </Bloc>
        ))}

      <Bloc titre={`Notes · ${n.notes.length}`}>
        {n.notes.length === 0 ? (
          <Aucun>Aucune note interne sur cette opération.</Aucun>
        ) : (
          <ul className="grid gap-3">
            {n.notes.map((x) => (
              <li key={x.id} className="grid gap-1 rounded-lg border bg-muted/30 p-3">
                <span className="flex flex-wrap items-center gap-2 text-legende text-muted-foreground">
                  <Lock className="size-3.5" />
                  <span className="font-semibold text-foreground">{x.auteur ?? "Équipe"}</span>
                  <Quand iso={x.le} maintenant={maintenant} />
                  <Link href={`/a-traiter?dossier=${x.dossier_id}`} className="font-semibold text-h2h-primary">
                    {x.dossier}
                  </Link>
                </span>
                <p className="whitespace-pre-line text-corps">{x.texte}</p>
              </li>
            ))}
          </ul>
        )}
      </Bloc>
    </div>
  );
}
