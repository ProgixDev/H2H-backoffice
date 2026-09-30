// Le tableau de bord tel que la base le rend (`bo_tableau_de_bord`,
// `bo_tableau_detail` — migration 20260930001000 de hand-to-hand).
//
// 🔴 UN CHIFFRE N'EST JAMAIS CALCULÉ ICI. Chaque indicateur est la mesure de ses
// lignes, faite en base : l'écran met en forme, il ne compte pas.
import { euros } from "@/lib/paiements/types";

export type Groupe = "utilisateurs" | "annonces" | "transactions" | "argent" | "services" | "litiges" | "territoire";
/** `periode` : ce qui s'est passé entre deux dates. `instant` : ce qui est vrai à la lecture. */
export type Portee = "periode" | "instant";
export type Mesure = "nombre" | "somme" | "mediane";
/** L'unité de la valeur que porte chaque ligne. */
export type Unite = "aucune" | "centimes" | "secondes";

type Registre = {
  code: string;
  /** Le point du §3 du cahier des charges, de 1 à 11. */
  point: number;
  groupe: Groupe;
  libelle: string;
  definition: string;
  portee: Portee;
  mesure: Mesure;
  unite: Unite;
  /** Une définition proposée, à faire valider par le client. */
  a_confirmer: boolean;
};

export type Chiffre = {
  /** Les lignes comptées. */
  nombre: number;
  /** Leur somme ou leur médiane ; nul pour un simple compte, ou sans ligne à mesurer. */
  valeur: number | null;
};

export type IndicateurDisponible = Registre &
  Chiffre & {
    disponible: true;
    a_venir: null;
    /** Les lignes de vitrine : montrées à part, hors du chiffre. */
    a_part: number;
    /** L'équipier détient la permission qui ouvre les lignes. */
    ouvrable: boolean;
    /** La même mesure sur la période précédente ; nul pour un instant. */
    precedent: Chiffre | null;
  };

/** Ce que l'indicateur compte n'existe pas encore : aucun chiffre, et la raison. */
export type IndicateurAVenir = Registre & { disponible: false; a_venir: string };

export type Indicateur = IndicateurDisponible | IndicateurAVenir;

export type PeriodeTableau = {
  du: string;
  au: string;
  jours: number;
  avant_du: string;
  avant_au: string;
};

export type Tableau = { periode: PeriodeTableau; lu_le: string; indicateurs: Indicateur[] };

/** Une ligne de ce qui compose un chiffre. */
export type LigneTableau = {
  id: string;
  reference: string | null;
  libelle: string;
  le: string | null;
  valeur: number | null;
  detail: string | null;
  /** La référence de l'opération que la ligne ouvre, quand elle en a une. */
  cible: string | null;
  est_test: boolean;
};

export type DetailIndicateur = {
  indicateur: Registre & Chiffre & { a_part: number };
  periode: { du: string; au: string; jours: number };
  lu_le: string;
  lignes: LigneTableau[];
  /** La liste s'arrête à cinq cents lignes ; le chiffre, lui, les compte toutes. */
  tronquee: boolean;
};

export type FiltresTableau = { du: string | null; au: string | null; test: boolean };

// Les groupes, dans l'ordre du cahier des charges.
export const GROUPES: { code: Groupe; titre: string; note?: string }[] = [
  { code: "utilisateurs", titre: "Utilisateurs" },
  { code: "annonces", titre: "Annonces" },
  { code: "transactions", titre: "Transactions" },
  {
    code: "argent",
    titre: "Argent",
    // Le cahier des charges : « le montant des ventes entre utilisateurs doit être
    // distingué du chiffre d'affaires de HandToHand ».
    note: "Le prix des biens revient aux vendeurs : les ventes entre utilisateurs ne sont pas le chiffre d’affaires de HandtoHand, qui se lit dans ses revenus propres.",
  },
  { code: "services", titre: "H2H Logistic, Offres Flash et Live Shopping" },
  { code: "litiges", titre: "Litiges" },
  { code: "territoire", titre: "Territoire et catégorie" },
];

// Ce que compte un indicateur dont la valeur est une somme ou une médiane.
const NOM_LIGNES: Record<string, [string, string]> = {
  ventes: ["commande encaissée", "commandes encaissées"],
  revenus: ["écriture au grand livre", "écritures au grand livre"],
  frais_paiement: ["écriture au grand livre", "écritures au grand livre"],
  remboursements: ["remboursement", "remboursements"],
  litiges_delai: ["réclamation close", "réclamations closes"],
};

const ENTIER = new Intl.NumberFormat("fr-FR");
export const entier = (n: number) => ENTIER.format(n);

/** « 8 j », « 2 j 4 h », « 5 h 30 », « 45 min ». */
export function duree(secondes: number): string {
  const s = Math.abs(Math.round(secondes));
  const minutes = Math.round(s / 60);
  if (minutes < 60) return `${minutes} min`;
  const heures = Math.floor(minutes / 60);
  if (heures < 48) {
    const reste = minutes % 60;
    return reste ? `${heures} h ${String(reste).padStart(2, "0")}` : `${heures} h`;
  }
  const jours = Math.floor(heures / 24);
  const h = heures % 24;
  return h ? `${jours} j ${h} h` : `${jours} j`;
}

/** Une valeur dans son unité ; « — » quand il n'y en a pas. */
export function valeurEnUnite(valeur: number | null, unite: Unite): string {
  if (valeur === null) return "—";
  if (unite === "centimes") return euros(valeur);
  if (unite === "secondes") return duree(valeur);
  return entier(valeur);
}

/** Le chiffre d'un indicateur : son compte, sa somme ou sa médiane. */
export function chiffre(i: Pick<Registre, "mesure" | "unite"> & Chiffre): string {
  return i.mesure === "nombre" ? entier(i.nombre) : valeurEnUnite(i.valeur, i.unite);
}

/** « 4 commandes encaissées » : ce que mesure une somme ou une médiane. Nul pour un simple compte. */
export function lignesComptees(i: Pick<Registre, "code" | "mesure"> & Chiffre): string | null {
  if (i.mesure === "nombre") return null;
  const [un, plusieurs] = NOM_LIGNES[i.code] ?? ["ligne", "lignes"];
  return `${entier(i.nombre)} ${i.nombre > 1 ? plusieurs : un}`;
}

/**
 * L'écart avec la période précédente : signé, et ce qu'elle valait.
 *
 * ⚠️ AUCUN JUGEMENT. Plus de remboursements n'est pas une bonne nouvelle, plus de
 * ventes en est une : l'écran dit le sens, pas s'il faut s'en réjouir.
 */
export function evolution(i: IndicateurDisponible): { ecart: string; avant: string } | null {
  if (!i.precedent) return null;
  if (i.mesure === "nombre") {
    const d = i.nombre - i.precedent.nombre;
    return { ecart: d === 0 ? "=" : `${d > 0 ? "+" : "−"}${entier(Math.abs(d))}`, avant: entier(i.precedent.nombre) };
  }
  // Une médiane sans ligne n'existe pas : rien à comparer.
  if (i.valeur === null || i.precedent.valeur === null) return null;
  const d = i.valeur - i.precedent.valeur;
  return {
    ecart: d === 0 ? "=" : `${d > 0 ? "+" : "−"}${valeurEnUnite(Math.abs(d), i.unite)}`,
    avant: valeurEnUnite(i.precedent.valeur, i.unite),
  };
}
