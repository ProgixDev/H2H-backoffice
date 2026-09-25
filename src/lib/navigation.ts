// Le menu principal du back-office — les seize rubriques du cahier des charges
// (§2), dans son ordre et avec son libellé d'utilité, mot pour mot.
//
// ⚠️ LES PARTIES A, C, D, E SONT CELLES DU CAHIER. La partie B (« consulter et
// traiter un dossier ») n'est pas une rubrique : c'est la fiche complète, qui
// s'ouvre depuis toutes les autres.
//
// ⚠️ `livraison` DIT QUAND LA RUBRIQUE ARRIVE, PAS CE QU'ELLE FERA. Une rubrique
// non livrée affiche un état « à venir » honnête — jamais un faux tableau.
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowLeftRight,
  Car,
  FileCog,
  Gem,
  Inbox,
  LayoutDashboard,
  Megaphone,
  Radio,
  Scale,
  ShieldCheck,
  Star,
  Tag,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

export type Phase = "P0a" | "P0b" | "P1" | "P2a" | "P2b" | "P3" | "P4" | "P5" | "P6" | "P7";

export type Rubrique = {
  titre: string;
  chemin: string;
  utilite: string;
  icone: LucideIcon;
  /** La rubrique s'affiche si l'équipier détient l'une de ces permissions. */
  permissions: string[];
  /** Les paragraphes du cahier qui la décrivent. */
  sections: string;
  livraison: Phase;
};

export type GroupeMenu = { partie: "A" | "C" | "D" | "E"; titre: string; rubriques: Rubrique[] };

export const MENU: GroupeMenu[] = [
  {
    partie: "A",
    titre: "Voir et piloter l'activité",
    rubriques: [
      { titre: "Tableau de bord", chemin: "/tableau-de-bord", permissions: ["tableau.lire"], utilite: "Consulter les résultats et les indicateurs", icone: LayoutDashboard, sections: "§3", livraison: "P2a" },
      { titre: "Activité en direct", chemin: "/activite-en-direct", permissions: ["activite.lire"], utilite: "Suivre toutes les opérations en cours", icone: Activity, sections: "§4", livraison: "P1" },
      { titre: "À traiter", chemin: "/a-traiter", permissions: ["dossiers.lire"], utilite: "Ouvrir les dossiers nécessitant une intervention", icone: Inbox, sections: "§5, §7", livraison: "P1" },
    ],
  },
  {
    partie: "C",
    titre: "Gérer les services",
    rubriques: [
      { titre: "Utilisateurs", chemin: "/utilisateurs", permissions: ["utilisateurs.lire"], utilite: "Consulter les comptes et leur historique", icone: Users, sections: "§8", livraison: "P2b" },
      { titre: "Annonces Marketplace", chemin: "/annonces", permissions: ["annonces.lire"], utilite: "Contrôler les publications", icone: Tag, sections: "§9", livraison: "P2b" },
      { titre: "Transactions", chemin: "/transactions", permissions: ["transactions.lire"], utilite: "Suivre les achats, paiements et livraisons", icone: ArrowLeftRight, sections: "§10, §11", livraison: "P2a" },
      { titre: "H2H Logistic", chemin: "/h2h-logistic", permissions: ["logistique.lire"], utilite: "Gérer les recherches, trajets, missions et hubs", icone: Car, sections: "§12", livraison: "P4" },
      { titre: "Offres Flash", chemin: "/offres-flash", permissions: ["flash.lire"], utilite: "Suivre les propositions et sélections", icone: Zap, sections: "§13", livraison: "P5" },
      { titre: "Live Shopping", chemin: "/live-shopping", permissions: ["live.lire"], utilite: "Superviser les directs, réservations et achats", icone: Radio, sections: "§14", livraison: "P5" },
    ],
  },
  {
    partie: "D",
    titre: "Problèmes et flux financiers",
    rubriques: [
      { titre: "Litiges et signalements", chemin: "/litiges-et-signalements", permissions: ["litiges.lire"], utilite: "Instruire les dossiers et les recours", icone: Scale, sections: "§15", livraison: "P2a" },
      { titre: "Paiements et comptabilité", chemin: "/paiements-et-comptabilite", permissions: ["paiements.lire"], utilite: "Contrôler les flux financiers", icone: Wallet, sections: "§16", livraison: "P2a" },
      { titre: "Visibilité et publicité", chemin: "/visibilite-et-publicite", permissions: ["visibilite.lire"], utilite: "Gérer les options et leur exécution", icone: Megaphone, sections: "§17", livraison: "P6" },
    ],
  },
  {
    partie: "E",
    titre: "Règles et administration",
    rubriques: [
      { titre: "Classement et Pépites", chemin: "/classement-et-pepites", permissions: ["classement.lire"], utilite: "Superviser les sélections automatiques", icone: Gem, sections: "§18", livraison: "P6" },
      { titre: "Avis utilisateurs", chemin: "/avis-utilisateurs", permissions: ["avis.lire"], utilite: "Contrôler les évaluations et signalements", icone: Star, sections: "§19", livraison: "P6" },
      { titre: "Documents et paramètres", chemin: "/documents-et-parametres", permissions: ["documents.lire"], utilite: "Gérer les règles, versions et configurations", icone: FileCog, sections: "§20", livraison: "P6" },
      { titre: "Équipe et journal d'audit", chemin: "/equipe-et-audit", permissions: ["equipe.lire", "journal.lire"], utilite: "Gérer les accès et consulter les actions", icone: ShieldCheck, sections: "§21", livraison: "P0a" },
    ],
  },
];

export const RUBRIQUES: Rubrique[] = MENU.flatMap((g) => g.rubriques);

export function rubriqueDe(chemin: string): Rubrique | undefined {
  return RUBRIQUES.find((r) => chemin === r.chemin || chemin.startsWith(`${r.chemin}/`));
}

/** Pour les pages : une rubrique absente du menu est une erreur de code, pas un cas. */
export function rubriqueObligatoire(chemin: string): Rubrique {
  const r = RUBRIQUES.find((x) => x.chemin === chemin);
  if (!r) throw new Error(`rubrique inconnue du menu : ${chemin}`);
  return r;
}

/** Les phases, dans l'ordre du plan, pour dire « à venir » avec précision. */
export const LIBELLE_PHASE: Record<Phase, string> = {
  P0a: "Fondations et sécurité",
  P0b: "Reprise des procédures du support",
  P1: "Cœur de supervision",
  P2a: "Argent et litiges",
  P2b: "Utilisateurs et annonces",
  P3: "Recherche de cotransporteur (§12.1)",
  P4: "H2H Logistic",
  P5: "Offres Flash et Live Shopping",
  P6: "Règles et contenus",
  P7: "Tableau de bord complet et mise en service",
};
