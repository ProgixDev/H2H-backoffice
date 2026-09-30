// LES GESTES DE MODÉRATION — l'écran ne montre que ce que la base permet.
//
// La base décide encore de tout (permission, identité reconfirmée, état, jamais
// sa propre annonce) ; on vérifie ici que les boutons suivent `possibles`, et
// que l'équipier sans droit lit pourquoi plutôt que des boutons qui échoueraient.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { ModerationFiche } from "@/lib/annonces/types";

vi.mock("@/lib/db/useGeste", () => ({ useGeste: () => ({ lancer: vi.fn(), enCours: false }) }));
vi.mock("@/lib/annonces/actions", () => ({
  masquerAnnonce: vi.fn(),
  retablirAnnonce: vi.fn(),
  retirerAnnonce: vi.fn(),
  demanderCorrection: vi.fn(),
  autoriserPublication: vi.fn(),
  refuserPublication: vi.fn(),
}));

const { GestesModeration } = await import("./GestesModeration");

const ID = "ff000000-0000-4000-a000-00000000aa01";
const possibles = (p: Partial<ModerationFiche["possibles"]>): ModerationFiche["possibles"] => ({
  moderer: true, raison: null, masquer: false, retablir: false, retirer: false, corriger: false, autoriser: false,
  refuser: false, ...p,
});
const rendre = (p: ModerationFiche["possibles"]) =>
  renderToStaticMarkup(<GestesModeration id={ID} nature="annonce" possibles={p} />);

describe("les gestes de modération", () => {
  it("une annonce sans mesure : corriger, masquer, retirer — pas rétablir", () => {
    const g = rendre(possibles({ masquer: true, retirer: true, corriger: true }));
    expect(g).toContain("Demander une correction");
    expect(g).toContain("Masquer");
    expect(g).toContain("Retirer");
    expect(g).not.toContain("Rétablir");
  });

  it("une annonce masquée, sa correction demandée : rétablir ou retirer, seulement", () => {
    const g = rendre(possibles({ retablir: true, retirer: true }));
    expect(g).toContain("Rétablir");
    expect(g).toContain("Retirer");
    expect(g).not.toContain("Masquer");
    expect(g).not.toContain("Demander une correction");
  });

  it("une annonce qui attend sa vérification : autoriser, refuser, demander une correction — rien d'autre", () => {
    const g = rendre(possibles({ autoriser: true, refuser: true, corriger: true }));
    expect(g).toContain("Autoriser la publication");
    expect(g).toContain("Refuser la publication");
    expect(g).toContain("Demander une correction");
    expect(g).not.toContain("Masquer");
    expect(g).not.toContain("Retirer");
    expect(g).not.toContain("Rétablir");
    // Ailleurs, ni l'un ni l'autre.
    expect(rendre(possibles({ masquer: true, retirer: true }))).not.toContain("la publication");
  });

  it("sans droit, ou sur sa propre annonce : la raison, aucun bouton", () => {
    const g = rendre(possibles({ moderer: false, raison: "Votre rôle ne permet pas de modérer une annonce.", masquer: true }));
    expect(g).toContain("Votre rôle ne permet pas de modérer une annonce.");
    expect(g).not.toContain("<button");
  });
});
