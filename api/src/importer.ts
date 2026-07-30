/**
 * Importació d'un PDF a la base de dades.
 *
 * El mateix codi el fa servir la llavor inicial i la pestanya "Importar", de manera que
 * només hi ha un camí possible per a les dades.
 *
 * Funciona en dos passos: `preview` no escriu res i explica què passaria; `commit` aplica.
 * Tot és idempotent (upsert per sessió+exercici), així que reimportar un PDF no duplica res.
 */
import { createHash } from 'node:crypto';
import type { PoolClient } from 'pg';
import { query, transaction } from './db.js';
import { matchExercise } from './dataset/match.js';
import { slugify } from './parser/normalize.js';
import { parseWorkoutPdf, type ParsedWorkout } from './parser/pdfParser.js';

export interface ImportPreview {
  filename: string;
  sha256: string;
  dates: string[];
  alreadyImported: boolean;
  newSessions: string[];
  knownSessions: string[];
  newExercises: {
    name: string;
    slug: string;
    matchedName: string | null;
    matchedId: string | null;
    matchKind: string | null;
  }[];
  knownExercises: string[];
  newEntries: number;
  duplicateEntries: number;
  warnings: string[];
}

async function getProfile(slug: string): Promise<{ id: number } | null> {
  const rows = await query<{ id: number }>('SELECT id FROM profiles WHERE slug = $1', [slug]);
  return rows[0] ?? null;
}

export function hashPdf(buffer: Buffer | Uint8Array): string {
  return createHash('sha256').update(buffer).digest('hex');
}

export async function previewImport(
  profileSlug: string,
  filename: string,
  buffer: Buffer,
): Promise<ImportPreview> {
  const profile = await getProfile(profileSlug);
  if (!profile) throw new Error(`Perfil desconegut: ${profileSlug}`);

  const parsed = await parseWorkoutPdf(new Uint8Array(buffer));
  const sha256 = hashPdf(buffer);

  const already = await query('SELECT 1 FROM imports WHERE profile_id = $1 AND sha256 = $2', [
    profile.id,
    sha256,
  ]);

  const existingSessions = await query<{ date: string }>(
    'SELECT to_char(date, \'YYYY-MM-DD\') AS date FROM sessions WHERE profile_id = $1',
    [profile.id],
  );
  const existingDates = new Set(existingSessions.map((r) => r.date));

  const existingExercises = await query<{ slug: string }>('SELECT slug FROM exercises');
  const existingSlugs = new Set(existingExercises.map((r) => r.slug));

  const existingEntries = await query<{ date: string; slug: string }>(
    `SELECT to_char(s.date, 'YYYY-MM-DD') AS date, e.slug
       FROM entries en
       JOIN sessions s ON s.id = en.session_id
       JOIN exercises e ON e.id = en.exercise_id
      WHERE s.profile_id = $1`,
    [profile.id],
  );
  const existingPairs = new Set(existingEntries.map((r) => `${r.date}|${r.slug}`));

  const newExercises: ImportPreview['newExercises'] = [];
  const knownExercises: string[] = [];
  let newEntries = 0;
  let duplicateEntries = 0;

  for (const ex of parsed.exercises) {
    const slug = slugify(ex.name);
    if (existingSlugs.has(slug)) {
      knownExercises.push(ex.name);
    } else {
      const match = matchExercise(ex.name);
      newExercises.push({
        name: ex.name,
        slug,
        matchedName: match?.exercise.name ?? null,
        matchedId: match?.exercise.id ?? null,
        matchKind: match?.kind ?? null,
      });
    }
    ex.cells.forEach((cell, i) => {
      if (!cell) return;
      if (existingPairs.has(`${parsed.dates[i]}|${slug}`)) duplicateEntries++;
      else newEntries++;
    });
  }

  return {
    filename,
    sha256,
    dates: parsed.dates,
    alreadyImported: already.length > 0,
    newSessions: parsed.dates.filter((d) => !existingDates.has(d)),
    knownSessions: parsed.dates.filter((d) => existingDates.has(d)),
    newExercises,
    knownExercises,
    newEntries,
    duplicateEntries,
    warnings: parsed.warnings,
  };
}

