import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Seules la connexion et la création du compte d'équipe sont ouvertes.
const estPublique = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

/**
 * La première porte : être connecté à Clerk.
 *
 * ⚠️ CE N'EST PAS ICI QUE L'ON DÉCIDE QUI EST DE L'ÉQUIPE. Next.js le rappelle :
 * le proxy ne fait que des vérifications optimistes. L'appartenance à l'équipe,
 * le second facteur, le rôle se vérifient dans la base, à chaque appel
 * (`app.bo_exiger`) — le cadre du back-office lit `bo_moi()` et envoie vers
 * `/acces` quiconque n'y est pas admis.
 */
export default clerkMiddleware(async (auth, requete) => {
  if (!estPublique(requete)) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
