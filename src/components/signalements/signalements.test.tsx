// LES SIGNALEMENTS ET LEUR EXAMEN — l'écran ne montre que ce que la base permet.
//
// La base décide encore de tout (la permission, jamais par une partie, une seule
// fois, une même cible) ; on vérifie ici que le bloc dit ce qui attend et ce qui
// a été examiné — la réponse envoyée et le motif interne, distingués —, qui a
// signalé seulement quand la base le dit, le geste ou la raison de ne pas
// pouvoir, un échec de lecture qui ne ressemble pas à « aucun signalement » ; et
// que le registre des litiges dit où en est chaque signalement.
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Signalement } from "@/lib/litiges/types";
import type { SignalementLu, SignalementsCible } from "@/lib/signalements/types";

vi.mock("next/link", () => ({
  default: ({ href, children, ...reste }: { href: string; children: ReactNode }) => (
    <a href={href} {...reste}>
      {children}
    </a>
  ),
}));
vi.mock("@/lib/db/useGeste", () => ({ useGeste: () => ({ lancer: vi.fn(), enCours: false }) }));
vi.mock("@/lib/signalements/actions", () => ({ examinerSignalements: vi.fn() }));
// Requalifier se teste avec les litiges : ici, la liste dit seulement à qui le bouton s'adresse.
vi.mock("@/components/litiges/GestesDossier", () => ({
  BoutonRequalifier: ({ genre, objet }: { genre: string; objet: string }) => <button data-requalifier={`${genre}:${objet}`} />,
}));

const { BlocSignalements, SignalementsLus } = await import("./BlocSignalements");
const { ListeSignalements } = await import("@/components/litiges/ListeSignalements");

const CIBLE = "ff000000-0000-4000-a000-00000000aa01";
const COMPTE = "ff000000-0000-4000-a000-000000000001";
const DOSSIER = "d0000000-0000-4000-a000-000000000001";

const OUVERT: SignalementLu = {
  id: "51000000-0000-4000-a000-000000000001",
  raison: "fraud",
  raison_libelle: "Arnaque ou fraude",
  explication: "Il demande un virement hors de l’application.",
  preuves: [
    { genre: "link", texte: "https://exemple.fr/annonce-copiee" },
    { genre: "message", texte: "Payez-moi par virement" },
  ],
  priorite: "critique",
  bonne_foi: true,
  le: "2026-09-30T08:00:00Z",
  signale_par: "@coursier_cl",
  examen: null,
};
const EXAMINE: SignalementLu = {
  ...OUVERT,
  id: "51000000-0000-4000-a000-000000000002",
  raison: "misleading",
  raison_libelle: "Annonce trompeuse",
  explication: null,
  preuves: [],
  priorite: "normale",
  bonne_foi: false,
  le: "2026-09-20T08:00:00Z",
  signale_par: "@acheteuse_cl",
  examen: {
    id: "e0000000-0000-4000-a000-000000000001",
    reference: "SIG-000007",
    issue: "non_fonde",
    reponse: "Les photos correspondent bien à l’objet vendu.",
    motif: "Photos vérifiées une à une",
    par: "mod1@handtohand.pro",
    le: "2026-09-21T09:00:00Z",
  },
};
const LU: SignalementsCible = {
  signalements: [OUVERT, EXAMINE],
  a_examiner: 1,
  dossier: { id: DOSSIER, reference: "DOS-000042", statut: "ouvert" },
  possibles: { examiner: true, raison: null },
};
const rendre = (s: SignalementsCible) => renderToStaticMarkup(<BlocSignalements genre="annonce" cible={CIBLE} s={s} />);

