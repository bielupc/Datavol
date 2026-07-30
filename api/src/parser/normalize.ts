/** Utilitats de normalització compartides pel parser i l'emparellament amb el dataset. */

/** Treu accents i deixa un slug estable: "HIP ABduccion" → "hip-abduccion". */
export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** "02' 32\"" → 152 segons. */
export function parseTut(minutes: string, seconds: string): number {
  return parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
}

/**
 * "8+1r" → { reps: 8, partialReps: 1 }
 * L'entrenador anota així quan l'última repetició no s'ha completat.
 */
export function parseReps(token: string): { reps: number; partialReps: number } | null {
  const m = /^(\d+)(?:\+(\d+))?r$/.exec(token);
  if (!m) return null;
  return { reps: parseInt(m[1], 10), partialReps: m[2] ? parseInt(m[2], 10) : 0 };
}

/** Unitats que apareixen als PDFs: "Kg" i "p." (plaques). */
export function parseUnit(token: string): 'kg' | 'p' | null {
  const t = token.toLowerCase();
  if (t === 'kg') return 'kg';
  if (t === 'p.' || t === 'p') return 'p';
  return null;
}

/** dd/mm/yyyy → yyyy-mm-dd (format que espera Postgres). */
export function parseDate(ddmmyyyy: string): string {
  const [d, m, y] = ddmmyyyy.split('/');
  return `${y}-${m}-${d}`;
}
