import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { riseIn } from '../../lib/motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Si la targeta forma part d'una graella amb entrada esglaonada. */
  animated?: boolean;
}

export function Card({ children, className = '', animated = true }: CardProps) {
  const Component = animated ? motion.div : 'div';
  return (
    <Component {...(animated ? { variants: riseIn } : {})} className={`card p-7 ${className}`}>
      {children}
    </Component>
  );
}

/**
 * Títol de secció. El subtítol només s'ha de fer servir quan aclareix una unitat
 * o un concepte; si només repeteix el títol, sobra.
 */
export function SectionTitle({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold tracking-title text-ink-900">{title}</h2>
        {hint && <p className="mt-1 text-sm text-ink-500">{hint}</p>}
      </div>
      {action}
    </div>
  );
}
