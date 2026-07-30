import { useLocation } from 'react-router-dom';
import { ca } from '../i18n/ca';
import { useProfile } from '../state/profile';

/**
 * Títol de pàgina per a mòbil.
 *
 * A mòbil la capçalera "illa" desapareix (la navegació ja és a baix), i amb
 * ella el títol i el color del perfil actiu. Això ho torna a posar dins del
 * contingut, sense cap barra fixa que robi alçada.
 *
 * Es busca la ruta exacta a propòsit: al detall d'un exercici no hi surt res,
 * perquè aquella pàgina ja té el seu `h1` amb el nom de l'exercici i l'enllaç
 * per tornar enrere.
 */
const TITLES: Record<string, string> = {
  '/': ca.nav.resum,
  '/exercicis': ca.nav.exercicis,
  '/sessions': ca.nav.sessions,
  '/importar': ca.nav.importar,
};

export function MobilePageHeader({ onOpenProfile }: { onOpenProfile: () => void }) {
  const { pathname } = useLocation();
  const { active } = useProfile();
  const title = TITLES[pathname];

  if (!title || !active) return null;

  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <h1 className="text-[1.75rem] font-semibold leading-tight tracking-display text-ink-900">
        {title}
      </h1>
      <button
        type="button"
        onClick={onOpenProfile}
        aria-haspopup="dialog"
        aria-label={`${ca.app.profile}: ${active.name}`}
        className="pressable shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold text-white"
        style={{ background: active.color }}
      >
        {active.name}
      </button>
    </div>
  );
}
