import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { ca } from '../../i18n/ca';
import { isSameDay, monthGrid, toIso } from '../../lib/calendar';

interface Props {
  year: number;
  month: number;
  /** Dies amb entrenament ('yyyy-mm-dd'). */
  sessionDates: Set<string>;
  selected: string | null;
  onSelect: (iso: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

/** Graella mensual. Només els dies amb entrenament es poden clicar. */
export function CalendarMonth({
  year,
  month,
  sessionDates,
  selected,
  onSelect,
  onPrev,
  onNext,
}: Props) {
  const weeks = useMemo(() => monthGrid(year, month), [year, month]);
  const today = new Date();
  const monthCount = weeks
    .flat()
    .filter((d) => d.getMonth() === month && sessionDates.has(toIso(d))).length;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className="min-w-0 truncate text-lg font-semibold tracking-title text-ink-900 sm:text-xl">
          {ca.sessions.months[month]} {year}
        </h3>
        <div className="flex gap-1">
          <NavButton onClick={onPrev} label={ca.sessions.prevMonth}>
            ‹
          </NavButton>
          <NavButton onClick={onNext} label={ca.sessions.nextMonth}>
            ›
          </NavButton>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {ca.sessions.weekdaysShort.map((d) => (
          <div key={d} className="pb-2 text-center text-sm font-medium text-ink-500">
            {d}
          </div>
        ))}

        {weeks.flat().map((day) => {
          const iso = toIso(day);
          const inMonth = day.getMonth() === month;
          const hasSession = sessionDates.has(iso);
          const isSelected = selected === iso;
          const isToday = isSameDay(day, today);

          if (!hasSession) {
            return (
              <div
                key={iso}
                className={`flex aspect-square max-h-20 items-center justify-center rounded-xl text-base
                            ${inMonth ? 'text-ink-400' : 'text-ink-400/40'}
                            ${isToday ? 'ring-1 ring-inset ring-ink-400' : ''}`}
              >
                {day.getDate()}
              </div>
            );
          }

          return (
            <motion.button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              aria-pressed={isSelected}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', duration: 0.25, bounce: 0.1 }}
              className={`relative flex aspect-square max-h-20 flex-col items-center justify-center gap-1
                          rounded-xl text-base font-semibold transition-colors duration-150
                          ${
                            isSelected
                              ? 'text-white'
                              : 'bg-paper text-ink-900 hover:bg-lineSoft'
                          }
                          ${!inMonth ? 'opacity-45' : ''}
                          ${isToday && !isSelected ? 'ring-1 ring-inset ring-ink-900' : ''}`}
              style={isSelected ? { background: 'var(--accent)' } : undefined}
            >
              {day.getDate()}
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: isSelected ? '#ffffff' : 'var(--accent)' }}
              />
            </motion.button>
          );
        })}
      </div>

      {monthCount === 0 && (
        <p className="mt-5 text-center text-ink-500">{ca.sessions.noSessionsMonth}</p>
      )}
    </div>
  );
}

function NavButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      // 44 px: la mida mínima raonable per a un objectiu tàctil.
      className="pressable grid h-11 w-11 place-items-center rounded-xl border border-line
                 bg-surface text-xl text-ink-700 transition-colors duration-150 hover:bg-paper"
    >
      {children}
    </button>
  );
}
