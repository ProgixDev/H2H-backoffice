// L'ANNUAIRE DES POINTS DE RENDEZ-VOUS (§ 12.4) — rendu tel que le serveur l'envoie (hand-to-hand `20261013005000`).
//
// La base décide de tout : l'état d'un point, ce qui y passe, les rendez-vous qui y restent, l'ordre, et ce que
// l'appelant peut faire (`pointsFermesEtRouverts.test.ts` dans hand-to-hand). On vérifie ici que l'écran le dit tel
// quel : l'annuaire, ses filtres et leurs compteurs, les épingles à valider, la fiche d'un point, et le geste quand
// la base le permet — la raison sinon.
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { CompteursHubs, FicheHub, Hub, SignalementHub } from "@/lib/logistique/types";

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
vi.mock("@/lib/logistique/actions", () => ({
  validerHub: vi.fn(),
  retirerHub: vi.fn(),
  reactiverHub: vi.fn(),
  poserHub: vi.fn(),
  corrigerHub: vi.fn(),
  examinerSignalementsHub: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

const { AnnuaireHubs, FiltresAnnuaireHubs } = await import("./AnnuaireHubs");
const { ListeHubs } = await import("./ListeHubs");
const { FicheHubVue } = await import("./FicheHub");
const { ChampsPoint, GestePoserHub } = await import("./FormulairePoint");
const { basculerChoix, choixDeDepart } = await import("./ExamenSignalementsHub");
const { POINT_VIDE, adresseHubs, cheminHub, detailPubliable, lireCoordonnees, nomDuPoint, saisieDe, versPoint } = await import(
  "@/lib/logistique/types"
);

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
  signalements_a_examiner: 0,
  trajets: 2,
  rendez_vous_en_cours: 1,
  cree_le: "2026-09-07T09:00:00Z",
  adresse_du_lieu: null,
  propositions_en_cours: 0,
  version: "3f2a",
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
    // 🔴 Ce qui attend se voit ; un point dont tout est examiné ne garde qu'une mention.
    const signale = annuaire([hub({ signalements: 3, signalements_a_examiner: 2, dernier_signalement_le: "2026-10-12T16:00:00Z" })]);
    expect(signale).toContain(">2 à examiner<");
    expect(signale).toContain("sur 3 signalements · ");
    expect(signale).toContain("le dernier le 12/10/2026");
    const seul = annuaire([hub({ signalements: 1, signalements_a_examiner: 1, dernier_signalement_le: "2026-10-12T16:00:00Z" })]);
    expect(seul).toContain(">1 à examiner<");
    expect(seul).not.toContain("sur 1 signalement");
    const examines = annuaire([hub({ signalements: 3, signalements_a_examiner: 0, dernier_signalement_le: "2026-10-12T16:00:00Z" })]);
    expect(examines).toContain("3 signalements examinés");
    expect(examines).not.toContain("à examiner");
    expect(annuaire([hub({ signalements: 1, dernier_signalement_le: "2026-10-12T16:00:00Z" })])).toContain("1 signalement examiné<");
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
    for (const attendu of ["Tous", "519", "Signalements à examiner", "2", "À valider", "7", "Actifs", "498", "Fermés", "3", "Écartés", "11"]) {
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
  propositions: [],
  voisins: [],
  corrections: [],
  dossiers: [],
  possibles: {
    valider: non("Cette épingle n'attend pas de validation."),
    fermer: OUI,
    rouvrir: non("Ce point n'est pas fermé."),
    corriger: OUI,
    examiner: OUI,
  },
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
      possibles: { valider: non("x"), fermer: non("Ce point est déjà fermé."), rouvrir: OUI, corriger: OUI, examiner: OUI },
    });
    expect(ferme).toContain("Rouvrir le point");
    expect(ferme).not.toContain("Fermer aux nouvelles recherches");
    expect(ferme).toContain("Point fermé aux nouvelles recherches depuis le 13/10/2026");
    expect(ferme).toContain("« Travaux »");

    const epingle = fiche({
      hub: hub({ etat: "a_valider", statut: "inactive", valide_le: null }),
      validation: null,
      possibles: { valider: OUI, fermer: OUI, rouvrir: non("Ce point n'est pas fermé."), corriger: OUI, examiner: OUI },
    });
    expect(epingle).toContain(">Valider<");
    expect(epingle).toContain(">Écarter<");

    const ecartee = fiche({
      hub: hub({ etat: "ecarte", statut: "inactive", valide_le: null, motif_fermeture: "Doublon" }),
      fermetures: [{ motif: "Doublon", le: "2026-10-13T08:00:00Z", par: null, leve_le: null, leve_par: null, motif_levee: null }],
      possibles: { valider: non("x"), fermer: non("y"), rouvrir: OUI, corriger: OUI, examiner: OUI },
    });
    expect(ecartee).toContain("Remettre à valider");
    expect(ecartee).toContain("Épingle écartée depuis le 13/10/2026");

    const raison = "Votre rôle ne permet pas de gérer les points de rendez-vous.";
    const lecteur = fiche({ possibles: { valider: non(raison), fermer: non(raison), rouvrir: non(raison), corriger: non(raison), examiner: non(raison) } });
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
        { id: "s-1", raison: "closed", explication: "Le parking est barré depuis lundi", signale_le: "2026-10-12T16:00:00Z", signale_par: "karim", colivraison: "HTH-2026-313B53", pieces: 2, nom_alors: "Hub Gare Nice Thiers", est_test: false, le_votre: false, examen: null },
        { id: "s-2", raison: "security", explication: null, signale_le: "2026-10-11T16:00:00Z", signale_par: null, colivraison: null, pieces: 0, nom_alors: "Hub Gare Nice-Ville", est_test: false, le_votre: false, examen: null },
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
    // Un signalement ne ferme rien de lui-même, son examen non plus : c'est dit.
    expect(html).toContain("fermer ou corriger le point reste un geste à");
    expect(html).not.toContain("viendra avec la suite");
    expect(fiche()).toContain("Aucun signalement de ce point.");
  });

  // ── L'examen des signalements (hand-to-hand 20261013008000) ──
  const S = (s: Partial<SignalementHub> = {}): SignalementHub => ({
    id: "s-1", raison: "closed", explication: null, signale_le: "2026-10-12T16:00:00Z", signale_par: "karim",
    colivraison: null, pieces: 0, nom_alors: null, est_test: false, le_votre: false, examen: null, ...s,
  });

  it("🔴 dit ce qui attend, son dossier « À traiter », et « Examiner » quand la base le permet — sinon pourquoi", () => {
    const attend = fiche({
      hub: hub({ signalements: 2, signalements_a_examiner: 2 }),
      signalements: [S(), S({ id: "s-2", raison: "security" })],
      dossiers: [{ id: "d-1", reference: "DOS-000042", est_test: false }],
    });
    expect(attend).toContain("2 signalements à examiner");
    expect(attend).toContain('href="/a-traiter?dossier=d-1"');
    expect(attend).toContain("DOS-000042");
    expect(attend).toContain("Examiner les signalements");
    expect(attend.split(">À examiner<").length - 1).toBe(2);
    expect(attend).not.toContain("(test)");

    const raison = "Votre rôle ne permet pas de gérer les points de rendez-vous.";
    const lecteur = fiche({
      hub: hub({ signalements: 1, signalements_a_examiner: 1 }),
      signalements: [S()],
      possibles: { ...FICHE.possibles, examiner: non(raison) },
    });
    expect(lecteur).not.toContain("Examiner les signalements");
    expect(lecteur).toContain(raison);

    // Le dossier du monde de test est étiqueté ; un point a un dossier par monde.
    const deux = fiche({
      hub: hub({ signalements: 2, signalements_a_examiner: 2 }),
      signalements: [S(), S({ id: "s-t", est_test: true })],
      dossiers: [
        { id: "d-1", reference: "DOS-000042", est_test: false },
        { id: "d-2", reference: "DOS-000043", est_test: true },
      ],
    });
    expect(deux).toContain("DOS-000043</a> (test)");
    expect(deux.split('href="/a-traiter?dossier=').length - 1).toBe(2);
  });

  it("🔴 un signalement examiné dit son issue, la réponse envoyée, le motif interne, qui et quand — et plus rien n’attend", () => {
    const html = fiche({
      hub: hub({ signalements: 2, signalements_a_examiner: 0 }),
      signalements: [
        S({ examen: { id: "e-1", issue: "fonde", reponse: "Le parking est bien fermé le soir.", motif: "Constaté sur place", par: "Léa Martin", le: "2026-10-13T09:30:00Z" } }),
        S({ id: "s-2", examen: { id: "e-2", issue: "non_fonde", reponse: "Le parking avait de la place.", motif: "Trois passages", par: null, le: "2026-10-13T10:00:00Z" } }),
      ],
    });
    expect(html).toContain("Tous les signalements sont examinés.");
    expect(html).not.toContain("Examiner les signalements");
    expect(html).not.toContain(">À examiner<");
    expect(html).toContain(">Fondé<");
    expect(html).toContain(">Non fondé<");
    expect(html).toContain("Examiné le 13/10/2026");
    expect(html).toContain("par Léa Martin");
    expect(html).toContain("« Le parking est bien fermé le soir. »");
    expect(html).toContain("Motif interne : Constaté sur place");
    expect(html).toContain("« Le parking avait de la place. »");
    // ⚠️ Un signalement peut attendre hors des cinquante affichés : c'est le compte de la base qui parle, pas la liste.
    const cache = fiche({
      hub: hub({ signalements: 60, signalements_a_examiner: 1 }),
      signalements: Array.from({ length: 50 }, (_, i) =>
        S({ id: `s-${i}`, examen: { id: "e-1", issue: "fonde", reponse: "Réponse commune.", motif: "Série", par: null, le: "2026-10-13T09:30:00Z" } })),
    });
    expect(cache).toContain("1 signalement à examiner");
    expect(cache).toContain("Les 50 premiers sont affichés : ceux qui attendent, puis les plus récents.");
  });

  it("🔴 le signalement de l’appelant est marqué, et ne se propose pas à son examen — s’il n’attend que lui, la fiche dit pourquoi", () => {
    // Deux attendent, dont le sien : le geste est là, pour l'autre seulement.
    const mele = fiche({
      hub: hub({ signalements: 2, signalements_a_examiner: 2 }),
      signalements: [S({ id: "s-moi", le_votre: true }), S({ id: "s-autre" })],
    });
    expect(mele.split(">Le vôtre<").length - 1).toBe(1);
    expect(mele).toContain("Examiner les signalements");
    // Il n'attend que le sien : la base dit que ce n'est pas possible, et pourquoi.
    const raison = "Ce qui attend est votre propre signalement : un autre membre de l'équipe doit l'examiner.";
    const seul = fiche({
      hub: hub({ signalements: 1, signalements_a_examiner: 1 }),
      signalements: [S({ id: "s-moi", le_votre: true })],
      possibles: { ...FICHE.possibles, examiner: non(raison) },
    });
    expect(seul).toContain(">Le vôtre<");
    expect(seul).not.toContain("Examiner les signalements");
    expect(seul).toContain(raison);
    // ⚠️ Même si la base disait le geste possible, l'écran ne propose pas d'examiner une liste vide.
    const incoherent = fiche({
      hub: hub({ signalements: 1, signalements_a_examiner: 1 }),
      signalements: [S({ id: "s-moi", le_votre: true })],
    });
    expect(incoherent).not.toContain("Examiner les signalements");
    expect(fiche({ signalements: [S()] })).not.toContain(">Le vôtre<");
  });

  it("🔴 un examen ne mêle pas les comptes réels et les comptes de test — le choix de départ, puis chaque case", () => {
    const reel1 = S({ id: "r1" });
    const reel2 = S({ id: "r2" });
    const test1 = S({ id: "t1", est_test: true });
    // Au départ : tout ce qui attend dans le monde réel ; à défaut, celui du test.
    expect(choixDeDepart([reel1, test1, reel2])).toEqual(["r1", "r2"]);
    expect(choixDeDepart([test1])).toEqual(["t1"]);
    expect(choixDeDepart([])).toEqual([]);
    // Cocher, décocher dans un même monde.
    expect(basculerChoix(["r1"], [reel1, reel2, test1], "r2")).toEqual(["r1", "r2"]);
    expect(basculerChoix(["r1", "r2"], [reel1, reel2, test1], "r1")).toEqual(["r2"]);
    // Celui de l'autre monde remplace la sélection : la base refuserait le mélange.
    expect(basculerChoix(["r1", "r2"], [reel1, reel2, test1], "t1")).toEqual(["t1"]);
    expect(basculerChoix(["t1"], [reel1, reel2, test1], "r2")).toEqual(["r2"]);
    expect(basculerChoix([], [reel1, test1], "t1")).toEqual(["t1"]);
  });

  it("⚠️ étiquette ce qui est du monde de test — un trajet, un rendez-vous, un signalement — et rien d’autre", () => {
    const html = fiche({
      trajets: [
        { id: "t-1", role: "collecte", ville_depart: "Nice", ville_arrivee: "Cannes", cotransporteur: "essai_porteur", situation: "propose", prochain_passage: null, est_test: true },
        { id: "t-2", role: "remise", ville_depart: "Antibes", ville_arrivee: "Nice", cotransporteur: "karim", situation: "propose", prochain_passage: null, est_test: false },
      ],
      rendez_vous: [{ mission: "m-1", ref: "HTH-2026-0000T1", role: "collecte", quand: null, moment: "a_collecter", est_test: true }],
      signalements: [
        { id: "s-1", raison: "closed", explication: null, signale_le: "2026-10-12T16:00:00Z", signale_par: "essai_porteur", colivraison: null, pieces: 0, nom_alors: null, est_test: true, le_votre: false, examen: null },
      ],
    });
    expect(html.split(">TEST<").length - 1).toBe(3);
    expect(fiche().split(">TEST<").length - 1).toBe(0);
    // Ce que la fermeture ne voit pas encore est dit : une recherche déjà lancée peut y aboutir.
    expect(html).toContain("un point ne se corrige pas tant qu’il en reste un");
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

// ── Poser et corriger un point (hand-to-hand `20261013006000`) ──────────────

describe("poser et corriger un point", () => {
  it("lit des coordonnées copiées d’une carte — et rien d’autre", () => {
    expect(lireCoordonnees("43.7046, 7.2619")).toEqual({ latitude: 43.7046, longitude: 7.2619 });
    expect(lireCoordonnees("  43.7046   7.2619 ")).toEqual({ latitude: 43.7046, longitude: 7.2619 });
    expect(lireCoordonnees("-21.115;55.536")).toEqual({ latitude: -21.115, longitude: 55.536 });
    for (const faux of ["", "43.7046", "43,7046, 7,2619", "nord, est", "95, 7.26", "43.70, 190", "43.7046, 7.2619, 12"]) {
      expect(lireCoordonnees(faux), faux).toBeNull();
    }
  });

  it("dit ce qui manque à une saisie, dans l’ordre du formulaire — puis l’envoie telle que la base l’attend", () => {
    const pleine = { type_lieu: "parking", repere: " La Roubine ", detail: " Parking ouvert, côté entrée ", ville: " Cannes ", region: "", adresse: " ", coordonnees: "43.55, 6.97", rayon_m: "" };
    expect(versPoint(POINT_VIDE)).toEqual({ manque: "Choisissez le type de lieu." });
    expect(versPoint({ ...pleine, repere: "X" })).toEqual({ manque: "Écrivez le repère : le nom du lieu, pas une adresse." });
    expect(versPoint({ ...pleine, detail: "ab" })).toEqual({ manque: "Écrivez le détail affiché : où se présenter." });
    expect(versPoint({ ...pleine, ville: " " })).toEqual({ manque: "Indiquez la ville." });
    expect(versPoint({ ...pleine, coordonnees: "ici" })).toHaveProperty("manque");
    for (const rayon of ["10", "301", "60.5", "large"]) {
      expect(versPoint({ ...pleine, rayon_m: rayon })).toEqual({ manque: "Le rayon de la zone va de 20 à 300 mètres." });
    }
    expect(versPoint(pleine)).toEqual({
      point: { type_lieu: "parking", repere: "La Roubine", detail: "Parking ouvert, côté entrée", ville: "Cannes", region: null, adresse: null, latitude: 43.55, longitude: 6.97, rayon_m: null },
    });
    expect(versPoint({ ...pleine, rayon_m: "80", region: "Sud" })).toMatchObject({ point: { rayon_m: 80, region: "Sud" } });
  });

  it("calcule le nom comme la base, reprend un point tel qu’il est, et reconnaît un détail qui attend encore", () => {
    expect(nomDuPoint("parking", " La Roubine ")).toBe("Hub Parking La Roubine");
    expect(nomDuPoint("rond_point", "Saint-Claude")).toBe("Hub Rond-point Saint-Claude");
    expect(saisieDe(hub({ adresse_du_lieu: "Avenue Thiers", region: null }))).toEqual({
      type_lieu: "gare", repere: "Nice-Ville", detail: "Parvis de la gare, côté dépose-minute", ville: "Nice", region: "",
      adresse: "Avenue Thiers", coordonnees: "43.7046, 7.2619", rayon_m: "60",
    });
    // Un point repris sans y toucher repart tel quel : la base y lira « aucune modification ».
    expect(versPoint(saisieDe(hub()))).toMatchObject({ point: { latitude: 43.7046, longitude: 7.2619, rayon_m: 60, repere: "Nice-Ville" } });
    expect(detailPubliable("Parvis de la gare, côté dépose-minute")).toBe(true);
    for (const d of [null, "Trop court", "Détail à compléter sur place", "Sous-texte a completer"]) expect(detailPubliable(d), String(d)).toBe(false);
  });

  it("le formulaire dit le nom que le point portera, et montre l’épingle AVANT de l’envoyer", () => {
    const champs = (p: Partial<typeof POINT_VIDE>) =>
      decode(renderToStaticMarkup(<ChampsPoint id="x" p={{ ...POINT_VIDE, ...p }} surChangement={() => {}} />));
    const vide = champs({});
    expect(vide).not.toContain("Le point s’appellera");
    expect(vide).toContain("jamais une adresse postale, ni le domicile de quelqu’un");
    expect(vide).toContain("Copiez-les depuis une carte en ligne");
    for (const lieu of ["Parking", "Gare", "Rond-point", "Aire de covoiturage", "Arrêt"]) expect(vide).toContain(`>${lieu}</option>`);
    const rempli = champs({ type_lieu: "parking", repere: "La Roubine", coordonnees: "43.55, 6.97" });
    expect(rempli).toContain("Hub Parking La Roubine");
    expect(rempli).toContain('href="https://www.google.com/maps?q=43.55,6.97"');
    expect(rempli).toContain("Regarder cette épingle sur la carte");
    const faux = champs({ coordonnees: "43,55 ; 6,97" });
    expect(faux).toContain("Latitude puis longitude, avec un point décimal");
    expect(faux).not.toContain("google.com/maps");
    // Le bouton de l'annuaire.
    expect(decode(renderToStaticMarkup(<GestePoserHub />))).toContain("Poser un point");
  });

  it("🔴 « Corriger » se propose quand la base le permet — et un point occupé dit pourquoi il ne se corrige pas", () => {
    expect(fiche()).toContain(">Corriger<");
    const raison = "Un rendez-vous confirmé reste à tenir à ce point : le corriger le déplacerait sans rien dire.";
    const occupe = fiche({ possibles: { ...FICHE.possibles, corriger: non(raison) } });
    expect(occupe).not.toContain(">Corriger<");
    expect(occupe).toContain("Corriger : </span>" + raison);
    // Ce qui reste possible le reste.
    expect(occupe).toContain("Fermer aux nouvelles recherches");
    // Une épingle à valider se corrige aussi, avant d'être validée.
    const epingle = fiche({
      hub: hub({ etat: "a_valider", statut: "inactive", valide_le: null }),
      validation: null,
      possibles: { valider: OUI, fermer: OUI, rouvrir: non("x"), corriger: OUI, examiner: OUI },
    });
    expect(epingle).toContain(">Valider<");
    expect(epingle).toContain(">Corriger<");
  });

  it("dit les propositions en cours — sur la ligne, sur la fiche — et l’adresse du lieu", () => {
    const html = fiche({
      hub: hub({ propositions_en_cours: 2, adresse_du_lieu: "Avenue Thiers" }),
      propositions: [
        { candidature: "c-1", ref: "HTH-2026-0000A1", role: "remise", etape: "choix", reponse: "en_attente", est_test: false },
        { candidature: "c-2", ref: null, role: "collecte", etape: "ouverte", reponse: "proposee", est_test: true },
      ],
    });
    expect(html).toContain("2 propositions en cours");
    expect(html).toContain("Avenue Thiers");
    expect(html).toContain('href="/operations/HTH-2026-0000A1?onglet=livraison"');
    expect(html).toContain("Candidature — choix de l’acheteur attendu");
    expect(html).toContain("Choix de l’acheteur attendu");
    expect(html).toContain("Recherche sans commande");
    expect(html).toContain("Proposition sans réponse");
    expect(html.split(">TEST<").length - 1).toBe(1);
    expect(html).toContain("fermer n’arrête que");
    expect(fiche()).toContain("Aucune recherche en cours ne propose ce point.");
    expect(fiche()).toContain("0 proposition en cours");
    // L'annuaire le dit sur la ligne.
    expect(annuaire([hub({ propositions_en_cours: 1, trajets: 0, rendez_vous_en_cours: 0 })])).toContain("1 proposition en cours");
    expect(annuaire([hub({ trajets: 0, rendez_vous_en_cours: 0 })])).not.toContain("proposition");
  });

  it("dit les points voisins — un doublon se voit — et l’histoire des corrections, mot pour mot", () => {
    const html = fiche({
      voisins: [
        { id: "v-1", nom: "Hub Parking Gare Thiers", etat: "ferme", distance_m: 43.6 },
        { id: "v-2", nom: "Hub Gare Nice Thiers", etat: "a_valider", distance_m: 121.2 },
      ],
      corrections: [
        {
          le: "2026-10-13T10:00:00Z", par: "Léa Martin", motif: "Relevé sur place : l’accès est côté nord", deplace_de_m: 92.4,
          avant: { repere: "Rue Porte Mage", type_lieu: "parking", latitude: 43.7, adresse_du_lieu: null },
          apres: { repere: "Esplanade Charles de Gaulle", type_lieu: "place", latitude: 43.7008, adresse_du_lieu: "Esplanade" },
        },
        { le: "2026-10-01T10:00:00Z", par: null, motif: "Faute de frappe", deplace_de_m: null, avant: { region: null }, apres: { region: "Sud" } },
      ],
    });
    expect(html).toContain('href="/h2h-logistic/points/v-1"');
    expect(html).toContain("Hub Parking Gare Thiers");
    expect(html).toContain("à 44 m");
    expect(html).toContain("à 121 m");
    expect(html).toContain("vérifiez qu’il ne s’agit pas du même lieu, posé deux fois");
    expect(html).toContain("corrigé le 13/10/2026");
    expect(html).toContain("Léa Martin");
    expect(html).toContain("épingle déplacée de 92 m");
    expect(html).toContain('Repère : </span>Rue Porte Mage → <span class="font-medium">Esplanade Charles de Gaulle</span>');
    expect(html).toContain('Type de lieu : </span>Parking → <span class="font-medium">Place</span>');
    expect(html).toContain('Adresse du lieu : </span>— → <span class="font-medium">Esplanade</span>');
    expect(html).toContain('Région : </span>— → <span class="font-medium">Sud</span>');
    expect(html).toContain("« Relevé sur place : l’accès est côté nord »");
    expect(html.split("épingle déplacée").length - 1).toBe(1);
    expect(html).toContain("aucune de ces corrections n’a déplacé un rendez-vous");
    expect(fiche()).toContain("Aucun autre point à moins de 150 mètres.");
    expect(fiche()).toContain("Ce point n’a pas été corrigé depuis le back-office.");
  });
});
