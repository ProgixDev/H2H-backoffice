/**
 * Ce qu'un geste sensible exige de revérifier : le second facteur, vérifié
 * depuis moins de dix minutes — exactement ce que la base contrôle
 * (`app.bo_exiger(permission, 10)` lit `fva[1]`). On ne redemande pas l'e-mail :
 * la base ne l'exige pas, et un code de plus à chaque geste lasserait sans rien
 * protéger de plus.
 */
export const REVERIFICATION_BO = { level: "second_factor", afterMinutes: 10 } as const;
