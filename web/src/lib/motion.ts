import { useReducedMotion } from 'framer-motion';

/**
 * Valors de moviment compartits.
 *
 * Criteris (Emil Kowalski / Apple):
 *  - Res per sobre de 300 ms a la interfície.
 *  - Mai `ease-in`: endarrereix el moment que l'usuari mira.
 *  - Corbes fortes; les integrades del navegador són massa fluixes.
 *  - Entrades amb `transform` complet, no amb les abreviatures `x`/`y` de Framer,
 *    que no s'acceleren per maquinari.
 */

/** Corba d'entrada/sortida forta. */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
/** Corba per a moviment dins la pantalla. */
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

/** Molla per defecte, a l'estil d'Apple: més fàcil de raonar que stiffness/damping. */
export const SPRING = { type: 'spring', duration: 0.4, bounce: 0.15 } as const;

/** Entrada esglaonada per a graelles de targetes (30–80 ms entre elements). */
export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.02 } },
};

export const riseIn = {
  hidden: { opacity: 0, transform: 'translateY(8px)' },
  show: { opacity: 1, transform: 'translateY(0px)', transition: SPRING },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2, ease: EASE_OUT } },
};

/** Encreuament en canviar la mètrica d'un gràfic: no es torna a dibuixar des de zero. */
export const metricCrossfade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: 0.12, ease: EASE_OUT } },
};

/** Durada que respecta la preferència del sistema. */
export function useAnimationDuration(base: number): number {
  const reduced = useReducedMotion();
  return reduced ? 0 : base;
}
