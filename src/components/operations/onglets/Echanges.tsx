import { MessagesSquare } from "lucide-react";
import { LIBELLE_CONVERSATION } from "@/lib/operations/libelles";
import type { Echanges } from "@/lib/operations/types";
import { Aucun, Bloc, Champs, ouiNon, Quand } from "../commun";
import { LectureEchanges } from "../LectureEchanges";

/**
 * Échanges : les conversations liées à l'achat.
 *
 * 🔴 UN MESSAGE NE SE LIT QU'AVEC LE LITIGE DE L'ACHETEUR, qui l'autorise en le
 * déposant — et chaque lecture est inscrite au journal d'audit, avec son motif.
 */
export function OngletEchanges({ e, maintenant }: { e: Echanges; maintenant: number }) {
  const consentie = e.consultation_acheteur === true;
  return (
    <div className="grid gap-4">
      <p className="flex items-start gap-2 rounded-xl border border-dashed p-3 text-legende text-muted-foreground">
        <MessagesSquare className="mt-0.5 size-4 shrink-0" />
        Le contenu des messages ne se lit que pour un litige : en l’ouvrant, l’acheteur autorise HandtoHand à consulter
        les échanges de la transaction. Chaque lecture est inscrite au journal d’audit.
      </p>

      <Bloc titre="Consentements">
        <Champs
          colonnes={2}
          items={[
            ["L’acheteur autorise la consultation", ouiNon(e.consultation_acheteur) ?? "Aucun litige ouvert"],
            ["Le vendeur autorise la consultation", ouiNon(e.consultation_vendeur) ?? "Pas encore de réponse du vendeur"],
          ]}
        />
      </Bloc>

      <Bloc titre="Conversations">
        {e.conversations.length === 0 ? (
          <Aucun>Aucune conversation liée à cet achat.</Aucun>
        ) : (
          <ul className="grid gap-2">
            {e.conversations.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border p-3 text-corps">
                <span className="font-medium">{LIBELLE_CONVERSATION[c.nature]}</span>
                <span className="tabular-nums">
                  {c.messages} message{c.messages > 1 ? "s" : ""}
                </span>
                <span className="text-legende text-muted-foreground">
                  ouverte <Quand iso={c.ouverte_le} maintenant={maintenant} />
                  {c.dernier_message_le && <> · dernier message <Quand iso={c.dernier_message_le} maintenant={maintenant} /></>}
                </span>
                {c.messages > 0 && (
                  <LectureEchanges
                    conversation={c.id}
                    libelle={LIBELLE_CONVERSATION[c.nature]}
                    consentie={consentie}
                    maintenant={maintenant}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </Bloc>
    </div>
  );
}
