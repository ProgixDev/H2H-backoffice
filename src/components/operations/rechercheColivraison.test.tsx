// CE QUE LA FICHE MONTRE D'UNE RECHERCHE DE COTRANSPORTEUR — rendu tel que le serveur l'envoie.
//
// La base calcule la recherche, ses délais et la raison de chaque candidature
// (`rechercheSupervisee.test.ts` dans hand-to-hand) ; on vérifie ici que l'écran
// le dit tel quel : T0 et la fenêtre, les TROIS délais chacun pour soi (R12.1),
// la marge, et chaque candidature avec son état, son passage, ses hubs, le motif
// d'un refus et la raison d'une indisponibilité.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { CandidatureColivraison, RechercheColivraison } from "@/lib/operations/types";
import { RechercheColivraisonBloc } from "./onglets/RechercheColivraison";

const MAINTENANT = new Date("2026-10-08T12:10:00Z").getTime();

const candidature = (c: Partial<CandidatureColivraison>): CandidatureColivraison => ({
  id: "c-1", statut: "en_attente", cotransporteur: "karim", proposee_le: "2026-10-08T12:00:00Z",
  repondre_avant: "2026-10-08T12:20:00Z", repondue_le: "2026-10-08T12:04:00Z", passages: 2,
  collecte_le: "2026-10-08T16:00:00Z", express: false, hub_collecte: "Gare de Nice", hub_remise: null,
  remise_le: null, choisie_le: null, decision_vendeur_le: null, close_le: null, motif_refus: null,
  motif_vendeur: null, participation_cents: 511, raison: null, marge_tenue_minutes: null, ...c,
});

const RECHERCHE: RechercheColivraison = {
  id: "r-1", numero: 12, statut: "choix", tour: 2, t0: "2026-10-08T12:00:00Z",
  collecte_min: "2026-10-08T14:30:00Z", collecte_max: "2026-10-11T12:00:00Z", express_avant: "2026-10-08T15:00:00Z",
  choix_jusqu_au: "2026-10-08T12:24:00Z", validation_jusqu_au: null, confirmee_le: null, annulee_le: null,
  motif_annulation: null, ville_depart: "Nice", ville_arrivee: "Cannes", format: "M",
  reponse_minutes: 20, choix_minutes: 20, validation_minutes: 20, marge_minutes: 90, propositions: 3,
  candidatures: [
    candidature({ id: "c-1", cotransporteur: "karim", statut: "refusee_vendeur", motif_vendeur: "Pas à cette heure" }),
    candidature({ id: "c-2", cotransporteur: "lea", statut: "en_attente", raison: "trajet_indisponible", express: true }),
    candidature({ id: "c-3", cotransporteur: null, statut: "refusee", repondue_le: "2026-10-08T12:02:00Z",
                  motif_refus: "Pas ce jour-là", collecte_le: null, hub_collecte: null }),
    candidature({ id: "c-4", cotransporteur: "sam", statut: "proposee", repondue_le: null, collecte_le: null,
                  hub_collecte: null }),
  ],
};

const rendu = (r: RechercheColivraison) => renderToStaticMarkup(<RechercheColivraisonBloc r={r} maintenant={MAINTENANT} />);

describe("la recherche de cotransporteur dans la fiche (§ 5 des CGU H2H Logistic)", () => {
  it("dit l'étape, le numéro, la fenêtre et le tour d'un remplaçant", () => {
    const html = rendu(RECHERCHE);
    expect(html).toContain("Recherche de cotransporteur n° 12");
    expect(html).toContain("Choix de l’acheteur attendu");
    expect(html).toContain("Nice → Cannes · format M");
    expect(html).toContain("2 — choix d’un remplaçant (§ 5.3.3)");
    expect(html).toContain("Propositions envoyées");
  });

  it("montre les trois délais chacun pour soi, et la marge avant collecte (R12.1)", () => {
    const html = rendu(RECHERCHE);
    expect(html).toContain("20 min après sa proposition");
    expect(html).toContain("Choix de l’acheteur");
    expect(html).toContain("Validation du vendeur");
    expect(html).toContain("90 min au moins après la confirmation");
  });

  it("dit chaque candidature : son état, le motif d'un refus, la raison d'une indisponibilité", () => {
    const html = rendu(RECHERCHE);
    expect(html).toContain("Refusé par le vendeur");
    expect(html).toContain("Vendeur : Pas à cette heure");
    expect(html).toContain("Trajet suspendu ou retiré");
    expect(html).toContain("Refus : Pas ce jour-là");
    expect(html).toContain("(compte effacé)");
    expect(html).toContain("Proposition sans réponse");
    expect(html).toContain("Gare de Nice");
    expect(html).toContain("Express");
  });

  it("une recherche close dit pourquoi ; une confirmée, la marge tenue", () => {
    const close = rendu({ ...RECHERCHE, statut: "annulee", annulee_le: "2026-10-08T12:30:00Z",
                          motif_annulation: "sans_candidat", candidatures: [] });
    expect(close).toContain("Recherche close");
    expect(close).toContain("Aucun cotransporteur disponible (§ 5.1.7)");
    const confirmee = rendu({
      ...RECHERCHE, statut: "confirmee", confirmee_le: "2026-10-08T12:30:00Z",
      candidatures: [candidature({ statut: "confirmee", marge_tenue_minutes: 210, hub_remise: "Cannes Port" })],
    });
    expect(confirmee).toContain("Co-livraison confirmée");
    expect(confirmee).toContain("Marge tenue : 210 min");
    expect(confirmee).toContain("Cannes Port");
  });
});
