"use client";

import { useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Deux lettres tirées de l'adresse : « direction.essai1@… » → « DE ». */
export function initialesDe(email: string): string {
  const local = email.split("@")[0]?.split("+")[0] ?? "";
  const morceaux = local.split(/[._-]/).filter(Boolean);
  const lettres = (morceaux[0]?.[0] ?? "") + (morceaux[1]?.[0] ?? morceaux[0]?.[1] ?? "");
  return lettres.toUpperCase() || "?";
}

/**
 * Le compte de l'équipier : qui est connecté, avec quels rôles, et la
 * déconnexion. Rien d'autre à régler ici : les rôles se décident à deux, dans
 * « Équipe et journal d'audit », et le second facteur s'installe à l'accès.
 */
export function MenuCompte({ email, roles }: { email: string | null; roles: string }) {
  const { signOut } = useClerk();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Mon compte"
          className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-h2h-primary-light text-legende font-semibold text-h2h-primary">
              {initialesDe(email ?? "")}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="grid gap-0.5">
          <span className="truncate text-legende font-medium">{email ?? "Adresse inconnue"}</span>
          <span className="text-[11px] font-normal text-muted-foreground">{roles}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => signOut({ redirectUrl: "/sign-in" })}>
          <LogOut /> Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
