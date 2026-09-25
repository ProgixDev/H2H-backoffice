import "server-only";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { Equipe, LigneJournal, Validation } from "./types";

export async function listerEquipe(): Promise<Equipe> {
  return rpc<Equipe>(await supabaseServeur(), "bo_equipe_lister");
}

export async function listerValidations(): Promise<Validation[]> {
  return rpc<Validation[]>(await supabaseServeur(), "bo_validations_lister");
}

export type FiltresJournal = {
  genre?: string;
  action?: string;
  acteur?: string;
  depuis?: string;
  jusqua?: string;
};

export async function listerJournal(filtres: FiltresJournal = {}, avant?: number): Promise<LigneJournal[]> {
  const nettoyes = Object.fromEntries(Object.entries(filtres).filter(([, v]) => v));
  return rpc<LigneJournal[]>(await supabaseServeur(), "bo_journal_lister", {
    p_filtres: nettoyes,
    p_avant: avant ?? null,
    p_limite: 50,
  });
}
