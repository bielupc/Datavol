import { useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';

/**
 * Els gràfics no s'animen en carregar la pàgina sinó quan entren a la vista,
 * així l'animació es veu sempre encara que la targeta quedi avall del tot.
 *
 * 600 ms: és una animació explicativa (mostra com evoluciona una sèrie), però
 * prou curta perquè la pàgina no sembli lenta.
 */
export function useChartReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduced = useReducedMotion();
  return { ref, revealed: inView, reduced, duration: reduced ? 0 : 600 };
}
