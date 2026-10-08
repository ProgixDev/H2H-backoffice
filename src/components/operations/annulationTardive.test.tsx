// CE QUE L'ONGLET PAIEMENTS DIT D'UNE ANNULATION TARDIVE — rendu tel que le serveur l'envoie.
//
// La base calcule les frais, ce qui en est retenu tout de suite, ce qui reste dû et où ils vont
// (`annulationTardive.test.ts` dans hand-to-hand, migration 20261008006000) ; on vérifie ici que l'écran le
// dit tel quel, et que les deux états nouveaux des fonds se nomment (leur ton, jamais vert, est typé dans
// `FondsAVerser.tsx`, que ce rendu ne peut pas charger : il importe des gestes réservés au serveur).
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { AnnulationTardive } from "@/lib/operations/types";
import { LIBELLE_ETAT_FONDS } from "@/lib/paiements/types";
import { AnnulationTardiveBloc } from "./onglets/AnnulationTardive";

const MAINTENANT = new Date("2026-10-08T15:00:00Z").getTime();

const ACHETEUR: AnnulationTardive = {
  role: "acheteur", par: "acheteur_ec", annulee_le: "2026-10-08T14:20:00Z", collecte_le: "2026-10-08T14:50:00Z",
  frais_cents: 428, retenu_cents: 428, du_cents: 0, mise_en_relation_cents: 128,
  compensation_vendeur_cents: 150, compensation_cotransporteur_cents: 150, plateforme_cents: 128,
};

const rendu = (a: AnnulationTardive) => renderToStaticMarkup(<AnnulationTardiveBloc a={a} maintenant={MAINTENANT} />);

describe("l’annulation tardive dans l’onglet Paiements (CGU H2H Logistic § 5.5.2, § 5.6.2)", () => {
  it("l’acheteur : la mise en relation et 3 €, retenus sur son remboursement, une compensation de chaque côté", () => {
    const html = rendu(ACHETEUR);
    expect(html).toContain("Annulation tardive");
    expect(html).toContain("Annulée par l’acheteur (acheteur_ec)");
    expect(html).toContain("moins d’une heure avant la collecte");
    expect(html).toContain("4,28");
    expect(html).toContain("dont frais de mise en relation, qui restent dus");
    expect(html).toContain("Retenus sur son remboursement");
    expect(html).toContain("Compensation du vendeur");
    expect(html).toContain("Compensation du cotransporteur");
    expect(html).toContain("Gardé par HandtoHand");
    expect(html).not.toContain("Dus, retenus");
  });

  it("le vendeur : sa part d’abord, le reste dû ; HandtoHand avance ce qu’un petit paiement ne couvre pas", () => {
    const html = rendu({
      ...ACHETEUR, role: "vendeur", par: "vendeur_ec", frais_cents: 400, retenu_cents: 110, du_cents: 290,
      mise_en_relation_cents: 0, compensation_vendeur_cents: 0, compensation_cotransporteur_cents: 300, plateforme_cents: 100,
    });
    expect(html).toContain("Annulée par le vendeur (vendeur_ec)");
    expect(html).toContain("Retenus sur sa part des frais");
    expect(html).toContain("Dus, retenus sur ses prochains virements");
    expect(html).not.toContain("Compensation du vendeur");
    expect(html).not.toContain("mise en relation");
    const avance = rendu({ ...ACHETEUR, frais_cents: 100, retenu_cents: 100, plateforme_cents: -200 });
    expect(avance).toContain("Avancé par HandtoHand");
    expect(avance).not.toContain("Gardé par HandtoHand");
  });

  it("le cotransporteur : 2 € dus, sur ses prochaines participations ; les états des fonds se nomment", () => {
    const html = rendu({
      ...ACHETEUR, role: "cotransporteur", par: "ct_a", frais_cents: 200, retenu_cents: 0, du_cents: 200,
      mise_en_relation_cents: 0, compensation_vendeur_cents: 0, compensation_cotransporteur_cents: 0, plateforme_cents: 200,
    });
    expect(html).toContain("Annulée par le cotransporteur (ct_a)");
    expect(html).toContain("Dus, retenus sur ses prochaines participations");
    expect(html).not.toContain("Retenus sur");
    expect([LIBELLE_ETAT_FONDS.a_recouvrer, LIBELLE_ETAT_FONDS.recouvre]).toEqual(["Frais à retenir", "Frais retenus"]);
  });
});
