import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { sileo } from 'sileo';
import { api } from '../api/client';
import { DatasetPicker } from '../components/DatasetPicker';
import { ExerciseMedia } from '../components/ExerciseMedia';
import { LineTrendChart } from '../components/charts/LineTrendChart';
import { Card, SectionTitle } from '../components/ui/Card';
import { ErrorState, Loading } from '../components/ui/States';
import { ca, translateEquipment, translateGroup, translateMuscle } from '../i18n/ca';
import { fmt } from '../lib/format';
import { riseIn, stagger } from '../lib/motion';
import { useAsync } from '../lib/useAsync';
import { useProfile } from '../state/profile';

export function ExerciciDetall() {
  const { slug: exSlug } = useParams<{ slug: string }>();
  const { active, version } = useProfile();
  const profileSlug = active!.slug;
  const [pickerOpen, setPickerOpen] = useState(false);

  const { data, loading, error, reload } = useAsync(
    () => api.exercise(profileSlug, exSlug!),
    [profileSlug, exSlug, version],
    'exerciciDetall',
  );

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState onRetry={reload} />;

  const unit = data.unit;
  const ds = data.dataset;

  async function pick(datasetId: string | null) {
    await api.setDataset(exSlug!, datasetId);
    setPickerOpen(false);
    reload();
    sileo.success({
      title: datasetId ? ca.detail.mediaSavedToast : ca.detail.mediaClearedToast,
    });
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <Link
        to="/exercicis"
        className="inline-flex items-center gap-2 text-ink-600 transition-colors duration-150
                   hover:text-ink-900"
      >
        <span aria-hidden>←</span> {ca.detail.back}
      </Link>

      {/* El GIF és el protagonista: explica l'exercici millor que cap text. */}
      <motion.div variants={riseIn} className="card overflow-hidden p-0">
        <div className="grid md:grid-cols-[minmax(0,26rem)_1fr]">
          <div className="flex flex-col items-center justify-center gap-3 border-b border-line bg-paper p-6 md:border-b-0 md:border-r">
            {ds ? (
              <>
                <ExerciseMedia
                  image={ds.image}
                  gif={ds.gif}
                  alt={data.name}
                  fallback={ca.exercises.noMedia}
                  className="h-72 w-full rounded-xl bg-surface"
                />
                <p className="text-xs text-ink-400">{ds.attribution}</p>
              </>
            ) : (
              <div className="flex h-72 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line px-4 text-center">
                <p className="text-ink-600">{ca.detail.noMedia}</p>
                <p className="text-sm text-ink-500">{ca.detail.noMediaHint}</p>
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="pressable mt-1 rounded-xl px-5 py-2.5 font-semibold text-white"
                  style={{ background: 'var(--accent)' }}
                >
                  {ca.detail.pickMedia}
                </button>
              </div>
            )}
          </div>

          <div className="p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-display text-ink-900">
                  {data.name}
                </h1>
                <p className="mt-1.5 text-ink-500">
                  {translateGroup(data.muscleGroup)}
                  {ds && ` · ${translateEquipment(ds.equipment)}`}
                </p>
              </div>
              {ds && (
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="pressable rounded-xl border border-line bg-surface px-4 py-2 text-sm
                             text-ink-700 transition-colors duration-150 hover:bg-paper"
                >
                  {ca.detail.changeMedia}
                </button>
              )}
            </div>

            {/* Fila de dades tranquil·la: sense caixes que competeixin. */}
            <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
              <Stat label={ca.detail.stats.sessions} value={String(data.stats.sessions)} />
              <Stat
                label={ca.detail.stats.record}
                value={fmt.weight(data.stats.recordWeight, unit)}
                hint={data.stats.recordDate ? fmt.dateMedium(data.stats.recordDate) : undefined}
              />
              <Stat
                label={ca.detail.stats.progress}
                value={fmt.percent(data.stats.progressPct)}
                tone={(data.stats.progressPct ?? 0) >= 0 ? 'up' : 'down'}
              />
              <Stat label={ca.detail.stats.avgTut} value={fmt.duration(data.stats.avgTut)} />
              <Stat
                label={ca.detail.stats.totalVolume}
                value={`${fmt.number(data.stats.totalVolume)} kg`}
              />
              <Stat
                label={ca.detail.stats.streak}
                value={ca.detail.stats.streakUnit(data.stats.streak)}
              />
            </dl>

            {ds && (
              <div className="mt-7 flex flex-wrap gap-2">
                <span className="chip">
                  {ca.detail.primaryMuscle}: {translateMuscle(ds.target)}
                </span>
                {ds.secondaryMuscles.slice(0, 4).map((m) => (
                  <span key={m} className="chip">
                    {translateMuscle(m)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Gràfics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle title={ca.detail.weightChart} />
          <LineTrendChart
            label={ca.detail.weight}
            data={data.series.map((p) => ({ ...p, value: p.weight }))}
            format={(v) => fmt.decimal(v)}
            tooltipRows={(d) => [
              { label: ca.detail.weight, value: fmt.weight(d.weight, unit) },
              { label: ca.detail.reps, value: fmt.reps(d.reps, d.partialReps) },
              { label: ca.detail.tut, value: fmt.duration(d.tutSeconds) },
            ]}
          />
        </Card>

        <Card>
          <SectionTitle title={ca.detail.repsChart} hint={ca.detail.partialTooltip} />
          <LineTrendChart
            label={ca.detail.reps}
            data={data.series.map((p) => ({ ...p, value: p.reps + p.partialReps }))}
            format={(v) => fmt.number(v)}
            tooltipRows={(d) => [
              { label: ca.detail.reps, value: fmt.reps(d.reps, d.partialReps) },
              { label: ca.detail.weight, value: fmt.weight(d.weight, unit) },
            ]}
          />
        </Card>

        <Card>
          <SectionTitle title={ca.detail.tutChart} />
          <LineTrendChart
            label={ca.detail.tut}
            data={data.series
              .filter((p) => p.tutSeconds !== null)
              .map((p) => ({ ...p, value: p.tutSeconds! }))}
            format={(v) => fmt.duration(v)}
            tooltipRows={(d) => [
              { label: ca.detail.tut, value: fmt.duration(d.tutSeconds) },
              { label: ca.detail.reps, value: fmt.reps(d.reps, d.partialReps) },
            ]}
          />
        </Card>

        <Card>
          <SectionTitle title={ca.detail.volumeChart} hint={ca.detail.volumeChartHint} />
          <LineTrendChart
            label={ca.detail.volume}
            data={data.series.map((p) => ({ ...p, value: p.volume }))}
            format={(v) => fmt.number(v)}
            tooltipRows={(d) => [
              { label: ca.detail.volume, value: fmt.number(d.volume) },
              { label: ca.detail.weight, value: fmt.weight(d.weight, unit) },
              { label: ca.detail.reps, value: fmt.reps(d.reps, d.partialReps) },
            ]}
          />
        </Card>
      </div>

      {/* Historial */}
      <Card>
        <SectionTitle title={ca.detail.history} />
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full min-w-[36rem]">
            <thead>
              <tr className="text-left text-sm text-ink-500">
                <th className="px-2 pb-2 font-medium">{ca.detail.date}</th>
                <th className="px-2 pb-2 text-right font-medium">{ca.detail.weight}</th>
                <th className="px-2 pb-2 text-right font-medium">{ca.detail.change}</th>
                <th className="px-2 pb-2 text-right font-medium">{ca.detail.reps}</th>
                <th className="px-2 pb-2 text-right font-medium">{ca.metrics.tut}</th>
                <th className="px-2 pb-2 text-right font-medium">{ca.detail.volume}</th>
              </tr>
            </thead>
            <tbody>
              {[...data.series].reverse().map((p) => (
                <tr key={p.date} className="border-t border-lineSoft">
                  <td className="px-2 py-3 text-ink-700">
                    {fmt.dateLong(p.date)}
                    <span className="ml-2 text-sm text-ink-400">{fmt.weekday(p.date)}</span>
                  </td>
                  <td className="px-2 py-3 text-right font-semibold tabular-nums text-ink-900">
                    {fmt.weight(p.weight, unit)}
                  </td>
                  <td className="px-2 py-3 text-right tabular-nums">
                    <WeightDelta delta={p.weightDelta} />
                  </td>
                  <td className="px-2 py-3 text-right tabular-nums text-ink-700">
                    {fmt.reps(p.reps, p.partialReps)}
                  </td>
                  <td className="px-2 py-3 text-right tabular-nums text-ink-600">
                    {fmt.duration(p.tutSeconds)}
                  </td>
                  <td className="px-2 py-3 text-right tabular-nums text-ink-600">
                    {fmt.number(p.volume)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <DatasetPicker
        open={pickerOpen}
        currentId={ds?.id ?? null}
        initialQuery={ds?.name ?? ''}
        onClose={() => setPickerOpen(false)}
        onPick={pick}
      />
    </motion.div>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'up' | 'down';
}) {
  return (
    <div>
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd
        className={`mt-0.5 text-lg font-semibold tabular-nums ${
          tone === 'up' ? 'text-up' : tone === 'down' ? 'text-down' : 'text-ink-900'
        }`}
      >
        {value}
      </dd>
      {hint && <p className="text-sm text-ink-400">{hint}</p>}
    </div>
  );
}

/** La fletxa ↑/↓ que surt al PDF: es calcula comparant amb la sessió anterior. */
export function WeightDelta({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-ink-400">—</span>;
  if (delta === 0) return <span className="text-ink-400">=</span>;
  const up = delta > 0;
  return (
    <span className={`font-medium ${up ? 'text-up' : 'text-down'}`}>
      {up ? '↑' : '↓'} {fmt.decimal(Math.abs(delta))}
    </span>
  );
}
