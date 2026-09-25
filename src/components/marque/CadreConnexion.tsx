import { LogoBadge } from "./LogoBadge";
import { Wordmark } from "./Wordmark";

/** Le cadre des pages de connexion et de création du compte d'équipe. */
export function CadreConnexion({ children, note }: { children: React.ReactNode; note: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6">
      <div className="flex items-center gap-3">
        <LogoBadge taille={44} />
        <div>
          <Wordmark taille={20} />
          <div className="mt-1 text-[10px] font-medium tracking-[1.4px] text-muted-foreground uppercase">
            Back-office
          </div>
        </div>
      </div>
      {children}
      <p className="max-w-sm text-center text-legende text-muted-foreground">{note}</p>
    </main>
  );
}
