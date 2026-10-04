// VISIBILITÉ ET PUBLICITÉ (§17) — rendu tel que le serveur l'envoie.
//
// La base décide de tout : l'état d'une option, ses anomalies, ce qui se rembourse, qui peut
// l'arrêter (`optionsSupervisees.test.ts` dans hand-to-hand). On vérifie ici que l'écran le dit tel
// quel : la liste et ses filtres, la fiche — le tarif, l'exécution, la preuve de l'accord mot pour
// mot, la rétractation, les remboursements et leurs avoirs, les arrêts —, le geste quand la base le
// permet, sa raison sinon.
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { FicheOption, OptionLigne } from "@/lib/visibilite/types";

vi.mock("next/link", () => ({
  default: ({ href, children, ...reste }: { href: string; children: ReactNode }) => (
    <a href={href} {...reste}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/marque/AnimationH2H", () => ({ AnimationH2H: () => <span data-animation /> }));
vi.mock("@/lib/db/useGeste", () => ({ useGeste: () => ({ lancer: vi.fn(), enCours: false }) }));
vi.mock("@/lib/visibilite/actions", () => ({ arreterOption: vi.fn(), demanderRemboursementOption: vi.fn() }));
// Les gestes des ordres financiers portent des actions serveur : ils ne se rendent pas ici.
vi.mock("@/components/paiements/GestesOrdres", () => ({
  BoutonAnnulerOrdre: () => null,
  BoutonRelancer: () => null,
  BoutonsValidation: () => null,
}));

const { ListeOptions, etatDetaille } = await import("./ListeOptions");
const { FiltresListeOptions } = await import("./FiltresOptions");
const { FicheOptionVue } = await import("./FicheOption");
const { adresseOptions, causePauseDite } = await import("@/lib/visibilite/types");
const { euros } = await import("@/lib/paiements/types");

const decode = (html: string) => html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

const LIGNE: OptionLigne = {
  id: "0c000000-0000-4000-a000-0000000000c1",
  famille: "annonce",
  ref: "OPT-0C000000",
  option: "daily7",
  prix_cents: 525,
  etat: "en_cours",
  fin_motif: null,
  reservee_le: "2026-10-04T08:00:00Z",
  active_depuis: "2026-10-04T08:01:00Z",
  fin_prevue: "2026-10-11T08:01:00Z",
  termine_le: null,
  cible_id: "0c000000-0000-4000-a000-0000000000a1",
  cible_titre: "Jantes alu 17 pouces",
  cible_statut: "active",
  acheteur_id: "0c000000-0000-4000-a000-000000000001",
  acheteur: "vendeuse_fc",
  paiement_id: "0c000000-0000-4000-a000-0000000000d1",
  paiement_statut: "captured",
  paiement_reel: false,
  remontees_faites: 1,
  remontees_prevues: 7,
  remontees_manquees: 0,
  pause_depuis: null,
  pause_cause: null,
  pauses: 0,
  accord: "options-2026-10",
  retractation_ref: null,
  retractation_reste_cents: null,
  rembourser_avant: null,
  rembourse_cents: 0,
  remboursement_statut: null,
  contestation: null,
  arrete_le: null,
  anomalies: [],
  est_test: false,
};

const { pauses: _compte, ...SANS_COMPTE } = LIGNE;
void _compte;
const FICHE: FicheOption = {
  ...SANS_COMPTE,
  libelle: "Chaque jour pendant 7 jours",
  tarif: {
    grille: "common", rang: 1, option: "daily7", calcul: "percent", assiette_cents: 15000, taux: 0.035,
    minimum_cents: 299, plafond_cents: 1999, forfait_cents: null, duree_jours: 7, prix_cents: 525,
  },
  cible: { id: LIGNE.cible_id, titre: LIGNE.cible_titre, statut: "active", moderation: null },
  acheteur_compte: "individual",
  paiement: { montant_cents: 525, statut: "captured", reel: false, intention: "pi_test_0c" },
  facture: { numero: "HTH-F-2026-000007", total_cents: 525, emise_le: "2026-10-04T08:01:00Z" },
  part: { part: 0.142857, methode: "remontees", faites: 1, prevues: 7 },
  remontees: [
    { numero: 1, prevue_le: "2026-10-04T08:01:00Z", executee_le: "2026-10-04T08:01:00Z", statut: "executee" },
    { numero: 2, prevue_le: "2026-10-05T08:01:00Z", executee_le: null, statut: "prevue" },
  ],
  pauses: [],
  accord_detail: {
    version: "options-2026-10", donne_le: "2026-10-04T08:00:00Z", particulier: true,
    texte: "En payant cette option, je demande qu’elle soit exécutée tout de suite.", empreinte: "9f1c0ffee", a_valider: true,
  },
  retractation: null,
  retractation_possible: { possible: true, raison: null, delai_jusqu_au: "2026-10-18T22:00:00Z", a_rembourser_cents: 450, execute_cents: 75 },
  remboursement: {
    rembourse_cents: 0, disponible_cents: 525, minimum_cents: 0, suggestion_cents: 450, ordres: [], avoirs: [],
    possible: true, raison: null,
  },
  contestations: [],
  arrets: [],
  dossiers: [],
  possibles: {
    arreter: { possible: true, raison: null, remboursement_cents: 450, remboursement_raison: null },
    rembourser: {
      possible: false,
      raison: "Rembourser une option demande la permission de préparer un remboursement (Support, Finance, Direction).",
    },
  },
};
const fiche = (f: Partial<FicheOption>, liens = true) =>
  decode(renderToStaticMarkup(
    <FicheOptionVue f={{ ...FICHE, ...f }} lienAnnonce={liens} lienCompte={liens} lienDossier={liens} />,
  ));

describe("la liste des options", () => {
  it("ce qu’elle met en avant, pour qui, son état et son exécution, son prix — et chaque ligne ouvre sa fiche", () => {
    const html = decode(renderToStaticMarkup(<ListeOptions options={[LIGNE]} filtree={false} />));
    expect(html).toContain(`href="/visibilite-et-publicite/${LIGNE.id}"`);
    expect(html).toContain("OPT-0C000000");
    expect(html).toContain("Chaque jour pendant 7 jours");
    expect(html).toContain("sur une annonce");
    expect(html).toContain("« Jantes alu 17 pouces »");
    expect(html).toContain("vendeuse_fc");
    expect(html).toContain("En cours");
    expect(html).toContain("1 remontée(s) sur 7");
    expect(html).toContain(euros(525));
    expect(html).toContain("mode test");
  });

  it("une pause dit sa cause ; un arrêt n’est jamais neutre ; une rétractation dit ce qui reste à rendre", () => {
    const html = decode(renderToStaticMarkup(<ListeOptions filtree={false} options={[
      { ...LIGNE, id: "p", etat: "en_pause", pause_cause: "annonce_draft", pauses: 1 },
      { ...LIGNE, id: "a", etat: "terminee", fin_motif: "arretee", termine_le: "2026-10-05T08:00:00Z" },
      { ...LIGNE, id: "r", etat: "terminee", fin_motif: "retractation", retractation_ref: "RET-000001",
        retractation_reste_cents: 450, rembourser_avant: "2026-10-18T08:00:00Z" },
    ]} />));
    expect(html).toContain("Parce que l’annonce est en brouillon");
    expect(html).toContain("arrêtée par l’équipe");
    expect(html).toContain("RET-000001");
    expect(html).toContain(`${euros(450)} à rendre avant le`);
  });

  it("les anomalies se nomment, en rouge", () => {
    const html = decode(renderToStaticMarkup(
      <ListeOptions filtree={false} options={[{ ...LIGNE, anomalies: ["remontee_en_retard", "contestation_ouverte"] }]} />,
    ));
    expect(html).toContain("Remontée en retard");
    expect(html).toContain("Paiement contesté");
  });

  it("vide : on le dit, filtré ou non", () => {
    expect(decode(renderToStaticMarkup(<ListeOptions options={[]} filtree />))).toContain("Aucune option pour ces filtres");
    expect(decode(renderToStaticMarkup(<ListeOptions options={[]} filtree={false} />))).toContain("Aucune option");
  });

  it("les filtres gardent leurs compteurs et la recherche dans l’adresse ; ce qui attend se signale", () => {
    const html = decode(renderToStaticMarkup(
      <FiltresListeOptions f={{ filtre: "en_cours", q: "jantes", test: false }} testVisible={false}
        compteurs={{ tous: 5, anomalies: 2, retractations: 0, en_cours: 2, en_pause: 1, reservees: 1, terminees: 1,
          remboursements: 0 }} />,
    ));
    expect(html).toContain('href="/visibilite-et-publicite?filtre=anomalies&q=jantes"');
    expect(html).toContain('Anomalies<span class="tabular-nums">2</span>');
    expect(html).toMatch(/text-\[#B45309\][^>]*>Anomalies/);
    expect(html).not.toMatch(/text-\[#B45309\][^>]*>Rétractations/);
    expect(adresseOptions({ filtre: null, q: null, test: true })).toBe("/visibilite-et-publicite?test=1");
  });
});

describe("la fiche d’une option", () => {
  it("le tarif appliqué, l’exécution remontée par remontée, la part exécutée", () => {
    const html = fiche({});
    expect(html).toContain("Pourcentage de l’assiette");
    expect(html).toContain("3,5");
    expect(html).toContain(euros(15000));
    expect(html).toContain("7 jour(s), depuis l’activation");
    expect(html).toContain("n° 1");
    expect(html).toContain("Exécutée");
    expect(html).toContain("Prévue");
    expect(html).toContain("1 remontée(s) faite(s) sur 7");
  });

  it("🔴 la preuve de l’accord : le texte accepté, mot pour mot, son empreinte, et qu’il est un projet", () => {
    const html = fiche({});
    expect(html).toContain("En payant cette option, je demande qu’elle soit exécutée tout de suite.");
    expect(html).toContain("Empreinte du texte (md5) : 9f1c0ffee");
    expect(html).toContain("à valider juridiquement");
    expect(fiche({ accord_detail: null })).toContain("Aucun accord recueilli");
  });

  it("la rétractation : possible jusqu’à quand et pour combien ; faite, ce qui reste à rendre", () => {
    expect(fiche({})).toContain(`L’acheteur peut encore se rétracter, avant le`);
    expect(fiche({})).toContain(euros(450));
    const faite = fiche({
      retractation: { ref: "RET-000004", demandee_le: "2026-10-05T08:00:00Z", execute_cents: 75, a_rembourser_cents: 450,
        deja_rembourse_cents: 0, rembourser_avant: "2026-10-19T08:00:00Z", reste_cents: 450 },
      retractation_possible: null,
    });
    expect(faite).toContain("RET-000004");
    expect(faite).toContain("Reste à rendre");
  });

  it("la Publicité arrête, la base dit ce qui se proposera de rendre ; sans permission de rembourser, la raison", () => {
    const html = fiche({});
    expect(html).toContain("Arrêter l’option");
    expect(html).toContain("préparer un remboursement");
    expect(html).not.toContain("Demander le remboursement");
  });

  it("la Finance rembourse — la suggestion de la base ; sans permission d’arrêter, la raison et pas de bouton", () => {
    const html = fiche({
      possibles: {
        arreter: { possible: false, raison: "Arrêter une option demande la permission de gérer la visibilité (Publicité, Direction).",
          remboursement_cents: 450, remboursement_raison: null },
        rembourser: { possible: true, raison: null },
      },
    });
    expect(html).toContain("Demander le remboursement");
    expect(html).toContain(`Suggestion : ${euros(450)}`);
    expect(html).toContain("gérer la visibilité");
    expect(html).not.toContain("Arrêter l’option");
  });

  it("les anomalies : leur nom et ce qui les éteint", () => {
    const html = fiche({ anomalies: ["non_demarree"] });
    expect(html).toContain("Payée, jamais démarrée");
    expect(html).toContain("l’option n’a jamais démarré");
  });

  it("les remboursements, leurs avoirs qui citent la facture, les contestations, les arrêts", () => {
    const html = fiche({
      remboursement: {
        ...FICHE.remboursement, rembourse_cents: 450, disponible_cents: 75,
        ordres: [{ id: "o1", ref: "OF-000003", statut: "reussi", montant_cents: 450, motif: "Arrêt", demande_par: "pub1@handtohand.pro",
          cree_le: "2026-10-05T08:00:00Z", termine_le: "2026-10-05T09:00:00Z", erreur: null, stripe: "re_1", avoir: "HTH-A-2026-000001" }],
        avoirs: [{ numero: "HTH-A-2026-000001", facture: "HTH-F-2026-000007", montant_cents: 450, emis_le: "2026-10-05T09:00:00Z",
          raison: "Option arrêtée par HandtoHand · ARO-000001" }],
      },
      contestations: [{ dispute: "dp_0c", montant_cents: 525, frais_cents: 1500, motif: "fraudulent", statut: "needs_response",
        issue: null, preuves_avant: "2026-10-12T08:00:00Z", ouverte_le: "2026-10-05T08:00:00Z", reprise_le: null,
        retablie_le: null, close_le: null }],
      arrets: [{ reference: "ARO-000001", le: "2026-10-05T08:00:00Z", par: "pub1@handtohand.pro",
        motif: "Contrefaçon vérifiée", message: "Votre annonce ne respecte plus nos règles.",
        part: { part: 0.142857, methode: "remontees", faites: 1, prevues: 7 }, propose_cents: 450, ordre: "OF-000003" }],
    });
    expect(html).toContain("OF-000003");
    expect(html).toContain("Avoir HTH-A-2026-000001");
    expect(html).toContain("Corrige la facture HTH-F-2026-000007");
    expect(html).toContain("« Option arrêtée par HandtoHand · ARO-000001 »");
    expect(html).toContain("dp_0c");
    expect(html).toContain("Ouverte");
    expect(html).toContain("ARO-000001");
    expect(html).toContain("« Votre annonce ne respecte plus nos règles. »");
    expect(html).toContain("Motif interne : Contrefaçon vérifiée");
    expect(html).toContain(`remboursement proposé : ${euros(450)} (OF-000003)`);
  });

  it("les liens suivent les permissions : l’annonce, l’acheteur, les dossiers", () => {
    const dossiers = [{ id: "d0000000-0000-4000-a000-000000000009", source: "retractation", statut: "ouvert",
      titre: "Rétractation à rembourser" }];
    const avec = fiche({ dossiers });
    expect(avec).toContain(`href="/annonces/${LIGNE.cible_id}"`);
    expect(avec).toContain(`href="/utilisateurs/${LIGNE.acheteur_id}"`);
    expect(avec).toContain('href="/a-traiter?dossier=d0000000-0000-4000-a000-000000000009"');
    const sans = fiche({ dossiers }, false);
    expect(sans).not.toContain("/annonces/");
    expect(sans).not.toContain("/utilisateurs/");
    expect(sans).not.toContain("/a-traiter");
    expect(sans).toContain("Rétractation à rembourser");
  });
});

describe("les mots de l’état", () => {
  it("une pause dit ce qui a rendu l’annonce invisible ; une cause inconnue se dit telle quelle", () => {
    expect(causePauseDite("compte_suspendu")).toBe("le compte du vendeur est suspendu");
    expect(causePauseDite("moderation_masquee")).toBe("l’annonce est masquée par la modération");
    expect(causePauseDite("annonce_autre")).toBe("annonce_autre");
  });

  it("une réservation payée n’est pas « en attente de paiement »", () => {
    expect(etatDetaille({ ...LIGNE, etat: "reservee", paiement_statut: "captured", remontees_prevues: 0 }))
      .toBe("Payée, pas encore démarrée");
    expect(etatDetaille({ ...LIGNE, etat: "reservee", paiement_statut: null, remontees_prevues: 0 })).toBe("Paiement attendu");
  });
});
