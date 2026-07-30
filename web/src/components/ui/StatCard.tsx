import { motion } from 'framer-motion';
import { riseIn } from '../../lib/motion';
import { AnimatedNumber } from './AnimatedNumber';

interface Props {
  label: string;
  value: number;
  format: (v: number) => string;
  suffix?: string;
  hint?: string;
  /** Verd si és positiu, vermell si és negatiu; per a variacions. */
  tone?: 'neutral' | 'signed';
}

export function StatCard({ label, value, format, suffix, hint, tone = 'neutral' }: Props) {
  const signedClass =
    tone === 'signed' ? (value > 0 ? 'text-up' : value < 0 ? 'text-down' : '') : 'text-ink-900';

  return (
    <motion.div variants={riseIn} className="card p-4 sm:p-6">
      <p className="text-sm font-medium text-ink-600">{label}</p>
      {/* `flex-wrap` i no un `margin` a la unitat: a mòbil aquestes targetes
          van de dues en dues i un número llarg amb la unitat al costat no hi
          cabia. Entre dos elements flex hi ha punt de salt de línia; entre dos
          `span` en línia sense cap espai, no. */}
      <p
        className={`mt-1.5 flex flex-wrap items-baseline gap-x-1.5 text-[1.625rem] font-semibold
                    leading-tight tracking-title tabular-nums sm:mt-2 sm:text-3xl ${signedClass}`}
      >
        <AnimatedNumber value={value} format={format} />
        {suffix && <span className="text-lg font-normal text-ink-500 sm:text-xl">{suffix}</span>}
      </p>
      {hint && <p className="mt-1.5 text-xs leading-snug text-ink-500 sm:mt-2 sm:text-sm">{hint}</p>}
    </motion.div>
  );
}
