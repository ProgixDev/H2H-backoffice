import "server-only";
import { rpc } from "@/lib/db/rpc";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { Texte } from "./types";

/**
 * Les textes du cahier des charges (R20.1) : leurs versions — programmée, en
 * vigueur, remplacée —, les acceptations, qui les a demandées et validées, et
 * les demandes qui attendent. La base dit aussi ce que l'équipier peut faire.
 */
export async function lireDocuments(): Promise<Texte[]> {
  return rpc<Texte[]>(await supabaseServeur(), "bo_documents_lire");
}
