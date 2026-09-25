import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import type { NomAnimation } from "@/components/marque/AnimationH2H";
import { chargerMoi } from "@/lib/equipe/moi";
import type { MoiMembre } from "@/lib/equipe/types";
import { rubriqueObligatoire, type Rubrique } from "@/lib/navigation";
import { AVenir } from "./AVenir";

/**
 * Vérifie qu'un équipier peut lire une rubrique ; rend l'équipier, ou `null`
 * après avoir affiché le refus.
 *
 * ⚠️ LE MENU CACHE, LA PAGE REFUSE. Masquer un lien n'empêche pas de taper
 * l'adresse : chaque rubrique vérifie elle-même la permission. (Et la base,
 * derrière, refuse de toute façon chaque lecture non permise.)
 */
export async function equipierPourRubrique(rubrique: Rubrique): Promise<MoiMembre | null> {
  const moi = await chargerMoi();
  if (!moi.membre) redirect("/acces");
  return rubrique.permissions.some((p) => moi.permissions.includes(p)) ? moi : null;
}

export function AccesRefuse({ rubrique }: { rubrique: Rubrique }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-h2h-surface-elevated">
        <Lock className="size-9 text-muted-foreground" />
      </span>
      <h2 className="mt-4 text-h2 font-semibold">{rubrique.titre}</h2>
      <p className="mt-1 text-corps text-muted-foreground">
        Votre rôle ne donne pas accès à cette rubrique. La Direction attribue les rôles.
      </p>
    </div>
  );
}

/** Une rubrique pas encore livrée : l'accès vérifié, puis l'état « à venir ». */
export async function PageRubrique({ chemin, animation }: { chemin: string; animation?: NomAnimation }) {
  const rubrique = rubriqueObligatoire(chemin);
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;
  return <AVenir rubrique={rubrique} animation={animation} />;
}