async function upsertExercise(
  client: PoolClient,
  name: string,
  unit: string,
): Promise<number> {
  const slug = slugify(name);
  const existing = await client.query('SELECT id FROM exercises WHERE slug = $1', [slug]);
  if (existing.rows.length) return existing.rows[0].id;

  const match = matchExercise(name);
  const res = await client.query(
    `INSERT INTO exercises (slug, name, default_unit, dataset_id, dataset_match, muscle_group)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [
      slug,
      name,
      unit,
      match?.exercise.id ?? null,
      match?.kind ?? null,
      match?.exercise.bodyPart ?? null,
    ],
  );
  return res.rows[0].id;
}

export interface ImportResult {
  importId: number;
  sessionsCreated: number;
  entriesWritten: number;
  exercisesCreated: number;
}

export async function commitImport(
  profileSlug: string,
  filename: string,
  buffer: Buffer,
): Promise<ImportResult> {
  const profile = await getProfile(profileSlug);
  if (!profile) throw new Error(`Perfil desconegut: ${profileSlug}`);

  const parsed: ParsedWorkout = await parseWorkoutPdf(new Uint8Array(buffer));
  const sha256 = hashPdf(buffer);

  return transaction(async (client) => {
    const importRow = await client.query(
      `INSERT INTO imports (profile_id, filename, sha256, summary)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (profile_id, sha256)
       DO UPDATE SET filename = EXCLUDED.filename, imported_at = now()
       RETURNING id`,
      [
        profile.id,
        filename,
        sha256,
        JSON.stringify({ dates: parsed.dates, exercises: parsed.exercises.map((e) => e.name) }),
      ],
    );
    const importId: number = importRow.rows[0].id;

    let sessionsCreated = 0;
    const sessionIds: number[] = [];
    for (const date of parsed.dates) {
      const existing = await client.query(
        'SELECT id FROM sessions WHERE profile_id = $1 AND date = $2',
        [profile.id, date],
      );
      if (existing.rows.length) {
        sessionIds.push(existing.rows[0].id);
      } else {
        const res = await client.query(
          'INSERT INTO sessions (profile_id, date) VALUES ($1, $2) RETURNING id',
          [profile.id, date],
        );
        sessionIds.push(res.rows[0].id);
        sessionsCreated++;
      }
    }

    let entriesWritten = 0;
    let exercisesCreated = 0;
    for (const ex of parsed.exercises) {
      const firstCell = ex.cells.find((c) => c !== null);
      const before = await client.query('SELECT 1 FROM exercises WHERE slug = $1', [
        slugify(ex.name),
      ]);
      const exerciseId = await upsertExercise(client, ex.name, firstCell?.unit ?? 'kg');
      if (before.rows.length === 0) exercisesCreated++;

      for (let i = 0; i < ex.cells.length; i++) {
        const cell = ex.cells[i];
        if (!cell) continue;
        await client.query(
          `INSERT INTO entries
             (session_id, exercise_id, weight, unit, reps, partial_reps, tut_seconds, notes, import_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (session_id, exercise_id) DO UPDATE SET
             weight = EXCLUDED.weight,
             unit = EXCLUDED.unit,
             reps = EXCLUDED.reps,
             partial_reps = EXCLUDED.partial_reps,
             tut_seconds = EXCLUDED.tut_seconds,
             notes = EXCLUDED.notes`,
          [
            sessionIds[i],
            exerciseId,
            cell.weight,
            cell.unit,
            cell.reps,
            cell.partialReps,
            cell.tutSeconds,
            cell.notes,
            importId,
          ],
        );
        entriesWritten++;
      }
    }

    return { importId, sessionsCreated, entriesWritten, exercisesCreated };
  });
}

/** Desfà una importació: esborra els seus registres i les sessions que quedin buides. */
export async function undoImport(importId: number): Promise<void> {
  await transaction(async (client) => {
    await client.query('DELETE FROM entries WHERE import_id = $1', [importId]);
    await client.query(
      `DELETE FROM sessions s
        WHERE NOT EXISTS (SELECT 1 FROM entries e WHERE e.session_id = s.id)`,
    );
    await client.query(
      `DELETE FROM exercises x
        WHERE NOT EXISTS (SELECT 1 FROM entries e WHERE e.exercise_id = x.id)`,
    );
    await client.query('DELETE FROM imports WHERE id = $1', [importId]);
  });
}
