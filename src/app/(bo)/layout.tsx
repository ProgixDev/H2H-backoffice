import { BarreHaute } from "@/components/bo/BarreHaute";
import { BarreLaterale } from "@/components/bo/BarreLaterale";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

/**
 * Le cadre de toutes les rubriques : le menu à gauche, la barre en haut.
 *
 * ⚠️ AUCUNE DONNÉE N'EST LUE ICI TANT QUE L'ÉQUIPIER N'EST PAS RECONNU. La
 * connexion Clerk et `bo_moi()` (phase P0a) viendront se placer ici : sans
 * rôle d'équipe, la personne ne voit que la page de refus.
 */
export default function LayoutBackOffice({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <BarreLaterale />
      <SidebarInset>
        <BarreHaute />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
