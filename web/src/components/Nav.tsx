import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { ca } from '../i18n/ca';
import { activeTabFor } from '../lib/nav';
import { IconCalendar, IconChart, IconDumbbell, IconUpload } from './icons';

const TABS = [
  { to: '/', label: ca.nav.resum, Icon: IconChart },
  { to: '/exercicis', label: ca.nav.exercicis, Icon: IconDumbbell },
  { to: '/sessions', label: ca.nav.sessions, Icon: IconCalendar },
  { to: '/importar', label: ca.nav.importar, Icon: IconUpload },
];

/**
 * Pestanyes amb icona i subratllat que llisca entre elles.
 *
 * Només es fa servir a l'escriptori: per sota de 768 px la navegació és
 * `BottomTabBar`, i `App` només en munta una de les dues.
 */
export function Nav() {
  const { pathname } = useLocation();
  const activePath = activeTabFor(pathname);

  return (
    // Sense scroll horitzontal mai: amb `auto`, el layout animat del
    // subratllat (`layoutId`) podia fer aparèixer i desaparèixer la barra de
    // desplaçament a mig moviment, cosa que es notava com un salt estrany.
    // Les pestanyes amaguen el text per sota de `sm` — la capçalera encara ha
    // de cabre entre 768 i ~900 px, on el títol i el selector de perfil ja se
    // n'emporten bona part.
    <nav className="flex items-center justify-center gap-0.5 overflow-hidden sm:gap-1">
      {TABS.map(({ to, label, Icon }) => {
        const isActive = activePath === to;
        return (
          <NavLink
            key={to}
            to={to}
            className={`pressable relative flex items-center gap-1.5 whitespace-nowrap rounded-full
                        px-2.5 py-1.5 text-sm font-medium transition-colors duration-150 sm:px-3.5 sm:text-base ${
                          isActive ? 'text-white' : 'text-white/70 hover:text-white'
                        }`}
          >
            <Icon />
            <span className="hidden sm:inline">{label}</span>
            {isActive && (
              <motion.span
                layoutId="nav-underline"
                className="absolute inset-0 -z-10 rounded-full bg-white/15"
                transition={{ type: 'spring', duration: 0.35, bounce: 0.1 }}
              />
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
