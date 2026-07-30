import { ca } from '../i18n/ca';

const dateLong = new Intl.DateTimeFormat('ca-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const dateShort = new Intl.DateTimeFormat('ca-ES', { day: '2-digit', month: '2-digit' });
const dateMedium = new Intl.DateTimeFormat('ca-ES', { day: 'numeric', month: 'short' });
const weekday = new Intl.DateTimeFormat('ca-ES', { weekday: 'long' });
const number0 = new Intl.NumberFormat('ca-ES', { maximumFractionDigits: 0 });
const number1 = new Intl.NumberFormat('ca-ES', { maximumFractionDigits: 1 });

/** Les dates arriben com a 'yyyy-mm-dd'; les tractem com a locals per no desplaçar-les un dia. */
function toDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const fmt = {
  dateLong: (iso: string) => dateLong.format(toDate(iso)),
  dateShort: (iso: string) => dateShort.format(toDate(iso)),
  dateMedium: (iso: string) => dateMedium.format(toDate(iso)),
  weekday: (iso: string) => {
    const w = weekday.format(toDate(iso));
    return w.charAt(0).toUpperCase() + w.slice(1);
  },

  number: (n: number) => number0.format(n),
  decimal: (n: number) => number1.format(n),

  /** El pes pot ser en kg o en plaques segons la màquina. */
  weight: (value: number, unit: string) =>
    `${number1.format(value)} ${unit === 'p' ? ca.units.pShort : ca.units.kg}`,

  unit: (unit: string) => (unit === 'p' ? ca.units.pShort : ca.units.kg),

  /** 152 → "2′ 32″" */
  duration: (seconds: number | null) => {
    if (seconds === null || Number.isNaN(seconds)) return '—';
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}′ ${String(s).padStart(2, '0')}″`;
  },

  /** Per a totals llargs: 10382 s → "2 h 53 min" */
  longDuration: (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    return h > 0 ? `${h} h ${m} min` : `${m} min`;
  },

  percent: (value: number | null) => {
    if (value === null) return '—';
    const sign = value > 0 ? '+' : '';
    return `${sign}${number1.format(value)} %`;
  },

  /** "8+1" quan hi ha repeticions incompletes. */
  reps: (reps: number, partial: number) => (partial > 0 ? `${reps}+${partial}` : String(reps)),
};
