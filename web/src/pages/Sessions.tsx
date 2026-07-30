import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { api } from '../api/client';
import type { SessionDay } from '../api/types';
import { CalendarMonth } from '../components/calendar/CalendarMonth';
import { SessionDayModal } from '../components/calendar/SessionDayModal';
import { StreakFlame } from '../components/calendar/StreakFlame';
import { YearHeatmap } from '../components/calendar/YearHeatmap';
import { Card, SectionTitle } from '../components/ui/Card';
import { EmptyState, ErrorState, Loading } from '../components/ui/States';
import { ca } from '../i18n/ca';
import { parseIso, twelveMonthWindow, weekStreak } from '../lib/calendar';
import { stagger } from '../lib/motion';
import { useAsync } from '../lib/useAsync';
import { useProfile } from '../state/profile';

export function Sessions() {
  const { active, version } = useProfile();
  const slug = active!.slug;
  const { data, loading, error, reload } = useAsync(
    () => api.sessions(slug),
    [slug, version],
    'sessions',
  );

  const [cursor, setCursor] = useState<{ year: number; month: number } | null>(null);
  const [openDay, setOpenDay] = useState<SessionDay | null>(null);

  const derived = useMemo(() => {
    const days = data ?? [];
    const sessionDates = new Set(days.map((d) => d.date));
    const volumeByDate = new Map(days.map((d) => [d.date, d.volume]));
    const byDate = new Map(days.map((d) => [d.date, d]));
    // Ja venen de més recent a més antiga: la darrera de la llista és la primera sessió.
    const firstDate = days.length ? days[days.length - 1].date : null;
    const latestDate = days[0]?.date ?? null;
    return {
      sessionDates,
      volumeByDate,
      byDate,
      firstDate,
      latestDate,
      streak: weekStreak(days.map((d) => d.date)),
    };
  }, [data]);

  // Franja fixa de 12 mesos des de la primera sessió — no depèn del mes que
  // s'estigui mirant al calendari, així sempre comença al mateix lloc.
  const heatmapRange = useMemo(() => {
    if (!derived.firstDate) return null;
    return twelveMonthWindow(parseIso(derived.firstDate));
  }, [derived.firstDate]);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState onRetry={reload} />;
  if (data.length === 0) {
    return <EmptyState title={ca.sessions.empty} hint={ca.overview.noDataHint} />;
  }

  const anchor = parseIso(derived.latestDate!);
  const view = cursor ?? { year: anchor.getFullYear(), month: anchor.getMonth() };

  function move(delta: number) {
    const next = new Date(view.year, view.month + delta, 1);
    setCursor({ year: next.getFullYear(), month: next.getMonth() });
  }

  function openDate(iso: string) {
    const found = derived.byDate.get(iso);
    if (!found) return;
    setOpenDay(found);
    // El calendari de sota salta al mes del dia triat, vingui del mapa de calor
    // o del propi calendari.
    const d = parseIso(iso);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Mapa de calor a tot l'ample; la ratxa és només una insígnia al costat
          del títol — ja diu quantes sessions hi ha hagut (una per setmana),
          no cal repetir el número enlloc més ni donar-li un bloc propi. */}
      <Card>
        <SectionTitle
          title={ca.sessions.yearHeatmap}
          hint={ca.sessions.yearHint}
          action={<StreakFlame weeks={derived.streak} />}
        />
        {heatmapRange && (
          <YearHeatmap
            start={heatmapRange.start}
            end={heatmapRange.end}
            volumeByDate={derived.volumeByDate}
            onPickDate={openDate}
          />
        )}
      </Card>

      {/* Calendari mensual */}
      <Card>
        <CalendarMonth
          year={view.year}
          month={view.month}
          sessionDates={derived.sessionDates}
          selected={openDay?.date ?? null}
          onSelect={openDate}
          onPrev={() => move(-1)}
          onNext={() => move(1)}
        />
      </Card>

      <SessionDayModal day={openDay} onClose={() => setOpenDay(null)} />
    </motion.div>
  );
}
