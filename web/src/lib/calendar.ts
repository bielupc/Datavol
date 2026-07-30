/**
 * Utilitats de calendari. Les setmanes comencen en **dilluns**, com aquí.
 *
 * Les dates arriben de l'API com a 'yyyy-mm-dd' i es tracten sempre com a locals
 * per no desplaçar-se un dia amb els fusos horaris.
 */

export function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 0 = dilluns … 6 = diumenge (JS fa servir 0 = diumenge). */
export function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** El dilluns de la setmana d'aquesta data. */
export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - mondayIndex(d));
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Graella d'un mes: sempre setmanes senceres, incloent-hi els dies del mes
 * anterior i següent que completen la primera i l'última fila.
 */
export function monthGrid(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1);
  const cursor = startOfWeek(first);
  const weeks: Date[][] = [];

  while (true) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
    // Parem quan ja hem passat el mes i hem tancat la setmana.
    const last = week[6];
    if (last.getMonth() !== month && last > first) break;
  }
  return weeks;
}

/**
 * Totes les setmanes entre dues dates (inclusives), per al mapa de calor.
 * A diferència d'un any de calendari fix, l'interval el decideix qui crida
 * la funció — normalment els 12 mesos des de la primera sessió registrada.
 */
export function rangeWeeks(start: Date, end: Date): Date[][] {
  const weeks: Date[][] = [];
  const cursor = startOfWeek(start);

  while (cursor <= end) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

/** El primer dia del mes d'una data, i el mateix dia 12 mesos després. */
export function twelveMonthWindow(firstSessionDate: Date): { start: Date; end: Date } {
  const start = new Date(firstSessionDate.getFullYear(), firstSessionDate.getMonth(), 1);
  const end = new Date(start.getFullYear(), start.getMonth() + 12, 0);
  return { start, end };
}

/**
 * Setmanes consecutives amb com a mínim un entrenament, comptades cap enrere
 * des de la setmana de l'última sessió.
 *
 * Es compta des de l'última sessió i no des d'avui a propòsit: si l'última
 * sessió va ser fa dues setmanes, la ratxa que es va fer continua sent un fet.
 */
export function weekStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const weekKeys = new Set(dates.map((d) => toIso(startOfWeek(parseIso(d)))));
  const sorted = [...weekKeys].sort();
  const cursor = parseIso(sorted[sorted.length - 1]);

  let streak = 0;
  while (weekKeys.has(toIso(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
