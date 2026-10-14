// LES INCIDENTS DE CO-LIVRAISON (§ 12.5) — rendus tels que le serveur les envoie (hand-to-hand `20261014001000`).
//
// La base décide de tout : où en est un incident, qui il attend, ce qu'il retient, ses délais, et si l'appelant peut
// ouvrir ses pièces (`incidentsLusEtAnnonces.test.ts` dans hand-to-hand). On vérifie ici que l'écran le dit tel
// quel : la liste, ses filtres et leurs compteurs, la fiche — et qu'elle ne promet aucun geste qui n'existe pas.
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { CompteursIncidents, FicheIncident, Incident } from "@/lib/logistique/types";
import type { Incident as Declaration, Litiges } from "@/lib/operations/types";

vi.mock("next/link", () => ({
  default: ({ href, children, ...reste }: { href: string; children: ReactNode }) => (
    <a href={href} {...reste}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/marque/AnimationH2H", () => ({ AnimationH2H: () => <span data-animation /> }));
vi.mock("@/lib/operations/sensibles", () => ({ ouvrirPiece: vi.fn(), revelerDonnee: vi.fn() }));
vi.mock("@/lib/db/useConsultation", () => ({ useConsultation: () => ({ consulter: vi.fn(), enCours: false }) }));

const { ListeIncidents } = await import("./ListeIncidents");
const { FiltresListeIncidents } = await import("./FiltresIncidents");
const { FicheIncidentVue, actionAttendue, dureeDite, executionDite } = await import("./FicheIncident");
const { OngletLitiges } = await import("@/components/operations/onglets/Litiges");
const { adresseIncidents, cheminIncident } = await import("@/lib/logistique/types");

/** Les espaces insécables d'un montant (« 4,00 € ») se lisent comme des espaces. */
const net = (s: string) => s.replace(/[\u00a0\u202f]/g, " ");
const decode = (html: string) => net(html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&"));

const ID = "c1250000-0000-4000-a000-0000000000d7";
const COMMANDE = "c1250000-0000-4000-a000-0000000000c1";
const DOSSIER = "c1250000-0000-4000-a000-0000000000f1";

const incident = (i: Partial<Incident> = {}): Incident => ({
  id: ID,
  numero: 7,
  formulaire: "seller_absent",
  nom: "Vendeur absent à la collecte",
  libelle: "Vendeur absent au rendez-vous",
  etape: "collecte",
  situation: "contestable",
  situation_libelle: "Contestation possible",
  attend: "partie",
  echeance: "2026-10-15T08:40:00Z",
  alerte: null,
  commande: COMMANDE,
  ref: "HTH-2026-000321",
  colivraison: "c1250000-0000-4000-a000-0000000000b1",
  bien_titre: "Lampe de bureau",
  hub: "Parking Quai des États-Unis",
  ville: "Nice",
  rendez_vous: "2026-10-14T08:00:00Z",
  declare_le: "2026-10-14T08:40:00Z",
  declarant_role: "cotransporteur",
  declarant: "karim",
  partie_visee_role: "vendeur",
  partie_visee: "sophie_m",
  conteste_le: null,
  contestable_jusqu_au: "2026-10-15T08:40:00Z",
  pieces: 1,
  retient_les_fonds: true,
  issue: null,
  dossier: null,
  dossier_id: null,
  est_test: false,
  ...i,
});

const BLOCAGE: Partial<Incident> = {
  numero: 6, formulaire: "hub_blocked", nom: "Remise bloquée", libelle: "Blocage au hub", etape: "remise",
  situation: "a_examiner", situation_libelle: "À examiner par l’équipe", attend: "equipe", echeance: null,
  partie_visee_role: null, partie_visee: null, contestable_jusqu_au: null, pieces: 0,
  dossier: "DOS-000061", dossier_id: DOSSIER,
};

const COMPTEURS: CompteursIncidents = {
  a_traiter: 2, contestables: 1, en_cloture: 0, clos: 4, tous: 7,
  formulaires: [
    { numero: 2, formulaire: "buyer_absent", nom: "Acheteur absent à la remise", libelle: "Acheteur absent au hub de remise" },
    { numero: 4, formulaire: "transporter_absent", nom: "Cotransporteur absent à la remise", libelle: "Cotransporteur absent au hub de remise" },
    { numero: 6, formulaire: "hub_blocked", nom: "Remise bloquée", libelle: "Blocage au hub" },
    { numero: 7, formulaire: "seller_absent", nom: "Vendeur absent à la collecte", libelle: "Vendeur absent au rendez-vous" },
    { numero: 11, formulaire: "refuse_package", nom: "Refus du Colis", libelle: "Refus du colis" },
    { numero: 13, formulaire: "collect_absent", nom: "Collecte bloquée", libelle: "Double absence au rendez-vous de collecte" },
  ],
};

const fiche = (f: Partial<FicheIncident> = {}, i: Partial<Incident> = {}): FicheIncident => ({
  incident: incident(i),
  declaration: {
    motif: "Vendeur injoignable", commentaire: "J’ai attendu vingt minutes.", reponses: { waited: "Oui" },
    exactitude_confirmee: true, statut: "pending",
  },
  delais: {
    tolerance_minutes: 10, attente_exigee: true, declarable_des: "2026-10-14T08:10:00Z", declaree_apres_minutes: 40,
    declaration_minutes: null, declaration_jusqu_au: null, declaree_dans_le_delai: null,
    contestation_heures: 24, contestable_jusqu_au: "2026-10-15T08:40:00Z",
    regle: {
      code: "D3", titre: "Contestation d'une absence vendeur",
      texte: "Après la déclaration « Vendeur absent au rendez-vous » (F7), le vendeur dispose de 24 heures à compter de la notification pour contester (F8).",
    },
    prolongations: null,
  },
  presences: [
    { etape: "recuperation", partie: "cotransporteur", pseudo: "karim", rendez_vous: "2026-10-14T08:00:00Z",
      declaree_le: "2026-10-14T07:58:00Z", validee_le: "2026-10-14T07:58:00Z", dans_la_zone: true, retard_minutes: -2, tentatives: 1 },
    { etape: "recuperation", partie: "vendeur", pseudo: "sophie_m", rendez_vous: "2026-10-14T08:00:00Z",
      declaree_le: "2026-10-14T08:20:00Z", validee_le: null, dans_la_zone: false, retard_minutes: 20, tentatives: 3 },
  ],
  contestations: [],
  colivraison: {
    id: "c1250000-0000-4000-a000-0000000000b1", statut: "group_created", etat_colis: "seller_confirmed", par_recherche: false,
    detenteur: "vendeur", vendeur: "sophie_m", acheteur: null, cotransporteur: "karim",
    hub_collecte: "Parking Quai des États-Unis", collecte_prevue: "2026-10-14T08:00:00Z", collecte_validee_le: null,
    hub_remise: "Gare de Cannes", remise_prevue: "2026-10-14T09:00:00Z", remise_validee_le: null,
  },
  protocole: {
    titre: "Règlement — vendeur absent", note: "Le coût est imputé au vendeur responsable.",
    lignes: [
      { partie: "buyer", nature: "refund", libelle: "Remboursement intégral de l'acheteur", montant_cents: null },
      { partie: "seller", nature: "fee", libelle: "Frais d'annulation imputé au vendeur", montant_cents: 400 },
      { partie: "transporter", nature: "pay", libelle: "Part reversée au cotransporteur", montant_cents: 300 },
      { partie: "platform", nature: "kept", libelle: "Part conservée par HandtoHand", montant_cents: 100 },
    ],
  },
  execution: { issue: null, reglements: 0, frais: null },
  retenues: [{ libelle: "Incident de co-livraison — Vendeur absent au rendez-vous", depuis: "2026-10-14T08:40:00Z", de_la_contestation: false }],
  dossiers: [],
  autres: [],
  refus_colis: null,
  pieces_ouvrables: true,
  partie: false,
  ...f,
});

const CONTESTATION = {
  id: "c1250000-0000-4000-a000-0000000000e8", formulaire: "contest_seller_absent", numero: 8,
  libelle: "Contestation — vendeur absent", declaree_le: "2026-10-14T10:00:00Z", role: "vendeur" as const, par: "sophie_m",
  motif: "J’étais sur place", commentaire: "À l’entrée du parking.", reponses: {}, pieces: 2, statut: "pending",
};

describe("la liste des incidents (§ 12.5)", () => {
  it("dit de chaque incident son formulaire, sa co-livraison, qui déclare et qui est visé, où il en est et qui il attend", () => {
    const html = decode(renderToStaticMarkup(<ListeIncidents incidents={[incident(BLOCAGE), incident()]} filtree={false} />));
    expect(html).toContain("Formulaire 7");
    expect(html).toContain("Vendeur absent à la collecte");
    expect(html).toContain("« Vendeur absent au rendez-vous »");
    expect(html).toContain(`href="${cheminIncident(ID)}"`);
    expect(html).toContain('href="/operations/HTH-2026-000321?onglet=litiges"');
    expect(html).toContain("Cotransporteur particulier · karim");
    expect(html).toContain("vise : Vendeur · sophie_m");
    expect(html).toContain("Contestation possible");
    expect(html).toContain("La personne visée");
    expect(html).toContain("jusqu’au 15/10/2026");
    expect(html).toContain("1 pièce");
    expect(html).toContain("retient les versements");
    // Un blocage ne vise personne, attend l'équipe, et nomme son dossier.
    expect(html).toContain("Formulaire 6");
    expect(html).toContain("Remise bloquée");
    expect(html).toContain("ne vise personne");
    expect(html).toContain("À examiner par l’équipe");
    expect(html).toContain("L’équipe");
    expect(html).toContain(`href="/a-traiter?dossier=${DOSSIER}"`);
    expect(html).toContain("DOS-000061");
    expect(html).toContain("aucune pièce");
  });

  it("marque le monde du test, un pseudonyme absent, une clôture en retard — sans rien inventer", () => {
    const html = decode(renderToStaticMarkup(
      <ListeIncidents
        filtree={false}
        incidents={[incident({
          est_test: true, declarant: null, situation: "en_cloture", situation_libelle: "Clôture en cours",
          attend: "plateforme", echeance: null, alerte: "cloture_en_retard", ref: null, commande: null,
        })]}
      />,
    ));
    expect(html).toContain("TEST");
    expect(html).toContain("Cotransporteur particulier · sans pseudonyme");
    expect(html).toContain("Par la plateforme");
    expect(html).toContain("La plateforme n’a pas clos");
    expect(html).toContain("Co-livraison introuvable");
    expect(html).not.toContain("compte effacé");
  });

  it("vide : dit pourquoi, selon qu’un filtre est posé ou non", () => {
    expect(decode(renderToStaticMarkup(<ListeIncidents incidents={[]} filtree={false} />))).toContain("Aucun incident déclaré");
    expect(decode(renderToStaticMarkup(<ListeIncidents incidents={[]} filtree />))).toContain("Aucun incident pour ces filtres");
  });

  it("au-delà de 300 lignes, le dit", () => {
    const beaucoup = Array.from({ length: 300 }, (_, n) => incident({ id: `${ID.slice(0, -3)}${String(n).padStart(3, "0")}` }));
    expect(decode(renderToStaticMarkup(<ListeIncidents incidents={beaucoup} filtree={false} />))).toContain("Les 300 premiers sont affichés");
  });
});

describe("les filtres des incidents", () => {
  const f = { filtre: "a_traiter" as const, formulaire: 7, q: "karim", test: false };

  it("chaque pastille porte son compteur et garde le formulaire, la recherche et le monde dans l’adresse", () => {
    const html = decode(renderToStaticMarkup(<FiltresListeIncidents f={f} compteurs={COMPTEURS} testVisible />));
    expect(html).toContain("À examiner");
    expect(html).toContain('href="/h2h-logistic?onglet=incidents&filtre=contestables&formulaire=7&q=karim"');
    expect(html).toContain('href="/h2h-logistic?onglet=incidents&formulaire=7&q=karim"');
    expect(html).toMatch(/Clos<span[^>]*>4<\/span>/);
    expect(html).toMatch(/Tous<span[^>]*>7<\/span>/);
    // Le formulaire se choisit dans le même formulaire que la recherche, nommé par la base.
    expect(html).toContain('<select name="formulaire"');
    expect(html).toContain("13 · Collecte bloquée");
    expect(html).toMatch(/<option value="7" selected="">7 · Vendeur absent à la collecte<\/option>/);
    expect(html).toContain("Inclure le monde du test");
  });

  it("sans compteurs lisibles : les pastilles sans nombre, les six formulaires nommés quand même", () => {
    const html = decode(renderToStaticMarkup(<FiltresListeIncidents f={{ ...f, formulaire: null }} compteurs={null} testVisible={false} />));
    expect(html).toContain("À examiner");
    expect(html).not.toMatch(/Clos<span/);
    for (const nom of ["2 · Acheteur absent à la remise", "4 · Cotransporteur absent à la remise", "6 · Remise bloquée",
                       "7 · Vendeur absent à la collecte", "11 · Refus du Colis", "13 · Collecte bloquée"]) {
      expect(html).toContain(nom);
    }
    expect(html).not.toContain("Inclure le monde du test");
  });

  it("l’adresse d’une liste filtrée", () => {
    expect(adresseIncidents({ filtre: null, formulaire: null, q: null, test: false })).toBe("/h2h-logistic?onglet=incidents");
    expect(adresseIncidents({ filtre: "clos", formulaire: 13, q: "nice", test: true }))
      .toBe("/h2h-logistic?onglet=incidents&filtre=clos&formulaire=13&q=nice&test=1");
  });
});

describe("la fiche d’un incident", () => {
  const rendu = (f: FicheIncident) => decode(renderToStaticMarkup(<FicheIncidentVue f={f} />));

  it("répond aux quatre questions, et dit la déclaration, ses délais, les présences, le protocole et ce qui a été exécuté", () => {
    const html = rendu(fiche());
    for (const q of ["Que se passe-t-il ?", "Qui est concerné ?", "Quelle action est attendue ?", "Avant quelle échéance ?"]) {
      expect(html).toContain(q);
    }
    expect(html).toContain("Formulaire 7");
    expect(html).toContain("Vendeur absent à la collecte");
    expect(html).toContain("Déclaré par : Cotransporteur particulier · karim");
    expect(html).toContain("Vise : Vendeur · sophie_m");
    expect(html).toContain("Il retient les versements de la commande.");
    expect(html).toContain("La personne visée peut contester depuis son application.");
    expect(html).toContain("Contestation possible jusqu’au 15/10/2026");
    // La déclaration.
    expect(html).toContain("Vendeur injoignable");
    expect(html).toContain("J’ai attendu vingt minutes.");
    expect(html).toContain("waited");
    // Ses délais : la tolérance, le délai de contestation, la règle ; aucune prolongation inventée.
    expect(html).toContain("10 min avant et après l’heure du rendez-vous");
    expect(html).toContain("40 min après l’heure du rendez-vous");
    expect(html).toContain("24 h à compter de la notification");
    expect(html).toContain("Aucun pour ce formulaire");
    expect(html).toContain("Aucune n’est enregistrée : les applications ne les transmettent pas.");
    expect(html).toContain("Règle D3");
    expect(html).toContain("le vendeur dispose de 24 heures à compter de la notification");
    // Les présences : déclarée n'est pas validée.
    expect(html).toContain("Cotransporteur particulier · karim");
    expect(html).toContain("2 min avant l’heure");
    expect(html).toContain("Validée");
    expect(html).toContain("Hors de la zone : non validée");
    expect(html).toContain("3 essais");
    // Pas de contestation encore.
    expect(html).toContain("Pas encore contestée : le délai court.");
    // La co-livraison ; un pseudonyme absent n'est pas un compte effacé.
    expect(html).toContain("Ancien parcours");
    expect(html).toContain("sans pseudonyme");
    expect(html).toContain('href="/operations/HTH-2026-000321?onglet=livraison"');
    // Le protocole : prévu, pas exécuté.
    expect(html).toContain("Prévu, pas exécuté");
    expect(html).toContain("Frais d'annulation imputé au vendeur");
    expect(html).toContain("4,00 €");
    expect(html).toContain("Rien n’a été exécuté");
    // Ce qu'il retient.
    expect(html).toContain("Fonds retenus");
    expect(html).toContain("retient tous les versements de la commande");
    // Les pièces s'ouvrent : un bouton par pièce.
    expect(html.match(/Voir<\/button>/g)?.length).toBe(1);
    // 🔴 AUCUN GESTE DE DÉCISION N'EST PROPOSÉ : il n'existe pas encore.
    expect(html).not.toMatch(/<button[^>]*>(Décider|Trancher|Clôturer|Notifier)/);
  });

  it("un blocage : son délai de déclaration, tenu ou non — et l’équipe, sans geste promis", () => {
    const delais = {
      ...fiche().delais, declaration_minutes: 10, declaration_jusqu_au: "2026-10-14T09:20:00Z", declaree_dans_le_delai: false,
      declaree_apres_minutes: 5790, contestation_heures: null, contestable_jusqu_au: null,
      regle: { code: "D5", titre: "Double absence au hub de remise", texte: "Si aucune présence n'est validée au hub de remise après le chrono…" },
    };
    const f = fiche({
      delais, protocole: null, presences: [], retenues: [],
      dossiers: [{ id: DOSSIER, reference: "DOS-000061", source: "operation", ouvert: true, est_test: false }],
      autres: [
        { id: "c1250000-0000-4000-a000-0000000000d2", formulaire: "buyer_absent", numero: 2, libelle: "Acheteur absent au hub de remise",
          genre: "incident", declare_le: "2026-10-14T09:50:00Z", role: "cotransporteur", statut: "pending" },
        { id: "c1250000-0000-4000-a000-0000000000d9", formulaire: "cancel_seller", numero: 9, libelle: "Annulation — vendeur",
          genre: "annulation", declare_le: "2026-10-14T09:55:00Z", role: "vendeur", statut: "pending" },
      ],
    }, { ...BLOCAGE, retient_les_fonds: false });
    const html = rendu(f);
    expect(html).toContain("Ne vise personne : c’est un blocage.");
    expect(html).toContain("10 min après la tolérance : jusqu’au 14/10/2026");
    expect(html).toContain("Déclaré hors de ce délai");
    expect(html).toContain("4 j après l’heure du rendez-vous");
    expect(html).toContain("Les formulaires 6 et 13 suivent les mêmes règles de délai.");
    expect(html).toContain("Aucun : personne ne peut contester cette déclaration");
    expect(html).toContain("Cette déclaration ne se conteste pas.");
    expect(html).toContain("Aucune échéance ne court pour un participant.");
    expect(html).toContain("Le protocole ne prévoit aucun règlement type pour ce formulaire.");
    expect(html).toContain("Il ne retient aucun versement.");
    expect(html).toContain("Aucune présence déclarée à ce rendez-vous");
    // L'équipe est attendue, et l'écran dit où instruire — sans bouton de décision.
    expect(html).toContain("La décision d’un incident arrive avec la suite du back-office");
    expect(html).toContain(`href="/a-traiter?dossier=${DOSSIER}"`);
    expect(html).toContain("Dossier DOS-000061");
    // Les autres déclarations : un incident ouvre sa fiche, une annulation non.
    expect(html).toContain('href="/h2h-logistic/incidents/c1250000-0000-4000-a000-0000000000d2"');
    expect(html).toContain("Formulaire 9 · Annulation — vendeur");
    expect(html).not.toContain('href="/h2h-logistic/incidents/c1250000-0000-4000-a000-0000000000d9"');
  });

  it("contesté : la contestation, ses pièces — et dans le délai tenu d’un blocage, la pastille le dit", () => {
    const html = rendu(fiche({ contestations: [CONTESTATION] }, {
      situation: "conteste", situation_libelle: "Contestation à examiner", attend: "equipe", echeance: null,
      conteste_le: CONTESTATION.declaree_le,
    }));
    expect(html).toContain("Formulaire 8 · Contestation — vendeur absent");
    expect(html).toContain("Vendeur · sophie_m");
    expect(html).toContain("J’étais sur place");
    expect(html).toContain("À l’entrée du parking.");
    expect(html.match(/Voir<\/button>/g)?.length).toBe(3); // une pièce de la déclaration, deux de la contestation
    expect(html).toContain("L’équipe examine la contestation.");

    const tenu = rendu(fiche({ delais: { ...fiche().delais, declaration_minutes: 10, declaration_jusqu_au: "2026-10-14T08:20:00Z", declaree_dans_le_delai: true } }));
    expect(tenu).toContain("Déclaré dans ce délai");
  });

  it("qui ne peut pas ouvrir les pièces ne voit aucun bouton — et sait pourquoi", () => {
    const lecteur = rendu(fiche({ pieces_ouvrables: false }));
    expect(lecteur).not.toContain("Voir</button>");
    expect(lecteur).toContain("Votre rôle ne permet pas d’ouvrir les pièces des utilisateurs.");
    const partie = rendu(fiche({ pieces_ouvrables: false, partie: true }));
    expect(partie).not.toContain("Voir</button>");
    expect(partie).toContain("Votre compte personnel est partie à cette co-livraison");
    expect(partie).not.toContain("Votre rôle ne permet pas");
  });

  it("le refus du colis d’une co-livraison du § 5 renvoie à l’onglet Livraison, où il s’examine", () => {
    const refus = {
      id: ID, declare_le: "2026-10-14T08:02:00Z", cotransporteur: "karim", motif: "Colis différent", commentaire: null,
      reponses: {}, pieces: 0, collecte_le: "2026-10-14T08:00:00Z", presence_cotransporteur_le: null, presence_vendeur_le: null,
      contestable_jusqu_au: "2026-10-15T08:02:00Z", issue: null, contestation: null, decision: null, examinable: true,
      raison: null, pieces_ouvrables: true,
    };
    const f = fiche({ refus_colis: refus, protocole: null }, {
      numero: 11, formulaire: "refuse_package", nom: "Refus du Colis", libelle: "Refus du colis",
      situation: "conteste", situation_libelle: "Contestation à examiner", attend: "equipe", echeance: null,
    });
    const html = rendu(f);
    expect(html).toContain("Examiner la contestation dans l’onglet Livraison");
    expect(html).toContain("Les frais d’un refus du colis se lisent avec son examen");
    expect(actionAttendue(f)).toBe("L’équipe examine la contestation : dans l’onglet Livraison de la commande.");
    expect(html).not.toContain("arrive avec la suite du back-office");
  });

  it("ce qui est attendu se dit d’après la situation — et un incident clos n’attend rien", () => {
    expect(actionAttendue(fiche({}, { situation: "en_cloture", attend: "plateforme" })))
      .toBe("La plateforme clôt la déclaration : le délai de contestation est passé sans contestation.");
    expect(actionAttendue(fiche({}, { situation: "clos", attend: null }))).toBe("Aucune : l’incident est clos.");
    expect(actionAttendue(fiche({}, { situation: "a_examiner", attend: "equipe" }))).toContain("L’équipe analyse l’incident.");
  });

  it("ce qui a été exécuté ne se confond jamais avec ce que le protocole prévoit", () => {
    expect(executionDite(fiche())).toContain("Rien n’a été exécuté");
    expect(executionDite(fiche({ execution: { issue: "refus_effectif", reglements: 0, frais: null } })))
      .toBe("Issue enregistrée : refus effectif — co-livraison annulée, frais du vendeur.");
    expect(net(executionDite(fiche({ execution: { issue: "refus_effectif", reglements: 0, frais: { role: "vendeur", frais_cents: 400, le: "2026-10-15T09:00:00Z" } } }))))
      .toMatch(/^Des frais de 4,00 € ont été appliqués — Vendeur —, le 15\/10\/2026/);
    expect(executionDite(fiche({ execution: { issue: null, reglements: 2, frais: null } }))).toBe("2 règlements enregistrés.");
  });

  it("une durée se lit", () => {
    expect([dureeDite(0), dureeDite(59), dureeDite(60), dureeDite(185), dureeDite(1440), dureeDite(5790), dureeDite(-12)])
      .toEqual(["0 min", "59 min", "1 h 00", "3 h 05", "1 j", "4 j", "12 min"]);
  });
});

describe("l’onglet « Litiges » d’une commande mène à la fiche d’un incident", () => {
  const declaration = (d: Partial<Declaration>): Declaration => ({
    id: ID, formulaire: "seller_absent", formulaire_libelle: "Vendeur absent au rendez-vous", declarant_role: "transporter",
    declarant: "karim", hub: "Parking Quai des États-Unis", rendez_vous: "2026-10-14T08:00:00Z", declare_le: "2026-10-14T08:40:00Z",
    statut: "pending", motif: null, commentaire: null, reponses: null, exactitude_confirmee: true,
    contestation_avant: "2026-10-15T08:40:00Z", conteste: null, issue: null, pieces: 0, motif_litige: null,
    motif_litige_libelle: null, numero: 7, genre: "incident", ...d,
  });
  const litiges = (incidents: Declaration[]): Litiges => ({ reclamations: [], incidents, oppositions: 0 }) as Litiges;

  it("un incident ouvre sa fiche et dit son numéro ; une contestation, non", () => {
    const html = decode(renderToStaticMarkup(
      <OngletLitiges
        maintenant={new Date("2026-10-14T12:00:00Z").getTime()}
        l={litiges([
          declaration({}),
          declaration({ id: "c1250000-0000-4000-a000-0000000000e8", formulaire: "contest_seller_absent",
                        formulaire_libelle: "Contestation — vendeur absent", conteste: ID, numero: 8, genre: "contestation" }),
        ])}
      />,
    ));
    expect(html).toContain("Formulaire 7 · Vendeur absent au rendez-vous");
    expect(html).toContain(`href="${cheminIncident(ID)}"`);
    expect(html.match(/Ouvrir la fiche de l’incident/g)?.length).toBe(1);
    expect(html).toContain("Formulaire 8 · Contestation · Contestation — vendeur absent");
  });
});
