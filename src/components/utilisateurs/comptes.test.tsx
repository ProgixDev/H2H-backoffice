// CE QUE LA RUBRIQUE « UTILISATEURS » MONTRE — rendu tel que le serveur l'envoie.
//
// Personne ne clique dans un navigateur pendant les tests : on vérifie ici que
// la liste et la fiche disent ce qu'elles doivent dire — le pseudonyme et
// jamais davantage, cinq données masquées et leur porte, ce qui n'existe pas
// encore dit « à venir », une référence d'achat qui n'ouvre la fiche que pour
// qui lit l'activité.
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { CompteListe, FicheCompte as Fiche } from "@/lib/utilisateurs/types";

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
  sanctions: null,
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

  it("ce qui n'existe pas encore se dit — ni sanction inventée, ni conditions générales présumées", () => {
    expect(html).toContain("À venir");
    expect(html).toContain("Aucune sanction ne peut encore être posée, ni lue, depuis cette fiche.");
    expect(html).toContain("leur acceptation n’est pas encore enregistrée par les applications");
    expect(html).toContain("Aucune coordonnée bancaire n’est gardée par HandtoHand");
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
