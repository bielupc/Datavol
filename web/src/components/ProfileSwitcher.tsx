import { motion } from 'framer-motion';
import { useProfile } from '../state/profile';

/** Selector de perfil. La pastilla activa es desplaça amb `layoutId`. */
export function ProfileSwitcher() {
  const { profiles, active, setActive } = useProfile();

  return (
    // Vidre translúcid en comptes de bg-paper/border-line: la barra ja no és
    // blanca, és de color d'accent, i aquells tons quedarien invisibles.
    <div className="flex shrink-0 items-center gap-0.5 rounded-full border border-white/25 bg-white/10 p-0.5">
      {profiles.map((p) => {
        const isActive = active?.slug === p.slug;
        return (
          <button
            key={p.slug}
            type="button"
            onClick={() => setActive(p.slug)}
            aria-pressed={isActive}
            className="pressable relative rounded-full px-3 py-1.5 text-sm font-semibold
                       transition-colors duration-150 sm:px-4"
            style={{ color: isActive ? p.color : 'rgba(255,255,255,0.75)' }}
          >
            {isActive && (
              // La pastilla activa és blanca (no del color del perfil): com
              // que ara tota la barra ja és d'aquell color, un fons igual
              // quedaria invisible — el blanc hi dona contrast sempre.
              <motion.span
                layoutId="profile-pill"
                className="absolute inset-0 rounded-full bg-white"
                transition={{ type: 'spring', duration: 0.35, bounce: 0.12 }}
              />
            )}
            <span className="relative z-10">{p.name}</span>
          </button>
        );
      })}
    </div>
  );
}
