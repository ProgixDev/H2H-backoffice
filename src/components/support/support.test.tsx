// LE FIL D'UN COMPTE AVEC LE SUPPORT — l'écran ne montre que ce que la base permet.
//
// La base décide encore de tout (la permission, jamais son propre compte ni un
// compte effacé, une seule fois) ; on vérifie ici que le fil dit qui a écrit —
// la personne, ou le support et l'équipier derrière —, s'il a été lu, son
// dossier, la réponse à écrire ou la raison de ne pas pouvoir, et qu'une
// lecture échouée ne ressemble pas à un fil vide.
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { FilSupportLu } from "@/lib/support/types";

vi.mock("next/link", () => ({
  default: ({ href, children, ...reste }: { href: string; children: ReactNode }) => (
    <a href={href} {...reste}>
      {children}
    </a>
  ),
}));
vi.mock("@/lib/db/useGeste", () => ({ useGeste: () => ({ lancer: vi.fn(), enCours: false }) }));
vi.mock("@/lib/support/actions", () => ({ ecrireAuSupport: vi.fn() }));

const { FilSupport, SupportLu } = await import("./FilSupport");

const PROFIL = "ff000000-0000-4000-a000-000000000001";
const DOSSIER = "d0000000-0000-4000-a000-000000000009";
const FIL: FilSupportLu = {
  conversation: "c0000000-0000-4000-a000-000000000001",
  messages: [
    { id: "m1", de: "personne", texte: "Bonjour, mon colis est bloqué au hub.", genre: "text",
      le: "2026-10-01T08:00:00Z", lu: false, par: null },
    { id: "m2", de: "support", texte: "Bonjour, nous regardons avec le hub.", genre: "text",
      le: "2026-10-01T09:00:00Z", lu: true, par: "Camille" },
    { id: "m3", de: "personne", texte: "Merci, et s’il reste fermé demain ?", genre: "text",
      le: "2026-10-01T10:00:00Z", lu: false, par: null },
  ],
  tronque: false,
  dossier: { id: DOSSIER, reference: "DOS-000077", statut: "ouvert" },
  possibles: { ecrire: true, raison: null },
};
const rendre = (f: FilSupportLu) => renderToStaticMarkup(<FilSupport profil={PROFIL} f={f} />);

describe("le fil d'un compte avec le support", () => {
  it("qui a écrit : la personne, ou le support et l'équipier derrière — et s'il a été lu", () => {
    const h = rendre(FIL);
    expect(h).toContain("Bonjour, mon colis est bloqué au hub.");
    expect(h).toContain("Support HandtoHand · Camille");
    expect(h).toContain(" · lu");
    expect(h.split("La personne · ").length - 1).toBe(2);
    // L'ordre de la base : du plus ancien au plus récent.
    expect(h.indexOf("mon colis est bloqué")).toBeLessThan(h.indexOf("nous regardons"));
    expect(h.indexOf("nous regardons")).toBeLessThan(h.indexOf("s’il reste fermé"));
    expect(h).toContain("La personne lit « Support HandtoHand » : l’équipier qui écrit reste au journal.");
  });

  it("son dossier « À traiter », et la réponse à écrire", () => {
    const h = rendre(FIL);
    expect(h).toContain(`href="/a-traiter?dossier=${DOSSIER}"`);
    expect(h).toContain("DOS-000077");
    expect(h).toContain("un message attend une réponse");
    expect(h).toContain("Répondre au nom de HandtoHand");
    expect(h).toContain("<textarea");
    expect(h).toContain("Envoyer");
  });

  it("sans le droit d'écrire : la raison, aucune zone de réponse", () => {
    const raison = "C’est votre propre compte : un autre membre de l’équipe doit lui écrire.";
    const h = rendre({ ...FIL, possibles: { ecrire: false, raison } });
    expect(h).toContain(raison);
    expect(h).not.toContain("<textarea");
  });

  it("sans fil : le premier message de l'équipe l'ouvrira ; un fil tronqué le dit", () => {
    const vide = rendre({ conversation: null, messages: [], tronque: false, dossier: null,
      possibles: { ecrire: true, raison: null } });
    expect(vide).toContain("Aucun échange avec le support : votre message ouvrira le fil.");
    expect(vide).not.toContain("/a-traiter");
    expect(rendre({ ...FIL, tronque: true })).toContain("Les deux cents derniers messages.");
  });

  it("une lecture échouée ne ressemble jamais à un fil vide", () => {
    const echec = renderToStaticMarkup(<SupportLu profil={PROFIL} f={null} />);
    expect(echec).toContain("Le fil avec le support ne se lit pas");
    expect(echec).not.toContain("Aucun échange");
    expect(renderToStaticMarkup(<SupportLu profil={PROFIL} f={FIL} />)).toContain("Support HandtoHand · Camille");
  });
});
