import Link from "next/link";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { StatutPastille, type Ton } from "@/components/bo/StatutPastille";
import { dateHeure } from "@/lib/dates";
import {
  LIBELLE_ATTENTE_INCIDENT,
  LIBELLE_ROLE_INCIDENT,
  cheminIncident,
  type Incident,
  type SituationIncident,
} from "@/lib/logistique/types";
import { cheminFiche } from "@/lib/operations/types";

/** ⚠️ UN INCIDENT CLOS N'EST PAS VERT : clore n'est pas donner raison. */
export const TON_SITUATION_INCIDENT: Record<SituationIncident, Ton> = {
  conteste: "attention",
  a_examiner: "attention",
  // Une décision préparée attend encore l'équipe : sa seconde clé.
  en_validation: "attention",
  contestable: "actif",
  en_cloture: "neutre",
  clos: "muet",
};

/**
 * ⚠️ UN PSEUDONYME ABSENT N'EST PAS UN COMPTE EFFACÉ : un membre peut ne pas en
 * avoir choisi. L'écran dit ce qu'il sait.
 */
const SANS_PSEUDONYME = "sans pseudonyme";

/** Une personne d'un incident : son rôle, son pseudonyme. */
export function personneDite(role: Incident["declarant_role"], pseudo: string | null): string {
  return `${LIBELLE_ROLE_INCIDENT[role]} · ${pseudo ?? SANS_PSEUDONYME}`;
}

/** Le nombre de pièces jointes, en clair. */
export const piecesDites = (n: number) => (n === 0 ? "aucune pièce" : n === 1 ? "1 pièce" : `${n} pièces`);

/**
 * Les incidents de co-livraison (§ 12.5) : un dossier par déclaration des
 * formulaires 2, 4, 6, 7, 11 et 13 — le formulaire et son numéro, la
 * co-livraison, le rendez-vous, qui déclare et qui est visé, où il en est, qui
 * il attend et jusqu'à quand, son dossier « À traiter ». Chaque ligne ouvre la
 * fiche de l'incident.
 *
 * 🔴 NI POSITION, NI CHEMIN D'UNE PIÈCE (R4.15) : des pseudonymes, un point de
 * rendez-vous nommé, des heures, un nombre de pièces.
 */
export function ListeIncidents({ incidents, filtree }: { incidents: Incident[]; filtree: boolean }) {
  if (incidents.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <AnimationH2H nom="car" taille={96} />
        <p className="mt-3 font-semibold">{filtree ? "Aucun incident pour ces filtres" : "Aucun incident déclaré"}</p>
        <p className="text-corps text-muted-foreground">
          Un incident apparaît ici dès qu’un participant le déclare depuis son application : une absence, un blocage ou
          le refus d’un colis.
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-2">
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[1180px] text-corps">
          <thead className="bg-muted/40 text-left text-legende text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Incident</th>
              <th className="px-3 py-2 font-medium">Co-livraison</th>
              <th className="px-3 py-2 font-medium">Rendez-vous</th>
              <th className="px-3 py-2 font-medium">Déclaré par · personne visée</th>
              <th className="px-3 py-2 font-medium">Où il en est</th>
              <th className="px-3 py-2 font-medium">Attendu de</th>
              <th className="px-3 py-2 font-medium">Dossier</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((i) => (
              <tr key={i.id} className="border-t align-top hover:bg-muted/30">
                <td className="max-w-60 px-3 py-2">
                  <Link href={cheminIncident(i.id)} className="font-medium text-h2h-primary hover:underline">
                    <span className="tabular-nums">Formulaire {i.numero}</span> · {i.nom}
                  </Link>
                  <span className="block text-legende text-muted-foreground">« {i.libelle} »</span>
                  <span className="block text-legende tabular-nums text-muted-foreground">
                    déclaré le {dateHeure(i.declare_le)} · {piecesDites(i.pieces)}
                  </span>
                  {i.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
                </td>
                <td className="max-w-56 px-3 py-2">
                  {i.ref ? (
                    <Link href={cheminFiche(i.ref, "litiges")} className="font-medium tabular-nums text-h2h-primary hover:underline">
                      {i.ref}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">Co-livraison introuvable</span>
                  )}
                  <span className="line-clamp-2">« {i.bien_titre ?? "—"} »</span>
                </td>
                <td className="px-3 py-2">
                  <span className="block">{i.etape === "collecte" ? "Collecte" : "Remise"}</span>
                  <span className="block">{[i.hub, i.ville].filter(Boolean).join(" · ") || "—"}</span>
                  <span className="block text-legende tabular-nums text-muted-foreground">prévu le {dateHeure(i.rendez_vous)}</span>
                </td>
                <td className="px-3 py-2 text-legende">
                  <span className="block">{personneDite(i.declarant_role, i.declarant)}</span>
                  <span className="block text-muted-foreground">
                    {i.partie_visee_role ? `vise : ${personneDite(i.partie_visee_role, i.partie_visee)}` : "ne vise personne"}
                  </span>
                </td>
                <td className="max-w-56 px-3 py-2">
                  <StatutPastille ton={TON_SITUATION_INCIDENT[i.situation]}>{i.situation_libelle}</StatutPastille>
                  {i.conteste_le && (
                    <span className="block text-legende tabular-nums text-muted-foreground">contesté le {dateHeure(i.conteste_le)}</span>
                  )}
                  {i.alerte === "cloture_en_retard" && (
                    <StatutPastille ton="erreur">La plateforme n’a pas clos : plus d’un quart d’heure</StatutPastille>
                  )}
                  {i.retient_les_fonds && <span className="block text-legende text-muted-foreground">retient les versements</span>}
                </td>
                <td className="px-3 py-2">
                  {i.attend ? (
                    <>
                      <span className="block">{LIBELLE_ATTENTE_INCIDENT[i.attend]}</span>
                      {i.echeance && (
                        <span className="block text-legende tabular-nums text-muted-foreground">jusqu’au {dateHeure(i.echeance)}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {i.dossier && i.dossier_id ? (
                    <Link href={`/a-traiter?dossier=${i.dossier_id}`} className="font-medium tabular-nums text-h2h-primary hover:underline">
                      {i.dossier}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {incidents.length >= 300 && (
        <p className="text-legende text-muted-foreground">
          Les 300 premiers sont affichés : affinez par un filtre, un formulaire ou une recherche pour voir les autres.
        </p>
      )}
    </div>
  );
}
