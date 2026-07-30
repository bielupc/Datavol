import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { ca } from '../../i18n/ca';

export function Loading() {
  return (
    <div className="flex items-center justify-center gap-3 py-24 text-ink-500">
      <motion.span
        className="h-5 w-5 rounded-full border-2 border-line"
        style={{ borderTopColor: 'var(--accent)' }}
        animate={{ transform: 'rotate(360deg)' }}
        transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
      />
      {ca.app.loading}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-ink-600">
      <p>{ca.app.error}</p>
      <button
        type="button"
        onClick={onRetry}
        className="pressable rounded-xl border border-line bg-surface px-5 py-2.5 font-medium
                   text-ink-900 shadow-card"
      >
        {ca.app.retry}
      </button>
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="card flex flex-col items-center gap-2 px-6 py-20 text-center"
    >
      <p className="text-lg font-semibold tracking-title text-ink-900">{title}</p>
      {hint && <p className="max-w-md text-ink-500">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
