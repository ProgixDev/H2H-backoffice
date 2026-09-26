"use server";

import { revalidatePath } from "next/cache";
import { geste as gesteBO } from "@/lib/db/geste";
import { refusEnResultat, rpc, type AppelRpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { Role } from "./types";

// Les gestes de la page « Équipe et journal d'audit ». La clé « une seule
// fois », la vérification d'identité et le rafraîchissement sont ceux de
// `geste` (`@/lib/db/geste`), commun à toutes les rubriques.
function geste<T>(...appel: AppelRpc) {
  return gesteBO<T>(["/equipe-et-audit"], ...appel);
}

export async function rejoindreEquipe() {
  try {
    const donnees = await rpc<unknown>(await supabaseServeur(), "bo_rejoindre");
    revalidatePath("/", "layout");
    return { ok: true as const, donnees };
  } catch (e) {
    return refusEnResultat(e);
  }
}

export async function inviterEquipier(p: {
  email: string;
  roles: Role[];
  motif: string;
  cle: string;
  equipe?: string | null;
  estTest?: boolean;
}) {
  return geste<{ invitation: string; validation: string; statut: string }>("bo_equipe_inviter", {
    p_email: p.email,
    p_roles: p.roles,
    p_motif: p.motif,
    p_cle: p.cle,
    p_equipe: p.equipe ?? null,
    p_est_test: p.estTest ?? false,
    p_profils_personnels: [],
  });
}

export async function demanderRole(p: { profil: string; role: Role; attribuer: boolean; motif: string; cle: string }) {
  return geste<{ validation: string; statut: string }>("bo_equipe_demander", {
    p_profil: p.profil,
    p_role: p.role,
    p_attribuer: p.attribuer,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

export async function suspendreEquipier(p: { profil: string; motif: string; cle: string }) {
  return geste<{ statut: string }>("bo_equipe_suspendre", {
    p_profil: p.profil,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

export async function demanderReactivation(p: { profil: string; motif: string; cle: string }) {
  return geste<{ validation: string; statut: string }>("bo_equipe_demander_reactivation", {
    p_profil: p.profil,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

export async function deciderValidation(p: { validation: string; approuver: boolean; motif: string; cle: string }) {
  return geste<{ ok: boolean; raison?: string; statut?: string }>("bo_validation_decider", {
    p_validation: p.validation,
    p_approuver: p.approuver,
    p_motif: p.motif || null,
    p_cle: p.cle,
  });
}
