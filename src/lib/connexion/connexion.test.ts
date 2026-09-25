import { describe, expect, it } from "vitest";
import { destinationSure } from "./destination";
import { MESSAGE_PAR_DEFAUT, messagePourCode } from "./erreurs";

describe("destinationSure — on ne revient que sur ce site", () => {
  const hote = "admin.handtohand.pro";

  it("garde un chemin relatif, avec sa requête", () => {
    expect(destinationSure("/utilisateurs?onglet=roles", hote)).toBe("/utilisateurs?onglet=roles");
  });

  it("garde une adresse absolue du même hôte, réduite à son chemin", () => {
    expect(destinationSure("https://admin.handtohand.pro/h2h-logistic", hote)).toBe("/h2h-logistic");
    expect(destinationSure("http://localhost:3000/", "localhost:3000")).toBe("/");
  });

  it("refuse un autre site, même déguisé", () => {
    expect(destinationSure("https://ailleurs.example/piege", hote)).toBe("/");
    expect(destinationSure("//ailleurs.example/piege", hote)).toBe("/");
    expect(destinationSure("/\\ailleurs.example", hote)).toBe("/");
    expect(destinationSure("javascript:alert(1)", hote)).toBe("/");
  });

  it("ne renvoie jamais vers la connexion elle-même", () => {
    expect(destinationSure("/sign-in", hote)).toBe("/");
    expect(destinationSure("/sign-up/verify", hote)).toBe("/");
  });

  it("rend l'accueil sans destination", () => {
    expect(destinationSure(undefined, hote)).toBe("/");
    expect(destinationSure(["/equipe-et-audit", "/autre"], hote)).toBe("/equipe-et-audit");
  });
});

describe("messagePourCode — des refus en français, sans nommer le prestataire", () => {
  it("traduit les refus connus", () => {
    expect(messagePourCode("form_code_incorrect")).toBe("Code incorrect.");
    expect(messagePourCode("verification_expired")).toMatch(/expiré/);
  });

  it("rend un message neutre pour le reste", () => {
    expect(messagePourCode("code_inconnu")).toBe(MESSAGE_PAR_DEFAUT);
    expect(messagePourCode(null)).toBe(MESSAGE_PAR_DEFAUT);
    expect(MESSAGE_PAR_DEFAUT).not.toMatch(/clerk/i);
  });
});
