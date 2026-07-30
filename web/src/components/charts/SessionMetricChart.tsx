import { AnimatePresence, motion } from 'framer-motion';
import { useRef } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ca } from '../../i18n/ca';
import { fmt } from '../../lib/format';
import { metricCrossfade } from '../../lib/motion';
import { ChartTooltip } from './ChartTooltip';
import { EmptyChart } from './LineTrendChart';
import { useChartReveal } from './useChartReveal';

export type SessionMetric = 'volume' | 'reps' | 'tutSeconds' | 'exercises';

export interface SessionPoint {
  date: string;
  volume: number;
  exercises: number;
  reps: number;
  tutSeconds: number;
}

export const SESSION_METRICS: { key: SessionMetric; label: string }[] = [
  { key: 'volume', label: ca.metrics.volume },
  { key: 'reps', label: ca.metrics.reps },
  { key: 'tutSeconds', label: ca.metrics.tut },
  { key: 'exercises', label: ca.metrics.exercises },
];

function axisFormat(metric: SessionMetric, value: number): string {
  if (metric === 'tutSeconds') return fmt.duration(value);
  return fmt.number(value);
}

/**
 * Gràfic principal del resum. La sèrie que es mostra la tria l'usuari.
 *
 * En canviar de mètrica es fa un encreuament d'opacitat en comptes de tornar a
 * dibuixar la línia des de zero: el que canvia és què s'està mirant, no que hi
 * hagi dades noves.
 */
export function SessionMetricChart({
  data,
  metric,
  height = 300,
}: {
  data: SessionPoint[];
  metric: SessionMetric;
  height?: number;
}) {
  const { ref, revealed, duration } = useChartReveal();
  const firstMetric = useRef(metric);
  const isFirstMetric = firstMetric.current === metric;

  if (data.length === 0) return <EmptyChart height={height} />;

  return (
    <div ref={ref} style={{ height }}>
      <AnimatePresence mode="wait">
        {revealed && (
          <motion.div key={metric} {...metricCrossfade} style={{ height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="session-metric-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eef0f3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={fmt.dateShort}
                  tick={{ fill: '#6b7280', fontSize: 13 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={20}
                />
                <YAxis
                  tickFormatter={(v) => axisFormat(metric, v)}
                  tick={{ fill: '#6b7280', fontSize: 13 }}
                  axisLine={false}
                  tickLine={false}
                  width={72}
                />
                <Tooltip
                  cursor={{ stroke: '#d1d5db', strokeWidth: 1 }}
                  content={
                    <ChartTooltip
                      rows={(d: SessionPoint) => [
                        { label: ca.metrics.volume, value: `${fmt.number(d.volume)} kg` },
                        { label: ca.metrics.reps, value: fmt.number(d.reps) },
                        { label: ca.metrics.tutLong, value: fmt.longDuration(d.tutSeconds) },
                        { label: ca.metrics.exercises, value: String(d.exercises) },
                      ]}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey={metric}
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                  fill="url(#session-metric-grad)"
                  // Només s'anima el dibuix la primera vegada; en canviar de
                  // mètrica ja hi ha l'encreuament d'opacitat.
                  isAnimationActive={isFirstMetric}
                  animationDuration={duration}
                  animationEasing="ease-out"
                  dot={{ r: 3.5, fill: '#ffffff', stroke: 'var(--accent)', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
