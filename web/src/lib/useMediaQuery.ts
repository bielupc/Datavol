import { useEffect, useState } from 'react';

/**
 * Consulta de mitjans com a estat de React.
 *
 * El valor inicial es llegeix de forma síncrona dins de `useState` (no en un
 * `useEffect`): si es calculés després del primer pintat, la primera imatge
 * seria sempre la de l'altra mida — es veuria la capçalera d'escriptori un
 * fotograma abans de saltar a la barra inferior.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    // Torna a sincronitzar per si la mida ha canviat entre el primer render i
    // el moment en què l'efecte s'executa.
    setMatches(mql.matches);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** El mateix llindar que `md:` de Tailwind, perquè CSS i JS no es contradiguin. */
export const DESKTOP_QUERY = '(min-width: 768px)';

/**
 * Per sota d'aquest llindar, la navegació és la barra inferior; per sobre, la
 * capçalera "illa". Ha de ser una condició de JavaScript i no un `hidden md:…`
 * de CSS: amagar amb CSS deixa els dos arbres muntats alhora, i llavors els
 * `layoutId` de Framer Motion (`nav-underline`, `profile-pill`) apareixen
 * duplicats i la pastilla vola d'una barra a l'altra.
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(DESKTOP_QUERY);
}
