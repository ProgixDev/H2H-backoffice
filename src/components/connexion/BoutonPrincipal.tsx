"use client";

import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  enCours?: boolean;
  desactive?: boolean;
  type?: "button" | "submit";
};

/** Le bouton principal des écrans de connexion : pleine largeur, au dégradé signature. */
export function BoutonPrincipal({ children, onClick, enCours, desactive, type = "button" }: Props) {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={enCours || desactive}
      className="h-11 w-full text-[15px] font-semibold text-white transition-transform active:scale-[0.98]"
      style={{ backgroundImage: "var(--degrade-signature)" }}
    >
      {enCours ? "Un instant…" : children}
    </Button>
  );
}
