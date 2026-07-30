/**
 * Llavor inicial: crea els dos perfils i importa els PDFs originals al de la Sandra.
 * És idempotent — es pot executar a cada arrencada sense duplicar res.
 *
 * Els slugs ('mama'/'papa') són identificadors interns i no es veuen enlloc de
 * la interfície — només hi surt el `name`. Es mantenen perquè les taules
 * `sessions`/`imports` ja hi referencien.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { query } from './db.js';
import { commitImport } from './importer.js';

const SEED_DIR = process.env.SEED_DIR ?? join(process.cwd(), '..');

// Tons prou foscos per llegir-se sobre blanc i per portar text blanc a sobre.
const PROFILES = [
  { slug: 'mama', name: 'Sandra', color: '#be185d', position: 0 },
  { slug: 'papa', name: 'Jordi', color: '#0369a1', position: 1 },
];

/** Els dos PDFs inicials són tots dos de la Sandra (canvi de rutina el 15/07). */
const SEED_PDFS = [
  { file: '1.pdf', profile: 'mama' },
  { file: '2.pdf', profile: 'mama' },
];

export async function seed(): Promise<void> {
  for (const p of PROFILES) {
    await query(
      `INSERT INTO profiles (slug, name, color, position) VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, color = EXCLUDED.color`,
      [p.slug, p.name, p.color, p.position],
    );
  }

  for (const { file, profile } of SEED_PDFS) {
    const path = join(SEED_DIR, file);
    if (!existsSync(path)) {
      console.warn(`[llavor] ${path} no existeix, s'omet.`);
      continue;
    }
    const buffer = readFileSync(path);
    const result = await commitImport(profile, file, buffer);
    console.log(
      `[llavor] ${file} → ${profile}: ${result.entriesWritten} registres, ` +
        `${result.sessionsCreated} sessions noves, ${result.exercisesCreated} exercicis nous.`,
    );
  }
}
