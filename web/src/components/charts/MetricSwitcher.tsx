import { motion } from 'framer-motion';

export interface MetricOption<T extends string> {
  key: T;
  label: string;
}

/**
 * Selector de mètrica. La pastilla activa es desplaça amb `layoutId` (molla
 * interrompible), així es veu d'on ve i cap on va.
 */
export function MetricSwitcher<T extends string>({
  options,
  value,
  onChange,
  /** Ha de ser únic per pàgina: identifica la pastilla que es desplaça. */
  layoutId,
}: {
  options: MetricOption<T>[];
  value: T;
  onChange: (key: T) => void;
  layoutId: string;
}) {
  return (
    <div
      role="tablist"
      // En pantalles estretes els botons s'estrenyen i, si encara no hi caben,
      // la tira es desplaça horitzontalment en comptes de trencar la pàgina.
      className="flex max-w-full items-center gap-0.5 overflow-x-auto rounded-xl border
                 border-line bg-paper p-1"
    >
      {options.map((option) => {
        const active = option.key === value;
        return (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.key)}
            className={`pressable relative shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1.5
                        text-sm font-medium transition-colors duration-150 sm:px-3.5 ${
                          active ? 'text-ink-900' : 'text-ink-500 hover:text-ink-700'
                        }`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-lg bg-surface shadow-card"
                transition={{ type: 'spring', duration: 0.35, bounce: 0.12 }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
