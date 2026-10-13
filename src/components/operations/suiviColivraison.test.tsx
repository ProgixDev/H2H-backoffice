// CE QUE LA FICHE DIT D'UNE CO-LIVRAISON SUR LE TERRAIN (§ 12.3) — rendu tel que le serveur l'envoie
// (hand-to-hand `20261013002000`).
//
// La base ne rend ni position, ni code, ni adresse (`colivraisonsLues.test.ts` dans hand-to-hand) ; on vérifie
// ici que l'écran dit ce qu'il reçoit sans le travestir : une présence hors zone n'est pas une faute, un scan
// refusé n'est jamais vert, une retenue dit sa cause.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { DemandeHorsHub, PresenceHub, RetenueLivraison, ScanColis } from "@/lib/operations/types";

const { HorsHubListe, PresencesTableau, RetenuesBloc, ScansTableau, ecartAuRendezVous } = await import(
  "./onglets/SuiviColivraison"
);

const MAINTENANT = new Date("2026-10-14T13:00:00Z").getTime();
const decode = (html: string) => html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

const presence = (p: Partial<PresenceHub> = {}): PresenceHub => ({
  etape: "recuperation", partie: "cotransporteur", pseudo: "karim", rendez_vous: "2026-10-14T12:30:00Z",
  declaree_le: "2026-10-14T12:26:00Z", validee_le: "2026-10-14T12:26:00Z", dans_la_zone: true,
  retard_minutes: -4, tentatives: 1, ...p,
});
const scan = (s: Partial<ScanColis> = {}): ScanColis => ({
  le: "2026-10-14T12:31:00Z", nature: "seller_qr", resultat: "success", role: "transporter", acteur: "karim",
  etat_avant: "seller_confirmed", etat_demande: null, libelle: "QR code du vendeur scanné", photo: false, ...s,
});

describe("les présences déclarées", () => {
  const rendu = (p: PresenceHub[]) => decode(renderToStaticMarkup(<PresencesTableau presences={p} maintenant={MAINTENANT} />));

  it("disent qui, à quelle étape, et l’écart à l’heure du rendez-vous", () => {
    const html = rendu([presence()]);
    expect(html).toContain("Collecte");
    expect(html).toContain("Cotransporteur particulier · karim");
    expect(html).toContain("4 min avant l’heure");
    expect(html).toContain("Validée");
  });

  it("🔴 une présence hors de la zone est enregistrée, pas validée — ni verte, ni dite comme une faute", () => {
    const html = rendu([presence({ partie: "vendeur", pseudo: "lea_nice", validee_le: null, dans_la_zone: false, retard_minutes: 12, tentatives: 3 })]);
    expect(html).toContain("Hors de la zone : non validée");
    expect(html).not.toContain(">Validée<");
    expect(html).toContain("12 min après l’heure");
    expect(html).toContain("3 essais");
  });

  it("une présence validée puis éloignée reste validée : la base garde la première fois", () => {
    expect(rendu([presence({ dans_la_zone: false })])).toContain("Validée");
  });

  it("disent qu’il n’y en a aucune, sans tableau vide", () => {
    const html = rendu([]);
    expect(html).toContain("Aucune présence déclarée.");
    expect(html).not.toContain("<table");
  });

  it("l’écart se dit dans les trois cas, et se tait sans rendez-vous", () => {
    expect(ecartAuRendezVous(0)).toBe("À l’heure");
    expect(ecartAuRendezVous(-7)).toBe("7 min avant l’heure");
    expect(ecartAuRendezVous(15)).toBe("15 min après l’heure");
    expect(ecartAuRendezVous(null)).toBeNull();
  });
});

describe("les validations et scans", () => {
  const rendu = (s: ScanColis[]) => decode(renderToStaticMarkup(<ScansTableau scans={s} maintenant={MAINTENANT} />));

  it("disent le geste avec les mots de la base, qui l’a fait, et son résultat", () => {
    const html = rendu([scan(), scan({ nature: "tracking_qr", libelle: "Étiquette de suivi scannée", etat_demande: "picked_up", photo: true })]);
    expect(html).toContain("QR code du vendeur scanné");
    expect(html).toContain("Cotransporteur particulier · karim");
    expect(html).toContain("Étiquette de suivi scannée");
    expect(html).toContain("avec photo");
    expect(html).toContain("Accepté");
    expect(html).not.toContain("Refusé");
  });

  it("🔴 un scan refusé n’est jamais vert — hors du créneau comme code erroné", () => {
    const html = rendu([
      scan({ resultat: "out_of_window", libelle: "Scan refusé : hors du créneau" }),
      scan({ resultat: "wrong_code", libelle: "Scan refusé : code erroné" }),
    ]);
    expect(html).toContain("Scan refusé : hors du créneau");
    expect(html).toContain("Scan refusé : code erroné");
    expect(html).not.toContain("Accepté");
    expect((html.match(/>Refusé</g) ?? []).length).toBe(2);
  });

  it("disent qu’il n’y en a aucun", () => {
    expect(rendu([])).toContain("Aucune validation ni scan.");
  });
});

describe("les demandes hors point de rendez-vous", () => {
  const demande = (d: Partial<DemandeHorsHub> = {}): DemandeHorsHub => ({
    etape: "remise", statut: "pending", demandeur: "sami_cannes", demandee_le: "2026-10-14T09:00:00Z",
    decidee_le: null, expire_le: "2026-10-15T09:00:00Z", frais_cents: null, ...d,
  });
  const rendu = (d: DemandeHorsHub[]) => decode(renderToStaticMarkup(<HorsHubListe demandes={d} maintenant={MAINTENANT} />));

  it("disent l’étape, qui demande et le sort — l’adresse reste masquée", () => {
    const html = rendu([demande()]);
    expect(html).toContain("Remise hors point de rendez-vous, demandée par sami_cannes");
    expect(html).toContain("En attente de la réponse du cotransporteur");
    expect(html).toContain("adresse masquée");
    expect(html).not.toContain("frais proposés");
  });

  it("une demande restée sans réponse dit que le rendez-vous reste au point prévu ; des frais proposés se lisent", () => {
    const html = rendu([demande({ statut: "expired", frais_cents: 300 })]);
    expect(html).toContain("Sans réponse : le rendez-vous reste au point prévu");
    expect(html).toContain("frais proposés : 3,00");
  });

  it("ne rendent rien quand il n’y en a pas", () => {
    expect(rendu([])).toBe("");
  });
});

describe("ce qui retient les versements", () => {
  const rendu = (r: RetenueLivraison[]) => decode(renderToStaticMarkup(<RetenuesBloc retenues={r} maintenant={MAINTENANT} />));

  it("dit la cause, pour qui, depuis quand — et renvoie les montants à l’onglet Paiements", () => {
    const html = rendu([
      { motif: "incident", libelle: "Incident de co-livraison ouvert", depuis: "2026-10-14T12:45:00Z", beneficiaire: null },
      { motif: "contestation", libelle: "Frais d’annulation tardive contestés, en examen", depuis: "2026-10-14T10:00:00Z", beneficiaire: "cotransporteur" },
    ]);
    expect(html).toContain("Fonds retenus");
    expect(html).toContain("Incident de co-livraison ouvert — retient tous les versements de cet achat");
    expect(html).toContain("retient la participation du cotransporteur particulier");
    expect(html).toContain("Les montants se lisent dans l’onglet Paiements");
    expect(html).not.toMatch(/\d+,\d{2}\s?€/);
  });

  it("ne rend rien quand rien n’est retenu", () => {
    expect(rendu([])).toBe("");
  });
});
