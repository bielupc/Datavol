import { Link } from 'react-router-dom';
import type { SessionDay } from '../../api/types';
import { ca } from '../../i18n/ca';
import { fmt } from '../../lib/format';
import { WeightDelta } from '../../pages/ExerciciDetall';
import { ExerciseMedia } from '../ExerciseMedia';
import { IconClose } from '../icons';
import { ModalShell } from '../ui/ModalShell';

interface Props {
  day: SessionDay | null;
  onClose: () => void;
}

/** Detall d'un dia d'entrenament, en un diàleg. */
export function SessionDayModal({ day, onClose }: Props) {
  return (
    <ModalShell open={day !== null} onClose={onClose} maxWidthClass="max-w-xl">
      {day && (
        <>
          <div className="flex items-start justify-between gap-3 border-b border-line p-5">
            <div>
              <p className="text-sm font-medium text-ink-500">{fmt.weekday(day.date)}</p>
              <h3 className="text-xl font-semibold tracking-title text-ink-900">
                {fmt.dateLong(day.date)}
              </h3>
              <p className="mt-1 text-sm text-ink-500">
                {ca.sessions.exercises(day.entries.length)} · {fmt.number(day.volume)} kg ·{' '}
                {fmt.longDuration(day.tutSeconds)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={ca.sessions.close}
              className="pressable grid h-9 w-9 shrink-0 place-items-center rounded-full
                         text-ink-500 transition-colors duration-150 hover:bg-paper hover:text-ink-900"
            >
              <IconClose />
            </button>
          </div>

          <div className="flex-1 space-y-1.5 overflow-y-auto p-3">
            {day.entries.map((e) => (
              <Link
                key={e.slug}
                to={`/exercicis/${e.slug}`}
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl p-2 transition-colors duration-150
                           hover:bg-paper"
              >
                <ExerciseMedia
                  image={e.image}
                  gif={e.gif}
                  alt={e.name}
                  fallback=""
                  className="h-14 w-14 shrink-0 rounded-lg bg-paper p-1"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink-900">{e.name}</p>
                  <p className="text-sm text-ink-500">
                    {fmt.reps(e.reps, e.partialReps)} {ca.units.reps.toLowerCase()} ·{' '}
                    {fmt.duration(e.tutSeconds)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold tabular-nums text-ink-900">
                    {fmt.weight(e.weight, e.unit)}
                  </p>
                  <p className="text-sm tabular-nums">
                    <WeightDelta delta={e.weightDelta} />
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <p className="border-t border-line px-5 py-3 text-center text-sm text-ink-500">
            {ca.sessions.dayModalHint}
          </p>
        </>
      )}
    </ModalShell>
  );
}
