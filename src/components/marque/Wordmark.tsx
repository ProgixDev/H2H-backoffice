type Props = { taille?: number; className?: string };

/**
 * Le nom écrit comme sur l'écran d'accueil de l'application (`src/app/index.tsx`) :
 * « Hand » bleu, « to » gris-bleu plus petit, « Hand » vert, souligné du dégradé.
 * `taille` est celle des deux « Hand » ; « to » en fait 80 %, comme là-bas (24/30).
 */
export function Wordmark({ taille = 18, className }: Props) {
  return (
    <span className={className} style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1.1 }}>
      <span style={{ display: "inline-flex", alignItems: "baseline", gap: 1, letterSpacing: 0.4 }}>
        <span style={{ color: "var(--h2h-primary)", fontWeight: 700, fontSize: taille }}>Hand</span>
        <span style={{ color: "#7B8AB8", fontWeight: 500, fontSize: Math.round(taille * 0.8) }}>to</span>
        <span style={{ color: "var(--h2h-primary-gradient-end)", fontWeight: 700, fontSize: taille }}>Hand</span>
      </span>
      <span
        aria-hidden
        style={{
          height: 2,
          width: Math.round(taille * 2.1),
          marginTop: 2,
          borderRadius: 2,
          backgroundImage: "var(--degrade-signature)",
        }}
      />
    </span>
  );
}
