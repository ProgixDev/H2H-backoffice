"use client";

import { useSyncExternalStore } from "react";
import { Lottie } from "lottie-react";

/** Les animations copiées de l'application par `scripts/sync-marque.mjs`. */
export type NomAnimation =
  | "sandtime"
  | "siren"
  | "handoff"
  | "vault-shield"
  | "flash"
  | "fire"
  | "live"
  | "car"
  | "Diamond"
  | "coin"
  | "annonce"
  | "recherche"
  | "troquez";

type Props = { nom: NomAnimation; taille?: number; boucle?: boolean; className?: string };

const REQUETE = "(prefers-reduced-motion: reduce)";

function sAbonner(signaler: () => void) {
  const mq = window.matchMedia(REQUETE);
  mq.addEventListener("change", signaler);
  return () => mq.removeEventListener("change", signaler);
}

/**
 * Une animation de l'application, chargée à la demande depuis `/lottie/`
 * (les fichiers pèsent jusqu'à 330 Ko ; le navigateur les garde en cache).
 *
 * ⚠️ LE MOUVEMENT SE COUPE QUAND LA PERSONNE L'A DEMANDÉ : avec
 * `prefers-reduced-motion`, l'animation reste sur sa première image. Côté
 * serveur, on la suppose réduite — rien ne bouge avant de savoir.
 */
export function AnimationH2H({ nom, taille = 96, boucle = true, className }: Props) {
  const reduit = useSyncExternalStore(
    sAbonner,
    () => window.matchMedia(REQUETE).matches,
    () => true,
  );

  return (
    <Lottie
      src={`/lottie/${nom}.json`}
      autoplay={!reduit}
      loop={boucle && !reduit}
      className={className}
      style={{ width: taille, height: taille }}
      aria-hidden
    />
  );
}
