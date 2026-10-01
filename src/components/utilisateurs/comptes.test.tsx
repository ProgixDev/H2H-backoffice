// CE QUE LA RUBRIQUE « UTILISATEURS » MONTRE — rendu tel que le serveur l'envoie.
//
// Personne ne clique dans un navigateur pendant les tests : on vérifie ici que
// la liste et la fiche disent ce qu'elles doivent dire — le pseudonyme et
// jamais davantage, cinq données masquées et leur porte, ce qui n'existe pas
// encore dit tel quel, une référence d'achat qui n'ouvre la fiche que pour qui
// lit l'activité, les sanctions — ce qui est arrêté, le message et le motif
// distingués, les gestes que la base permet —, les recours de la personne et
// leur examen, et l'onglet qui les liste.
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { SignalementsCible } from "@/lib/signalements/types";
import type { FilSupportLu } from "@/lib/support/types";
import type { CompteListe, FicheCompte as Fiche, RecoursListe, RecoursLu, SanctionsCompte } from "@/lib/utilisateurs/types";

vi.mock("next/link", () => ({
  default: ({ href, children, ...reste }: { href: string; children: ReactNode }) => (
    <a href={href} {...reste}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/marque/AnimationH2H", () => ({ AnimationH2H: () => <span data-animation /> }));
// Les consultations demandent la session de l'équipier : ici, on ne garde que ce qu'elles reçoivent.
vi.mock("@/components/operations/sensibles", () => ({
  CadreConsultations: ({ objet, table, peutReveler, children }: { objet: string; table?: string; peutReveler: boolean; children: ReactNode }) => (
    <div data-cadre={`${table}:${objet}:${peutReveler}`}>{children}</div>
  ),
  DonneeMasquee: ({ champ }: { champ: string }) => <span data-masquee={champ}>••••••</span>,
}));
// Les gestes ouvrent des fenêtres et demandent la session : ici, on ne garde que ce qu'ils reçoivent.
vi.mock("@/components/utilisateurs/GestesSanction", () => ({
  GestesSanction: ({ profil, possibles }: { profil: string; possibles: SanctionsCompte["possibles"] }) => (
    <div
      data-gestes={`${profil}:${possibles.sanctionner}:${possibles.suspendre}:${possibles.portees.map((p) => p.code).join(",")}`}
    >
      {possibles.raison}
    </div>
  ),
  LeverSanction: ({ sanction, nature }: { sanction: string; nature: string }) => <button data-lever={`${nature}:${sanction}`} />,
}));
// Le fil avec le support se teste à part (`support.test.tsx`) : ici, ce que la fiche lui passe.
vi.mock("@/components/support/FilSupport", () => ({
  SupportLu: ({ profil, f }: { profil: string; f: { messages: unknown[] } | null }) => (
    <span data-support={`${profil}:${f === null ? "echec" : f.messages.length}`} />
  ),
}));
// Le bloc des signalements se teste à part (`signalements.test.tsx`) : ici, ce que la fiche lui passe.
vi.mock("@/components/signalements/BlocSignalements", () => ({
  SignalementsLus: ({ genre, cible, s }: { genre: string; cible: string; s: { a_examiner: number } | null }) => (
    <span data-signalements={`${genre}:${cible}:${s === null ? "echec" : s.a_examiner}`} />
  ),
}));
vi.mock("@/components/utilisateurs/GestesRecours", () => ({
  ExaminerRecours: ({ recours, reference }: { recours: string; reference: string }) => (
    <button data-examiner={`${reference}:${recours}`} />
  ),
  PieceRecours: ({ recours, rang }: { recours: string; rang: number }) => <button data-piece={`${recours}:${rang}`} />,
}));

const { FiltresComptes, ListeComptes, noteDite } = await import("./ListeComptes");
const { FicheCompte } = await import("./FicheCompte");
const { ListeRecours } = await import("./ListeRecours");

const ID = "fb000000-0000-4000-a000-000000000002";
const LIGNE: CompteListe = {
  id: ID,
  pseudo: "acheteur_cl",
  ville: "Cannes",
  type_compte: "individual",
  inscrit_le: "2026-08-11T09:00:00Z",
  roles: [{ role: "transporter", statut: "pending_validation" }],
  identite_verifiee: true,
  compte_versement: null,
  note: 4.5,
  avis: 2,
  annonces: 0,
  achats: 3,
  ventes: 0,
  signalements: 0,
  derniere_ouverture: "2026-09-28T17:38:00Z",
  sanctions: null,
  efface: false,
  vitrine: false,
  est_test: false,
};

/** Aucun échange avec le support : ce que `bo_support_lire` rend d'un compte sans fil. */
const SANS_SUPPORT: FilSupportLu = { conversation: null, messages: [], tronque: false, dossier: null,
  possibles: { ecrire: true, raison: null } };
/** Aucun signalement : ce que `bo_signalements_cible` rend d'une cible jamais signalée. */
const SANS_SIGNALEMENT: SignalementsCible = { signalements: [], a_examiner: 0, recours_a_examiner: 0, dossier: null, possibles: { examiner: true, raison: null } };
const FICHE: Fiche = {
  compte: {
    id: ID,
    pseudo: "acheteur_cl",
    avatar: null,
    ville: "Cannes",
    region: "PACA",
    type_compte: "individual",
    inscrit_le: "2026-08-11T09:00:00Z",
    connexion: "google",
    langue: "fr",
    note: 4,
    avis: 1,
    est_test: false,
    vitrine: false,
    efface_le: null,
  },
  conflit: false,
  verifications: {
    identite: { verifiee: true, methode: "stripe_identity", verifiee_le: "2026-08-16T09:00:00Z", mode_test: false, selfie: true, type_document: "passport" },
    demandes: [
      { statut: "verified", statut_stripe: "verified", soumise_le: "2026-08-16T08:50:00Z", verifiee_le: "2026-08-16T09:00:00Z", motif_rejet: null, echecs: 0, selfie: true, mode_test: false },
    ],
    professionnel_verifie: false,
    pseudo_autorise: false,
    documents_cotransporteur: null,
  },
  roles: [{ role: "transporter", statut: "pending_validation", demande_le: "2026-09-25T09:00:00Z", active_le: null, decide_le: null, motif: null }],
  point_relais: null,
  paiement: { compte_versement: "absent", encaissements: null, mode_test: null, payable_depuis: null, ouvert_le: null, reference: null, carte_enregistree: true },
  documents: { conventions: [], conditions_generales: { publiees: false, acceptations: [], a_accepter: [] } },
  activite: {
    annonces: { publiees: 0, en_ligne: 0, vendues: 0, brouillons: 0 },
    recherches: 1,
    achats: { total: 3, en_cours: 1, annules: 1 },
    ventes: { total: 0, en_cours: 0, annulees: 0 },
    colivraisons: { total: 0, realisees: 0 },
    trajets: 0,
    ouvertures: [{ application: "marketplace", le: "2026-09-28T17:38:00Z" }],
  },
  annonces: [],
  transactions: [
    { reference: "HTH-2026-AAAAAA", role: "acheteur", statut: "delivered", total_cents: 10639, le: "2026-09-20T10:05:00Z", avec: "ven_deuse_cl", titre: "Vélo de ville" },
  ],
  colivraisons: [],
  avis: {
    recus: [{ id: "a1", note: 4, commentaire: "Acheteur sérieux", le: "2026-09-29T10:00:00Z", avec: "ven_deuse_cl", role: "buyer" }],
    donnes: [],
  },
  signalements: { recus: [], recus_total: 0, faits: 1, annonces: 0, avis: 1, blocages: 0 },
  litiges: { total: 1, ouverts: 1 },
  sanctions: {
    en_cours: [],
    passees: [],
    avertissements: 0,
    recours_a_examiner: 0,
    possibles: { sanctionner: false, raison: "Votre rôle ne permet pas de sanctionner un compte.", suspendre: true, portees: [] },
  },
};

const PORTEES: SanctionsCompte["possibles"]["portees"] = [
  { code: "publication", libelle: "Publication", effet: "la publication d'annonces et de recherches, et l'achat de visibilité" },
  { code: "live", libelle: "Live Shopping", effet: "les lives : en lancer un, y réserver une place, y faire une offre" },
];
const SANCTIONNE: SanctionsCompte = {
  en_cours: [
    {
      id: "r1",
      nature: "restriction",
      portee: "achat",
      portee_libelle: "Achats et offres",
      effet: "les achats, les offres et les propositions d'échange",
      message: "Plusieurs acheteurs signalent des échanges proposés hors de la plateforme.",
      motif: "Trois signalements concordants",
      depuis: "2026-09-30T08:00:00Z",
      jusqu_a: "2026-10-07T08:00:00Z",
      par: "mod1@handtohand.pro",
      recours: null,
    },
  ],
  passees: [
    {
      id: "s0", nature: "suspension", portee: null, portee_libelle: null, message: "Comportement insultant envers un vendeur.",
      motif: "Signalement vérifié", depuis: "2026-09-01T08:00:00Z", jusqu_a: null, par: "mod1@handtohand.pro",
      levee_le: "2026-09-03T08:00:00Z", levee_par: "dir1@handtohand.pro", motif_levee: "Recours accepté",
      annulee: false, recours: null,
    },
    {
      id: "r0", nature: "restriction", portee: "messagerie", portee_libelle: "Messages hors transaction", message: "Messages répétés.",
      motif: "Spam", depuis: "2026-08-01T08:00:00Z", jusqu_a: "2026-08-04T08:00:00Z", par: "mod1@handtohand.pro",
      levee_le: null, levee_par: null, motif_levee: null,
      annulee: false, recours: null,
    },
    {
      id: "a0", nature: "avertissement", portee: null, portee_libelle: null, message: "Merci de rester courtois.",
      motif: "Ton agressif", depuis: "2026-07-01T08:00:00Z", jusqu_a: null, par: "mod1@handtohand.pro",
      levee_le: null, levee_par: null, motif_levee: null,
      annulee: false, recours: null,
    },
  ],
  avertissements: 1,
  recours_a_examiner: 0,
  possibles: { sanctionner: true, raison: null, suspendre: true, portees: PORTEES },
};

// Un recours contre la restriction en cours, qui attend ; un autre, accepté, contre l'avertissement.
const EN_ATTENTE: RecoursLu = {
  id: "rc1", reference: "REC-000012", statut: "a_examiner", depose_le: "2026-09-30T12:00:00Z",
  texte: "Je n’ai jamais proposé d’échange hors de la plateforme.", pieces: 2, examine_le: null, examine_par: null,
  reponse: null, motif: null, dossier: "DOS-000042", examinable: true, raison: null, pieces_ouvrables: true,
};
const ACCEPTE: RecoursLu = {
  ...EN_ATTENTE, id: "rc0", reference: "REC-000007", statut: "accepte", texte: "Le ton était vif, pas agressif.", pieces: 0,
  examine_le: "2026-07-02T08:00:00Z", examine_par: "mod2@handtohand.pro",
  reponse: "Après relecture, l’avertissement n’était pas justifié.", motif: "Relecture des messages", dossier: "DOS-000031",
  examinable: false,
};
const CONTESTE: SanctionsCompte = {
  ...SANCTIONNE,
  en_cours: [{ ...SANCTIONNE.en_cours[0], recours: EN_ATTENTE }],
  passees: SANCTIONNE.passees.map((x) => (x.id === "a0" ? { ...x, annulee: true, recours: ACCEPTE } : x)),
  avertissements: 0,
  recours_a_examiner: 1,
};

const RECOURS: RecoursListe = {
  id: "rc1", reference: "REC-000012", statut: "a_examiner", depose_le: "2026-09-30T12:00:00Z", profil: ID,
  pseudo: "acheteur_cl", nature: "restriction", portee: "achat", sanction_depuis: "2026-09-30T08:00:00Z",
  sanction_jusqu_a: "2026-10-07T08:00:00Z", sanction_en_cours: true,
  extrait: "Je n’ai jamais proposé d’échange hors de la plateforme.", pieces: 2, examine_le: null, examine_par: null,
  echeance: "2026-10-01T12:00:00Z", est_test: false,
};


describe("la liste des comptes", () => {
  it("une ligne dit le pseudonyme, l'activité et les vérifications — et ouvre la fiche", () => {
    const html = renderToStaticMarkup(<ListeComptes comptes={[LIGNE]} filtree={false} />);
    expect(html).toContain(`href="/utilisateurs/${ID}"`);
    expect(html).toContain("@acheteur_cl");
    expect(html).toContain("Particulier · Cannes");
    expect(html).toContain("Cotransporteur particulier");
    expect(html).toContain("À valider");
    expect(html).toContain("Identité vérifiée");
    expect(html).toContain("Pas de compte de versement");
    expect(html).toContain("4,5 / 5 (2 avis)");
    // Le 28 septembre à 17 h 38 UTC : 19 h 38 à Paris.
    expect(html).toContain("28/09/2026 19:38");
    expect(html).toContain("11/08/2026");
  });

  it("un compte de test, de vitrine ou effacé se reconnaît ; des signalements se voient", () => {
    const html = renderToStaticMarkup(
      <ListeComptes
        comptes={[{ ...LIGNE, est_test: true, vitrine: true, efface: true, pseudo: null, signalements: 2, note: null, avis: 0 }]}
        filtree={false}
      />,
    );
    for (const mot of ["TEST", "Vitrine", "Compte effacé", "Sans pseudonyme", "2 en 90 jours"]) expect(html).toContain(mot);
    expect(noteDite(null, 0)).toBe("—");
    expect(noteDite(5, 0)).toBe("—");
  });

  it("ce qui pèse sur un compte se voit : suspendu, restreint et sur quoi, averti", () => {
    const suspendu = renderToStaticMarkup(
      <ListeComptes comptes={[{ ...LIGNE, sanctions: { suspendu: true, portees: [], avertissements: 2, recours: 0 } }]} filtree={false} />,
    );
    expect(suspendu).toContain("Suspendu");
    expect(suspendu).toContain("2 avertissements");
    expect(suspendu).not.toContain("Restreint");
    const restreint = renderToStaticMarkup(
      <ListeComptes comptes={[{ ...LIGNE, sanctions: { suspendu: false, portees: ["achat", "live"], avertissements: 1, recours: 0 } }]} filtree={false} />,
    );
    expect(restreint).toContain("Restreint · Achats et offres, Live Shopping");
    expect(restreint).toMatch(/1 avertissement(?!s)/);
    expect(renderToStaticMarkup(<ListeComptes comptes={[LIGNE]} filtree={false} />)).not.toMatch(/Suspendu|Restreint|avertissement/);
  });

  it("un recours qui attend son examen se voit dans la liste", () => {
    const un = renderToStaticMarkup(
      <ListeComptes comptes={[{ ...LIGNE, sanctions: { suspendu: false, portees: [], avertissements: 0, recours: 1 } }]} filtree={false} />,
    );
    expect(un).toContain("Recours à examiner");
    expect(un).not.toMatch(/avertissement|Restreint/);
    const deux = renderToStaticMarkup(
      <ListeComptes comptes={[{ ...LIGNE, sanctions: { suspendu: true, portees: [], avertissements: 0, recours: 2 } }]} filtree={false} />,
    );
    expect(deux).toContain("2 recours à examiner");
  });

  it("une liste vide se dit vide — et dit où chercher un e-mail quand on a cherché", () => {
    expect(renderToStaticMarkup(<ListeComptes comptes={[]} filtree={false} />)).toContain("Aucun compte");
    const cherche = renderToStaticMarkup(<ListeComptes comptes={[]} filtree />);
    expect(cherche).toContain("Aucun compte ne correspond");
    expect(cherche).toContain("Retrouver par e-mail");
  });

  it("la recherche et le filtre restent dans l'adresse ; le monde du test ne se demande que si c'est permis", () => {
    const html = renderToStaticMarkup(<FiltresComptes f={{ q: "cannes", filtre: "signales", test: false }} testVisible />);
    expect(html).toContain('href="/utilisateurs?q=cannes&amp;filtre=vendeurs"');
    expect(html).toContain('href="/utilisateurs?q=cannes"');
    expect(html).toContain('name="filtre" value="signales"');
    expect(html).toContain('href="/utilisateurs?q=cannes&amp;filtre=sanctionnes"');
    expect(html).toContain("Sanctionnés");
    expect(html).toContain("Inclure le monde du test");
    expect(renderToStaticMarkup(<FiltresComptes f={{ q: null, filtre: null, test: false }} testVisible={false} />)).not.toContain(
      "Inclure le monde du test",
    );
  });
});

describe("les recours d'un compte", () => {
  it("un recours qui attend : ses mots, ses pièces, son dossier, et le geste qui l'examine", () => {
    const f = renderToStaticMarkup(<FicheCompte support={SANS_SUPPORT} signalements={SANS_SIGNALEMENT} f={{ ...FICHE, sanctions: CONTESTE }} peutReveler peutOuvrirFiche />);
    expect(f).toContain("Recours · 1 à examiner");
    expect(f).toContain("Recours à examiner");
    expect(f).toContain("REC-000012");
    // Le 30 septembre à 12 h UTC : 14 h à Paris.
    expect(f).toContain("Contre : Restriction · Achats et offres du 30/09/2026 10:00 · déposé le 30/09/2026 14:00 · dossier DOS-000042");
    expect(f).toContain("Les mots de la personne");
    expect(f).toContain("« Je n’ai jamais proposé d’échange hors de la plateforme. »");
    expect(f).toContain("2 pièces jointes");
    expect(f).toContain('data-piece="rc1:1"');
    expect(f).toContain('data-piece="rc1:2"');
    expect(f).toContain('data-examiner="REC-000012:rc1"');
  });

  it("un recours accepté : l'avertissement annulé, la réponse envoyée et le motif distingués", () => {
    const f = renderToStaticMarkup(<FicheCompte support={SANS_SUPPORT} signalements={SANS_SIGNALEMENT} f={{ ...FICHE, sanctions: CONTESTE }} peutReveler peutOuvrirFiche />);
    expect(f).toContain("Annulée sur recours");
    expect(f).toContain("Aucun avertissement reçu.");
    expect(f).toContain("Examiné le 02/07/2026 10:00 par mod2@handtohand.pro · réponse envoyée à la personne");
    expect(f).toContain("« Après relecture, l’avertissement n’était pas justifié. »");
    expect(f).toContain("Relecture des messages");
    expect(f).not.toContain('data-examiner="REC-000007:rc0"');
  });

  it("qui ne peut pas examiner le lit, et sait pourquoi ; qui ne peut pas ouvrir les pièces aussi", () => {
    const raison = "Vous avez posé cette sanction : un autre membre de l'équipe examine le recours.";
    const lu: SanctionsCompte = {
      ...CONTESTE,
      en_cours: [{ ...CONTESTE.en_cours[0], recours: { ...EN_ATTENTE, examinable: false, raison, pieces_ouvrables: false } }],
    };
    const f = renderToStaticMarkup(<FicheCompte support={SANS_SUPPORT} signalements={SANS_SIGNALEMENT} f={{ ...FICHE, sanctions: lu }} peutReveler peutOuvrirFiche />);
    expect(f).not.toContain("data-examiner");
    expect(f).not.toContain("data-piece");
    expect(f).toContain("Vous avez posé cette sanction : un autre membre de l&#x27;équipe examine le recours.");
    expect(f).toContain("votre rôle ne permet pas de les ouvrir");
  });

  it("sans recours, la fiche n'en parle pas", () => {
    const f = renderToStaticMarkup(<FicheCompte support={SANS_SUPPORT} signalements={SANS_SIGNALEMENT} f={{ ...FICHE, sanctions: SANCTIONNE }} peutReveler peutOuvrirFiche />);
    expect(f).not.toContain("Les mots de la personne");
    expect(f).not.toMatch(/REC-\d/);
  });
});

describe("l'onglet des recours", () => {
  it("un recours qui attend : le compte, la décision contestée, ses mots, son délai — et la fiche où l'examiner", () => {
    const l = renderToStaticMarkup(<ListeRecours recours={[RECOURS]} filtre="a_examiner" test={false} />);
    expect(l).toContain("REC-000012");
    expect(l).toContain(`href="/utilisateurs/${ID}"`);
    expect(l).toContain("@acheteur_cl");
    expect(l).toContain("Contre : Restriction · Achats et offres du 30/09/2026 10:00 — en cours");
    expect(l).toContain("« Je n’ai jamais proposé d’échange hors de la plateforme. »");
    expect(l).toContain("2 pièces jointes · à traiter avant le 01/10/2026 14:00");
    expect(l).toContain("Examiner sur la fiche du compte");
    expect(l).not.toContain("TEST");
  });

  it("un recours examiné dit par qui et quand ; un recours du monde d'essai le dit", () => {
    const l = renderToStaticMarkup(
      <ListeRecours
        recours={[{ ...RECOURS, statut: "rejete", examine_le: "2026-10-01T08:00:00Z", examine_par: "mod2@handtohand.pro",
          echeance: null, est_test: true }]}
        filtre="examines"
        test
      />,
    );
    expect(l).toContain("Rejeté");
    expect(l).toContain("TEST");
    expect(l).toContain("examiné le 01/10/2026 10:00 par mod2@handtohand.pro");
    expect(l).toContain("Lire sur la fiche du compte");
    // Les filtres gardent le monde demandé.
    expect(l).toContain('href="/utilisateurs?vue=recours&amp;test=1"');
    expect(l).toContain('href="/utilisateurs?vue=recours&amp;statut=tous&amp;test=1"');
  });

  it("aucun recours à examiner se dit", () => {
    expect(renderToStaticMarkup(<ListeRecours recours={[]} filtre="a_examiner" test={false} />)).toContain("Aucun recours à examiner");
  });
});

describe("la fiche d'un compte", () => {
  const html = renderToStaticMarkup(<FicheCompte support={SANS_SUPPORT} signalements={SANS_SIGNALEMENT} f={FICHE} peutReveler peutOuvrirFiche />);

  it("cinq données masquées, révélées depuis le compte — jamais écrites dans la fiche", () => {
    expect(html).toContain(`data-cadre="profiles:${ID}:true"`);
    const champs = [...html.matchAll(/data-masquee="([^"]+)"/g)].map((m) => m[1]);
    expect(champs).toEqual(["compte.nom", "compte.email", "compte.telephone", "compte.identite_verifiee", "compte.adresses"]);
    expect(html).toContain("Chaque donnée se révèle une à la fois");
  });

  it("l'identifiant permanent, le statut, les vérifications et les rôles", () => {
    expect(html).toContain("@acheteur_cl");
    expect(html).toContain("Compte actif");
    expect(html).toContain("Identifiant permanent");
    expect(html).toContain("Vérifiée par pièce d’identité et selfie (passeport), le 16/08/2026");
    expect(html).toContain("Cotransporteur particulier");
    expect(html).toContain("À valider");
    expect(html).toContain("1 sur 1");
    expect(html).toContain("Google");
    expect(html).toContain("HandtoHand : 28/09/2026 19:38");
  });

  it("ce qui n'existe pas encore se dit — ni conditions générales présumées", () => {
    expect(html).toContain("aucun texte n’est encore publié dans le registre des versions");
    expect(html).not.toContain("Aucun texte accepté");
    expect(html).toContain("Aucune coordonnée bancaire n’est gardée par HandtoHand");
  });

  it("des textes publiés : la version acceptée, quand, d'où — la remplacée distinguée — et ce qui reste", () => {
    const conditions = {
      publiees: true,
      acceptations: [
        { code: "cgu_marketplace", titre: "Conditions générales d’utilisation", version: "2027-01-01",
          accepte_le: "2027-01-02T08:00:00Z", application: "marketplace" as const, contexte: "mise_a_jour" as const,
          en_vigueur: true },
        { code: "cgu_marketplace", titre: "Conditions générales d’utilisation", version: "2026-11-01",
          accepte_le: "2026-11-02T08:00:00Z", application: "marketplace" as const, contexte: "premiere" as const,
          en_vigueur: false },
      ],
      a_accepter: [{ code: "confidentialite", titre: "Politique de confidentialité", version: "2027-02-01" }],
    };
    const f = renderToStaticMarkup(
      <FicheCompte support={SANS_SUPPORT} signalements={SANS_SIGNALEMENT}
        f={{ ...FICHE, documents: { ...FICHE.documents, conditions_generales: conditions } }} peutReveler peutOuvrirFiche />,
    );
    expect(f).not.toContain("aucun texte n’est encore publié");
    expect(f).toContain("2027-01-01");
    expect(f).toContain("En vigueur");
    expect(f).toContain("Remplacée");
    expect(f).toContain("Nouvelle version");
    expect(f).toContain("Première acceptation");
    expect(f).toContain("02/01/2027");
    expect(f).toContain("Reste à accepter dans HandtoHand : Politique de confidentialité (version 2027-02-01).");

    const aJour = renderToStaticMarkup(
      <FicheCompte support={SANS_SUPPORT} signalements={SANS_SIGNALEMENT}
        f={{ ...FICHE, documents: { ...FICHE.documents, conditions_generales: { ...conditions, a_accepter: [] } } }}
        peutReveler peutOuvrirFiche />,
    );
    expect(aJour).toContain("Rien ne reste à accepter dans HandtoHand.");
    const rien = renderToStaticMarkup(
      <FicheCompte support={SANS_SUPPORT} signalements={SANS_SIGNALEMENT}
        f={{ ...FICHE, documents: { ...FICHE.documents, conditions_generales: { ...conditions, acceptations: [] } } }}
        peutReveler peutOuvrirFiche />,
    );
    expect(rien).toContain("Aucun texte accepté.");
  });

  it("sans sanction : le compte peut tout commencer, et l'équipier sans le droit de sanctionner sait pourquoi", () => {
    expect(html).toContain("Aucune restriction ni suspension en cours : le compte peut tout commencer.");
    expect(html).toContain("Aucun avertissement reçu.");
    expect(html).toContain(`data-gestes="${ID}:false:true:"`);
    expect(html).toContain("Votre rôle ne permet pas de sanctionner un compte.");
    expect(html).not.toContain("data-lever");
    expect(html).not.toContain("Historique");
  });

  it("une restriction en cours : ce qui est arrêté, jusqu'à quand, qui — le message et le motif distingués", () => {
    const f = renderToStaticMarkup(<FicheCompte support={SANS_SUPPORT} signalements={SANS_SIGNALEMENT} f={{ ...FICHE, sanctions: SANCTIONNE }} peutReveler peutOuvrirFiche />);
    expect(f).toContain("Compte restreint");
    expect(f).not.toContain("Compte actif");
    expect(f).toContain("Restreint · Achats et offres");
    // Le 30 septembre à 8 h UTC : 10 h à Paris ; le 7 octobre, idem.
    expect(f).toContain("Depuis le 30/09/2026 10:00, jusqu’au 07/10/2026 10:00 · par mod1@handtohand.pro");
    expect(f).toContain("Arrêté : les achats, les offres et les propositions d&#x27;échange. Ses transactions et ses colis déjà engagés vont au bout.");
    expect(f).toContain("Message envoyé à la personne");
    expect(f).toContain("« Plusieurs acheteurs signalent des échanges proposés hors de la plateforme. »");
    expect(f).toContain("Motif interne");
    expect(f).toContain("Trois signalements concordants");
    expect(f).toContain('data-lever="restriction:r1"');
    expect(f).toContain(`data-gestes="${ID}:true:true:publication,live"`);
    expect(f).toContain("1 avertissement reçu.");
  });

  it("l'historique : levée par qui et pourquoi, arrivée à son terme, un avertissement sans fin", () => {
    const f = renderToStaticMarkup(<FicheCompte support={SANS_SUPPORT} signalements={SANS_SIGNALEMENT} f={{ ...FICHE, sanctions: SANCTIONNE }} peutReveler peutOuvrirFiche />);
    expect(f).toContain("Historique");
    expect(f).toContain("Levée le 03/09/2026 10:00 par dir1@handtohand.pro : Recours accepté");
    expect(f).toContain("Suspension");
    expect(f).toContain("Restriction · Messages hors transaction");
    expect(f).toContain("Arrivée à son terme le 04/08/2026 10:00");
    expect(f).toContain("« Merci de rester courtois. »");
  });

  it("une suspension en cours : le compte le dit, et ses annonces ont quitté la vitrine", () => {
    const suspendu: SanctionsCompte = {
      ...SANCTIONNE,
      en_cours: [{ ...SANCTIONNE.en_cours[0], id: "s1", nature: "suspension", portee: null, portee_libelle: null, effet: null, jusqu_a: null }],
      possibles: { ...SANCTIONNE.possibles, suspendre: false, portees: [] },
    };
    const f = renderToStaticMarkup(<FicheCompte support={SANS_SUPPORT} signalements={SANS_SIGNALEMENT} f={{ ...FICHE, sanctions: suspendu }} peutReveler peutOuvrirFiche />);
    expect(f).toContain("Compte suspendu");
    expect(f).toContain("sans terme, jusqu’à sa levée");
    expect(f).toContain("Arrêté : tout ce qui commence — ses annonces ont quitté la vitrine.");
    expect(f).toContain('data-lever="suspension:s1"');
    expect(f).toContain(`data-gestes="${ID}:true:false:"`);
  });

  it("une référence d'achat ouvre la fiche de l'opération — seulement pour qui lit l'activité", () => {
    expect(html).toContain('href="/operations/HTH-2026-AAAAAA"');
    expect(html).toContain("@ven_deuse_cl");
    expect(html).toMatch(/106,39\s€/);
    const sans = renderToStaticMarkup(<FicheCompte support={SANS_SUPPORT} signalements={SANS_SIGNALEMENT} f={FICHE} peutReveler peutOuvrirFiche={false} />);
    expect(sans).toContain("HTH-2026-AAAAAA");
    expect(sans).not.toContain('href="/operations/');
  });

  it("son propre compte : l'équipier lit la fiche, ne révèle rien, et la fiche le dit", () => {
    const mien = renderToStaticMarkup(<FicheCompte support={SANS_SUPPORT} signalements={SANS_SIGNALEMENT} f={{ ...FICHE, conflit: true }} peutReveler peutOuvrirFiche />);
    expect(mien).toContain(`data-cadre="profiles:${ID}:false"`);
    expect(mien).toContain("Ce compte est le vôtre");
    const sansDroit = renderToStaticMarkup(<FicheCompte support={SANS_SUPPORT} signalements={SANS_SIGNALEMENT} f={FICHE} peutReveler={false} peutOuvrirFiche />);
    expect(sansDroit).toContain(`data-cadre="profiles:${ID}:false"`);
  });

  it("un compte effacé dit ce qui est parti avec lui", () => {
    const efface = renderToStaticMarkup(
      <FicheCompte support={SANS_SUPPORT} signalements={SANS_SIGNALEMENT} f={{ ...FICHE, compte: { ...FICHE.compte, pseudo: "supprime_x1a2b3c", efface_le: "2026-09-29T08:00:00Z", ville: null, region: null } }} peutReveler peutOuvrirFiche />,
    );
    expect(efface).toContain("Compte effacé");
    expect(efface).not.toContain("Compte actif");
    expect(efface).toContain("le nom, l’e-mail, le téléphone et les adresses ont été supprimés");
  });

  it("un avis reçu dit qui l'a donné et en tant que quoi ; les signalements se lisent à part", () => {
    expect(html).toContain("par @ven_deuse_cl, comme acheteur");
    expect(html).toContain("« Acheteur sérieux »");
    expect(html).toContain("Aucun avis donné.");
    const signale = renderToStaticMarkup(
      <FicheCompte support={SANS_SUPPORT} signalements={SANS_SIGNALEMENT}
        f={{
          ...FICHE,
          signalements: {
            ...FICHE.signalements,
            recus_total: 1,
            recus: [{ id: "s1", motif: "fraud", libelle: "Arnaque ou tentative de fraude", priorite: "elevee", le: "2026-09-27T10:00:00Z", par: "coursier_cl" }],
          },
        }}
        peutReveler
        peutOuvrirFiche
      />,
    );
    // Les comptes viennent de la fiche ; chaque signalement et son examen, de `bo_signalements_cible`.
    expect(signale).toContain(`data-signalements="utilisateur:${FICHE.compte.id}:0"`);
    expect(signale).toContain("Signalements reçus");
    const echec = renderToStaticMarkup(<FicheCompte support={SANS_SUPPORT} f={FICHE} signalements={null} peutReveler peutOuvrirFiche />);
    expect(echec).toContain(`data-signalements="utilisateur:${FICHE.compte.id}:echec"`);
    // Le fil avec le support se lit à part, lui aussi — et son échec se dit.
    expect(signale).toContain(`data-support="${FICHE.compte.id}:0"`);
    expect(signale).toContain("Support");
    expect(renderToStaticMarkup(<FicheCompte f={FICHE} signalements={null} support={null} peutReveler peutOuvrirFiche />))
      .toContain(`data-support="${FICHE.compte.id}:echec"`);
  });
});
