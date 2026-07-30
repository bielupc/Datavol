import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { ExerciseMedia } from '../components/ExerciseMedia';
import { Sparkline } from '../components/charts/Sparkline';
import { IconClose, IconSearch } from '../components/icons';
import { EmptyState, ErrorState, Loading } from '../components/ui/States';
import { ca, translateGroup } from '../i18n/ca';
import { fmt } from '../lib/format';
import { riseIn, stagger } from '../lib/motion';
import { useAsync } from '../lib/useAsync';
import { useProfile } from '../state/profile';

export function Exercicis() {
  const { active, version } = useProfile();
  const slug = active!.slug;
  const { data, loading, error, reload } = useAsync(
    () => api.exercises(slug),
    [slug, version],
    'exercicis',
  );

  const [search, setSearch] = useState('');
  const [group, setGroup] = useState<string | null>(null);

  const groups = useMemo(() => {
    const set = new Set<string>();
    for (const e of data ?? []) set.add(e.muscleGroup ?? 'altres');
    return [...set].sort((a, b) => translateGroup(a).localeCompare(translateGroup(b), 'ca'));
  }, [data]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (data ?? []).filter((e) => {
      if (group && (e.muscleGroup ?? 'altres') !== group) return false;
      if (!needle) return true;
      return `${e.name} ${e.datasetName ?? ''}`.toLowerCase().includes(needle);
    });
  }, [data, search, group]);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState onRetry={reload} />;
  if (data.length === 0) {
    return <EmptyState title={ca.overview.noData} hint={ca.overview.noDataHint} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={ca.exercises.search}
            className="w-full rounded-xl border border-line bg-surface py-3 pl-11 pr-10 text-ink-900
                       shadow-card outline-none transition-colors duration-150
                       placeholder:text-ink-400 focus:border-ink-400
                       [&::-webkit-search-cancel-button]:appearance-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label={ca.exercises.clearSearch}
              className="pressable absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
            >
              <IconClose width={16} height={16} />
            </button>
          )}
        </div>
        <p className="text-sm text-ink-500">{ca.exercises.count(filtered.length)}</p>
      </div>

      {/* A mòbil, una tira que es desplaça de costat en comptes d'un bloc que
          embolica: amb vuit grups musculars, els filtres ocupaven quatre línies
          i empenyien la llista fora de la pantalla abans de veure'n res.
          Els marges negatius fan que la tira arribi fins a la vora del
          viewport, així es veu que hi ha més coses a la dreta. */}
      <div
        className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1
                   [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                   sm:mx-0 sm:flex-wrap sm:px-0"
      >
        <FilterChip active={group === null} onClick={() => setGroup(null)}>
          {ca.exercises.filterAll}
        </FilterChip>
        {groups.map((g) => (
          <FilterChip key={g} active={group === g} onClick={() => setGroup(g)}>
            {translateGroup(g)}
          </FilterChip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={ca.exercises.noResults} />
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((ex) => (
            <motion.div key={ex.slug} variants={riseIn}>
              <Link
                to={`/exercicis/${ex.slug}`}
                className="card hover-lift flex h-full flex-col gap-4 p-4 sm:p-5"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <ExerciseMedia
                    image={ex.image}
                    gif={ex.gif}
                    alt={ex.name}
                    playOnHover
                    fallback={ca.exercises.noMedia}
                    className="h-16 w-16 shrink-0 rounded-xl bg-paper p-1 sm:h-20 sm:w-20"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold tracking-title text-ink-900">
                      {ex.name}
                    </h3>
                    <p className="mt-1 text-sm text-ink-500">{translateGroup(ex.muscleGroup)}</p>
                    <p className="text-sm text-ink-400">{ca.exercises.sessions(ex.sessions)}</p>
                  </div>
                </div>

                <div className="mt-auto flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-ink-500">{ca.exercises.current}</p>
                    <p className="text-2xl font-semibold tracking-title tabular-nums text-ink-900">
                      {fmt.weight(ex.lastWeight, ex.unit)}
                    </p>
                    <p
                      className={`text-sm font-semibold tabular-nums ${
                        (ex.progressPct ?? 0) > 0
                          ? 'text-up'
                          : (ex.progressPct ?? 0) < 0
                            ? 'text-down'
                            : 'text-ink-400'
                      }`}
                    >
                      {fmt.percent(ex.progressPct)}
                    </p>
                  </div>
                  <span className="shrink-0">
                    <Sparkline values={ex.sparkline} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pressable shrink-0 whitespace-nowrap rounded-full border px-4 py-2
                  text-sm font-medium transition-colors duration-150 ${
                    active
                      ? 'border-transparent text-white'
                      : 'border-line bg-surface text-ink-600 hover:bg-paper'
                  }`}
      style={active ? { background: 'var(--accent)' } : undefined}
    >
      {children}
    </button>
  );
}
