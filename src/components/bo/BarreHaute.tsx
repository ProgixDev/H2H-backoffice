"use client";

import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { FlaskConical, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LIBELLE_ROLE, type MoiMembre } from "@/lib/equipe/types";
import { rubriqueDe } from "@/lib/navigation";

/**
 * La barre du haut : la rubrique courante, le mode test, l'équipier, le thème.
 *
 * 🔴 LE BADGE « MODE TEST » EST PERMANENT QUAND IL S'APPLIQUE. Les essais se
 * font sur la base de production (décision du 25/09/2026) : un équipier de test,
 * ou une session ouverte depuis l'instance de développement, ne doit jamais
 * pouvoir croire qu'il agit sur des données réelles.
 */
export function BarreHaute({ moi }: { moi: MoiMembre }) {
  const rubrique = rubriqueDe(usePathname());
  const { resolvedTheme, setTheme } = useTheme();
  const sombre = resolvedTheme === "dark";
  const modeTest = moi.est_test || moi.origine !== "production" || moi.emetteur !== "production";

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-4 data-vertical:self-center" />
      <h1 className="text-h3 font-semibold">{rubrique?.titre ?? "Back-office"}</h1>
      {modeTest && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-h2h-warning-light px-2.5 py-1 text-legende font-semibold text-h2h-warning">
              <FlaskConical className="size-3.5" />
              MODE TEST
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {moi.est_test
              ? "Compte d'équipe de test : vous ne voyez et ne touchez que des données de test."
              : "Session ouverte hors production : seules les données de test sont accessibles."}
          </TooltipContent>
        </Tooltip>
      )}
      <div className="ml-auto flex items-center gap-2">
        <span className="hidden text-right leading-tight md:block">
          <span className="block text-legende font-medium">{moi.email}</span>
          <span className="block text-[11px] text-muted-foreground">
            {moi.roles.map((r) => LIBELLE_ROLE[r]).join(" · ") || "Aucun rôle"}
          </span>
        </span>
        <Button
          variant="ghost"
          size="icon"
          aria-label={sombre ? "Passer au thème clair" : "Passer au thème sombre"}
          onClick={() => setTheme(sombre ? "light" : "dark")}
        >
          {sombre ? <Sun /> : <Moon />}
        </Button>
        <UserButton />
      </div>
    </header>
  );
}
