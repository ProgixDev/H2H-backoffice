"use client";

import { useState } from "react";
import { MoreHorizontal, UserPlus } from "lucide-react";
import { DialogueMotif } from "@/components/bo/DialogueMotif";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { demanderReactivation, demanderRole, suspendreEquipier } from "@/lib/equipe/actions";
import { LIBELLE_ROLE, ROLES, type Equipe, type Membre, type Role } from "@/lib/equipe/types";
import { useGeste } from "@/lib/db/useGeste";
import { DialogueInvitation } from "./DialogueInvitation";

type Geste =
  | { type: "role"; membre: Membre; role: Role; attribuer: boolean }
  | { type: "suspendre"; membre: Membre }
  | { type: "reactiver"; membre: Membre };

const date = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

/**
 * L'équipe : qui, avec quels rôles, dans quel état — et les gestes de la
 * Direction.
 *
 * ⚠️ AUCUN GESTE N'AGIT SEUL, SAUF LA SUSPENSION. Attribuer ou retirer un rôle
 * crée une DEMANDE, qu'un autre membre de la Direction valide dans l'onglet
 * « Validations ». Le bouton le dit, pour qu'on n'attende pas un effet immédiat.
 */
export function TableauEquipe({ equipe, moi, peutGerer }: { equipe: Equipe; moi: string; peutGerer: boolean }) {
  const [geste, setGeste] = useState<Geste | null>(null);
  const [invitation, setInvitation] = useState(false);
  const role = useGeste(demanderRole);
  const suspendre = useGeste(suspendreEquipier);
  const reactiver = useGeste(demanderReactivation);
  const enCours = role.enCours || suspendre.enCours || reactiver.enCours;

  async function confirmer(motif: string) {
    if (!geste) return;
    if (geste.type === "role") {
      await role.lancer(
        { profil: geste.membre.profil, role: geste.role, attribuer: geste.attribuer, motif },
        "Demande envoyée : un autre membre de la Direction doit la valider.",
      );
    } else if (geste.type === "suspendre") {
      await suspendre.lancer({ profil: geste.membre.profil, motif }, "Accès suspendu.");
    } else {
      await reactiver.lancer(
        { profil: geste.membre.profil, motif },
        "Demande de réactivation envoyée pour validation.",
      );
    }
    setGeste(null);
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <p className="text-corps text-muted-foreground">
          {equipe.membres.length} équipier{equipe.membres.length > 1 ? "s" : ""} · comptes dédiés, protégés par
          double authentification.
        </p>
        {peutGerer && (
          <Button onClick={() => setInvitation(true)}>
            <UserPlus /> Inviter
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-corps">
          <thead className="bg-muted/60 text-left text-legende text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">Équipier</th>
              <th className="px-4 py-2.5 font-medium">Rôles</th>
              <th className="px-4 py-2.5 font-medium">État</th>
              <th className="px-4 py-2.5 font-medium">Depuis</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {equipe.membres.map((m) => (
              <tr key={m.profil} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-medium">{m.nom ?? m.email}</div>
                  <div className="text-legende text-muted-foreground">
                    {m.email}
                    {m.est_test && <StatutPastille ton="attention" className="ml-2 py-0">TEST</StatutPastille>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {m.roles.length === 0 && <span className="text-muted-foreground">Aucun</span>}
                    {m.roles.map((r) => (
                      <StatutPastille key={r} ton="marque">
                        {LIBELLE_ROLE[r]}
                      </StatutPastille>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatutPastille ton={m.statut === "actif" ? "succes" : m.statut === "suspendu" ? "erreur" : "muet"}>
                    {m.statut === "actif" ? "Actif" : m.statut === "suspendu" ? "Suspendu" : "Parti"}
                  </StatutPastille>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{date(m.depuis)}</td>
                <td className="px-2 py-3">
                  {peutGerer && m.profil !== moi && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Gestes pour ${m.email}`}>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Demander (à valider)</DropdownMenuLabel>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger disabled={m.statut !== "actif"}>Attribuer un rôle</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {ROLES.filter((r) => !m.roles.includes(r)).map((r) => (
                              <DropdownMenuItem key={r} onSelect={() => setGeste({ type: "role", membre: m, role: r, attribuer: true })}>
                                {LIBELLE_ROLE[r]}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger disabled={m.roles.length === 0}>Retirer un rôle</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {m.roles.map((r) => (
                              <DropdownMenuItem key={r} onSelect={() => setGeste({ type: "role", membre: m, role: r, attribuer: false })}>
                                {LIBELLE_ROLE[r]}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        {m.statut === "suspendu" && (
                          <DropdownMenuItem onSelect={() => setGeste({ type: "reactiver", membre: m })}>
                            Demander la réactivation
                          </DropdownMenuItem>
                        )}
                        {m.statut === "actif" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Immédiat</DropdownMenuLabel>
                            <DropdownMenuItem variant="destructive" onSelect={() => setGeste({ type: "suspendre", membre: m })}>
                              Suspendre l’accès
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {equipe.invitations.length > 0 && (
        <section className="grid gap-2">
          <h3 className="text-h3 font-semibold">Invitations ouvertes</h3>
          <ul className="grid gap-2">
            {equipe.invitations.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card px-4 py-3">
                <div>
                  <div className="font-medium">{i.email}</div>
                  <div className="text-legende text-muted-foreground">
                    {i.roles.map((r) => LIBELLE_ROLE[r]).join(" · ")} — {i.motif}
                  </div>
                </div>
                <StatutPastille ton={i.statut === "valide" ? "succes" : "actif"}>
                  {i.statut === "valide" ? "Validée — en attente de connexion" : "À valider par la Direction"}
                </StatutPastille>
              </li>
            ))}
          </ul>
        </section>
      )}

      <DialogueInvitation ouvert={invitation} surFermeture={() => setInvitation(false)} />
      <DialogueMotif
        ouvert={geste !== null}
        surFermeture={() => setGeste(null)}
        enCours={enCours}
        destructif={geste?.type === "suspendre" || (geste?.type === "role" && !geste.attribuer)}
        titre={
          geste?.type === "suspendre"
            ? `Suspendre ${geste.membre.email}`
            : geste?.type === "reactiver"
              ? `Réactiver ${geste.membre.email}`
              : geste
                ? `${geste.attribuer ? "Attribuer" : "Retirer"} le rôle ${LIBELLE_ROLE[geste.role]}`
                : ""
        }
        description={
          geste?.type === "suspendre"
            ? "L’accès est coupé tout de suite. La réactivation demandera la validation d’un autre membre de la Direction."
            : "Cette demande ne prendra effet qu’après la validation d’un autre membre de la Direction."
        }
        libelleAction={geste?.type === "suspendre" ? "Suspendre" : "Envoyer la demande"}
        surConfirmation={confirmer}
      />
    </div>
  );
}
