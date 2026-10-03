// LE SUIVI DES NOTIFICATIONS ET LEUR RENVOI (§20, R20.5, R20.6) — rendu tel que le serveur l'envoie.
//
// La base décide de tout (`notificationsRenvoyees.test.ts` dans hand-to-hand) : ce
// qui se renvoie, qui renvoie, la même notification sans échéance qui repart. On
// vérifie ici que l'écran le dit tel quel : le geste quand la base le permet, la
// raison d'un avis non parvenu qui ne se renvoie pas, les renvois déjà faits — et
// rien de plus sur un avis arrivé.
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { NotificationSuivie } from "@/lib/activite/types";

vi.mock("next/link", () => ({
  default: ({ href, children, ...reste }: { href: string; children: ReactNode }) => (
    <a href={href} {...reste}>
      {children}
    </a>
  ),
}));
vi.mock("@/lib/db/useGeste", () => ({ useGeste: () => ({ lancer: vi.fn(), enCours: false }) }));
vi.mock("@/lib/activite/actions", () => ({ renvoyerNotification: vi.fn() }));

const { ListeNotifications } = await import("./ListeNotifications");

const decode = (html: string) => html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const BOUTON = "Renvoyer</button>";
const MAINTENANT = Date.parse("2026-10-03T12:00:00Z");

const base: NotificationSuivie = {
  id: "n1", le: "2026-10-03T09:00:00Z", type: "order", titre: "Confirmez la disponibilité", destinataire: "vendeuse",
  obligatoire: true, modele: null, etat: "echec", push_statut: "echec", push_erreur: "MessageRateExceeded",
  push_tentatives: 2, push_appareils: 1, consultee_le: null, non_parvenue: true, objet_table: "orders",
  objet_id: "o1", objet_ref: "HTH-2026-ABC123", est_test: false, renvois: 0, renvoi_possible: true, renvoi_raison: null,
};

function rendre(notifications: NotificationSuivie[]) {
  return decode(
    renderToStaticMarkup(
      <ListeNotifications notifications={notifications} filtre={null} surFiltre={() => {}} maintenant={MAINTENANT} />,
    ),
  );
}

describe("le renvoi d’une notification", () => {
  it("le geste quand la base le permet, à côté de l’opération", () => {
    const html = rendre([base]);
    expect(html.split(BOUTON).length - 1).toBe(1);
    expect(html).toContain('href="/operations/HTH-2026-ABC123?onglet=chronologie"');
  });

  it("sinon, pour un avis qui n’est pas arrivé, la raison que donne la base", () => {
    const html = rendre([
      { ...base, renvoi_possible: false, renvoi_raison: "Aucun appareil enregistré : l’avis l’attend dans l’application." },
    ]);
    expect(html).not.toContain(BOUTON);
    expect(html).toContain("Aucun appareil enregistré : l’avis l’attend dans l’application.");
  });

  it("un avis arrivé ne dit ni geste ni raison", () => {
    const html = rendre([
      { ...base, id: "n2", etat: "consultee", push_statut: "distribue", non_parvenue: false, renvoi_possible: false,
        renvoi_raison: "Elle a été lue dans l’application : rien à renvoyer.", consultee_le: "2026-10-03T10:00:00Z" },
    ]);
    expect(html).not.toContain(BOUTON);
    expect(html).not.toContain("rien à renvoyer");
  });

  it("les renvois déjà faits se lisent dans la remise", () => {
    const html = rendre([{ ...base, etat: "prevue", push_statut: "prevu", push_tentatives: 0, renvois: 2,
                           renvoi_possible: false, renvoi_raison: "Un envoi est déjà en cours.", non_parvenue: false }]);
    expect(html).toContain("Push en attente");
    expect(html).toContain("renvoyée 2 fois par l’équipe");
    expect(html).not.toContain("Un envoi est déjà en cours.");
  });
});
