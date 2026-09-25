"use client";

import { cn } from "cn";
import { Input } from "@/components/ui/input";

type Props = {
  id: string;
  valeur: string;
  surChangement: (v: string) => void;
  /** Un code de secours mêle lettres et chiffres ; les autres codes ne sont que des chiffres. */
  secours?: boolean;
  autoFocus?: boolean;
  invalide?: boolean;
};

/**
 * Un code à usage unique — reçu par e-mail, lu dans l'application
 * d'authentification, ou code de secours. Collé ou tapé, il est nettoyé au vol ;
 * le téléphone peut le proposer seul (`one-time-code`).
 */
export function ChampCode({ id, valeur, surChangement, secours, autoFocus, invalide }: Props) {
  return (
    <Input
      id={id}
      value={valeur}
      onChange={(e) => {
        const brut = secours
          ? e.target.value.replace(/[^0-9a-z]/gi, "").toLowerCase().slice(0, 16)
          : e.target.value.replace(/\D/g, "").slice(0, 6);
        surChangement(brut);
      }}
      inputMode={secours ? "text" : "numeric"}
      autoComplete="one-time-code"
      autoCapitalize="off"
      spellCheck={false}
      autoFocus={autoFocus}
      aria-invalid={invalide || undefined}
      placeholder={secours ? "Code de secours" : "000000"}
      className={cn(
        "h-12 text-center font-mono text-xl placeholder:text-muted-foreground/40",
        secours ? "tracking-[0.2em]" : "tracking-[0.5em]",
      )}
    />
  );
}
