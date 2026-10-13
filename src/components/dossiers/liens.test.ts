// OÙ S'EXAMINENT LES SIGNALEMENTS D'UN DOSSIER — la fiche de ce qu'ils visent.
//
// 🔴 UN POINT DE RENDEZ-VOUS SIGNALÉ A SON DOSSIER (hand-to-hand `20261013008000`). Avant ce cas, tout dossier de
// signalements qui ne portait ni une annonce, ni une recherche, ni un live ouvrait la fiche d'un COMPTE : celui d'un
// point aurait mené à un compte qui n'existe pas.
import { describe, expect, it } from "vitest";
import { ficheDesSignalements } from "./liens";

const ID = "c1270000-0000-4000-a000-0000000000a1";

describe("la fiche où s’examinent les signalements d’un dossier", () => {
  it("🔴 un point de rendez-vous signalé s’examine sur sa fiche, dans H2H Logistic", () => {
    expect(ficheDesSignalements({ objet_table: "hubs", objet_id: ID })).toEqual({
      href: `/h2h-logistic/points/${ID}`,
      fiche: "du point de rendez-vous",
    });
  });

  it("garde les autres : l’annonce, la recherche, le live — et le compte quand le dossier ne porte pas de table", () => {
    expect(ficheDesSignalements({ objet_table: "products", objet_id: ID })?.fiche).toBe("de l’annonce");
    expect(ficheDesSignalements({ objet_table: "je_cherche_demandes", objet_id: ID })?.fiche).toBe("de la recherche");
    expect(ficheDesSignalements({ objet_table: "live_sessions", objet_id: ID })?.fiche).toBe("du live");
    expect(ficheDesSignalements({ objet_table: null, objet_id: ID })?.fiche).toBe("du compte");
    // Chacun mène à une adresse différente : aucun ne retombe sur la fiche d'un autre.
    const adresses = (["products", "live_sessions", "hubs", null] as const).map(
      (t) => ficheDesSignalements({ objet_table: t, objet_id: ID })?.href,
    );
    expect(new Set(adresses).size).toBe(4);
    for (const a of adresses) expect(a).toContain(ID);
  });

  it("sans objet, il n’y a aucune fiche à ouvrir", () => {
    expect(ficheDesSignalements({ objet_table: "hubs", objet_id: null })).toBeNull();
  });
});
