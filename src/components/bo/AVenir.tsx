import { AnimationH2H, type NomAnimation } from "@/components/marque/AnimationH2H";
import { LIBELLE_PHASE, type Rubrique } from "@/lib/navigation";

type Props = { rubrique: Rubrique; animation?: NomAnimation };

/**
 * L'état honnête d'une rubrique pas encore livrée.
 *
 * 🔴 PAS DE FAUX TABLEAU. Un écran vide « en attendant » ressemble à un écran
 * sans données, et une équipe qui le lit conclut qu'il ne se passe rien. Celui-ci
 * dit ce que la rubrique fera, d'après quel paragraphe du cahier, et quand.
 */
export function AVenir({ rubrique, animation = "sandtime" }: Props) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <AnimationH2H nom={animation} taille={120} />
      <h2 className="mt-4 text-h2 font-semibold">{rubrique.titre}</h2>
      <p className="mt-1 text-corps text-muted-foreground">{rubrique.utilite}.</p>
      <p className="mt-6 rounded-full bg-h2h-primary-light px-3 py-1 text-legende font-medium text-h2h-primary">
        À venir — phase {rubrique.livraison} · {LIBELLE_PHASE[rubrique.livraison]}
      </p>
      <p className="mt-3 text-legende text-muted-foreground">Cahier des charges : {rubrique.sections}</p>
    </div>
  );
}
