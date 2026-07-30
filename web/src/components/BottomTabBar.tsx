import { NavLink, useLocation } from 'react-router-dom';
import { ca } from '../i18n/ca';
import { activeTabFor } from '../lib/nav';
import { useProfile } from '../state/profile';
import { IconCalendar, IconChart, IconDumbbell, IconUpload } from './icons';

/** Les pestanyes laterals; el "Resum" té el seu propi botó central. */
const SIDE_TABS = [
  { to: '/exercicis', label: ca.nav.exercicis, Icon: IconDumbbell },
  { to: '/sessions', label: ca.nav.sessions, Icon: IconCalendar },
  { to: '/importar', label: ca.nav.importar, Icon: IconUpload },
];

interface Props {
  /** Obre el full de perfils. L'estat viu a `App`: la capçalera de mòbil també l'obre. */
  onOpenProfile: () => void;
  profileOpen: boolean;
}

/**
 * Navegació de mòbil, a l'abast del polze.
 *
 * L'element actiu es marca només amb el color d'accent, sense cap pastilla que
 * llisqui d'una pestanya a l'altra: el botó central trenca la fila pel mig, i
 * una pastilla que hi entrés i en sortís de cop es notava més que no pas
 * ajudava. El que queda és una transició de color de 150 ms — la barra es toca
 * moltes vegades al dia i no ha de demanar atenció.
 */
export function BottomTabBar({ onOpenProfile, profileOpen }: Props) {
  const { pathname } = useLocation();
  const { active } = useProfile();
  const activeTab = activeTabFor(pathname);

  return (
    // El contenidor ocupa tot l'ample per gestionar l'àrea segura, però no ha
    // de capturar els tocs de les franges buides que queden als costats.
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <nav
        className="tabbar-shadow pointer-events-auto relative mx-3 mb-3"
        aria-label={ca.app.title}
      >
        <div
          className="tabbar grid grid-cols-5 items-stretch"
          style={{ height: 'var(--tabbar-h)' }}
        >
          <Tab tab={SIDE_TABS[0]} active={activeTab === SIDE_TABS[0].to} />
          <Tab tab={SIDE_TABS[1]} active={activeTab === SIDE_TABS[1].to} />
          {/* Ranura del botó central: aquí la barra té el mos i el botó es dibuixa a fora. */}
          <div aria-hidden />
          <Tab tab={SIDE_TABS[2]} active={activeTab === SIDE_TABS[2].to} />

          <button
            type="button"
            onClick={onOpenProfile}
            aria-haspopup="dialog"
            aria-expanded={profileOpen}
            className="pressable flex flex-col items-center justify-center gap-1
                       transition-colors duration-150"
            style={profileOpen ? { color: 'var(--accent)' } : undefined}
          >
            {/* El disc amb la inicial fa d'icona i, alhora, diu de qui són les
                dades que s'estan mirant — la feina que abans feia el color de
                la capçalera, que a mòbil ja no hi és. */}
            <span
              className="grid h-[1.375rem] w-[1.375rem] place-items-center rounded-full
                         text-[0.625rem] font-bold uppercase leading-none text-white"
              style={{ background: active?.color ?? 'var(--accent)' }}
              aria-hidden
            >
              {active?.name.charAt(0) ?? '·'}
            </span>
            <TabLabel active={profileOpen}>{ca.nav.perfil}</TabLabel>
          </button>
        </div>

        {/* Botó central: el resum, que és el que s'obre més sovint. Sobresurt
            pel mos de la barra, i per això va fora de `.tabbar` (emmascarada).
            El cercle sempre és del color del perfil; qui diu si la pestanya és
            l'activa és l'etiqueta, igual que a la resta. */}
        <NavLink
          to="/"
          className="pressable absolute bottom-0 left-1/2 w-24 -translate-x-1/2"
          style={{ height: 'var(--tabbar-h)' }}
        >
          <span
            className="absolute left-1/2 top-0 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2
                       place-items-center rounded-full text-white"
            style={{ background: 'var(--accent)' }}
          >
            <IconChart width={24} height={24} strokeWidth={2} />
          </span>
          <span className="absolute inset-x-0 bottom-4 text-center">
            {/* L'estat actiu surt d'`activeTabFor` i no de l'`isActive` del
                `NavLink`: per a `to="/"`, react-router el dona per bo a
                qualsevol ruta (totes comencen per "/"), i el botó central
                s'hauria vist encès sempre. */}
            <TabLabel active={activeTab === '/'}>{ca.nav.resum}</TabLabel>
          </span>
        </NavLink>
      </nav>
    </div>
  );
}

function Tab({
  tab,
  active,
}: {
  tab: { to: string; label: string; Icon: typeof IconChart };
  active: boolean;
}) {
  const { to, label, Icon } = tab;
  return (
    <NavLink
      to={to}
      className="pressable flex flex-col items-center justify-center gap-1 transition-colors duration-150"
      style={active ? { color: 'var(--accent)' } : undefined}
    >
      <Icon width={22} height={22} className={active ? undefined : 'text-ink-500'} />
      <TabLabel active={active}>{label}</TabLabel>
    </NavLink>
  );
}

/** L'etiqueta hereta el color d'accent quan la pestanya és activa. */
function TabLabel({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`block text-[0.6875rem] font-medium leading-none transition-colors duration-150 ${
        active ? '' : 'text-ink-500'
      }`}
      style={active ? { color: 'var(--accent)' } : undefined}
    >
      {children}
    </span>
  );
}
