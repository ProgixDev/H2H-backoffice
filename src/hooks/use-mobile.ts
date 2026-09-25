import * as React from "react"

const MOBILE_BREAKPOINT = 768
const REQUETE = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

// Réécrit sur `useSyncExternalStore` : la version générée par shadcn posait
// l'état dans un effet, ce que la règle `react-hooks/set-state-in-effect`
// refuse (un rendu de plus à chaque montage).
function sAbonner(signaler: () => void) {
  const mql = window.matchMedia(REQUETE)
  mql.addEventListener("change", signaler)
  return () => mql.removeEventListener("change", signaler)
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    sAbonner,
    () => window.matchMedia(REQUETE).matches,
    () => false,
  )
}
