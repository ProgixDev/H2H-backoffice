import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "cn";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { ListeTextes } from "@/components/documents/ListeTextes";
import { OngletNotifications } from "@/components/documents/OngletNotifications";
import { ListeParametres } from "@/components/parametres/ListeParametres";
import { lireParametres } from "@/lib/parametres/lectures";
import type { GroupeReglages } from "@/lib/parametres/types";
import { listerNotificationsLues } from "@/lib/activite/lectures";
import { FILTRES_NOTIFICATIONS, type FiltreNotifications, type NotificationSuivie } from "@/lib/activite/types";
import { lireDocuments } from "@/lib/documents/lectures";
import type { Texte } from "@/lib/documents/types";
import { rubriqueObligatoire } from "@/lib/navigation";

const rubrique = rubriqueObligatoire("/documents-et-parametres");
export const metadata: Metadata = { title: rubrique.titre };

type Onglet = "documents" | "notifications" | "parametres";

/**
 * Documents et paramètres (§20).
 *
 * - Documents (R20.1, R20.2) : chaque texte, ses versions, les acceptations ; publier
 *   une version, à deux clés ; annuler une version programmée.
 * - Notifications (R20.5, R20.6) : leur suivi, et le renvoi d'un push qui n'est pas
 *   arrivé — une nouvelle tentative sur la même notification, qui ne fait repartir
 *   aucune échéance.
 * - Paramètres (R20.3, R20.4) : chaque réglage, sa version en vigueur, ses versions
 *   programmées, son histoire ; un changement se demande et une seconde personne de la
 *   Direction le valide, jamais rétroactif. ⚠️ Tous figés à l'ouverture : la version de
 *   l'application qui les lit en base n'est pas encore installée — chacun dit pourquoi.
 */
export default async function PageDocumentsEtParametres({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const p = await searchParams;
  const onglet: Onglet = p.onglet === "notifications" || p.onglet === "parametres" ? p.onglet : "documents";
  const onglets: { id: Onglet; libelle: string }[] = [
    { id: "documents", libelle: "Documents" },
    { id: "notifications", libelle: "Notifications" },
    { id: "parametres", libelle: "Paramètres" },
  ];

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let textes: Texte[] | null = null;
  if (onglet === "documents") {
    try {
      textes = await lireDocuments();
    } catch {
      textes = null;
    }
  }
  const filtre = (FILTRES_NOTIFICATIONS as readonly string[]).includes(String(p.filtre))
    ? (p.filtre as FiltreNotifications)
    : null;
  let groupes: GroupeReglages[] | null = null;
  if (onglet === "parametres") {
    try {
      groupes = await lireParametres();
    } catch {
      groupes = null;
    }
  }
  let notifications: { liste: NotificationSuivie[]; lu: number } | null = null;
  if (onglet === "notifications") {
    try {
      notifications = await listerNotificationsLues(filtre, false);
    } catch {
      notifications = null;
    }
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      <p className="max-w-4xl text-corps text-muted-foreground">
        {onglet === "documents"
          ? "Chaque texte que les personnes acceptent — CGU, conditions de vente, confidentialité — et ceux qui se versionnent seulement. Une version publiée ne change plus ; chaque acceptation dit laquelle, et quand. Publier demande une seconde validation de la Direction."
          : onglet === "notifications"
            ? "Le suivi de chaque notification — prévue, envoyée, distribuée, en échec, consultée. Un push qui n’est pas arrivé se renvoie, trois fois au plus : c’est une nouvelle tentative sur la même notification, telle quelle — sa date ne change pas, et aucune échéance ne repart."
            : "Les délais de réclamation, les frais et la commission, les règles des rendez-vous de co-livraison se publient par versions, jamais rétroactives : une nouvelle version gouverne ce qui naît à sa date, ce qui existe garde la sienne. Un changement se demande et une seconde personne de la Direction le valide. Pour l’instant, aucun ne se change d’ici : l’application qui les lit en base n’est pas encore installée sur les téléphones — chaque réglage dit pourquoi."}
      </p>
      <nav className="flex gap-1 border-b" aria-label="Onglets">
        {onglets.map((o) => (
          <Link
            key={o.id}
            href={`/documents-et-parametres?onglet=${o.id}`}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-corps font-medium transition-colors",
              o.id === onglet
                ? "border-h2h-primary text-h2h-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {o.libelle}
          </Link>
        ))}
      </nav>
      {onglet === "documents" &&
        (textes === null ? <LectureEchouee /> : <ListeTextes textes={textes} />)}
      {onglet === "notifications" &&
        (notifications === null ? (
          <LectureEchouee />
        ) : (
          <OngletNotifications notifications={notifications.liste} filtre={filtre} lu={notifications.lu} />
        ))}
      {onglet === "parametres" && (groupes === null ? <LectureEchouee /> : <ListeParametres groupes={groupes} />)}
    </div>
  );
}
