import Link from "next/link";
import { StatutPastille, type Ton } from "@/components/bo/StatutPastille";
import { dateCourte, ilYA } from "@/lib/activite/temps";
import {
  FILTRES_NOTIFICATIONS,
  type EtatNotification,
  type FiltreNotifications,
  type NotificationSuivie,
} from "@/lib/activite/types";
import { cheminFiche } from "@/lib/operations/types";

// ⚠️ UNE ISSUE DÉFAVORABLE N'EST JAMAIS VERTE : seule la lecture l'est.
const ETAT: Record<EtatNotification, { ton: Ton; libelle: string }> = {
  consultee: { ton: "succes", libelle: "Consultée" },
  distribuee: { ton: "marque", libelle: "Distribuée" },
  envoyee: { ton: "marque", libelle: "Envoyée" },
  prevue: { ton: "neutre", libelle: "Prévue" },
  echec: { ton: "erreur", libelle: "Échec" },
  application: { ton: "neutre", libelle: "Dans l’application" },
  avant_suivi: { ton: "muet", libelle: "Avant le suivi" },
  ecartee: { ton: "muet", libelle: "Non envoyée (préférence)" },
};

const FILTRE: Record<FiltreNotifications, string> = {
  non_parvenues: "Non parvenues",
  echecs: "Push en échec",
  obligatoires_non_lues: "Obligatoires non lues",
  ecartees: "Retenues par une préférence",
};

const TYPE: Record<NotificationSuivie["type"], string> = {
  message: "Message",
  order: "Commande",
  proposition: "Offre",
  delivery: "Livraison",
  boost: "Boost",
  exchange: "Échange",
  mission_proposal: "Proposition de mission",
  pickup: "Retrait",
  payout: "Versement",
  dispute: "Litige",
  system: "Compte",
  incoming_package: "Colis à recevoir",
  pickup_done: "Colis récupéré",
  co_delivery: "Co-livraison",
  price_drop: "Baisse de prix",
  access_request: "Demande d’accès",
  seat_freed: "Place libérée",
  seat_reminder: "Rappel de place",
  vip_live: "Live VIP",
  correction_requested: "Correction demandée",
  purchase_access: "Accès d’achat",
};

const PUSH: Record<NonNullable<NotificationSuivie["push_statut"]>, string> = {
  prevu: "Push en attente",
  envoye: "Push envoyé",
  distribue: "Push distribué",
  echec: "Push en échec",
  expire: "Push jamais parti",
  sans_appareil: "Aucun appareil : dans l’application seulement",
};

const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? "s" : ""}`;

/** Ce que l'équipe sait de la remise d'un avis, en une ligne. */
function remise(n: NotificationSuivie, maintenant: number): string {
  if (n.etat === "ecartee") {
    return "Le destinataire a coupé cette catégorie : l’avis n’a été ni écrit dans l’application, ni poussé.";
  }
  if (!n.push_statut) {
    return n.etat === "consultee" ? "Lue — envoyée avant le suivi des remises." : "Envoyée avant le suivi des remises : seule sa lecture se saura.";
  }
  return [
    PUSH[n.push_statut] + (n.push_erreur ? ` — ${n.push_erreur}` : ""),
    n.push_tentatives ? pluriel(n.push_tentatives, "tentative") : null,
    n.push_appareils ? pluriel(n.push_appareils, "appareil") : null,
    n.consultee_le ? `lue ${dateCourte(n.consultee_le, maintenant)}` : n.etat === "consultee" ? "lue" : "non lue",
  ]
    .filter(Boolean)
    .join(" · ");
}

/**
 * Les notifications des sept derniers jours et leur suivi (R20.5) : prévue,
 * envoyée, distribuée, consultée — ou en échec.
 *
 * 🔴 UN AVIS OBLIGATOIRE QUE PERSONNE N'A REÇU remonte dans « À traiter » (R7.3) :
 * la liste le dit, le dossier s'y traite. Et ni le contenu d'un avis, ni les
 * messages entre utilisateurs : la base ne les rend pas.
 */
export function ListeNotifications({
  notifications,
  filtre,
  surFiltre,
  maintenant,
}: {
  notifications: NotificationSuivie[];
  filtre: FiltreNotifications | null;
  surFiltre: (f: FiltreNotifications | null) => void;
  maintenant: number;
}) {
  return (
    <div className="grid gap-4">
      <p className="text-corps text-muted-foreground">
        Les notifications des sept derniers jours et leur remise. Un avis obligatoire — une échéance à tenir, de
        l’argent en jeu — ne se coupe pas ; les autres suivent les préférences du destinataire. Leur contenu et les
        messages entre utilisateurs ne s’affichent pas ici.
      </p>

      <div className="flex flex-wrap gap-2">
        {[null, ...FILTRES_NOTIFICATIONS].map((f) => (
          <button
            key={f ?? "toutes"}
            type="button"
            aria-pressed={filtre === f}
            onClick={() => surFiltre(f)}
            className={
              "rounded-full border px-3 py-1.5 text-legende font-semibold transition-colors " +
              (filtre === f ? "border-h2h-primary bg-h2h-primary-light text-h2h-primary" : "hover:bg-muted")
            }
          >
            {f ? FILTRE[f] : "Toutes"}
          </button>
        ))}
      </div>

      {notifications.length === 0 ? (
        <p className="py-8 text-center text-corps text-muted-foreground">
          Aucune notification dans cet état ces sept derniers jours.
        </p>
      ) : (
        <ul className="grid gap-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className="grid gap-1 rounded-xl border bg-card p-3 md:grid-cols-[1fr_auto]"
              style={{ boxShadow: "var(--ombre-carte)" }}
            >
              <span className="grid min-w-0 gap-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{n.titre}</span>
                  <StatutPastille ton={ETAT[n.etat].ton}>{ETAT[n.etat].libelle}</StatutPastille>
                  {n.obligatoire && <StatutPastille ton="neutre">Obligatoire</StatutPastille>}
                  {n.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
                </span>
                <span className="text-legende text-muted-foreground">
                  {n.destinataire ?? "Compte effacé"} · {TYPE[n.type]} · {dateCourte(n.le, maintenant)} ·{" "}
                  {ilYA(n.le, maintenant)}
                </span>
                <span className="text-legende">{remise(n, maintenant)}</span>
                {n.non_parvenue && (
                  <span className="text-legende font-semibold text-h2h-error">
                    Personne ne l’a reçu : il remonte dans{" "}
                    <Link href="/a-traiter" className="underline underline-offset-2">
                      « À traiter »
                    </Link>
                    .
                  </span>
                )}
              </span>
              {n.objet_ref && n.objet_table && (
                <Link
                  href={cheminFiche(n.objet_ref, "chronologie")}
                  className="self-center text-legende font-semibold text-h2h-primary tabular-nums"
                >
                  {n.objet_ref} →
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}

      {notifications.length === 300 && (
        <p className="text-legende text-muted-foreground">
          Les 300 plus récentes sont affichées : affinez avec un filtre.
        </p>
      )}
    </div>
  );
}
