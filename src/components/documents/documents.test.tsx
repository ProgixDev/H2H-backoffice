// LES TEXTES ET LEURS VERSIONS (§20, R20.1) — rendu tel que le serveur l'envoie.
//
// La base décide de tout (`documentsPublies.test.ts` dans hand-to-hand) : qui
// publie, à deux clés, quelles versions existent, ce qui se fait accepter. On
// vérifie ici que l'écran le dit tel quel : les versions et leur état, les
// acceptations, qui a demandé et validé, la demande qui attend, le geste ou la
// raison — et que la page des validations montre ce que la seconde personne relit.
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Texte } from "@/lib/documents/types";
import type { Validation } from "@/lib/equipe/types";

vi.mock("next/link", () => ({
  default: ({ href, children, ...reste }: { href: string; children: ReactNode }) => (
    <a href={href} {...reste}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/marque/AnimationH2H", () => ({ AnimationH2H: () => <span data-animation /> }));
vi.mock("@/lib/db/useGeste", () => ({ useGeste: () => ({ lancer: vi.fn(), enCours: false }) }));
vi.mock("@/lib/documents/actions", () => ({
  demanderPublication: vi.fn(),
  annulerVersion: vi.fn(),
  calculerEmpreinte: vi.fn(),
}));
vi.mock("@/lib/equipe/actions", () => ({ deciderValidation: vi.fn() }));

const { ListeTextes } = await import("./ListeTextes");
const { ListeValidations } = await import("@/components/equipe/ListeValidations");

const decode = (html: string) => html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const EMPREINTE = "a".repeat(64);

const CGU: Texte = {
  code: "cgu_marketplace",
  libelle: "Conditions générales d’utilisation — place de marché",
  application: "marketplace",
  acceptable: true,
  versions: [
    { version: "2.0", titre: "CGU v2", url: "https://handtohand.pro/legal/cgu-v2.pdf", empreinte: EMPREINTE,
      application: "marketplace", obligatoire: true, en_vigueur_le: "2026-11-01T00:00:00Z", publie_le: "2026-10-03T08:00:00Z",
      statut: "programmee", acceptations: 0, annulable: true,
      changement: { demandeur: "dira@handtohand.pro", demande_le: "2026-10-03T07:00:00Z", valideur: "dirb@handtohand.pro",
                    valide_le: "2026-10-03T08:00:00Z", motif: "Texte validé par le juriste" } },
    { version: "1.0", titre: "CGU v1", url: "https://handtohand.pro/legal/cgu-v1.pdf", empreinte: EMPREINTE,
      application: "marketplace", obligatoire: true, en_vigueur_le: "2026-10-01T00:00:00Z", publie_le: "2026-10-01T00:00:00Z",
      statut: "en_vigueur", acceptations: 12, annulable: false, changement: null },
  ],
  demandes: [],
  possible: { demander: true, raison: null },
};
const CHARTE: Texte = {
  code: "charte", libelle: "Chartes", application: null, acceptable: false, versions: [],
  demandes: [{ validation: "v1", demandeur: "dira@handtohand.pro", demande_le: "2026-10-03T09:00:00Z",
               expire_le: "2026-10-06T09:00:00Z", version: "1.0", titre: "Charte", effet: null, obligatoire: false,
               motif: "Première charte" }],
  possible: { demander: false, raison: "Une demande attend déjà sa validation pour ce texte." },
};

describe("les textes", () => {
  const html = decode(renderToStaticMarkup(<ListeTextes textes={[CGU, CHARTE]} />));

  it("chaque version : son état, sa date, ce qui se fait accepter, les acceptations, l’adresse et l’empreinte", () => {
    expect(html).toContain("Programmée");
    expect(html).toContain("En vigueur");
    expect(html).toContain("à partir du");
    expect(html).toContain("se fait accepter");
    expect(html).toContain(">12<");
    expect(html).toContain('href="https://handtohand.pro/legal/cgu-v1.pdf"');
    expect(html).toContain(`sha-256 ${EMPREINTE}`);
  });

  it("qui l’a demandée et validée — ou une version inscrite par migration", () => {
    expect(html).toContain("Demandée par dira@handtohand.pro, validée par dirb@handtohand.pro");
    expect(html).toContain("« Texte validé par le juriste »");
    expect(html).toContain("Inscrite par migration");
  });

  it("le geste quand la base le permet ; sinon la raison, et la demande qui attend", () => {
    expect(html).toContain("Publier une version");
    expect((html.match(/>Annuler</g) ?? []).length).toBe(1);
    expect(html).toContain("Une demande attend déjà sa validation pour ce texte.");
    expect(html).toContain("Version 1.0 demandée par dira@handtohand.pro");
    expect(html).toContain("en vigueur dès la validation");
    expect(html).toContain("Aucune version publiée : rien n’est versionné.");
    expect(html).toContain("Se versionne sans se faire accepter");
  });
});

describe("la validation d’une version", () => {
  it("la seconde personne relit l’adresse, l’empreinte, la date — et sait qu’elle se fera accepter", () => {
    const v = {
      id: "v1", action: "documents.publier", libelle: "Publier une version d’un texte",
      cible: "Conditions générales d’utilisation — place de marché — version 2.0", cible_id: null,
      parametres: { code: "cgu_marketplace", version: "2.0", titre: "CGU v2", url: "https://handtohand.pro/legal/cgu-v2.pdf",
                    empreinte: EMPREINTE, effet: null, application: "marketplace", obligatoire: true },
      motif: "Texte validé par le juriste", demandeur: "p1", demandeur_email: "dira@handtohand.pro",
      demande_le: "2026-10-03T07:00:00Z", expire_le: "2026-10-06T07:00:00Z", est_test: false, peut_decider: true,
    } as unknown as Validation;
    const html = decode(renderToStaticMarkup(<ListeValidations validations={[v]} />));
    expect(html).toContain("« CGU v2 » — en vigueur dès la validation");
    expect(html).toContain('href="https://handtohand.pro/legal/cgu-v2.pdf"');
    expect(html).toContain(`sha-256 ${EMPREINTE}`);
    expect(html).toContain("Chaque personne devra l’accepter à sa prochaine ouverture de l’application.");
    expect(html).toContain("Valider");
  });
});
