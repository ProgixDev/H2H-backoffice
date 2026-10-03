"use server";

import { createHash } from "node:crypto";
import { geste } from "@/lib/db/geste";
import { chargerMoi } from "@/lib/equipe/moi";
import { peut } from "@/lib/equipe/types";
import type { EmpreinteCalculee, PublicationDemandee } from "./types";

const TAILLE_MAX = 10 * 1024 * 1024;
const DELAI_MS = 15_000;

/**
 * L'empreinte d'un texte publié : son sha-256, calculé ici sur ce que l'adresse
 * sert. La seconde personne qui valide relit l'adresse et la même empreinte.
 *
 * ⚠️ HTTPS SEULEMENT, SANS REDIRECTION, DIX MÉGAOCTETS AU PLUS : une adresse qui
 * change de contenu ou de lieu n'est pas une adresse définitive.
 */
export async function calculerEmpreinte(url: string): Promise<EmpreinteCalculee> {
  // 🔴 UNE ACTION DE SERVEUR EST UNE PORTE PUBLIQUE, et celle-ci ne passe pas par la base :
  // elle vérifie elle-même qu'elle sert un équipier qui peut publier.
  let moi;
  try {
    moi = await chargerMoi();
  } catch {
    return { ok: false, erreur: "Votre session ne permet pas cette lecture." };
  }
  if (!moi.membre || !peut(moi, "documents.publier") || moi.est_test) {
    return { ok: false, erreur: "Calculer l’empreinte d’un texte demande la permission de publier." };
  }
  let adresse: URL;
  try {
    adresse = new URL(url.trim());
  } catch {
    return { ok: false, erreur: "Cette adresse n’est pas valide." };
  }
  if (adresse.protocol !== "https:") return { ok: false, erreur: "L’adresse doit commencer par https://." };
  try {
    const reponse = await fetch(adresse, { redirect: "error", signal: AbortSignal.timeout(DELAI_MS), cache: "no-store" });
    if (!reponse.ok) return { ok: false, erreur: `L’adresse répond ${reponse.status} : le texte n’y est pas.` };
    const longueur = Number(reponse.headers.get("content-length") ?? "0");
    if (longueur > TAILLE_MAX) return { ok: false, erreur: "Le texte dépasse dix mégaoctets." };
    const octets = Buffer.from(await reponse.arrayBuffer());
    if (octets.length > TAILLE_MAX) return { ok: false, erreur: "Le texte dépasse dix mégaoctets." };
    if (octets.length === 0) return { ok: false, erreur: "L’adresse sert un texte vide." };
    return { ok: true, empreinte: createHash("sha256").update(octets).digest("hex"), octets: octets.length };
  } catch {
    return { ok: false, erreur: "Le texte n’a pas pu être lu à cette adresse (redirection, délai ou réseau)." };
  }
}

/**
 * Demander la publication d'une version (R20.1) — identité reconfirmée. Rien ne
 * se publie avant la seconde validation d'une autre personne de la Direction.
 *
 * 🔴 UNE VERSION OBLIGATOIRE EN VIGUEUR SE FAIT ACCEPTER PAR CHAQUE PERSONNE À SA
 * PROCHAINE OUVERTURE DE L'APPLICATION.
 */
export async function demanderPublication(p: {
  code: string;
  version: string;
  titre: string;
  url: string;
  empreinte: string;
  /** Nulle : dès la validation. */
  effet: string | null;
  application: string | null;
  obligatoire: boolean;
  motif: string;
  cle: string;
}) {
  return geste<PublicationDemandee>(["/documents-et-parametres", "/equipe-et-audit"], "bo_document_demander", {
    p_code: p.code,
    p_version: p.version,
    p_titre: p.titre,
    p_url: p.url,
    p_empreinte: p.empreinte,
    p_effet: p.effet,
    p_application: p.application,
    p_obligatoire: p.obligatoire,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}

/** Annuler une version programmée, avant sa date : personne ne l'a encore acceptée. */
export async function annulerVersion(p: { code: string; version: string; motif: string; cle: string }) {
  return geste<{ code: string; version: string; annulee: true }>(["/documents-et-parametres"], "bo_document_annuler", {
    p_code: p.code,
    p_version: p.version,
    p_motif: p.motif,
    p_cle: p.cle,
  });
}
