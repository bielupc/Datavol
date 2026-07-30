import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ca } from '../../i18n/ca';
import { fmt } from '../../lib/format';
import { useIsDesktop } from '../../lib/useMediaQuery';
import { ChartTooltip } from './ChartTooltip';
import { useChartReveal } from './useChartReveal';

export interface LineTrendPoint {
  date: string;
  value: number;
  [key: string]: unknown;
}

interface Props {
  data: LineTrendPoint[];
  /** Com es formata el valor a l'eix. */
  format: (v: number) => string;
  label: string;
  height?: number;
  color?: string;
  /** Files del tooltip. */
  tooltipRows?: (data: any) => { label: string; value: string }[];
}

/** Línia amb àrea degradada, que es dibuixa quan el gràfic entra a la vista. */
export function LineTrendChart({
  data,
  format,
  label,
  height,
  color = 'var(--accent)',
  tooltipRows,
}: Props) {
  const { ref, revealed, duration } = useChartReveal();
  const gradientId = `grad-${label.replace(/\W/g, '')}`;
  // A la fitxa d'un exercici n'hi ha quatre, un sota l'altre: a 260 px cadascun
  // eren més de 1.000 px de gràfics seguits en un telèfon.
  const isDesktop = useIsDesktop();
  const chartHeight = height ?? (isDesktop ? 260 : 200);

  if (data.length === 0) return <EmptyChart height={chartHeight} />;

  // Marge del 12 % perquè la línia no toqui les vores.
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max((max - min) * 0.12, max * 0.03, 0.5);

  return (
    <div ref={ref} style={{ height: chartHeight }}>
      {revealed && (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#eef0f3" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={fmt.dateShort}
              tick={{ fill: '#6b7280', fontSize: isDesktop ? 13 : 11 }}
              axisLine={false}
              tickLine={false}
              minTickGap={isDesktop ? 20 : 28}
            />
            <YAxis
              domain={[min - pad, max + pad]}
              tickFormatter={format}
              tick={{ fill: '#6b7280', fontSize: isDesktop ? 13 : 11 }}
              axisLine={false}
              tickLine={false}
              width={isDesktop ? 64 : 42}
            />
            <Tooltip
              cursor={{ stroke: '#d1d5db', strokeWidth: 1 }}
              content={<ChartTooltip rows={tooltipRows} />}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="none"
              fill={`url(#${gradientId})`}
              animationDuration={duration}
              animationEasing="ease-out"
              isAnimationActive
            />
            <Line
              type="monotone"
              dataKey="value"
              name={label}
              stroke={color}
              strokeWidth={2.5}
              animationDuration={duration}
              animationEasing="ease-out"
              isAnimationActive
              dot={{ r: 3.5, fill: '#ffffff', stroke: color, strokeWidth: 2 }}
              activeDot={{ r: 6, fill: color, stroke: '#ffffff', strokeWidth: 2.5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function EmptyChart({ height }: { height: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl border border-dashed border-line
                 text-ink-500"
      style={{ height }}
    >
      {ca.chart.noData}
    </div>
  );
}
