import { describe, expect, it } from "vitest";
import { libelleSiege } from "./libelles";
import { cheminFiche, ONGLETS, ongletsDe } from "./types";

describe("la fiche complète (§6)", () => {
  it("a pour adresse sa référence, puis l'onglet s'il n'est pas le premier", () => {
    expect(cheminFiche("HTH-2026-C2D477")).toBe("/operations/HTH-2026-C2D477");
    expect(cheminFiche("HTH-2026-C2D477", "resume")).toBe("/operations/HTH-2026-C2D477");
    expect(cheminFiche("HTH-2026-C2D477", "paiements")).toBe("/operations/HTH-2026-C2D477?onglet=paiements");
    // Une référence tapée à la main ne casse pas l'adresse.
    expect(cheminFiche("DOS/1 ?")).toBe("/operations/DOS%2F1%20%3F");
  });

  it("un achat a les neuf onglets du cahier, une offre Flash ou un live seulement les siens", () => {
    expect(ONGLETS).toHaveLength(9);
    expect(ongletsDe("orders")).toEqual([...ONGLETS]);
    for (const t of ["courtage_listings", "live_sessions"] as const) {
      expect(ongletsDe(t)).toEqual(["resume", "bien-et-accord", "chronologie", "notes-internes"]);
    }
  });

  it("dit les places d'un live en clair, et une clé inconnue telle quelle", () => {
    expect(libelleSiege("buyer.confirmed")).toBe("Places acheteur confirmées");
    expect(libelleSiege("spectator.waitlisted")).toBe("Spectateurs en liste d’attente");
    expect(libelleSiege("inconnu.x")).toBe("inconnu.x");
  });
});
