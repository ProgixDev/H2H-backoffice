import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

// La police de l'application, aux quatre graisses qu'elle charge
// (`@expo-google-fonts/poppins` 400/500/600/700).
const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "HandtoHand — Back-office", template: "%s · Back-office HandtoHand" },
  description: "Supervision et administration de HandtoHand.",
  // ⚠️ UN OUTIL INTERNE NE SE RÉFÉRENCE PAS.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${poppins.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full">
        {/* La connexion, l'installation du second facteur et le menu du compte
            sont nos propres écrans. Reste de Clerk la fenêtre de vérification
            d'identité avant un geste sensible (`useReverification`) : elle
            prend ici les couleurs de l'application et le français. Les boutons
            de réseaux sociaux restent masqués : un compte d'équipe se connecte
            par e-mail et second facteur, jamais par un compte Google. */}
        <ClerkProvider
          localization={frFR}
          appearance={{
            variables: {
              colorPrimary: "#0091C5",
              colorDanger: "#EF4444",
              colorSuccess: "#10B981",
              colorWarning: "#F59E0B",
              fontFamily: "var(--font-poppins), system-ui, sans-serif",
              borderRadius: "0.75rem",
            },
            elements: { socialButtonsRoot: { display: "none" }, dividerRow: { display: "none" } },
          }}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}