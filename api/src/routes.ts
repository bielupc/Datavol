import type { FastifyInstance } from 'fastify';
import { query } from './db.js';
import { getDatasetExercise, searchDataset } from './dataset/loader.js';
import { commitImport, previewImport, undoImport } from './importer.js';
import { buildSeries, computeStats, daysSince, type EntryRow } from './stats.js';

const ENTRY_SELECT = `
  SELECT to_char(s.date, 'YYYY-MM-DD') AS date,
         e.id   AS "exerciseId",
         e.slug AS "exerciseSlug",
         e.name AS "exerciseName",
         en.weight, en.unit, en.reps,
         en.partial_reps AS "partialReps",
         en.tut_seconds  AS "tutSeconds"
    FROM entries en
    JOIN sessions s  ON s.id = en.session_id
    JOIN exercises e ON e.id = en.exercise_id
   WHERE s.profile_id = $1`;

async function profileId(slug: string): Promise<number | null> {
  const rows = await query<{ id: number }>('SELECT id FROM profiles WHERE slug = $1', [slug]);
  return rows[0]?.id ?? null;
}

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    const list = map.get(k);
    if (list) list.push(item);
    else map.set(k, [item]);
  }
  return map;
}

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/health', async () => ({ ok: true }));

  app.get('/api/profiles', async () => {
    return query(
      `SELECT p.slug, p.name, p.color,
              (SELECT count(*) FROM sessions s WHERE s.profile_id = p.id)::int AS sessions
         FROM profiles p ORDER BY p.position`,
    );
  });

  // --- Resum del perfil -----------------------------------------------------
  app.get<{ Params: { slug: string } }>('/api/profiles/:slug/overview', async (req, reply) => {
    const id = await profileId(req.params.slug);
    if (id === null) return reply.code(404).send({ error: 'Perfil no trobat' });

    const entries = await query<EntryRow>(ENTRY_SELECT, [id]);

    if (entries.length === 0) {
      return {
        totals: { sessions: 0, exercises: 0, entries: 0, volume: 0, tutSeconds: 0 },
        avgProgressPct: null,
        lastSessionDate: null,
        daysSinceLast: null,
        volumeBySession: [],
        exerciseProgress: [],
        records: [],
        muscleGroups: [],
        muscleBreakdown: [],
      };
    }

    const byExercise = groupBy(entries, (e) => e.exerciseSlug);
    const exerciseProgress = [...byExercise.entries()].map(([slug, rows]) => {
      const series = buildSeries(rows);
      const stats = computeStats(series);
      return {
        slug,
        name: rows[0].exerciseName,
        unit: rows[0].unit,
        sessions: stats.sessions,
        firstWeight: stats.first?.weight ?? 0,
        lastWeight: stats.last?.weight ?? 0,
        progressPct: stats.progressPct,
        recordWeight: stats.recordWeight,
        recordDate: stats.recordDate,
        totalVolume: stats.totalVolume,
        streak: stats.streak,
      };
    });

    const bySession = groupBy(entries, (e) => e.date);
    const volumeBySession = [...bySession.entries()]
      .map(([date, rows]) => ({
        date,
        volume: rows.reduce((sum, r) => sum + r.weight * r.reps, 0),
        exercises: rows.length,
        tutSeconds: rows.reduce((sum, r) => sum + (r.tutSeconds ?? 0), 0),
        reps: rows.reduce((sum, r) => sum + r.reps, 0),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const withProgress = exerciseProgress.filter((e) => e.progressPct !== null);
    const avgProgressPct = withProgress.length
      ? withProgress.reduce((s, e) => s + (e.progressPct ?? 0), 0) / withProgress.length
      : null;

    const lastSessionDate = volumeBySession[volumeBySession.length - 1].date;

    // El pes més alt de CADA exercici, del més pesat al més lleuger.
    const records = exerciseProgress
      .filter((e) => e.recordDate !== null)
      .map((e) => ({
        slug: e.slug,
        name: e.name,
        weight: e.recordWeight,
        date: e.recordDate!,
        unit: e.unit,
      }))
      .sort((a, b) => b.weight - a.weight);

    const exerciseRows = await query<{ slug: string; muscle_group: string | null }>(
      `SELECT DISTINCT e.slug, e.muscle_group
         FROM exercises e JOIN entries en ON en.exercise_id = e.id
         JOIN sessions s ON s.id = en.session_id WHERE s.profile_id = $1`,
      [id],
    );
    const groupBySlug = new Map(exerciseRows.map((r) => [r.slug, r.muscle_group ?? 'altres']));

    const groupCounts = new Map<string, number>();
    for (const row of exerciseRows) {
      const g = row.muscle_group ?? 'altres';
      groupCounts.set(g, (groupCounts.get(g) ?? 0) + 1);
    }

    // Repartiment de la feina per grup muscular. Es dóna en les tres mètriques
    // perquè la interfície pugui canviar entre elles sense tornar a demanar dades.
    const breakdown = new Map<
      string,
      { group: string; tutSeconds: number; volume: number; reps: number; exercises: Set<string> }
    >();
    for (const e of entries) {
      const group = groupBySlug.get(e.exerciseSlug) ?? 'altres';
      let row = breakdown.get(group);
      if (!row) {
        row = { group, tutSeconds: 0, volume: 0, reps: 0, exercises: new Set() };
        breakdown.set(group, row);
      }
      row.tutSeconds += e.tutSeconds ?? 0;
      row.volume += e.weight * e.reps;
      row.reps += e.reps;
      row.exercises.add(e.exerciseSlug);
    }

    return {
      totals: {
        sessions: bySession.size,
        exercises: byExercise.size,
        entries: entries.length,
        volume: entries.reduce((s, e) => s + e.weight * e.reps, 0),
        tutSeconds: entries.reduce((s, e) => s + (e.tutSeconds ?? 0), 0),
      },
      avgProgressPct,
      lastSessionDate,
      daysSinceLast: daysSince(lastSessionDate),
      volumeBySession,
      exerciseProgress: exerciseProgress.sort((a, b) => (b.progressPct ?? 0) - (a.progressPct ?? 0)),
      records,
      muscleGroups: [...groupCounts.entries()]
        .map(([group, count]) => ({ group, count }))
        .sort((a, b) => b.count - a.count),
      muscleBreakdown: [...breakdown.values()]
        .map((r) => ({
          group: r.group,
          tutSeconds: r.tutSeconds,
          volume: r.volume,
          reps: r.reps,
          exercises: r.exercises.size,
        }))
        .sort((a, b) => b.volume - a.volume),
    };
  });

  // --- Llista d'exercicis ---------------------------------------------------
  app.get<{ Params: { slug: string } }>('/api/profiles/:slug/exercises', async (req, reply) => {
    const id = await profileId(req.params.slug);
    if (id === null) return reply.code(404).send({ error: 'Perfil no trobat' });

    const entries = await query<EntryRow>(ENTRY_SELECT, [id]);
    const meta = await query<{
      slug: string;
      dataset_id: string | null;
      dataset_match: string | null;
      muscle_group: string | null;
    }>('SELECT slug, dataset_id, dataset_match, muscle_group FROM exercises');
    const metaBySlug = new Map(meta.map((m) => [m.slug, m]));

    return [...groupBy(entries, (e) => e.exerciseSlug).entries()]
      .map(([slug, rows]) => {
        const series = buildSeries(rows);
        const stats = computeStats(series);
        const m = metaBySlug.get(slug);
        const ds = getDatasetExercise(m?.dataset_id);
        return {
          slug,
          name: rows[0].exerciseName,
          unit: rows[0].unit,
          muscleGroup: m?.muscle_group ?? null,
          equipment: ds?.equipment ?? null,
          image: ds?.image ?? null,
          gif: ds?.gif ?? null,
          datasetName: ds?.name ?? null,
          sessions: stats.sessions,
          lastWeight: stats.last?.weight ?? 0,
          lastDate: stats.last?.date ?? null,
          progressPct: stats.progressPct,
          recordWeight: stats.recordWeight,
          streak: stats.streak,
          sparkline: series.map((p) => p.weight),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'ca'));
  });

  // --- Detall d'un exercici -------------------------------------------------
  app.get<{ Params: { slug: string; exSlug: string } }>(
    '/api/profiles/:slug/exercises/:exSlug',
    async (req, reply) => {
      const id = await profileId(req.params.slug);
      if (id === null) return reply.code(404).send({ error: 'Perfil no trobat' });

      const rows = await query<EntryRow>(`${ENTRY_SELECT} AND e.slug = $2`, [
        id,
        req.params.exSlug,
      ]);
      const meta = await query<{
        name: string;
        dataset_id: string | null;
        dataset_match: string | null;
        muscle_group: string | null;
      }>('SELECT name, dataset_id, dataset_match, muscle_group FROM exercises WHERE slug = $1', [
        req.params.exSlug,
      ]);
      if (meta.length === 0) return reply.code(404).send({ error: 'Exercici no trobat' });

      const series = buildSeries(rows);
      const ds = getDatasetExercise(meta[0].dataset_id);

      return {
        slug: req.params.exSlug,
        name: meta[0].name,
        unit: rows[0]?.unit ?? 'kg',
        muscleGroup: meta[0].muscle_group,
        datasetMatch: meta[0].dataset_match,
        // Les instruccions pas a pas no s'envien: el GIF ja explica l'exercici,
        // i eren mig quilobyte de castellà per exercici que no es mostrava enlloc.
        dataset: ds && {
          id: ds.id,
          name: ds.name,
          bodyPart: ds.bodyPart,
          equipment: ds.equipment,
          target: ds.target,
          muscleGroup: ds.muscleGroup,
          secondaryMuscles: ds.secondaryMuscles,
          image: ds.image,
          gif: ds.gif,
          attribution: ds.attribution,
        },
        series,
        stats: computeStats(series),
      };
    },
  );

  // --- Sessions -------------------------------------------------------------
  app.get<{ Params: { slug: string } }>('/api/profiles/:slug/sessions', async (req, reply) => {
    const id = await profileId(req.params.slug);
    if (id === null) return reply.code(404).send({ error: 'Perfil no trobat' });

    const entries = await query<EntryRow>(ENTRY_SELECT, [id]);
    // Sèries per exercici per poder marcar la variació de pes de cada registre.
    const deltaByKey = new Map<string, number | null>();
    for (const [slug, rows] of groupBy(entries, (e) => e.exerciseSlug)) {
      for (const p of buildSeries(rows)) deltaByKey.set(`${p.date}|${slug}`, p.weightDelta);
    }

    const meta = await query<{ slug: string; dataset_id: string | null }>(
      'SELECT slug, dataset_id FROM exercises',
    );
    const datasetIdBySlug = new Map(meta.map((m) => [m.slug, m.dataset_id]));

    return [...groupBy(entries, (e) => e.date).entries()]
      .map(([date, rows]) => ({
        date,
        volume: rows.reduce((s, r) => s + r.weight * r.reps, 0),
        tutSeconds: rows.reduce((s, r) => s + (r.tutSeconds ?? 0), 0),
        entries: rows
          .map((r) => {
            const ds = getDatasetExercise(datasetIdBySlug.get(r.exerciseSlug));
            return {
              slug: r.exerciseSlug,
              name: r.exerciseName,
              weight: r.weight,
              unit: r.unit,
              reps: r.reps,
              partialReps: r.partialReps,
              tutSeconds: r.tutSeconds,
              weightDelta: deltaByKey.get(`${date}|${r.exerciseSlug}`) ?? null,
              image: ds?.image ?? null,
              gif: ds?.gif ?? null,
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name, 'ca')),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  });

  // --- Catàleg del dataset --------------------------------------------------
  app.get<{ Querystring: { q?: string } }>('/api/dataset/search', async (req) => {
    return searchDataset(req.query.q ?? '', 40).map((e) => ({
      id: e.id,
      name: e.name,
      bodyPart: e.bodyPart,
      equipment: e.equipment,
      target: e.target,
      image: e.image,
      gif: e.gif,
    }));
  });

  app.put<{ Params: { exSlug: string }; Body: { datasetId: string | null } }>(
    '/api/exercises/:exSlug/dataset',
    async (req, reply) => {
      const ds = req.body.datasetId ? getDatasetExercise(req.body.datasetId) : null;
      if (req.body.datasetId && !ds) {
        return reply.code(400).send({ error: 'Exercici del dataset desconegut' });
      }
      // En treure l'assignació també es treu el grup muscular: venia del catàleg.
      const rows = await query(
        `UPDATE exercises
            SET dataset_id = $2,
                dataset_match = CASE WHEN $2::text IS NULL THEN NULL ELSE 'manual' END,
                muscle_group = $3
          WHERE slug = $1
      RETURNING slug`,
        [req.params.exSlug, req.body.datasetId, ds?.bodyPart ?? null],
      );
      if (rows.length === 0) return reply.code(404).send({ error: 'Exercici no trobat' });
      return { ok: true };
    },
  );

  // --- Importacions ---------------------------------------------------------
  app.get<{ Params: { slug: string } }>('/api/profiles/:slug/imports', async (req, reply) => {
    const id = await profileId(req.params.slug);
    if (id === null) return reply.code(404).send({ error: 'Perfil no trobat' });
    return query(
      `SELECT i.id, i.filename, to_char(i.imported_at, 'YYYY-MM-DD HH24:MI') AS "importedAt",
              i.summary,
              (SELECT count(*) FROM entries e WHERE e.import_id = i.id)::int AS entries
         FROM imports i WHERE i.profile_id = $1 ORDER BY i.imported_at DESC`,
      [id],
    );
  });

  app.post<{ Params: { slug: string } }>(
    '/api/profiles/:slug/imports/preview',
    async (req, reply) => {
      const file = await (req as any).file();
      if (!file) return reply.code(400).send({ error: 'Falta el fitxer PDF' });
      const buffer = await file.toBuffer();
      try {
        return await previewImport(req.params.slug, file.filename, buffer);
      } catch (err) {
        req.log.error(err);
        return reply.code(400).send({ error: (err as Error).message });
      }
    },
  );

  app.post<{ Params: { slug: string } }>(
    '/api/profiles/:slug/imports/commit',
    async (req, reply) => {
      const file = await (req as any).file();
      if (!file) return reply.code(400).send({ error: 'Falta el fitxer PDF' });
      const buffer = await file.toBuffer();
      try {
        return await commitImport(req.params.slug, file.filename, buffer);
      } catch (err) {
        req.log.error(err);
        return reply.code(400).send({ error: (err as Error).message });
      }
    },
  );

  app.delete<{ Params: { id: string } }>('/api/imports/:id', async (req) => {
    await undoImport(parseInt(req.params.id, 10));
    return { ok: true };
  });
}
