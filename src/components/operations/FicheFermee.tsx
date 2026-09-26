import { Lock } from "lucide-react";

/**
 * La fiche refusée — par le rôle, ou parce que l'équipier prend part à
 * l'opération (conflit d'intérêts). La base a le dernier mot ; l'écran dit
 * pourquoi.
 */
export function FicheFermee({
  titre = "Fiche d’opération",
  message = "Votre rôle ne donne pas accès aux fiches d’opération (permission « activite.lire »). La Direction attribue les rôles.",
}: {
  titre?: string;
  message?: string;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-h2h-surface-elevated">
        <Lock className="size-9 text-muted-foreground" />
      </span>
      <h2 className="mt-4 text-h2 font-semibold">{titre}</h2>
      <p className="mt-1 text-corps text-muted-foreground">{message}</p>
    </div>
  );
}
