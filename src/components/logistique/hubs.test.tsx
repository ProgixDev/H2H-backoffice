// L'ANNUAIRE DES POINTS DE RENDEZ-VOUS (§ 12.4) — rendu tel que le serveur l'envoie (hand-to-hand `20261013005000`).
//
// La base décide de tout : l'état d'un point, ce qui y passe, les rendez-vous qui y restent, l'ordre, et ce que
// l'appelant peut faire (`pointsFermesEtRouverts.test.ts` dans hand-to-hand). On vérifie ici que l'écran le dit tel
// quel : l'annuaire, ses filtres et leurs compteurs, les épingles à valider, la fiche d'un point, et le geste quand
// la base le permet — la raison sinon.
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { CompteursHubs, FicheHub, Hub } from "@/lib/logistique/types";

vi.mock("next/link", () => ({
  default: ({ href, children, ...reste }: { href: string; children: ReactNode }) => (
    <a href={href} {...reste}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/marque/AnimationH2H", () => ({ AnimationH2H: () => <span data-animation /> }));
// Les gestes passent par la base : ici, seulement ce que l'écran en montre.
vi.mock("@/lib/db/useGeste", () => ({ useGeste: () => ({ lancer: vi.fn(), enCours: false }) }));
vi.mock("@/lib/logistique/actions", () => ({ validerHub: vi.fn(), retirerHub: vi.fn(), reactiverHub: vi.fn() }));

const { AnnuaireHubs, FiltresAnnuaireHubs } = await import("./AnnuaireHubs");
const { ListeHubs } = await import("./ListeHubs");
const { FicheHubVue } = await import("./FicheHub");
const { adresseHubs, cheminHub } = await import("@/lib/logistique/types");

const decode = (html: string) => html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

const ID = "c1240000-0000-4000-a000-0000000000a1";
const HUB: Hub = {
  id: ID,
  nom: "Hub Gare Nice-Ville",
  repere: "Nice-Ville",
  detail_affiche: "Parvis de la gare, côté dépose-minute",
  type_lieu: "gare",
  ville: "Nice",
  region: "Provence-Alpes-Côte d’Azur",
  latitude: 43.7046,
  longitude: 7.2619,
  rayon_m: 60,
  statut: "active",
  etat: "actif",
  valide_le: "2026-09-08T09:00:00Z",
  ferme_le: null,
  motif_fermeture: null,
  signalements: 0,
  dernier_signalement_le: null,
  trajets: 2,
  rendez_vous_en_cours: 1,
  cree_le: "2026-09-07T09:00:00Z",
};
const hub = (h: Partial<Hub> = {}): Hub => ({ ...HUB, ...h });
const annuaire = (hubs: Hub[], filtree = false) => decode(renderToStaticMarkup(<AnnuaireHubs hubs={hubs} filtree={filtree} />));

describe("l’annuaire des points de rendez-vous", () => {
  it("dit le point, où se présenter, son état et ce qui y passe — et ouvre sa fiche", () => {
    const html = annuaire([hub()]);
    expect(html).toContain(`href="${cheminHub(ID)}"`);
    expect(html).toContain("Hub Gare Nice-Ville");
    expect(html).toContain("Gare · Nice · Provence-Alpes-Côte d’Azur");
    expect(html).toContain("« Parvis de la gare, côté dépose-minute »");
    expect(html).toContain('href="https://www.google.com/maps?q=43.7046,7.2619"');
    expect(html).toContain("Actif");
    expect(html).toContain("2 trajets");
    expect(html).toContain("1 rendez-vous à tenir");
    expect(html).not.toContain("signalement");
    expect(html).not.toContain("depuis le");
  });

  it("🔴 dit un point fermé, depuis quand et pourquoi — et les rendez-vous qui y restent", () => {
    const html = annuaire([hub({ etat: "ferme", statut: "inactive", ferme_le: "2026-10-13T08:00:00Z", motif_fermeture: "Parking fermé pour travaux", trajets: 0, rendez_vous_en_cours: 2 })]);
    expect(html).toContain("Fermé");
    expect(html).toContain("depuis le 13/10/2026");
    expect(html).toContain("« Parking fermé pour travaux »");
    expect(html).toContain("2 rendez-vous à tenir");
    expect(html).toContain("font-semibold text-[#B45309]");
    expect(html).not.toContain("trajet");
  });

  it("dit les autres états, les signalements et leur date — sans rien inventer", () => {
    expect(annuaire([hub({ etat: "a_valider", statut: "inactive", valide_le: null })])).toContain("Épingle à valider");
    expect(annuaire([hub({ etat: "ecarte", statut: "inactive", motif_fermeture: "Doublon" })])).toContain("Épingle écartée");
    const signale = annuaire([hub({ signalements: 3, dernier_signalement_le: "2026-10-12T16:00:00Z" })]);
    expect(signale).toContain("3 signalements");
    expect(signale).toContain("le dernier le 12/10/2026");
    expect(annuaire([hub({ signalements: 1, dernier_signalement_le: "2026-10-12T16:00:00Z" })])).toContain("1 signalement<");
    const vide = annuaire([hub({ trajets: 0, rendez_vous_en_cours: 0, nom: null, region: null, detail_affiche: null })]);
    expect(vide).toContain("Nice-Ville");
    expect(vide).toContain("Gare · Nice<");
    expect(vide).toContain("« — »");
  });

  it("distingue un annuaire vide d’un filtre sans résultat, et dit quand la liste est tronquée", () => {
    expect(annuaire([])).toContain("Aucun point de rendez-vous");
    expect(annuaire([], true)).toContain("Aucun point pour ces filtres");
    const beaucoup = Array.from({ length: 300 }, (_, i) => hub({ id: `h-${i}` }));
    expect(annuaire(beaucoup)).toContain("Les 300 premiers sont affichés");
    expect(annuaire([hub()])).not.toContain("Les 300 premiers");
  });
});

describe("les filtres de l’annuaire", () => {
  const COMPTEURS: CompteursHubs = { signales: 2, a_valider: 7, actifs: 498, fermes: 3, ecartes: 11, tous: 519 };
  const filtres = (f: Parameters<typeof FiltresAnnuaireHubs>[0]["f"], compteurs: CompteursHubs | null = COMPTEURS) =>
    decode(renderToStaticMarkup(<FiltresAnnuaireHubs f={f} compteurs={compteurs} />));

  it("affichent le compteur de chaque filtre et le total — ceux que la base a comptés", () => {
    const html = filtres({ filtre: null, q: null, test: false });
    for (const attendu of ["Tous", "519", "Signalés", "2", "À valider", "7", "Actifs", "498", "Fermés", "3", "Écartés", "11"]) {
      expect(html).toContain(attendu);
    }
  });

  it("gardent l’onglet et la recherche dans chaque adresse (R4.10) — et n’offrent pas de monde du test", () => {
    const html = filtres({ filtre: "fermes", q: "Nice", test: false });
    expect(html).toContain('href="/h2h-logistic?onglet=points&filtre=a_valider&q=Nice"');
    expect(html).toContain('href="/h2h-logistic?onglet=points&q=Nice"'); // « Tous »
    expect(html).toContain('name="onglet" value="points"');
    expect(html).toContain('name="filtre" value="fermes"');
    expect(html).toContain('aria-current="page"');
    expect(html).not.toContain("Inclure le monde du test");
    expect(adresseHubs({ filtre: null, q: null })).toBe("/h2h-logistic?onglet=points");
  });

  it("s’affichent sans nombre quand les compteurs n’ont pas pu être lus — pas avec des zéros", () => {
    const html = filtres({ filtre: null, q: null, test: false }, null);
    expect(html).toContain("À valider");
    expect(html).not.toMatch(/tabular-nums/);
  });
});

describe("les épingles à valider", () => {
  const epingle = hub({ etat: "a_valider", statut: "inactive", valide_le: null, trajets: 0, rendez_vous_en_cours: 0 });
  const liste = (hubs: Hub[], peutGerer = true, filtree = false) =>
    decode(renderToStaticMarkup(<ListeHubs hubs={hubs} peutGerer={peutGerer} filtree={filtree} />));

  it("montrent l’épingle, son point sur la carte, et les deux gestes à qui gère l’annuaire", () => {
    const html = liste([epingle]);
    expect(html).toContain(`href="${cheminHub(ID)}"`);
    expect(html).toContain("Repère : Nice-Ville");
    expect(html).toContain("Voir l’épingle sur la carte");
    expect(html).toContain("Valider");
    expect(html).toContain("Écarter");
    const lecteur = liste([epingle], false);
    expect(lecteur).toContain("Hub Gare Nice-Ville");
    expect(lecteur).not.toContain("<button");
  });

  it("disent quand il n’y en a aucune — ou aucune pour la recherche", () => {
    expect(liste([])).toContain("Aucune épingle à regarder");
    expect(liste([], true, true)).toContain("Aucune épingle à valider pour cette recherche");
  });
});

// ── La fiche ────────────────────────────────────────────────────────────────

const OUI = { possible: true, raison: null };
const non = (raison: string) => ({ possible: false, raison });
const FICHE: FicheHub = {
  hub: HUB,
  validation: { le: "2026-09-08T09:00:00Z", par: "Léa Martin" },
  fermetures: [],
  signalements: [],
  trajets: [],
  rendez_vous: [],
  possibles: { valider: non("Cette épingle n'attend pas de validation."), fermer: OUI, rouvrir: non("Ce point n'est pas fermé.") },
};
const fiche = (f: Partial<FicheHub> = {}) => decode(renderToStaticMarkup(<FicheHubVue f={{ ...FICHE, ...f }} />));

describe("la fiche d’un point de rendez-vous", () => {
  it("dit sa localisation, où se présenter, qui a validé l’épingle et ce qui y passe", () => {
    const html = fiche();
    expect(html).toContain("Hub Gare Nice-Ville");
    expect(html).toContain("Nice · Provence-Alpes-Côte d’Azur");
    expect(html).toContain('href="https://www.google.com/maps?q=43.7046,7.2619"');
    expect(html).toContain("zone de rendez-vous : 60 m");
    expect(html).toContain("« Parvis de la gare, côté dépose-minute »");
    expect(html).toContain("le 08/09/2026");
    expect(html).toContain("Léa Martin");
    expect(html).toContain("2 trajets");
    expect(html).toContain("1 rendez-vous à tenir");
    expect(fiche({ validation: null })).toContain("Jamais validée : personne n’a encore regardé cette épingle");
    expect(fiche({ validation: { le: "2026-09-08T09:00:00Z", par: null } })).toContain("à la mise en place de l’annuaire");
  });

  it("🔴 propose le geste que la base permet — et la raison quand aucun ne l’est", () => {
    const actif = fiche();
    expect(actif).toContain("Fermer aux nouvelles recherches");
    expect(actif).not.toContain("Rouvrir le point");
    expect(actif).not.toContain(">Valider<");
    expect(actif).not.toContain("Ce point n'est pas fermé.");

    const ferme = fiche({
      hub: hub({ etat: "ferme", statut: "inactive", ferme_le: "2026-10-13T08:00:00Z", motif_fermeture: "Travaux" }),
      fermetures: [{ motif: "Travaux", le: "2026-10-13T08:00:00Z", par: "Léa Martin", leve_le: null, leve_par: null, motif_levee: null }],
      possibles: { valider: non("x"), fermer: non("Ce point est déjà fermé."), rouvrir: OUI },
    });
    expect(ferme).toContain("Rouvrir le point");
    expect(ferme).not.toContain("Fermer aux nouvelles recherches");
    expect(ferme).toContain("Point fermé aux nouvelles recherches depuis le 13/10/2026");
    expect(ferme).toContain("« Travaux »");

    const epingle = fiche({
      hub: hub({ etat: "a_valider", statut: "inactive", valide_le: null }),
      validation: null,
      possibles: { valider: OUI, fermer: OUI, rouvrir: non("Ce point n'est pas fermé.") },
    });
    expect(epingle).toContain(">Valider<");
    expect(epingle).toContain(">Écarter<");

    const ecartee = fiche({
      hub: hub({ etat: "ecarte", statut: "inactive", valide_le: null, motif_fermeture: "Doublon" }),
      fermetures: [{ motif: "Doublon", le: "2026-10-13T08:00:00Z", par: null, leve_le: null, leve_par: null, motif_levee: null }],
      possibles: { valider: non("x"), fermer: non("y"), rouvrir: OUI },
    });
    expect(ecartee).toContain("Remettre à valider");
    expect(ecartee).toContain("Épingle écartée depuis le 13/10/2026");

    const raison = "Votre rôle ne permet pas de gérer les points de rendez-vous.";
    const lecteur = fiche({ possibles: { valider: non(raison), fermer: non(raison), rouvrir: non(raison) } });
    expect(lecteur).not.toContain("<button");
    expect(lecteur.split(raison).length - 1).toBe(1);
  });

  it("🔴 un point fermé où des rendez-vous confirmés restent le dit — rien ne les déplace", () => {
    const html = fiche({
      hub: hub({ etat: "ferme", statut: "inactive", rendez_vous_en_cours: 2 }),
      rendez_vous: [
        { mission: "m-1", ref: "HTH-2026-313B53", role: "collecte", quand: "2026-10-14T12:30:00Z", moment: "a_collecter", est_test: false },
        { mission: "m-2", ref: null, role: "remise", quand: null, moment: "en_route", est_test: false },
      ],
    });
    expect(html).toContain("2 rendez-vous confirmés restent à tenir à ce point fermé.");
    expect(html).toContain("Fermer le point ne les déplace pas et ne les annule pas");
    expect(html).toContain('href="/operations/HTH-2026-313B53?onglet=livraison"');
    expect(html).toContain("Collecte");
    expect(html).toContain("le 14/10/2026");
    expect(html).toContain("Co-livraison sans commande");
    expect(html).toContain("heure non fixée");
    expect(html).toContain("En route");
    expect(fiche({ hub: hub({ etat: "ferme", statut: "inactive", rendez_vous_en_cours: 1 }) })).toContain("Un rendez-vous confirmé reste à tenir à ce point fermé.");
    // Un point actif ne s'en alarme pas.
    expect(fiche()).not.toContain("restent à tenir à ce point fermé");
    expect(fiche()).toContain("Aucun rendez-vous confirmé n’attend à ce point.");
  });

  it("dit les trajets qui y passent : leur rôle, leur cotransporteur, où ils en sont — et ouvre leur fiche", () => {
    const html = fiche({
      trajets: [
        { id: "t-1", role: "collecte", ville_depart: "Nice", ville_arrivee: "Cannes", cotransporteur: "karim", situation: "indisponible", prochain_passage: "2026-10-14T12:30:00Z", est_test: false },
        { id: "t-2", role: "remise", ville_depart: "Antibes", ville_arrivee: "Nice", cotransporteur: null, situation: "propose", prochain_passage: null, est_test: false },
      ],
    });
    expect(html).toContain('href="/h2h-logistic/trajets/t-1"');
    expect(html).toContain("Nice → Cannes");
    expect(html).toContain("karim");
    expect(html).toContain("Indisponible");
    expect(html).toContain("prochain passage le 14/10/2026");
    expect(html).toContain("Antibes → Nice");
    expect(html).toContain("sans pseudonyme");
    expect(html).toContain("aucun passage à venir");
    expect(fiche()).toContain("Aucun trajet en cours ne passe par ce point.");
  });

  it("🔴 dit les signalements avec les mots de l’application — un pseudonyme, rien d’autre de la personne", () => {
    const html = fiche({
      signalements: [
        { id: "s-1", raison: "closed", explication: "Le parking est barré depuis lundi", signale_le: "2026-10-12T16:00:00Z", signale_par: "karim", colivraison: "HTH-2026-313B53", pieces: 2, nom_alors: "Hub Gare Nice Thiers", est_test: false },
        { id: "s-2", raison: "security", explication: null, signale_le: "2026-10-11T16:00:00Z", signale_par: null, colivraison: null, pieces: 0, nom_alors: "Hub Gare Nice-Ville", est_test: false },
      ],
    });
    expect(html).toContain("Point fermé à l’horaire indiqué");
    expect(html).toContain("le 12/10/2026");
    expect(html).toContain("karim");
    expect(html).toContain("2 pièces jointes");
    expect(html).toContain("« Le parking est barré depuis lundi »");
    expect(html).toContain('href="/operations/HTH-2026-313B53?onglet=livraison"');
    expect(html).toContain("Le point s’appelait alors « Hub Gare Nice Thiers ».");
    expect(html).toContain("Problème de sécurité");
    expect(html).toContain("sans pseudonyme");
    expect(html.split("Le point s’appelait alors").length - 1).toBe(1);
    // ⚠️ La limite est dite : l'examen n'existe pas encore.
    expect(html).toContain("leur examen — une décision, une réponse à leur auteur — viendra avec la suite");
    expect(fiche()).toContain("Aucun signalement de ce point.");
  });

  it("⚠️ étiquette ce qui est du monde de test — un trajet, un rendez-vous, un signalement — et rien d’autre", () => {
    const html = fiche({
      trajets: [
        { id: "t-1", role: "collecte", ville_depart: "Nice", ville_arrivee: "Cannes", cotransporteur: "essai_porteur", situation: "propose", prochain_passage: null, est_test: true },
        { id: "t-2", role: "remise", ville_depart: "Antibes", ville_arrivee: "Nice", cotransporteur: "karim", situation: "propose", prochain_passage: null, est_test: false },
      ],
      rendez_vous: [{ mission: "m-1", ref: "HTH-2026-0000T1", role: "collecte", quand: null, moment: "a_collecter", est_test: true }],
      signalements: [
        { id: "s-1", raison: "closed", explication: null, signale_le: "2026-10-12T16:00:00Z", signale_par: "essai_porteur", colivraison: null, pieces: 0, nom_alors: null, est_test: true },
      ],
    });
    expect(html.split(">TEST<").length - 1).toBe(3);
    expect(fiche().split(">TEST<").length - 1).toBe(0);
    // Ce que la fermeture ne voit pas encore est dit : une recherche déjà lancée peut y aboutir.
    expect(html).toContain("Une recherche lancée avant la fermeture peut encore y confirmer un rendez-vous : il apparaîtra ici.");
  });

  it("garde l’histoire des fermetures : le motif, qui, et la réouverture", () => {
    const html = fiche({
      fermetures: [
        { motif: "Fermé une seconde fois", le: "2026-10-13T08:00:00Z", par: "Léa Martin", leve_le: null, leve_par: null, motif_levee: null },
        { motif: "Parking fermé pour travaux", le: "2026-10-01T08:00:00Z", par: "Léa Martin", leve_le: "2026-10-03T08:00:00Z", leve_par: "Paul Roux", motif_levee: "Travaux terminés" },
      ],
    });
    expect(html).toContain("« Fermé une seconde fois »");
    expect(html).toContain("Toujours en cours");
    expect(html).toContain("Rouvert le 03/10/2026");
    expect(html).toContain("Paul Roux — Travaux terminés");
    expect(fiche()).toContain("Ce point n’a jamais été fermé ni écarté.");
  });
});
