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
    <motion.div variants={riseIn} className="card p-6">
      <p className="text-sm font-medium text-ink-600">{label}</p>
      <p className={`mt-2 text-3xl font-semibold tracking-title tabular-nums ${signedClass}`}>
        <AnimatedNumber value={value} format={format} />
        {suffix && <span className="ml-1.5 text-xl font-normal text-ink-500">{suffix}</span>}
      </p>
      {hint && <p className="mt-2 text-sm leading-snug text-ink-500">{hint}</p>}
    </motion.div>
  );
}
