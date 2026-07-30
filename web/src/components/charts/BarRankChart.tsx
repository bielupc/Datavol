import { motion } from 'framer-motion';
import { fmt } from '../../lib/format';
import { EASE_OUT } from '../../lib/motion';
import { useChartReveal } from './useChartReveal';

export interface RankItem {
  slug: string;
  name: string;
  value: number;
}

/**
 * Rànquing horitzontal. Les barres creixen amb `scaleX` en comptes de `width`:
 * `width` dispara layout i pintat a cada fotograma, `transform` va a la GPU.
 */
export function BarRankChart({
  items,
  onSelect,
}: {
  items: RankItem[];
  onSelect?: (slug: string) => void;
}) {
  const { ref, revealed, reduced } = useChartReveal();
  const maxAbs = Math.max(...items.map((i) => Math.abs(i.value)), 1);

  return (
    <div ref={ref} className="space-y-1">
      {items.map((item, index) => {
        const positive = item.value >= 0;
        const ratio = Math.abs(item.value) / maxAbs;
        return (
          <button
            key={item.slug}
            type="button"
            onClick={() => onSelect?.(item.slug)}
            className="pressable group flex w-full items-center gap-2 rounded-lg px-2 py-2
                       text-left hover:bg-paper sm:gap-3"
          >
            {/* En mòbil el nom es queda estret perquè la barra continuï llegint-se. */}
            <span className="w-20 shrink-0 truncate text-sm text-ink-700 sm:w-48">{item.name}</span>
            <span className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-lineSoft">
              <motion.span
                className="absolute inset-y-0 left-0 w-full origin-left rounded-full"
                style={{ background: positive ? 'var(--accent)' : '#e11d48' }}
                initial={{ transform: `scaleX(${reduced ? ratio : 0})` }}
                animate={revealed ? { transform: `scaleX(${ratio})` } : {}}
                transition={{
                  duration: reduced ? 0 : 0.5,
                  ease: EASE_OUT,
                  delay: reduced ? 0 : index * 0.03,
                }}
              />
            </span>
            <span
              className={`w-14 shrink-0 text-right text-sm font-semibold tabular-nums sm:w-20 ${
                positive ? 'text-up' : 'text-down'
              }`}
            >
              {fmt.percent(item.value)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