describe("les signalements d'une cible", () => {
  it("ce qui attend, son dossier « À traiter », le geste d'examen", () => {
    const b = rendre(LU);
    expect(b).toContain("1 signalement à examiner");
    expect(b).toContain(`href="/a-traiter?dossier=${DOSSIER}"`);
    expect(b).toContain("DOS-000042");
    expect(b).toContain("Examiner les signalements");
    expect(b).toContain("Arnaque ou fraude");
    expect(b).toContain("Priorité critique");
    expect(b).toContain("À examiner");
    expect(b).toContain("« Il demande un virement hors de l’application. »");
    // Les preuves écrites, chacune avec ce qu'elle est.
    expect(b).toContain("Lien");
    expect(b).toContain("https://exemple.fr/annonce-copiee");
    expect(b).toContain("Message recopié");
    expect(b).toContain("par @coursier_cl");
  });

  it("un signalement examiné : l'issue, sa référence, la réponse envoyée et le motif interne, distingués", () => {
    const b = rendre(LU);
    expect(b).toContain("Non fondé · SIG-000007");
    expect(b).toContain("par mod1@handtohand.pro");
    expect(b).toContain("Réponse envoyée : </span>« Les photos correspondent bien à l’objet vendu. »");
    expect(b).toContain("Motif interne : Photos vérifiées une à une");
    expect(b).toContain("sans déclaration de bonne foi");
  });

  it("qui a signalé ne se lit que si la base le dit", () => {
    const b = rendre({ ...LU, signalements: LU.signalements.map((s) => ({ ...s, signale_par: null })) });
    expect(b).not.toContain("par @");
  });

  it("sans droit, ou partie aux signalements : la raison, aucun bouton", () => {
    const raison = "Vous êtes partie à ces signalements : un autre membre de l’équipe doit les examiner.";
    const b = rendre({ ...LU, possibles: { examiner: false, raison } });
    expect(b).toContain(raison);
    expect(b).not.toContain("<button");
  });

  it("tout est examiné : plus de geste ; rien n'a été signalé : on le dit", () => {
    const tout = rendre({ ...LU, signalements: [EXAMINE], a_examiner: 0, dossier: { ...LU.dossier!, statut: "clos" } });
    expect(tout).toContain("Tous les signalements sont examinés.");
    expect(tout).not.toContain("<button");
    expect(rendre({ signalements: [], a_examiner: 0, dossier: null, possibles: { examiner: true, raison: null } })).toContain(
      "Aucun signalement.",
    );
  });

  it("une lecture échouée ne ressemble jamais à « aucun signalement »", () => {
    const echec = renderToStaticMarkup(<SignalementsLus genre="utilisateur" cible={COMPTE} s={null} />);
    expect(echec).toContain("Les signalements ne se lisent pas");
    expect(echec).not.toContain("Aucun signalement");
    expect(renderToStaticMarkup(<SignalementsLus genre="utilisateur" cible={COMPTE} s={LU} />)).toContain(
      "1 signalement à examiner",
    );
  });
});

describe("le registre des litiges", () => {
  const ligne = (s: Partial<Signalement>): Signalement => ({
    genre: "signalement_annonce",
    id: "52000000-0000-4000-a000-000000000001",
    motif: "fraude",
    motif_libelle: "Fraude",
    motif_qualifie: false,
    titre: "Arnaque ou fraude",
    etat: "a_examiner",
    ouvert: true,
    ouvert_le: "2026-09-30T08:00:00Z",
    commande_id: null,
    reference: "Lampe de bureau vintage",
    participants: "Signalé par coursier_cl · annonce de vendeuse_cl",
    cible: CIBLE,
    est_test: false,
    ...s,
  });
  const LIGNES = [
    ligne({}),
    ligne({
      genre: "signalement_recherche", id: "52000000-0000-4000-a000-000000000002", etat: "fonde", ouvert: false,
      reference: "Vélo de route taille M",
    }),
    ligne({
      genre: "signalement_utilisateur", id: "52000000-0000-4000-a000-000000000003", etat: "non_fonde", ouvert: false,
      reference: null, cible: COMPTE,
    }),
  ];

  it("chaque signalement dit où il en est — celui d'une recherche compris", () => {
    const l = renderToStaticMarkup(<ListeSignalements signalements={LIGNES} motifs={[]} peutInstruire={false} />);
    expect(l).toContain("À examiner");
    expect(l).toContain("Fondé");
    expect(l).toContain("Non fondé");
    expect(l).toContain("Signalement d’une recherche");
    expect(l).toContain("Recherche « Vélo de route taille M »");
  });

  it("ce qu'il vise s'ouvre, seulement pour qui peut lire sa fiche", () => {
    const tout = renderToStaticMarkup(
      <ListeSignalements signalements={LIGNES} motifs={[]} peutInstruire peutOuvrirAnnonce peutOuvrirCompte />,
    );
    expect(tout).toContain(`href="/annonces/${CIBLE}"`);
    expect(tout).toContain(`href="/utilisateurs/${COMPTE}"`);
    expect(tout).toContain("Ouvrir le compte signalé");
    expect(tout).toContain(`data-requalifier="signalement_recherche:52000000-0000-4000-a000-000000000002"`);
    const rien = renderToStaticMarkup(<ListeSignalements signalements={LIGNES} motifs={[]} peutInstruire={false} />);
    expect(rien).not.toContain("/annonces/");
    expect(rien).not.toContain("/utilisateurs/");
    expect(rien).toContain("Annonce « Lampe de bureau vintage »");
  });
});
