/**
 * Càrrega del dataset d'exercicis (hasaneyldrm/exercises-dataset).
 *
 * El JSON complet fa 17 MB perquè porta instruccions en 10 idiomes. Aquí en guardem
 * només el que fem servir (castellà i anglès) per no inflar la memòria ni les respostes.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface DatasetExercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string;
  muscleGroup: string;
  secondaryMuscles: string[];
  /** Passos, en castellà si n'hi ha (el dataset no porta català). */
  steps: string[];
  image: string;
  gif: string;
  attribution: string;
}

const DATASET_DIR = process.env.DATASET_DIR ?? join(process.cwd(), '../data/exercises-dataset');

/**
 * Alguns noms del dataset porten mojibake (UTF-8 llegit com a cp1251): "sled 45в° leg press".
 * Ho corregim per als casos que hi surten.
 */
function fixMojibake(text: string): string {
  return text
    .replace(/в°/g, '°')
    .replace(/вЂ™/g, '’')
    .replace(/Ã©/g, 'é')
    .replace(/\s+/g, ' ')
    .trim();
}

let cache: DatasetExercise[] | null = null;

export function loadDataset(): DatasetExercise[] {
  if (cache) return cache;

  const path = join(DATASET_DIR, 'data', 'exercises.json');
  if (!existsSync(path)) {
    console.warn(
      `[dataset] No s'ha trobat ${path}. Executa scripts/fetch-dataset.sh per tenir GIFs i fitxes.`,
    );
    cache = [];
    return cache;
  }

  const raw = JSON.parse(readFileSync(path, 'utf8')) as any[];
  cache = raw.map((e) => ({
    id: String(e.id),
    name: fixMojibake(String(e.name ?? '')),
    bodyPart: String(e.body_part ?? ''),
    equipment: String(e.equipment ?? ''),
    target: String(e.target ?? ''),
    muscleGroup: String(e.muscle_group ?? ''),
    secondaryMuscles: Array.isArray(e.secondary_muscles) ? e.secondary_muscles.map(String) : [],
    steps: (e.instruction_steps?.es ?? e.instruction_steps?.en ?? []).map(String),
    image: String(e.image ?? ''),
    gif: String(e.gif_url ?? ''),
    attribution: String(e.attribution ?? ''),
  }));

  console.log(`[dataset] ${cache.length} exercicis carregats.`);
  return cache;
}

export function getDatasetExercise(id: string | null | undefined): DatasetExercise | null {
  if (!id) return null;
  return loadDataset().find((e) => e.id === id) ?? null;
}

/** Cerca simple per al selector manual de la UI. */
export function searchDataset(q: string, limit = 40): DatasetExercise[] {
  const needle = q.trim().toLowerCase();
  const all = loadDataset();
  if (!needle) return all.slice(0, limit);
  const words = needle.split(/\s+/);
  return all
    .filter((e) => {
      const hay = `${e.name} ${e.bodyPart} ${e.equipment} ${e.target}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    })
    .slice(0, limit);
}
