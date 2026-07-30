import { ca } from '../i18n/ca';
import { useProfile } from '../state/profile';
import { IconCheck } from './icons';
import { ModalShell } from './ui/ModalShell';

/**
 * Selecció de perfil a mòbil, on la capçalera de color (i el seu selector) ja
 * no hi són. Files grosses i separades: es toquen amb el polze i sense mirar.
 */
export function ProfileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profiles, active, setActive } = useProfile();

  return (
    <ModalShell open={open} onClose={onClose} maxWidthClass="max-w-sm" heightClass="h-auto">
      <div className="p-5">
        <h2 className="text-xl font-semibold tracking-title text-ink-900">
          {ca.profileSheet.title}
        </h2>
        <p className="mt-1 text-sm text-ink-500">{ca.profileSheet.hint}</p>

        <ul className="mt-5 space-y-2">
          {profiles.map((p) => {
            const isActive = active?.slug === p.slug;
            return (
              <li key={p.slug}>
                <button
                  type="button"
                  onClick={() => {
                    setActive(p.slug);
                    onClose();
                  }}
                  aria-pressed={isActive}
                  className={`pressable flex w-full items-center gap-3.5 rounded-2xl border p-3
                              text-left transition-colors duration-150 ${
                                isActive ? 'bg-paper' : 'border-line hover:bg-paper'
                              }`}
                  style={isActive ? { borderColor: p.color } : undefined}
                >
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-lg
                               font-bold uppercase text-white"
                    style={{ background: p.color }}
                    aria-hidden
                  >
                    {p.name.charAt(0)}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold text-ink-900">
                    {p.name}
                  </span>
                  {isActive && (
                    <span className="shrink-0" style={{ color: p.color }}>
                      <IconCheck />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={onClose}
          className="pressable mt-4 w-full rounded-2xl border border-line bg-surface py-3
                     font-medium text-ink-700 transition-colors duration-150 hover:bg-paper"
        >
          {ca.profileSheet.close}
        </button>
      </div>
    </ModalShell>
  );
}
