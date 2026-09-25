"use client";

import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { rubriqueDe } from "@/lib/navigation";

/**
 * La barre du haut : la rubrique courante et le thème.
 *
 * Ce qui la rejoindra, dans l'ordre du plan : le badge MODE TEST et l'identité
 * de l'équipier (P0a, avec `bo_moi()`), la recherche par référence ⌘K et
 * l'état de synchronisation (P1).
 */
export function BarreHaute() {
  const rubrique = rubriqueDe(usePathname());
  const { resolvedTheme, setTheme } = useTheme();
  const sombre = resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-4 data-vertical:self-center" />
      <h1 className="text-h3 font-semibold">{rubrique?.titre ?? "Back-office"}</h1>
      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label={sombre ? "Passer au thème clair" : "Passer au thème sombre"}
          onClick={() => setTheme(sombre ? "light" : "dark")}
        >
          {sombre ? <Sun /> : <Moon />}
        </Button>
      </div>
    </header>
  );
}
