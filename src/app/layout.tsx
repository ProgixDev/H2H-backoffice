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
        {/* La connexion, l'installation du second facteur, le menu du compte et
            la vérification avant un geste sensible sont nos propres écrans.
            Ces réglages ne servent plus qu'en secours, si une fenêtre du
            prestataire devait encore s'ouvrir (un geste hors du cadre de
            l'équipe) : ses couleurs, le français, et jamais de connexion par un
            réseau social. */}
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