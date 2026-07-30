import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ca, translateGroup } from '../../i18n/ca';
import { fmt } from '../../lib/format';
import { metricCrossfade } from '../../lib/motion';
import { useIsDesktop } from '../../lib/useMediaQuery';
import { useChartReveal } from './useChartReveal';

export type MuscleMetric = 'tutSeconds' | 'volume' | 'reps';

export interface MuscleSlice {
  group: string;
  tutSeconds: number;
  volume: number;
  reps: number;
  exercises: number;
}

/**
 * Paleta pensada per a fons blanc: tons prou saturats per distingir-se entre
 * ells i prou foscos perquè el text blanc a sobre es llegeixi.
 */
const PALETTE = [
  '#be185d',
  '#0369a1',
  '#047857',
  '#b45309',
  '#6d28d9',
  '#0e7490',
  '#a21caf',
  '#4d7c0f',
  '#9f1239',
  '#1d4ed8',
];

function formatValue(metric: MuscleMetric, value: number): string {
  if (metric === 'tutSeconds') return fmt.longDuration(value);
  if (metric === 'volume') return `${fmt.number(value)} kg`;
  return `${fmt.number(value)} ${ca.units.reps}`;
}

export function MuscleDonutChart({
  data,
  metric,
  height,
}: {
  data: MuscleSlice[];
  metric: MuscleMetric;
  height?: number;
}) {
  const { ref, revealed, duration } = useChartReveal();
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const isDesktop = useIsDesktop();
  const chartHeight = height ?? (isDesktop ? 300 : 240);

  const slices = data
    .map((d) => ({ ...d, value: d[metric] }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const active = slices.find((s) => s.group === activeGroup) ?? null;
  const centreValue = active ? active.value : total;
  const centreLabel = active ? translateGroup(active.group) : ca.detail.total;

  if (slices.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-line
                   text-ink-500"
        style={{ height: chartHeight }}
      >
        {ca.chart.noData}
      </div>
    );
  }

  return (
    <div ref={ref}>
      <div className="relative" style={{ height: chartHeight }}>
        {revealed && (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="group"
                  innerRadius="62%"
                  outerRadius="92%"
                  paddingAngle={2}
                  strokeWidth={0}
                  animationDuration={duration}
                  animationEasing="ease-out"
                  isAnimationActive
                  onMouseEnter={(_, index) => setActiveGroup(slices[index].group)}
                  onMouseLeave={() => setActiveGroup(null)}
                >
                  {slices.map((slice, i) => (
                    <Cell
                      key={slice.group}
                      fill={PALETTE[i % PALETTE.length]}
                      opacity={activeGroup && activeGroup !== slice.group ? 0.35 : 1}
                      style={{ transition: 'opacity 150ms ease' }}
                    />
                  ))}
                </Pie>
                <Tooltip content={() => null} />
              </PieChart>
            </ResponsiveContainer>

            {/* Centre del formatget: total, o el segment que s'estigui mirant. */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${centreLabel}-${metric}`}
                  {...metricCrossfade}
                  className="text-center"
                >
                  <p className="text-2xl font-semibold tracking-title tabular-nums text-ink-900">
                    {formatValue(metric, centreValue)}
                  </p>
                  <p className="mt-0.5 max-w-[8rem] text-sm text-ink-500">{centreLabel}</p>
                  {active && (
                    <p className="mt-0.5 text-sm font-medium text-ink-600">
                      {fmt.decimal((active.value / total) * 100)} %
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* Llegenda: fa de taula i de control alhora. */}
      <ul className="mt-5 space-y-1">
        {slices.map((slice, i) => (
          <li key={slice.group}>
            <button
              type="button"
              onMouseEnter={() => setActiveGroup(slice.group)}
              onMouseLeave={() => setActiveGroup(null)}
              onFocus={() => setActiveGroup(slice.group)}
              onBlur={() => setActiveGroup(null)}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left
                         transition-colors duration-150 hover:bg-paper"
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ background: PALETTE[i % PALETTE.length] }}
              />
              <span className="min-w-0 flex-1 truncate text-sm text-ink-700">
                {translateGroup(slice.group)}
              </span>
              {/* El percentatge cau a mòbil: amb quatre columnes, el nom del
                  grup es quedava sense amplada i es tallava sempre. El valor
                  absolut és el que costa més de deduir, així que es queda. */}
              <span className="hidden shrink-0 text-sm tabular-nums text-ink-500 sm:inline">
                {fmt.decimal((slice.value / total) * 100)} %
              </span>
              <span className="w-20 shrink-0 text-right text-sm font-medium tabular-nums text-ink-900 sm:w-24">
                {formatValue(metric, slice.value)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
