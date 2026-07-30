import type { TooltipProps } from 'recharts';
import { fmt } from '../../lib/format';

interface Row {
  label: string;
  value: string;
}

/** Tooltip clar i compacte, compartit per tots els gràfics. */
export function ChartTooltip({
  active,
  payload,
  label,
  rows,
}: TooltipProps<number, string> & {
  rows?: (data: any) => Row[];
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  const content: Row[] = rows
    ? rows(data)
    : payload.map((p) => ({
        label: String(p.name ?? ''),
        value: fmt.decimal(Number(p.value ?? 0)),
      }));

  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3 shadow-pop">
      <p className="mb-1.5 text-sm font-semibold text-ink-900">
        {typeof label === 'string' ? fmt.dateLong(label) : label}
      </p>
      <div className="space-y-1">
        {content.map((row) => (
          <p key={row.label} className="flex gap-6 text-sm text-ink-600">
            <span className="flex-1">{row.label}</span>
            <span className="font-semibold tabular-nums text-ink-900">{row.value}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
