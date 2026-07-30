/**
 * Quina pestanya s'ha de veure activa per a una ruta donada. El detall d'un
 * exercici (`/exercicis/:slug`) pertany a la pestanya "Exercicis".
 *
 * Viu aquí, i no dins d'una de les dues barres, perquè la capçalera
 * d'escriptori i la barra inferior de mòbil han de coincidir sempre.
 */
export function activeTabFor(pathname: string): string {
  return pathname.startsWith('/exercicis') ? '/exercicis' : pathname;
}
