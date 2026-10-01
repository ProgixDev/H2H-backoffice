// LES VÉRIFICATIONS D'UN COMPTE — l'écran ne montre que ce que la base permet.
//
// La base décide encore de tout (la permission, l'identité reconfirmée, un
// motif, jamais son propre compte, jamais une décision qui changerait les règles
// d'une vente en cours) ; on vérifie ici que les gestes disent ce qu'ils feront
// — reconnaître ou retirer la mention professionnelle, autoriser ou retirer un
// terme réservé —, qu'un équipier sans le droit lit la raison au lieu des
// boutons, et ce que l'écran juge d'un pseudonyme avant de l'envoyer.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { FicheCompte } from "@/lib/utilisateurs/types";

vi.mock("@/lib/db/useGeste", () => ({ useGeste: () => ({ lancer: vi.fn(), enCours: false }) }));
vi.mock("@/lib/utilisateurs/actions", () => ({ deciderProfessionnel: vi.fn(), deciderNomReserve: vi.fn() }));

const { GestesVerification, pseudoMalForme } = await import("./GestesVerification");

const PROFIL = "fc000000-0000-4000-a000-000000000001";
const V: FicheCompte["verifications"] = {
  identite: { verifiee: false, methode: null, verifiee_le: null, mode_test: null, selfie: null, type_document: null },
  demandes: [],
  professionnel_verifie: false,
  pseudo_autorise: false,
  documents_cotransporteur: null,
  possibles: { verifier: true, raison: null, pseudo_reserve: false },
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
      possibles: { verifier: false, raison: "Ce compte est le vôtre : un autre membre de l’équipe doit en décider.", pseudo_reserve: false },
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
