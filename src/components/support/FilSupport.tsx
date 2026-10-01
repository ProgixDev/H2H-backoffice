"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "cn";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { dateHeure } from "@/lib/dates";
import { useGeste } from "@/lib/db/useGeste";
import { ecrireAuSupport } from "@/lib/support/actions";
import { MESSAGE_MAX, MESSAGE_MIN, NOM_SUPPORT, type FilSupportLu, type MessageSupport } from "@/lib/support/types";

/** Un message : celui de la personne à gauche, celui du support à droite, signé pour l'équipe. */
function Bulle({ m }: { m: MessageSupport }) {
  const support = m.de === "support";
  return (
    <li className={cn("flex", support ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "grid max-w-[80%] gap-1 rounded-xl border px-3 py-2",
          support ? "border-h2h-primary/30 bg-h2h-primary-light" : "bg-card",
        )}
      >
        <span className="text-legende text-muted-foreground">
          {support ? `${NOM_SUPPORT}${m.par ? ` · ${m.par}` : ""}` : "La personne"} · {dateHeure(m.le)}
          {support && (m.lu ? " · lu" : " · pas encore lu")}
        </span>
        <p className="whitespace-pre-line break-words text-corps">{m.texte ?? "—"}</p>
      </div>
    </li>
  );
}

/**
 * Le fil d'un compte avec le support (§8) : ce que la personne a écrit, ce que
 * l'équipe lui a répondu — et l'équipier derrière chaque réponse, que la
 * personne ne voit pas —, le dossier « À traiter », et la réponse à écrire.
 *
 * ⚠️ L'ÉCRAN MONTRE CE QUE LA BASE PERMET (`possibles`), et la base décide encore.
 */
export function FilSupport({ profil, f }: { profil: string; f: FilSupportLu }) {
  const [texte, setTexte] = useState("");
  const ecrire = useGeste(ecrireAuSupport);
  const longueur = texte.trim().length;
  const valide = longueur >= MESSAGE_MIN && longueur <= MESSAGE_MAX;

  async function envoyer() {
    const r = await ecrire.lancer(
      { profil, texte: texte.trim() },
      "Message envoyé : la personne est prévenue.",
    );
    if (r?.ok) setTexte("");
  }

  return (
    <div className="grid gap-3">
      <p className="text-legende text-muted-foreground">
        La personne lit « {NOM_SUPPORT} » : l’équipier qui écrit reste au journal.
        {f.dossier && (
          <>
            {" "}
            Dossier{" "}
            <Link
              href={`/a-traiter?dossier=${f.dossier.id}`}
              className="font-semibold tabular-nums text-h2h-primary hover:underline"
            >
              {f.dossier.reference}
            </Link>
            {f.dossier.statut === "ouvert" ? " — un message attend une réponse." : " — clos."}
          </>
        )}
      </p>

      {f.messages.length === 0 ? (
        <p className="text-corps text-muted-foreground">
          {f.conversation ? "Aucun message." : "Aucun échange avec le support : votre message ouvrira le fil."}
        </p>
      ) : (
        <>
          {f.tronque && <p className="text-legende text-muted-foreground">Les deux cents derniers messages.</p>}
          <ul className="grid gap-2">
            {f.messages.map((m) => (
              <Bulle key={m.id} m={m} />
            ))}
          </ul>
        </>
      )}

      {f.possibles.ecrire ? (
        <div className="grid gap-2 border-t pt-3">
          <Label htmlFor={`support-${profil}`}>Répondre au nom de HandtoHand</Label>
          <Textarea
            id={`support-${profil}`}
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            placeholder="La personne reçoit ce message dans son fil avec le support, et un avis sur son téléphone."
            rows={3}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={cn("text-legende", longueur > MESSAGE_MAX ? "text-h2h-error" : "text-muted-foreground")}>
              {longueur} / {MESSAGE_MAX} caractères
            </span>
            <Button size="sm" disabled={!valide || ecrire.enCours} onClick={envoyer}>
              {ecrire.enCours ? "Un instant…" : "Envoyer"}
            </Button>
          </div>
        </div>
      ) : (
        f.possibles.raison && <p className="text-legende text-muted-foreground">{f.possibles.raison}</p>
      )}
    </div>
  );
}

/** Le fil, ou l'échec de sa lecture — jamais un fil vide à la place d'une panne. */
export function SupportLu({ profil, f }: { profil: string; f: FilSupportLu | null }) {
  return f ? (
    <FilSupport profil={profil} f={f} />
  ) : (
    <LectureEchouee
      titre="Le fil avec le support ne se lit pas"
      message="Le reste de la fiche est à jour. Rechargez la page dans un instant."
    />
  );
}
