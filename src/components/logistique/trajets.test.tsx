// LES TRAJETS (§ 12.2) — rendu tel que le serveur l'envoie (hand-to-hand `20261013003000`).
//
// La base décide de tout : la situation d'un trajet, ce qui l'écarte d'une recherche — lu là où la mise en relation
// le lit —, les places de chaque passage, l'ordre, le monde, et ce que l'appelant peut faire
// (`trajetsLusEtSuspendus.test.ts` dans hand-to-hand). On vérifie ici que l'écran le dit tel quel : la liste, ses
// filtres et leurs compteurs, la fiche, et le geste quand la base le permet — la raison sinon.
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { CompteursTrajets, FicheTrajet, RechercheOuverte, Trajet } from "@/lib/logistique/types";

vi.mock("next/link", () => ({
  default: ({ href, children, ...reste }: { href: string; children: ReactNode }) => (
    <a href={href} {...reste}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/marque/AnimationH2H", () => ({ AnimationH2H: () => <span data-animation /> }));
// Le geste passe par la base : ici, seulement ce que l'écran en montre.
vi.mock("@/lib/db/useGeste", () => ({ useGeste: () => ({ lancer: vi.fn(), enCours: false }) }));
vi.mock("@/lib/logistique/actions", () => ({ suspendreTrajet: vi.fn(), reprendreTrajet: vi.fn() }));

const { ListeTrajets, raisonsADire } = await import("./ListeTrajets");
const { FiltresListeTrajets } = await import("./FiltresTrajets");
const { FicheTrajetVue } = await import("./FicheTrajet");
const { adresseTrajets, cheminTrajet, joursDits } = await import("@/lib/logistique/types");

const decode = (html: string) => html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

const ID = "c1220000-0000-4000-a000-0000000000a1";
const CT = "c1220000-0000-4000-a000-0000000000b1";
const TRAJET: Trajet = {
  id: ID,
  cotransporteur_id: CT,
  cotransporteur: "karim",
  type: "one_time",
  jours: [],
  depart_le: "2026-10-14T12:30:00Z",
  ville_depart: "Nice",
  ville_arrivee: "Cannes",
  hub_collecte: "Hub Gare Nice-Ville",
  hubs_remise: ["Hub Gare de Cannes", "Hub Port de Cannes"],
  mode: "car",
  places: 3,
  taille_max: "L",
  poids_max_kg: 20,
  hors_hub: false,
  statut: "active",
  situation: "propose",
  raisons: [],
  suspendu_le: null,
  prochain_passage: "2026-10-14T12:30:00Z",
  places_restantes: 2,
  reservations: 1,
  colivraisons_en_cours: 1,
  anomalies: [],
  est_test: false,
  cree_le: "2026-10-10T09:00:00Z",
};
const trajet = (t: Partial<Trajet> = {}): Trajet => ({ ...TRAJET, ...t });
const liste = (trajets: Trajet[], o: { filtree?: boolean; lienCompte?: boolean } = {}) =>
  decode(renderToStaticMarkup(<ListeTrajets trajets={trajets} filtree={o.filtree ?? false} lienCompte={o.lienCompte ?? true} />));

describe("la liste des trajets", () => {
  it("dit le corridor, le rythme, le cotransporteur, les points, la capacité, le prochain passage et ses places", () => {
    const html = liste([trajet()]);
    expect(html).toContain("Nice → Cannes");
    expect(html).toContain("Ponctuel · le 14/10/2026");
    expect(html).toContain("Voiture");
    expect(html).toContain("karim");
    expect(html).toContain("Collecte · Hub Gare Nice-Ville");
    expect(html).toContain("Remise · Hub Gare de Cannes · Hub Port de Cannes");
    expect(html).toContain("3 places par passage · jusqu’au format L · 20 kg");
    expect(html).toContain("2 places sur 3 encore libres");
    expect(html).toContain("1 réservation à venir");
    expect(html).toContain("1 co-livraison en cours");
    expect(html).toContain("Proposé aux recherches");
    expect(html).not.toContain("TEST");
    expect(html).not.toContain("Hors point de rendez-vous possible");
  });

  it("ouvre la fiche du trajet, et celle du cotransporteur pour qui lit les comptes", () => {
    expect(liste([trajet()])).toContain(`href="${cheminTrajet(ID)}"`);
    expect(liste([trajet()])).toContain(`href="/utilisateurs/${CT}"`);
    expect(liste([trajet()], { lienCompte: false })).not.toContain("/utilisateurs/");
  });

  it("dit un trajet récurrent par ses jours, et un poids à virgule à la française", () => {
    const html = liste([trajet({ type: "recurring", jours: [1, 3, 5], depart_le: null, poids_max_kg: 7.5, places: 1, places_restantes: 1, hors_hub: true })]);
    expect(html).toContain("Récurrent · lun., mer., ven.");
    expect(html).toContain("1 place par passage · jusqu’au format L · 7,5 kg");
    expect(html).toContain("1 place sur 1 encore libre");
    expect(html).not.toContain("encore libres");
    expect(html).toContain("Hors point de rendez-vous possible");
    expect(joursDits([1, 2, 3, 4, 5, 6, 7])).toBe("tous les jours");
    expect(joursDits([7, 6])).toBe("sam., dim.");
    expect(joursDits([])).toBe("aucun jour");
  });

  it("🔴 dit où en est le trajet pour de nouvelles propositions — et pourquoi, sans répéter la situation", () => {
    const suspendu = liste([trajet({ situation: "suspendu", raisons: ["trajet_suspendu", "hors_ligne"], suspendu_le: "2026-10-13T08:00:00Z" })]);
    expect(suspendu).toContain("Propositions suspendues");
    expect(suspendu).toContain("depuis le 13/10/2026");
    expect(suspendu).toContain("Le cotransporteur s’est mis hors ligne");
    expect(suspendu).not.toContain("L’équipe a suspendu ses nouvelles propositions");

    const pause = liste([trajet({ situation: "en_pause", raisons: ["trajet_inactif"], statut: "paused" })]);
    expect(pause).toContain("En pause");
    expect(pause).not.toContain("Le trajet n’est pas actif");

    const indisponible = liste([trajet({ situation: "indisponible", raisons: ["compte_restreint", "en_attente_ailleurs"] })]);
    expect(indisponible).toContain("Indisponible");
    expect(indisponible).toContain("Son compte est restreint pour la co-livraison, ou suspendu");
    expect(indisponible).toContain("Il attend une décision dans une autre recherche (§ 5.2.6)");

    const clos = liste([trajet({ situation: "clos", raisons: ["trajet_inactif", "hors_ligne"], prochain_passage: null, places_restantes: null, reservations: 0, colivraisons_en_cours: 0 })]);
    expect(clos).toContain("Clos");
    expect(clos).toContain("Aucun passage à venir");
    expect(clos).not.toContain("hors ligne");
    expect(raisonsADire({ situation: "clos", raisons: ["hors_ligne"] })).toEqual([]);
  });

  it("dit quand le déplacement du prochain passage est confirmé — et se tait sinon", () => {
    expect(liste([trajet({ prochain_passage_confirme_le: "2026-10-13T06:05:00Z" })])).toContain("déplacement confirmé");
    expect(liste([trajet({ prochain_passage_confirme_le: null })])).not.toContain("déplacement confirmé");
    expect(liste([trajet()])).not.toContain("déplacement confirmé");
  });

  it("signale ce qui cloche, le monde du test et un passage plein — sans les inventer", () => {
    const html = liste([trajet({ anomalies: ["point_de_remise_inactif", "surreserve"], est_test: true, places_restantes: 0 })]);
    expect(html).toContain("Point de remise inactif");
    expect(html).toContain("Passage sur-réservé");
    expect(html).toContain("TEST");
    expect(html).toContain("plus de place sur ce passage");
  });

  it("🔴 un pseudonyme absent n’est pas un compte effacé ; un trajet sans point le dit", () => {
    const html = liste([trajet({ cotransporteur: null, hub_collecte: null, hubs_remise: [] })]);
    expect(html).toContain("sans pseudonyme");
    expect(html).not.toContain("compte effacé");
    expect(html).toContain("Collecte · aucun point");
    expect(html).toContain("Remise · aucun point");
  });

  it("distingue une liste vide d’un filtre sans résultat, et dit quand elle est tronquée", () => {
    expect(liste([])).toContain("Aucun trajet");
    expect(liste([])).not.toContain("pour ces filtres");
    expect(liste([], { filtree: true })).toContain("Aucun trajet pour ces filtres");
    const beaucoup = Array.from({ length: 300 }, (_, i) => trajet({ id: `t-${i}` }));
    expect(liste(beaucoup)).toContain("Les 300 premiers sont affichés");
    expect(liste([trajet()])).not.toContain("Les 300 premiers");
  });
});

describe("les filtres des trajets", () => {
  const COMPTEURS: CompteursTrajets = { anomalies: 2, proposes: 14, suspendus: 1, en_pause: 6, indisponibles: 3, clos: 9, tous: 33 };
  const filtres = (f: Parameters<typeof FiltresListeTrajets>[0]["f"], compteurs: CompteursTrajets | null = COMPTEURS, testVisible = true) =>
    decode(renderToStaticMarkup(<FiltresListeTrajets f={f} compteurs={compteurs} testVisible={testVisible} />));

  it("affichent le compteur de chaque filtre et le total — ceux que la base a comptés", () => {
    const html = filtres({ filtre: null, q: null, test: false });
    for (const attendu of ["Tous", "33", "À examiner", "2", "Proposés", "14", "Suspendus", "1", "En pause", "6", "Indisponibles", "3", "Clos", "9"]) {
      expect(html).toContain(attendu);
    }
  });

  it("gardent l’onglet, la recherche et le monde du test dans chaque adresse (R4.10)", () => {
    const html = filtres({ filtre: "suspendus", q: "karim", test: true });
    expect(html).toContain('href="/h2h-logistic?onglet=trajets&filtre=anomalies&q=karim&test=1"');
    expect(html).toContain('href="/h2h-logistic?onglet=trajets&q=karim&test=1"'); // « Tous »
    expect(html).toContain('name="onglet" value="trajets"');
    expect(html).toContain('name="filtre" value="suspendus"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('aria-label="Filtrer les trajets"');
  });

  it("s’affichent sans nombre quand les compteurs n’ont pas pu être lus — pas avec des zéros", () => {
    const html = filtres({ filtre: null, q: null, test: false }, null);
    expect(html).toContain("À examiner");
    expect(html).not.toMatch(/tabular-nums/);
  });

  it("ne proposent le monde du test qu’à qui peut le voir", () => {
    expect(filtres({ filtre: null, q: null, test: false }, COMPTEURS, true)).toContain("Inclure le monde du test");
    expect(filtres({ filtre: null, q: null, test: false }, COMPTEURS, false)).not.toContain("Inclure le monde du test");
  });

  it("l’adresse sans filtre reste celle de l’onglet", () => {
    expect(adresseTrajets({ filtre: null, q: null, test: false })).toBe("/h2h-logistic?onglet=trajets");
  });
});

// ── La fiche ────────────────────────────────────────────────────────────────

const recherche = (r: Partial<RechercheOuverte>): RechercheOuverte => ({
  recherche: "c1220000-0000-4000-a000-0000000000c1", numero: 41, ref: "HTH-2026-0000A1", t0: "2026-10-13T09:00:00Z",
  statut: "ouverte", format: "M", des: "2026-10-13T11:30:00Z", jusqu_au: "2026-10-16T09:00:00Z", fenetre_close: false,
  candidature: null, sur_ce_trajet: null, ecarte: null, passages: null, ...r,
});
const FICHE: FicheTrajet = {
  trajet: TRAJET,
  arrets: [
    { position: 0, ville: "Nice", heure: "14:30:00", point: "Hub Gare Nice-Ville", point_actif: true },
    { position: 1, ville: "Cannes", heure: "15:15:00", point: "Hub Gare de Cannes", point_actif: true },
    { position: 2, ville: "Cannes", heure: "15:30:00", point: "Hub Port de Cannes", point_actif: false },
  ],
  passages: [
    { collecte_le: "2026-10-14T12:30:00Z", fin_le: "2026-10-14T13:30:00Z", places: 3, reserves: 1, libre: true, jour_off: false, ecarte: null },
  ],
  colivraisons: [
    { id: "m-1", ref: "HTH-2026-313B53", statut: "group_created", moment: "a_collecter", collecte_prevue: "2026-10-14T12:30:00Z", remise_prevue: null },
  ],
  candidatures: { confirmee: 1, proposee: 2, expiree: 4 },
  recherches_ouvertes: [],
  suspensions: [],
  possibles: { suspendre: { possible: true, raison: null }, reprendre: { possible: false, raison: "Les nouvelles propositions de ce trajet ne sont pas suspendues." } },
};
const fiche = (f: Partial<FicheTrajet> = {}, lienCompte = true) =>
  decode(renderToStaticMarkup(<FicheTrajetVue f={{ ...FICHE, ...f }} lienCompte={lienCompte} />));

describe("la fiche d’un trajet", () => {
  it("dit le trajet, ses arrêts à l’heure de Paris, ses passages et leurs places", () => {
    const html = fiche();
    expect(html).toContain("Nice → Cannes");
    expect(html).toContain("Proposé aux recherches");
    expect(html).toContain(`href="/utilisateurs/${CT}"`);
    expect(html).toContain("Voiture · publié le 10/10/2026");
    expect(html).toContain("Aux points de rendez-vous seulement");
    expect(html).toContain("2 places sur 3 · 1 réservation à venir · 1 co-livraison en cours");
    // Les arrêts : l'heure telle que la base la garde, sans la convertir.
    expect(html).toContain("Collecte");
    expect(html).toContain("14:30");
    expect(html).toContain("Hub Gare Nice-Ville · Nice");
    expect(html).toContain("Remise 2");
    expect(html).toContain("Point inactif");
    // Le passage.
    expect(html).toContain("1 sur 3");
    expect(html).toContain("2 places libres");
    expect(html).not.toContain("Tant que le trajet est écarté");
  });

  it("🔴 dit la confirmation du déplacement de chaque passage — et ce qu’un « pas confirmé » ne dit pas encore", () => {
    const passage = (x: Partial<FicheTrajet["passages"][number]>) =>
      ({ collecte_le: "2026-10-14T12:30:00Z", fin_le: "2026-10-14T13:30:00Z", places: 3, reserves: 0, libre: true, jour_off: false, ecarte: null, ...x });
    // ⚠️ La cellule, pas la phrase d'explication de la fiche — qui cite elle aussi « pas confirmé ».
    const PAS_CONFIRME = '<span class="text-muted-foreground">pas confirmé</span>';
    const confirme = fiche({ passages: [passage({ confirme_le: "2026-10-13T06:05:00Z" })] });
    expect(confirme).toContain("confirmé le 13/10/2026 08:05");
    expect(confirme).not.toContain(PAS_CONFIRME);
    const muet = fiche({ passages: [passage({ confirme_le: null })] });
    expect(muet).toContain(PAS_CONFIRME);
    expect(muet).not.toContain("confirmé le");
    // Une lecture d'avant la colonne ne dit rien : ce n'est pas une confirmation.
    expect(fiche({ passages: [passage({})] })).toContain(PAS_CONFIRME);
    const ferme = fiche({ passages: [passage({ jour_off: true, libre: false, ecarte: "jour_off", confirme_le: null })] });
    expect(ferme).toContain("fermé par le cotransporteur");
    expect(ferme).not.toContain(PAS_CONFIRME);
    // ⚠️ La limite est dite : l'application en magasin ne l'envoie pas encore.
    expect(fiche()).toContain("Confirmation du déplacement : elle se lit sur chaque passage");
    expect(fiche()).toContain("ne l’envoie pas encore");
    expect(fiche()).toContain("un trajet non confirmé reste proposé");
  });

  it("🔴 propose le geste que la base permet — sinon sa raison, sans bouton", () => {
    const libre = fiche();
    expect(libre).toContain("Suspendre les nouvelles propositions");
    expect(libre).not.toContain("Rétablir les nouvelles propositions");
    expect(libre).not.toContain("ne sont pas suspendues");

    const suspendu = fiche({
      trajet: trajet({ situation: "suspendu", raisons: ["trajet_suspendu"], suspendu_le: "2026-10-13T08:00:00Z" }),
      possibles: { suspendre: { possible: false, raison: "Les nouvelles propositions de ce trajet sont déjà suspendues." }, reprendre: { possible: true, raison: null } },
    });
    expect(suspendu).toContain("Rétablir les nouvelles propositions");
    expect(suspendu).not.toContain("Suspendre les nouvelles propositions");
    expect(suspendu).toContain("Propositions suspendues depuis le 13/10/2026");
    expect(suspendu).toContain("Ce trajet n’est proposé à aucune recherche");
    expect(suspendu).toContain("L’équipe a suspendu ses nouvelles propositions");
    expect(suspendu).toContain("Tant que le trajet est écarté, aucun de ces passages n’est proposé.");

    const sansRole = fiche({
      possibles: {
        suspendre: { possible: false, raison: "Votre rôle ne permet pas de suspendre ou de rétablir les propositions d'un trajet." },
        reprendre: { possible: false, raison: "Votre rôle ne permet pas de suspendre ou de rétablir les propositions d'un trajet." },
      },
    });
    expect(sansRole).toContain("Votre rôle ne permet pas de suspendre ou de rétablir les propositions d'un trajet.");
    expect(sansRole).not.toContain("<button");

    const clos = fiche({
      trajet: trajet({ situation: "clos", statut: "expired", raisons: ["trajet_inactif"], prochain_passage: null, places_restantes: null }),
      possibles: { suspendre: { possible: false, raison: "Ce trajet est clos : il ne reçoit plus de proposition." }, reprendre: { possible: false, raison: "x" } },
    });
    expect(clos).toContain("Ce trajet est clos : il ne reçoit plus de proposition.");
    expect(clos).toContain("Ce trajet ne recevra plus de proposition");
    expect(clos).not.toContain("Ce trajet n’est proposé à aucune recherche");
    expect(clos).not.toContain("<button");
  });

  it("explique chaque anomalie que la base nomme", () => {
    const html = fiche({ trajet: trajet({ anomalies: ["point_de_remise_inactif", "surreserve"] }) });
    expect(html).toContain("Point de remise inactif");
    expect(html).toContain("Un de ses points de remise est fermé : il n’est plus proposé à la remise sur ce trajet.");
    expect(html).toContain("Un de ses passages à venir porte plus d’engagements que de places.");
  });

  it("dit ce qui écarte un passage, tel que la mise en relation le lit", () => {
    const passage = (ecarte: FicheTrajet["passages"][number]["ecarte"], reserves = 0) =>
      ({ collecte_le: "2026-10-14T12:30:00Z", fin_le: "2026-10-14T13:30:00Z", places: 1, reserves, libre: ecarte === null, jour_off: ecarte === "jour_off", ecarte });
    expect(fiche({ passages: [passage("complet", 1)] })).toContain("Complet");
    expect(fiche({ passages: [passage("chevauchement")] })).toContain("Un autre engagement le chevauche");
    expect(fiche({ passages: [passage("jour_off")] })).toContain("« Pas aujourd’hui »");
    expect(fiche({ passages: [passage("sans_point_de_remise")] })).toContain("Aucun point de remise");
    expect(fiche({ passages: [passage(null)] })).toContain("1 place libre");
    expect(fiche({ passages: [] })).toContain("Aucun passage dans les sept prochains jours.");
  });

  it("« Voir les missions associées » : chaque co-livraison ouvre l’onglet Livraison de son opération", () => {
    const html = fiche();
    expect(html).toContain('href="/operations/HTH-2026-313B53?onglet=livraison"');
    expect(html).toContain("À collecter");
    expect(html).toContain("collecte le 14/10/2026");
    expect(html).toContain("remise non fixée");
    expect(fiche({ colivraisons: [] })).toContain("Aucune co-livraison sur ce trajet.");
  });

  it("compte les propositions et les candidatures avec les mots de la fiche d’une recherche — et dit celles qui suivent leur cours", () => {
    const html = fiche();
    expect(html).toContain("Co-livraison confirmée");
    expect(html).toContain("Proposition sans réponse");
    expect(html).toContain("Proposition expirée sans réponse");
    expect(html).toContain("2 sont en cours : elles suivent leur cours");
    expect(fiche({ candidatures: { en_attente: 1 } })).toContain("Une est en cours : elle suit leur cours");
    expect(fiche({ candidatures: {} })).toContain("Aucune proposition n’a encore porté sur ce trajet.");
    expect(fiche({ candidatures: { confirmee: 3 } })).not.toContain("en cours : ell");
  });

  it("🔴 « Examiner une incompatibilité » : pour chaque recherche ouverte, ce qui écarte le trajet — ou qu’il va être proposé", () => {
    const html = fiche({
      recherches_ouvertes: [
        recherche({ recherche: "r-1", ref: "HTH-2026-0000A1", candidature: "en_attente", sur_ce_trajet: true }),
        recherche({ recherche: "r-2", ref: "HTH-2026-0000A2", candidature: "proposee", sur_ce_trajet: false }),
        recherche({ recherche: "r-3", ref: "HTH-2026-0000A3", statut: "choix", ecarte: "format" }),
        recherche({ recherche: "r-4", ref: "HTH-2026-0000A4", passages: [] }),
        recherche({ recherche: "r-5", ref: "HTH-2026-0000A5", passages: [{ collecte_le: "2026-10-14T12:30:00Z", ecarte: "complet" }] }),
        recherche({ recherche: "r-6", ref: "HTH-2026-0000A6", passages: [{ collecte_le: "2026-10-14T12:30:00Z", ecarte: null }] }),
        recherche({ recherche: "r-7", ref: null, numero: 77, fenetre_close: true, passages: [] }),
      ],
    });
    expect(html).toContain('href="/operations/HTH-2026-0000A1?onglet=livraison"');
    expect(html).toContain("Proposition déjà envoyée — Candidature — choix de l’acheteur attendu");
    expect(html).toContain("(sur ce trajet)");
    expect(html).toContain("(sur un autre trajet du même cotransporteur)");
    expect(html).toContain("Choix de l’acheteur attendu");
    expect(html).toContain("Le trajet ne prend pas ce format de colis");
    expect(html).toContain("Aucun passage dans la fenêtre de cette recherche : une collecte y est possible du 13/10/2026");
    expect(html).toContain("Aucun de ses passages n’est libre dans la fenêtre de cette recherche.");
    expect(html).toContain("· Complet");
    expect(html).toContain("Rien ne l’écarte : la proposition part au prochain tour d’horloge.");
    expect(html).toContain("· libre");
    expect(html).toContain("Recherche n° 77");
    expect(html).toContain("La recherche n’a plus le temps de prévenir un cotransporteur");
    // ⚠️ La limite de la lecture est dite.
    expect(html).toContain("elle n’était pas enregistrée quand une recherche a prévenu les cotransporteurs");
    expect(fiche()).toContain("Aucune recherche de co-livraison n’est ouverte sur ce corridor en ce moment.");
  });

  it("garde l’histoire des suspensions : le message dit au cotransporteur, le motif interne, la levée", () => {
    const html = fiche({
      suspensions: [
        { numero: 2, message: "Second message.", motif: "Second motif", suspendu_le: "2026-10-13T08:00:00Z", suspendu_par: "Léa Martin", leve_le: null, leve_par: null, motif_levee: null },
        { numero: 1, message: "Point de collecte en travaux.", motif: "Signalé par deux vendeurs", suspendu_le: "2026-10-01T08:00:00Z", suspendu_par: "Léa Martin", leve_le: "2026-10-03T08:00:00Z", leve_par: "Paul Roux", motif_levee: "Travaux terminés" },
      ],
    });
    expect(html).toContain("n° 2 · suspendues le 13/10/2026");
    expect(html).toContain("Toujours en cours");
    expect(html).toContain("« Point de collecte en travaux. »");
    expect(html).toContain("Motif interne : Signalé par deux vendeurs");
    expect(html).toContain("Rétablies le 03/10/2026");
    expect(html).toContain("Paul Roux — Travaux terminés");
    expect(fiche()).toContain("Aucune.");
  });

  it("🔴 ne remplace jamais ce qui manque : pas de pseudonyme, pas de point, pas de passage", () => {
    const html = fiche({
      trajet: trajet({ cotransporteur: null, prochain_passage: null, places_restantes: null, reservations: 0, colivraisons_en_cours: 0 }),
      arrets: [{ position: 1, ville: "Cannes", heure: null, point: null, point_actif: null }],
    }, false);
    expect(html).toContain("sans pseudonyme");
    expect(html).not.toContain("compte effacé");
    expect(html).not.toContain("/utilisateurs/");
    expect(html).toContain("Aucun passage à venir");
    expect(html).toContain("0 réservation à venir · 0 co-livraison en cours");
    expect(html).toContain("Sans point de rendez-vous");
    expect(html).not.toContain("Point inactif");
  });
});
