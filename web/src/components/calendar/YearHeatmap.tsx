import { motion } from 'framer-motion';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { ca } from '../../i18n/ca';
import { fmt } from '../../lib/format';
import { isSameDay, rangeWeeks, toIso } from '../../lib/calendar';
import { useIsDesktop } from '../../lib/useMediaQuery';

interface Props {
  /** Interval fix de 12 mesos: normalment des de la primera sessió registrada. */
  start: Date;
  end: Date;
  /** Volum de cada dia amb entrenament, indexat per 'yyyy-mm-dd'. */
  volumeByDate: Map<string, number>;
  onPickDate: (iso: string) => void;
}

/** Cinc nivells: cap entrenament + quatre intensitats de volum. */
function levelOf(volume: number, max: number): number {
  if (volume <= 0) return 0;
  if (max <= 0) return 1;
  const ratio = volume / max;
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
}

const LEVEL_OPACITY = [0, 0.25, 0.45, 0.7, 1];

/**
 * Mapa de calor: una franja fixa de 12 mesos (no un any de calendari), perquè
 * sempre comenci al mes de la primera sessió en comptes de mostrar mig any buit
 * abans que hi hagi cap dada.
 */
export function YearHeatmap({ start, end, volumeByDate, onPickDate }: Props) {
  const weeks = useMemo(() => rangeWeeks(start, end), [start, end]);
  const today = new Date();
  const maxVolume = Math.max(...volumeByDate.values(), 0);
  const isDesktop = useIsDesktop();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Cinquanta-tres setmanes no caben en un telèfon per petita que es faci la
  // cel·la, així que el desplaçament lateral es queda — però comença pel final,
  // que és on hi ha les setmanes recents. Amb `useLayoutEffect` (i no
  // `useEffect`) el salt es fa abans de pintar: no s'arriba a veure el principi
  // de la franja i, tot seguit, el salt cap al final.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = el.scrollWidth;
  }, [weeks.length, isDesktop]);

  // Etiqueta de mes un sol cop per mes, a la primera setmana que hi pertany.
  // El mes d'una setmana és el del seu dijous (la regla ISO): així una setmana
  // partida entre dos mesos no genera dues etiquetes.
  const monthLabels: (string | null)[] = [];
  let lastLabelled = -1;
  for (const week of weeks) {
    const thursday = week[3];
    const inRange = thursday >= start && thursday <= end;
    const month = thursday.getMonth();
    if (inRange && month !== lastLabelled) {
      monthLabels.push(ca.sessions.months[month].slice(0, 3));
      lastLabelled = month;
    } else {
      monthLabels.push(null);
    }
  }

  // `minmax(_, 1fr)`: les columnes s'estiren per ocupar tot l'ample de la
  // targeta en pantalles grans (en comptes de deixar un buit a la dreta amb
  // un `min-w` fix), però mai per sota del mínim llegible — per sota d'això
  // la graella es desborda i l'`overflow-x-auto` de fora hi respon amb scroll.
  const gridCols = {
    gridTemplateColumns: `repeat(${weeks.length}, minmax(${isDesktop ? 11 : 10}px, 1fr))`,
  };

  return (
    <div>
      <div className="relative">
        <div ref={scrollRef} className="overflow-x-auto pb-1">
          {/* Les etiquetes poden sobresortir cap a la dreta: hi ha prou espai
              entre mesos i així no cal retallar-les. */}
          <div className="mb-1.5 grid gap-[3px] pl-0 sm:pl-8" style={gridCols}>
            {weeks.map((_, i) => (
              <span key={i} className="overflow-visible whitespace-nowrap text-[11px] text-ink-500">
                {monthLabels[i] ?? ''}
              </span>
            ))}
          </div>

          <div className="flex gap-[3px]">
            {/* Els 7 dies de la setmana. A mòbil no hi són: se'n van 32 px, que
                allà valen més com a graella que com a etiquetes que ja s'endevinen
                per la posició. */}
            <div className="mr-1 hidden w-7 shrink-0 flex-col gap-[3px] sm:flex">
              {ca.sessions.weekdaysShort.map((d) => (
                <span key={d} className="h-[13px] text-[11px] leading-[13px] text-ink-500">
                  {d}
                </span>
              ))}
            </div>

            <div className="grid flex-1 gap-[3px]" style={gridCols}>
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((day) => {
                    const iso = toIso(day);
                    const volume = volumeByDate.get(iso) ?? 0;
                    const level = levelOf(volume, maxVolume);
                    const inRange = day >= start && day <= end;
                    const future = day > today;

                    if (!inRange) return <span key={iso} className="aspect-square w-full" />;

                    const cell = (
                      <span
                        className="block aspect-square w-full rounded-[3px] border border-line"
                        style={{
                          background:
                            level === 0
                              ? future
                                ? 'transparent'
                                : '#f1f3f5'
                              : `color-mix(in srgb, var(--accent) ${LEVEL_OPACITY[level] * 100}%, #ffffff)`,
                        }}
                      />
                    );

                    if (level === 0) return <span key={iso}>{cell}</span>;

                    return (
                      <motion.button
                        key={iso}
                        type="button"
                        onClick={() => onPickDate(iso)}
                        // Nota: NO passar `transform: 'scale(x)'` com a string aquí.
                        // Framer Motion no sap interpolar-lo des del valor inicial
                        // ("none") i el resol a scale(0) — la cel·la desapareixeria
                        // en passar-hi el ratolí. La prop curta `scale` sí que funciona.
                        whileHover={{ scale: 1.35 }}
                        transition={{ type: 'spring', duration: 0.25, bounce: 0.3 }}
                        title={`${fmt.dateLong(iso)} · ${fmt.number(volume)} kg`}
                        aria-label={`${fmt.dateLong(iso)}, ${fmt.number(volume)} quilos`}
                        className={`block w-full rounded-[3px] ${isSameDay(day, today) ? 'ring-2 ring-ink-900 ring-offset-1' : ''}`}
                      >
                        {cell}
                      </motion.button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Difuminats a les vores: diuen que la franja continua més enllà del
            que es veu. Només a mòbil, que és on sempre hi ha desplaçament, i
            sense capturar cap toc perquè no bloquegin l'arrossegament. */}
        <span className="pointer-events-none absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-surface sm:hidden" />
        <span className="pointer-events-none absolute inset-y-0 right-0 w-5 bg-gradient-to-l from-surface sm:hidden" />
      </div>

      {/* Llegenda */}
      <div className="mt-3 flex items-center gap-2 pl-0 text-[11px] text-ink-500 sm:pl-8">
        <span>−</span>
        {LEVEL_OPACITY.map((o, i) => (
          <span
            key={i}
            className="h-[13px] w-[13px] rounded-[3px] border border-line"
            style={{
              background:
                i === 0 ? '#f1f3f5' : `color-mix(in srgb, var(--accent) ${o * 100}%, #ffffff)`,
            }}
          />
        ))}
        <span>+</span>
      </div>
    </div>
  );
}
