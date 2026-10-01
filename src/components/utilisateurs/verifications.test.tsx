// LES VÉRIFICATIONS D'UN COMPTE — l'écran ne montre que ce que la base permet.
//
// La base décide encore de tout (la permission, l'identité reconfirmée, un
// motif, jamais son propre compte, jamais une décision qui changerait les règles
// d'une vente en cours) ; on vérifie ici que les gestes disent ce qu'ils feront
// — reconnaître ou retirer la mention professionnelle, autoriser ou retirer un
// terme réservé —, qu'un équipier sans le droit lit la raison au lieu des
// boutons, et ce que l'écran juge d'un pseudonyme avant de l'envoyer.
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { FicheCompte } from "@/lib/utilisateurs/types";

vi.mock("@/lib/db/useGeste", () => ({ useGeste: () => ({ lancer: vi.fn(), enCours: false }) }));
vi.mock("@/lib/utilisateurs/actions", () => ({
  deciderProfessionnel: vi.fn(),
  deciderNomReserve: vi.fn(),
  demanderVerification: vi.fn(),
  cloreVerification: vi.fn(),
}));
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => <a href={href}>{children}</a>,
}));

const { GestesVerification, pseudoMalForme } = await import("./GestesVerification");
const { DemandesVerification } = await import("./DemandesVerification");

const PROFIL = "fc000000-0000-4000-a000-000000000001";
const V: FicheCompte["verifications"] = {
  identite: { verifiee: false, methode: null, verifiee_le: null, mode_test: null, selfie: null, type_document: null },
  demandes: [],
  professionnel_verifie: false,
  pseudo_autorise: false,
  documents_cotransporteur: null,
  possibles: {
    verifier: true,
    raison: null,
    pseudo_reserve: false,
    demander: {
      possible: true,
      raison: null,
      objets: [
        { objet: "identite", libelle: "identité", raison: null },
        { objet: "professionnel", libelle: "informations professionnelles", raison: null },
        { objet: "documents_cotransporteur", libelle: "documents de cotransporteur", raison: "Ce compte n’a pas demandé à être cotransporteur." },
      ],
    },
  },
  demandes_equipe: [],
};
const rendre = (v: FicheCompte["verifications"]) => renderToStaticMarkup(<GestesVerification profil={PROFIL} v={v} />);

describe("les gestes de vérification", () => {
  it("un particulier sans autorisation : reconnaître, autoriser", () => {
    const html = rendre(V);
    expect(html).toContain("Reconnaître vendeur professionnel");
    expect(html).toContain("Autoriser un terme réservé");
    expect(html).not.toContain("Retirer");
  });

  it("un professionnel autorisé : retirer l'un, retirer l'autre", () => {
    const html = rendre({ ...V, professionnel_verifie: true, pseudo_autorise: true, possibles: { ...V.possibles, pseudo_reserve: true } });
    expect(html).toContain("Retirer la mention professionnelle");
    expect(html).toContain("Retirer le terme réservé");
    expect(html).not.toContain("Reconnaître vendeur professionnel");
  });

  it("qui ne peut pas décider lit la raison, sans bouton", () => {
    const html = rendre({
      ...V,
      possibles: {
        ...V.possibles,
        verifier: false,
        raison: "Ce compte est le vôtre : un autre membre de l’équipe doit en décider.",
        pseudo_reserve: false,
      },
    });
    expect(html).toContain("Ce compte est le vôtre : un autre membre de l’équipe doit en décider.");
    expect(html).not.toContain("<button");
  });
});

describe("un pseudonyme, avant de l'envoyer", () => {
  it("la forme se juge ici ; les insultes et les doublons, en base", () => {
    expect(pseudoMalForme("maison_durand_officiel")).toContain("20 caractères au plus");
    expect(pseudoMalForme("md")).toContain("3 caractères au moins");
    expect(pseudoMalForme("maison durand")).toBe("Lettres sans accent, chiffres, point ou tiret bas.");
    expect(pseudoMalForme("élise_officiel")).toBe("Lettres sans accent, chiffres, point ou tiret bas.");
    expect(pseudoMalForme("  durand_officiel ")).toBeNull();
  });
});

const DEMANDE: FicheCompte["verifications"]["demandes_equipe"][number] = {
  id: "dv000000-0000-4000-a000-000000000001",
  objet: "identite",
  libelle: "identité",
  demandee_le: "2026-10-01T09:00:00Z",
  par: "Camille (Support)",
  statut: "en_attente",
  repondue_le: null,
  close_le: null,
  close_par: null,
  issue: null,
  motif_cloture: null,
  dossier: { id: "d0000000-0000-4000-a000-000000000042", reference: "D-000042", statut: "ouvert" },
};

describe("les vérifications demandées", () => {
  it("chaque demande dit où elle en est — et seules celles qui attendent se closent", () => {
    const html = renderToStaticMarkup(
      <DemandesVerification
        profil={PROFIL}
        v={{
          ...V,
          demandes_equipe: [
            DEMANDE,
            { ...DEMANDE, id: "b", objet: "professionnel", libelle: "informations professionnelles", statut: "repondue", repondue_le: "2026-10-02T09:00:00Z" },
            { ...DEMANDE, id: "c", statut: "close", issue: "verifiee", close_le: "2026-10-03T09:00:00Z", motif_cloture: "Pièce vérifiée en visio" },
            { ...DEMANDE, id: "d", statut: "close", issue: "sans_suite", close_le: "2026-10-04T09:00:00Z", motif_cloture: "Plus nécessaire" },
          ],
        }}
      />,
    );
    expect(html).toContain("En attente de sa réponse");
    expect(html).toContain("Réponse reçue");
    expect(html).toContain("Close — vérification faite");
    expect(html).toContain("Close — sans suite");
    expect(html).toContain("Pièce vérifiée en visio");
    expect(html).toContain("Camille (Support)");
    expect(html).toContain('href="/a-traiter?dossier=d0000000-0000-4000-a000-000000000042"');
    expect(html.match(/>Clore</g)?.length).toBe(2);
    expect(html).toContain("Demander une vérification");
  });

  it("qui ne peut pas demander lit la raison, sans bouton", () => {
    const html = renderToStaticMarkup(
      <DemandesVerification
        profil={PROFIL}
        v={{
          ...V,
          demandes_equipe: [DEMANDE],
          possibles: {
            ...V.possibles,
            demander: { possible: false, raison: "Votre rôle ne permet pas de demander une vérification.", objets: [] },
          },
        }}
      />,
    );
    expect(html).toContain("Votre rôle ne permet pas de demander une vérification.");
    expect(html).not.toContain("<button");
  });

  it("un texte est proposé pour chaque demande, et dit à la personne quoi faire", async () => {
    const { MODELES_DEMANDE } = await import("@/lib/utilisateurs/types");
    for (const texte of Object.values(MODELES_DEMANDE)) {
      expect(texte.length).toBeGreaterThanOrEqual(10);
      expect(texte.length).toBeLessThanOrEqual(4000);
      expect(texte).toMatch(/^Bonjour/);
    }
    expect(MODELES_DEMANDE.professionnel).toContain("SIRET");
  });
});
