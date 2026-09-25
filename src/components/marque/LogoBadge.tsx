import Image from "next/image";

type Props = {
  /** Côté du carré, en px. */
  taille?: number;
  className?: string;
};

/**
 * Le traitement canonique du logo, repris de l'application (`LogoBadge.tsx`) :
 * la poignée de main sans fond, posée sur le carré au dégradé de marque
 * (primary → vert, en diagonale), coins à ~27 % et logo à 74 % du carré.
 *
 * ⚠️ JAMAIS SUR UN FOND UNI OU BLANC — c'est la règle écrite dans l'application.
 */
export function LogoBadge({ taille = 36, className }: Props) {
  const logo = Math.round(taille * 0.74);
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: taille,
        height: taille,
        borderRadius: Math.round(taille * 0.27),
        backgroundImage: "var(--degrade-signature-diagonal)",
        flexShrink: 0,
      }}
    >
      <Image src="/marque/logo-256.png" alt="" width={logo} height={logo} priority />
    </span>
  );
}
