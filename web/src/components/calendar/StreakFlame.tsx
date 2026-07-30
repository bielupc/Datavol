import { ca } from '../../i18n/ca';
import { FlameIcon } from './FlameIcon';

/**
 * Insígnia mínima de ratxa: pensada per anar al costat del títol del mapa de
 * calor (no com a bloc propi) — el número de sessions ja es dedueix de la
 * ratxa quan hi ha una sessió per setmana, així que no es repeteix enlloc més.
 */
export function StreakFlame({ weeks }: { weeks: number }) {
  const active = weeks > 0;

  return (
    // `max-w-full`: dins d'un `SectionTitle` que embolica, en pantalles
    // estretes la insígnia baixa sota el títol i no ha de sobresortir de la
    // targeta encara que el text de la ratxa sigui llarg.
    <div className="flex max-w-full shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-line bg-paper px-3 py-1.5">
      <FlameIcon size={18} muted={!active} />
      <span className="text-sm font-medium text-ink-700">{ca.sessions.streak(weeks)}</span>
    </div>
  );
}
