// LES AVIS UTILISATEURS (§19) — rendu tel que le serveur l'envoie.
//
// La base décide de tout : l'état d'un avis, son effet sur la moyenne, qui peut le
// retirer ou le rétablir (`avisModeres.test.ts` dans hand-to-hand). On vérifie ici
// que l'écran le dit tel quel : la liste et ses filtres, la fiche et l'effet sur la
// moyenne affichée, le geste quand il est possible, la raison sinon, les décisions
// et les signalements — qui a signalé seulement quand la base le dit.
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { AvisLigne, FicheAvis } from "@/lib/avis/types";

vi.mock("next/link", () => ({
  default: ({ href, children, ...reste }: { href: string; children: ReactNode }) => (
    <a href={href} {...reste}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/marque/AnimationH2H", () => ({ AnimationH2H: () => <span data-animation /> }));
vi.mock("@/lib/db/useGeste", () => ({ useGeste: () => ({ lancer: vi.fn(), enCours: false }) }));
vi.mock("@/lib/avis/actions", () => ({ modererAvis: vi.fn() }));

const { ListeAvis } = await import("./ListeAvis");
const { FiltresListeAvis } = await import("./FiltresAvis");
const { FicheAvisVue } = await import("./FicheAvis");
const { moyenneDite, adresseAvis } = await import("@/lib/avis/types");

const decode = (html: string) => html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

const LIGNE: AvisLigne = {
  id: "fb000000-0000-4000-a000-0000000000a1",
  ref: "AVIS-FB000000",
  depose_le: "2026-10-01T08:00:00Z",
  retire_le: null,
  statut: "publie",
  note: 1,
  commentaire: "Vendeuse malhonnête, à fuir absolument.",
  role: "seller",
  auteur: "un_fb",
  auteur_id: "fb000000-0000-4000-a000-000000000002",
  destinataire: "vendeuse_fb",
  destinataire_id: "fb000000-0000-4000-a000-000000000001",
  commande_id: "fb000000-0000-4000-a000-0000000000c1",
  commande_ref: "HTH-FB-1",
  mission_id: null,
  signalements: 1,
  signalements_ouverts: 1,
  est_test: false,
};
const FICHE: FicheAvis = {
  ...LIGNE,
  commande_statut: "delivered",
  moyenne: { affichee: 3, nombre: 2, sans_cet_avis: 5, avec_cet_avis: 3 },
  decisions: [],
  signalements: [
    { id: "s1", raison: "offensive", raison_libelle: "Offensant, insultant ou menaçant", explication: "Insultant envers la vendeuse.",
      le: "2026-10-01T09:00:00Z", signale_par: "@deux_fb" },
  ],
  possibles: {
    retirer: { possible: true, raison: null },
    retablir: { possible: false, raison: "Cet avis est publié : il n’y a rien à rétablir." },
  },
};
const fiche = (f: Partial<FicheAvis>, liens = true) =>
  decode(renderToStaticMarkup(<FicheAvisVue f={{ ...FICHE, ...f }} lienCompte={liens} lienFiche={liens} />));

describe("la liste des avis", () => {
  it("qui a noté qui, la note, le commentaire, l’état, les signalements — et chaque ligne ouvre sa fiche", () => {
    const html = decode(renderToStaticMarkup(
      <ListeAvis avis={[LIGNE, { ...LIGNE, id: "x2", ref: "AVIS-X2", statut: "retire", retire_le: "2026-10-02T08:00:00Z",
        signalements_ouverts: 0, signalements: 0, commentaire: null }]} filtree={false} />,
    ));
    expect(html).toContain(`href="/avis-utilisateurs/${LIGNE.id}"`);
    expect(html).toContain("un_fb → vendeuse_fb");
    expect(html).toContain("noté comme vendeur · HTH-FB-1");
    expect(html).toContain("« Vendeuse malhonnête, à fuir absolument. »");
    expect(html).toContain("1 à examiner");
    expect(html).toContain("Retiré");
    expect(html).toContain("Sans commentaire");
  });

  it("vide : on le dit, filtré ou non", () => {
    expect(decode(renderToStaticMarkup(<ListeAvis avis={[]} filtree />))).toContain("Aucun avis pour ces filtres");
    expect(decode(renderToStaticMarkup(<ListeAvis avis={[]} filtree={false} />))).toContain("Aucun avis");
  });

  it("les filtres gardent leurs compteurs et la recherche dans l’adresse", () => {
    const html = decode(renderToStaticMarkup(
      <FiltresListeAvis f={{ filtre: "signales", q: "rapide", test: false }}
        compteurs={{ tous: 2, publies: 2, retires: 0, signales: 1 }} testVisible={false} />,
    ));
    expect(html).toContain('href="/avis-utilisateurs?filtre=retires&q=rapide"');
    expect(html).toContain('Signalés<span class="tabular-nums">1</span>');
    expect(adresseAvis({ filtre: null, q: null, test: true })).toBe("/avis-utilisateurs?test=1");
  });
});

describe("la fiche d’un avis", () => {
  it("dit qui, quoi, la transaction, et l’effet sur la moyenne affichée", () => {
    const html = fiche({});
    expect(html).toContain('href="/utilisateurs/fb000000-0000-4000-a000-000000000002"');
    expect(html).toContain('href="/operations/HTH-FB-1"');
    expect(html).toContain("1 / 5");
    expect(html).toContain("Moyenne affichée de vendeuse_fb : 3,0 / 5 (2 avis comptés)");
    expect(html).toContain("Sans cet avis : 5,0 / 5.");
    expect(html).toContain("l’équipe ne les réécrit pas");
  });

  it("publié et retirable : le geste ; sinon la raison de la base, sans bouton", () => {
    expect(fiche({})).toContain("Retirer l’avis");
    const sans = fiche({ possibles: { ...FICHE.possibles, retirer: { possible: false, raison: "Vous êtes partie à cet avis : un autre membre de l’équipe doit en décider." } } });
    expect(sans).toContain("Vous êtes partie à cet avis");
    expect(sans).not.toContain("<button");
  });

  it("retiré : rétablir, la moyenne avec lui, les décisions — message et motif distingués", () => {
    const html = fiche({
      statut: "retire",
      retire_le: "2026-10-02T08:00:00Z",
      moyenne: { affichee: 5, nombre: 1, sans_cet_avis: 5, avec_cet_avis: 3 },
      decisions: [{ reference: "MAV-000001", decision: "retirer", message: "Votre avis contient des propos insultants.",
        motif: "Propos insultants vérifiés", par: "mod1@handtohand.pro", le: "2026-10-02T08:00:00Z" }],
      possibles: { retirer: { possible: false, raison: "Cet avis est déjà retiré." }, retablir: { possible: true, raison: null } },
    });
    expect(html).toContain("Rétablir l’avis");
    expect(html).toContain("Avec cet avis : 3,0 / 5.");
    expect(html).toContain("retiré le");
    expect(html).toContain("MAV-000001");
    expect(html).toContain("« Votre avis contient des propos insultants. »");
    expect(html).toContain("Motif interne : Propos insultants vérifiés");
  });

  it("les signalements : qui a signalé seulement si la base le dit ; leur examen est annoncé, pas simulé", () => {
    expect(fiche({})).toContain("par @deux_fb");
    const tu = fiche({ signalements: FICHE.signalements.map((s) => ({ ...s, signale_par: null })) });
    expect(tu).not.toContain("par @");
    expect(tu).toContain("arrive avec la suite de cette rubrique");
  });

  it("sans le droit de lire les comptes ni les opérations : pas de lien", () => {
    const html = fiche({}, false);
    expect(html).not.toContain("/utilisateurs/");
    expect(html).not.toContain("/operations/");
  });

  it("une moyenne sans avis se dit « aucune note », jamais zéro", () => {
    expect(moyenneDite(null)).toBe("aucune note");
    expect(moyenneDite(4.5)).toBe("4,5 / 5");
  });
});
