"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { LogoBadge } from "@/components/marque/LogoBadge";
import { Wordmark } from "@/components/marque/Wordmark";
import { MENU } from "@/lib/navigation";

/**
 * Les seize rubriques du cahier, groupées par partie.
 *
 * ⚠️ UNE RUBRIQUE NON LIVRÉE RESTE DANS LE MENU. Le cahier fixe le menu ; la
 * cacher ferait croire qu'elle n'existe pas. Elle s'ouvre sur un état « à venir »
 * qui dit quand. (Le filtrage par permission arrivera avec `bo_moi()`.)
 */
export function BarreLaterale() {
  const chemin = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/activite-en-direct" className="flex items-center gap-2.5 px-1 py-1.5">
          <LogoBadge taille={32} />
          <span className="flex flex-col group-data-[collapsible=icon]:hidden">
            <Wordmark taille={16} />
            <span className="mt-1 text-[10px] font-medium tracking-[1.4px] text-muted-foreground uppercase">
              Back-office
            </span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {MENU.map((groupe) => (
          <SidebarGroup key={groupe.partie}>
            <SidebarGroupLabel>{groupe.titre}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {groupe.rubriques.map((r) => {
                  const actif = chemin === r.chemin || chemin.startsWith(`${r.chemin}/`);
                  return (
                    <SidebarMenuItem key={r.chemin}>
                      <SidebarMenuButton asChild isActive={actif} tooltip={r.titre}>
                        <Link href={r.chemin}>
                          <r.icone />
                          <span>{r.titre}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
