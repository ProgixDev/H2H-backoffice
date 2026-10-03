"use client";

import { useRouter } from "next/navigation";
import { ListeNotifications } from "@/components/activite/ListeNotifications";
import type { FiltreNotifications, NotificationSuivie } from "@/lib/activite/types";

/**
 * L'onglet Notifications de « Documents et paramètres » (R20.5, R20.6) : la même
 * liste qu'Activité en direct, son filtre dans l'adresse, et le renvoi — qui
 * relit la page (`useGeste`).
 *
 * ⚠️ L'HEURE EST CELLE DE LA LECTURE, VENUE DU SERVEUR : le rendu serveur et
 * celui du navigateur disent alors le même « il y a ».
 */
export function OngletNotifications({
  notifications,
  filtre,
  lu,
}: {
  notifications: NotificationSuivie[];
  filtre: FiltreNotifications | null;
  lu: number;
}) {
  const router = useRouter();
  return (
    <ListeNotifications
      notifications={notifications}
      filtre={filtre}
      surFiltre={(f) => router.push(`/documents-et-parametres?onglet=notifications${f ? `&filtre=${f}` : ""}`)}
      maintenant={lu}
    />
  );
}
