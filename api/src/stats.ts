/**
 * Càlcul d'estadístiques a partir dels registres.
 *
 * Nota sobre el volum: es fa servir `pes × repeticions completes`. Les repeticions
 * incompletes (la part "+1" de "8+1r") no compten com a feina completa, però es mostren
 * a part perquè indiquen que s'ha arribat al límit.
 */

export interface EntryRow {
  date: string;
  exerciseId: number;
  exerciseSlug: string;
  exerciseName: string;
  weight: number;
  unit: string;
  reps: number;
  partialReps: number;
  tutSeconds: number | null;
}

export interface SeriesPoint {
  date: string;
  weight: number;
  reps: number;
  partialReps: number;
  tutSeconds: number | null;
  volume: number;
  /** Variació de pes respecte de la sessió anterior: és la fletxa ↑/↓ del PDF. */
  weightDelta: number | null;
}

export interface ExerciseStats {
  sessions: number;
  first: SeriesPoint | null;
  last: SeriesPoint | null;
  /** Pes màxim assolit i quan. */
  recordWeight: number;
  recordDate: string | null;
  /** Variació percentual de pes entre la primera i l'última sessió. */
  progressPct: number | null;
  totalVolume: number;
  avgTut: number | null;
  /** Sessions consecutives (des del final) sense baixar de pes. */
  streak: number;
}

export function buildSeries(entries: EntryRow[]): SeriesPoint[] {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  return sorted.map((e, i) => ({
    date: e.date,
    weight: e.weight,
    reps: e.reps,
    partialReps: e.partialReps,
    tutSeconds: e.tutSeconds,
    volume: e.weight * e.reps,
    weightDelta: i === 0 ? null : e.weight - sorted[i - 1].weight,
  }));
}

export function computeStats(series: SeriesPoint[]): ExerciseStats {
  if (series.length === 0) {
    return {
      sessions: 0,
      first: null,
      last: null,
      recordWeight: 0,
      recordDate: null,
      progressPct: null,
      totalVolume: 0,
      avgTut: null,
      streak: 0,
    };
  }

  const first = series[0];
  const last = series[series.length - 1];

  let recordWeight = -Infinity;
  let recordDate: string | null = null;
  for (const p of series) {
    if (p.weight > recordWeight) {
      recordWeight = p.weight;
      recordDate = p.date;
    }
  }

  const tuts = series.map((p) => p.tutSeconds).filter((t): t is number => t !== null);

  let streak = 0;
  for (let i = series.length - 1; i >= 1; i--) {
    if (series[i].weight >= series[i - 1].weight) streak++;
    else break;
  }

  return {
    sessions: series.length,
    first,
    last,
    recordWeight,
    recordDate,
    progressPct: first.weight > 0 ? ((last.weight - first.weight) / first.weight) * 100 : null,
    totalVolume: series.reduce((sum, p) => sum + p.volume, 0),
    avgTut: tuts.length ? tuts.reduce((a, b) => a + b, 0) / tuts.length : null,
    streak,
  };
}

/** Dies entre una data ISO i avui. */
export function daysSince(dateIso: string): number {
  const then = new Date(`${dateIso}T00:00:00Z`).getTime();
  const today = new Date();
  const now = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.max(0, Math.round((now - then) / 86400000));
}
