// CE QUE LA RUBRIQUE « UTILISATEURS » MONTRE — rendu tel que le serveur l'envoie.
//
// Personne ne clique dans un navigateur pendant les tests : on vérifie ici que
// la liste et la fiche disent ce qu'elles doivent dire — le pseudonyme et
// jamais davantage, cinq données masquées et leur porte, ce qui n'existe pas
// encore dit tel quel, une référence d'achat qui n'ouvre la fiche que pour qui
// lit l'activité, les sanctions — ce qui est arrêté, le message et le motif
// distingués, les gestes que la base permet.
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { CompteListe, FicheCompte as Fiche, SanctionsCompte } from "@/lib/utilisateurs/types";

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

const { FiltresComptes, ListeComptes, noteDite } = await import("./ListeComptes");
const { FicheCompte } = await import("./FicheCompte");

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
  documents: { conventions: [], conditions_generales: null },
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
    },
  ],
  passees: [
    {
      id: "s0", nature: "suspension", portee: null, portee_libelle: null, message: "Comportement insultant envers un vendeur.",
      motif: "Signalement vérifié", depuis: "2026-09-01T08:00:00Z", jusqu_a: null, par: "mod1@handtohand.pro",
      levee_le: "2026-09-03T08:00:00Z", levee_par: "dir1@handtohand.pro", motif_levee: "Recours accepté",
    },
    {
      id: "r0", nature: "restriction", portee: "messagerie", portee_libelle: "Messages hors transaction", message: "Messages répétés.",
      motif: "Spam", depuis: "2026-08-01T08:00:00Z", jusqu_a: "2026-08-04T08:00:00Z", par: "mod1@handtohand.pro",
      levee_le: null, levee_par: null, motif_levee: null,
    },
    {
      id: "a0", nature: "avertissement", portee: null, portee_libelle: null, message: "Merci de rester courtois.",
      motif: "Ton agressif", depuis: "2026-07-01T08:00:00Z", jusqu_a: null, par: "mod1@handtohand.pro",
      levee_le: null, levee_par: null, motif_levee: null,
    },
  ],
  avertissements: 1,
  possibles: { sanctionner: true, raison: null, suspendre: true, portees: PORTEES },
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
      <ListeComptes comptes={[{ ...LIGNE, sanctions: { suspendu: true, portees: [], avertissements: 2 } }]} filtree={false} />,
    );
    expect(suspendu).toContain("Suspendu");
    expect(suspendu).toContain("2 avertissements");
    expect(suspendu).not.toContain("Restreint");
    const restreint = renderToStaticMarkup(
      <ListeComptes comptes={[{ ...LIGNE, sanctions: { suspendu: false, portees: ["achat", "live"], avertissements: 1 } }]} filtree={false} />,
    );
    expect(restreint).toContain("Restreint · Achats et offres, Live Shopping");
    expect(restreint).toMatch(/1 avertissement(?!s)/);
    expect(renderToStaticMarkup(<ListeComptes comptes={[LIGNE]} filtree={false} />)).not.toMatch(/Suspendu|Restreint|avertissement/);
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

describe("la fiche d'un compte", () => {
  const html = renderToStaticMarkup(<FicheCompte f={FICHE} peutReveler peutOuvrirFiche />);

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
    expect(html).toContain("leur acceptation n’est pas encore enregistrée par les applications");
    expect(html).toContain("Aucune coordonnée bancaire n’est gardée par HandtoHand");
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
    const f = renderToStaticMarkup(<FicheCompte f={{ ...FICHE, sanctions: SANCTIONNE }} peutReveler peutOuvrirFiche />);
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
    const f = renderToStaticMarkup(<FicheCompte f={{ ...FICHE, sanctions: SANCTIONNE }} peutReveler peutOuvrirFiche />);
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
    const f = renderToStaticMarkup(<FicheCompte f={{ ...FICHE, sanctions: suspendu }} peutReveler peutOuvrirFiche />);
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
    const sans = renderToStaticMarkup(<FicheCompte f={FICHE} peutReveler peutOuvrirFiche={false} />);
    expect(sans).toContain("HTH-2026-AAAAAA");
    expect(sans).not.toContain('href="/operations/');
  });

  it("son propre compte : l'équipier lit la fiche, ne révèle rien, et la fiche le dit", () => {
    const mien = renderToStaticMarkup(<FicheCompte f={{ ...FICHE, conflit: true }} peutReveler peutOuvrirFiche />);
    expect(mien).toContain(`data-cadre="profiles:${ID}:false"`);
    expect(mien).toContain("Ce compte est le vôtre");
    const sansDroit = renderToStaticMarkup(<FicheCompte f={FICHE} peutReveler={false} peutOuvrirFiche />);
    expect(sansDroit).toContain(`data-cadre="profiles:${ID}:false"`);
  });

  it("un compte effacé dit ce qui est parti avec lui", () => {
    const efface = renderToStaticMarkup(
      <FicheCompte f={{ ...FICHE, compte: { ...FICHE.compte, pseudo: "supprime_x1a2b3c", efface_le: "2026-09-29T08:00:00Z", ville: null, region: null } }} peutReveler peutOuvrirFiche />,
    );
    expect(efface).toContain("Compte effacé");
    expect(efface).not.toContain("Compte actif");
    expect(efface).toContain("le nom, l’e-mail, le téléphone et les adresses ont été supprimés");
  });

  it("un avis reçu dit qui l'a donné et en tant que quoi ; un signalement, son motif", () => {
    expect(html).toContain("par @ven_deuse_cl, comme acheteur");
    expect(html).toContain("« Acheteur sérieux »");
    expect(html).toContain("Aucun avis donné.");
    const signale = renderToStaticMarkup(
      <FicheCompte
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
    expect(signale).toContain("Arnaque ou tentative de fraude");
    expect(signale).toContain("Élevée");
    expect(signale).toContain("@coursier_cl");
  });
});
