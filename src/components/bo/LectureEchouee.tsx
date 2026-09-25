import { WifiOff } from "lucide-react";

/**
 * « La lecture a échoué » — repris de l'application (`LectureEchouee.tsx`).
 *
 * 🔴 UN ÉCHEC DE LECTURE NE RESSEMBLE JAMAIS À UNE LISTE VIDE. Une liste vide
 * dit « il n'y a rien » ; une panne affichée comme telle ferait conclure à
 * l'équipe qu'aucun dossier n'attend.
 */
export function LectureEchouee({
  titre = "La lecture a échoué",
  message = "Un souci est survenu. Réessayez dans un instant.",
}: {
  titre?: string;
  message?: string;
}) {
  return (
    <div
      role="alert"
      className="flex max-w-md items-start gap-3 rounded-xl border p-4"
      style={{
        backgroundColor: "color-mix(in srgb, var(--h2h-error) 5%, transparent)",
        borderColor: "color-mix(in srgb, var(--h2h-error) 20%, transparent)",
      }}
    >
      <WifiOff className="mt-0.5 size-5 shrink-0 text-h2h-error" />
      <div>
        <p className="font-semibold">{titre}</p>
        <p className="text-corps text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
