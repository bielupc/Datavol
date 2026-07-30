import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { BarRankChart } from '../components/charts/BarRankChart';
import { MetricSwitcher } from '../components/charts/MetricSwitcher';
import { MuscleDonutChart, type MuscleMetric } from '../components/charts/MuscleDonutChart';
import {
  SESSION_METRICS,
  SessionMetricChart,
  type SessionMetric,
} from '../components/charts/SessionMetricChart';
import { Card, SectionTitle } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { EmptyState, ErrorState, Loading } from '../components/ui/States';
import { ca } from '../i18n/ca';
import { fmt } from '../lib/format';
import { riseIn, stagger } from '../lib/motion';
import { useAsync } from '../lib/useAsync';
import { useProfile } from '../state/profile';

const MUSCLE_METRICS: { key: MuscleMetric; label: string }[] = [
  { key: 'tutSeconds', label: ca.metrics.tut },
  { key: 'volume', label: ca.metrics.volume },
  { key: 'reps', label: ca.metrics.reps },
];

export function Resum() {
  const { active, version } = useProfile();
  const navigate = useNavigate();
  const slug = active!.slug;
  const { data, loading, error, reload } = useAsync(
    () => api.overview(slug),
    [slug, version],
    'overview',
  );

  const [sessionMetric, setSessionMetric] = useState<SessionMetric>('volume');
  const [muscleMetric, setMuscleMetric] = useState<MuscleMetric>('tutSeconds');

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState onRetry={reload} />;

  if (data.totals.sessions === 0) {
    return <EmptyState title={ca.overview.noData} hint={ca.overview.noDataHint} />;
  }

  const ranked = data.exerciseProgress
    .filter((e) => e.progressPct !== null)
    .map((e) => ({ slug: e.slug, name: e.name, value: e.progressPct! }));

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Indicadors principals. A mòbil van de dos en dos: quatre targetes
          apilades empenyien el primer gràfic fora de la primera pantalla. */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label={ca.overview.sessions}
          value={data.totals.sessions}
          format={(v) => fmt.number(v)}
          hint={
            data.lastSessionDate
              ? `${ca.overview.lastSession}: ${fmt.dateMedium(data.lastSessionDate)}`
              : undefined
          }
        />
        <StatCard
          label={ca.overview.exercises}
          value={data.totals.exercises}
          format={(v) => fmt.number(v)}
          hint={`${fmt.number(data.totals.entries)} ${ca.overview.entries.toLowerCase()}`}
        />
        <StatCard
          label={ca.overview.totalVolume}
          value={data.totals.volume}
          format={(v) => fmt.number(v)}
          suffix="kg"
          hint={`${ca.overview.totalTut}: ${fmt.longDuration(data.totals.tutSeconds)}`}
        />
        <StatCard
          label={ca.overview.avgProgress}
          value={data.avgProgressPct ?? 0}
          format={(v) => fmt.percent(v)}
          tone="signed"
          hint={ca.overview.progressChartHint}
        />
      </div>

      {/* Gràfic principal amb selector de mètrica */}
      <Card>
        <SectionTitle
          title={ca.overview.volumeChart}
          hint={sessionMetric === 'volume' ? ca.overview.volumeChartHint : undefined}
          action={
            <MetricSwitcher
              layoutId="session-metric"
              options={SESSION_METRICS}
              value={sessionMetric}
              onChange={setSessionMetric}
            />
          }
        />
        <SessionMetricChart data={data.volumeBySession} metric={sessionMetric} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Repartiment per grup muscular */}
        <Card>
          <SectionTitle
            title={ca.overview.muscleSplit}
            action={
              <MetricSwitcher
                layoutId="muscle-metric"
                options={MUSCLE_METRICS}
                value={muscleMetric}
                onChange={setMuscleMetric}
              />
            }
          />
          <MuscleDonutChart data={data.muscleBreakdown} metric={muscleMetric} />
        </Card>

        {/* Millors marques — totes */}
        <Card>
          <SectionTitle title={ca.overview.records} hint={ca.overview.recordsHint} />
          <ul className="space-y-0.5">
            {data.records.map((r) => (
              <li key={r.slug}>
                <button
                  type="button"
                  onClick={() => navigate(`/exercicis/${r.slug}`)}
                  className="pressable flex w-full items-baseline gap-3 rounded-lg px-2 py-2
                             text-left transition-colors duration-150 hover:bg-paper"
                >
                  {/* A mòbil la data baixa sota el nom: en tres columnes, el
                      nom de l'exercici es quedava amb quatre lletres. */}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-ink-700">{r.name}</span>
                    <span className="block text-sm tabular-nums text-ink-500 sm:hidden">
                      {fmt.dateShort(r.date)}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-ink-900">
                    {fmt.weight(r.weight, r.unit)}
                  </span>
                  <span className="hidden w-16 shrink-0 text-right text-sm tabular-nums text-ink-500 sm:block">
                    {fmt.dateShort(r.date)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Progressió per exercici */}
      <motion.div variants={riseIn}>
        <Card animated={false}>
          <SectionTitle title={ca.overview.progressChart} hint={ca.overview.progressChartHint} />
          <BarRankChart items={ranked} onSelect={(s) => navigate(`/exercicis/${s}`)} />
        </Card>
      </motion.div>
    </motion.div>
  );
}
