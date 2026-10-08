// CE QUE LA FICHE MONTRE D'UN REFUS DU COLIS — rendu tel que le serveur l'envoie (hand-to-hand 20261008009000).
//
// La base décide qui examine, quand, et ce que l'examen déclenche (`colisRefuse.test.ts` dans hand-to-hand) ; on
// vérifie ici que l'écran le dit tel quel : la déclaration et ses réponses, les présences au hub, le délai du
// vendeur, sa contestation, l'examen — proposé seulement quand la base le permet — et l'issue.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { AnnulationTardive, RefusColisLu } from "@/lib/operations/types";

vi.mock("@/lib/operations/sensibles", () => ({ ouvrirPiece: vi.fn(), revelerDonnee: vi.fn() }));
vi.mock("@/lib/db/useConsultation", () => ({ useConsultation: () => ({ consulter: vi.fn(), enCours: false }) }));

const { RefusColisBloc } = await import("./onglets/RefusColis");
const { AnnulationTardiveBloc } = await import("./onglets/AnnulationTardive");

const MAINTENANT = new Date("2026-10-08T12:30:00Z").getTime();

const refus = (r: Partial<RefusColisLu> = {}): RefusColisLu => ({
  id: "d-1", declare_le: "2026-10-08T12:05:00Z", cotransporteur: "karim", motif: "Colis différent de la description",
  commentaire: null,
  reponses: { presented: "Oui", matches: "Non", safe_transport: "Oui", describe: "Un carton deux fois plus grand." },
  pieces: 2, collecte_le: "2026-10-08T12:00:00Z", presence_cotransporteur_le: "2026-10-08T11:58:00Z",
  presence_vendeur_le: null, contestable_jusqu_au: "2026-10-09T12:05:00Z", issue: null, contestation: null,
  decision: null, examinable: false, raison: null, pieces_ouvrables: true, ...r,
});
const CONTESTATION = {
  id: "k-1", declaree_le: "2026-10-08T13:00:00Z", motif: "Le colis correspondait à l’annonce",
  commentaire: "Mesuré avant le départ.", pieces: 1, dossier: "DOS-000042",
};
const rendu = (r: RefusColisLu, geste?: React.ReactNode) =>
  renderToStaticMarkup(<RefusColisBloc refus={r} maintenant={MAINTENANT} geste={geste} />);

describe("le refus du colis, dans l’onglet Livraison", () => {
  it("dit la déclaration, ses réponses, les présences et le délai du vendeur", () => {
    const html = rendu(refus());
    expect(html).toContain("Refus du colis");
    expect(html).toContain("Délai de contestation du vendeur en cours");
    expect(html).toContain("karim");
    expect(html).toContain("Colis différent de la description");
    expect(html).toContain("Conforme à l’annonce");
    expect(html).toContain("Un carton deux fois plus grand.");
    expect(html).toContain("Non déclaré"); // le vendeur ne s'est pas déclaré au hub
    expect(html).not.toContain("Contestation du vendeur");
  });

  it("propose l’examen seulement quand la base le permet — sinon dit pourquoi", () => {
    const geste = <button type="button">Examiner la contestation</button>;
    const examinable = rendu(refus({ contestation: CONTESTATION, examinable: true }), geste);
    expect(examinable).toContain("Contesté par le vendeur : à examiner");
    expect(examinable).toContain("Le colis correspondait à l’annonce");
    expect(examinable).toContain("DOS-000042");
    expect(examinable).toContain("Examiner la contestation");

    const partie = rendu(refus({
      contestation: CONTESTATION, examinable: false,
      raison: "Vous êtes partie à cette co-livraison : un autre membre de l’équipe doit examiner cette contestation.",
    }));
    expect(partie).toContain("Vous êtes partie à cette co-livraison");
    expect(partie).not.toContain("Examiner la contestation");
  });

  it("dit l’examen, puis l’issue", () => {
    const decide = rendu(refus({
      contestation: CONTESTATION,
      decision: { decision: "maintenu", reponse: "Les photos montrent un colis plus grand qu’annoncé.",
                  motif: "Photos comparées", par: "lea", le: "2026-10-08T14:00:00Z" },
    }));
    expect(decide).toContain("Refus maintenu : l’annulation s’exécute");
    expect(decide).toContain("refus maintenu · lea");
    expect(decide).toContain("Les photos montrent un colis plus grand qu’annoncé.");
    expect(decide).not.toContain("Examiner la contestation");

    expect(rendu(refus({ issue: "refus_effectif" }))).toContain("Refus effectif : co-livraison annulée, frais du vendeur");
    expect(rendu(refus({ issue: "refus_injustifie" }))).toContain("Refus non retenu");
    expect(rendu(refus({ issue: "sans_objet" }))).toContain("Sans objet");
  });
});

describe("les frais d’un refus, dans l’onglet Paiements", () => {
  const frais: AnnulationTardive = {
    role: "vendeur", cause: "refus_colis", par: "vendeur_ec", annulee_le: "2026-10-09T12:06:00Z",
    collecte_le: "2026-10-08T12:00:00Z", frais_cents: 400, retenu_cents: 110, du_cents: 290,
    mise_en_relation_cents: 0, compensation_vendeur_cents: 0, compensation_cotransporteur_cents: 300,
    plateforme_cents: 100, contestable_jusqu_au: null, recours: null, levee_ecrite: false,
  };

  it("disent un refus maintenu, pas une annulation tardive", () => {
    const html = renderToStaticMarkup(<AnnulationTardiveBloc a={frais} maintenant={MAINTENANT} />);
    expect(html).toContain("Refus du colis");
    expect(html).toContain("frais à la charge du vendeur (refus maintenu)");
    expect(html).not.toContain("moins d’une heure avant la collecte");
    expect(html).not.toContain("Contestable jusqu’au");
  });
});
