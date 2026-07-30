/**
 * Comprovació del parser contra els PDFs reals.
 * Ús: npm run parser:check -- ../1.pdf ../2.pdf
 * Sense arguments comprova els dos PDFs de la carpeta arrel i valida uns quants valors coneguts.
 */
import { readFileSync } from 'node:fs';
import { parseWorkoutPdf } from './pdfParser.js';

interface Expectation {
  file: string;
  exercise: string;
  date: string;
  weight?: number;
  unit?: string;
  reps?: number;
  partialReps?: number;
  tutSeconds?: number;
  notes?: string[];
  empty?: boolean;
}

/**
 * Valors llegits a ull del PDF renderitzat, no copiats de la sortida del parser:
 * si es copiessin, la comprovació no comprovaria res.
 */
const EXPECTED: Expectation[] = [
  // 1.pdf
  { file: '1.pdf', exercise: 'ABDOMINAL MEDX', date: '2026-05-20', weight: 45, unit: 'kg', reps: 10, tutSeconds: 171, notes: ['NF'] },
  // "2+3r": 2 completes i 3 d'incompletes
  { file: '1.pdf', exercise: 'ABDOMINAL MEDX', date: '2026-05-27', weight: 55, reps: 2, partialReps: 3, tutSeconds: 36 },
  { file: '1.pdf', exercise: 'LEG PRESS', date: '2026-05-20', weight: 104, unit: 'kg', reps: 4, partialReps: 1, tutSeconds: 63 },
  { file: '1.pdf', exercise: 'LEG PRESS', date: '2026-06-10', weight: 92, reps: 8, tutSeconds: 132, notes: ['AP', 'NS'] },
  { file: '1.pdf', exercise: 'HIP ABduccion', date: '2026-07-08', weight: 88, unit: 'kg', reps: 6, partialReps: 1, tutSeconds: 101 },
  { file: '1.pdf', exercise: 'REM MEDX', date: '2026-05-20', weight: 72, reps: 10, tutSeconds: 176 },

  // 2.pdf — ROTARY Esquerre és l'únic exercici en plaques, no en quilos
  { file: '2.pdf', exercise: 'ROTARY Esquerre', date: '2026-07-15', weight: 20, unit: 'p', reps: 7, partialReps: 1, tutSeconds: 121, notes: ['MT', 'NS'] },
  { file: '2.pdf', exercise: 'ROTARY Esquerre', date: '2026-07-29', weight: 20, unit: 'p', reps: 8, tutSeconds: 151 },
  { file: '2.pdf', exercise: 'ROTARY Dreta', date: '2026-07-22', weight: 15, unit: 'kg', reps: 10, tutSeconds: 172 },
  { file: '2.pdf', exercise: 'PULL DOWN MEDX', date: '2026-07-15', weight: 72, reps: 10, tutSeconds: 182, notes: ['NF'] },
  // La primera sessió d'aquest exercici és un "-": no hi ha dada
  { file: '2.pdf', exercise: 'LUMBAR MEDX', date: '2026-07-15', empty: true },
];

const files = process.argv.slice(2);
const targets = files.length ? files : ['../1.pdf', '../2.pdf'];

let failures = 0;

for (const path of targets) {
  const name = path.split('/').pop()!;
  const parsed = await parseWorkoutPdf(new Uint8Array(readFileSync(path)));

  const filled = parsed.exercises.reduce(
    (n, ex) => n + ex.cells.filter((c) => c !== null).length,
    0,
  );
  console.log(`\n=== ${name} — ${parsed.dates.length} sessions, ${parsed.exercises.length} exercicis, ${filled} registres`);
  console.log(`    dates: ${parsed.dates.join(', ')}`);
  for (const ex of parsed.exercises) {
    const cells = ex.cells
      .map((c) =>
        c
          ? `${c.weight}${c.unit}/${c.reps}${c.partialReps ? '+' + c.partialReps : ''}/${c.tutSeconds}s${c.notes.length ? '[' + c.notes.join(',') + ']' : ''}`
          : '—',
      )
      .join('  ');
    console.log(`    ${ex.name.padEnd(18)} ${cells}`);
  }
  if (parsed.warnings.length) console.log('    avisos:', parsed.warnings);

  for (const e of EXPECTED.filter((x) => x.file === name)) {
    const ex = parsed.exercises.find((x) => x.name === e.exercise);
    const idx = parsed.dates.indexOf(e.date);
    const cell = ex && idx >= 0 ? ex.cells[idx] : undefined;
    const fail = (msg: string) => {
      console.error(`    ✗ ${e.exercise} ${e.date}: ${msg}`);
      failures++;
    };
    if (!ex) { fail('exercici no trobat'); continue; }
    if (idx < 0) { fail('data no trobada'); continue; }
    if (e.empty) {
      if (cell !== null) fail(`s'esperava cel·la buida, s'ha rebut ${JSON.stringify(cell)}`);
      else console.log(`    ✓ ${e.exercise} ${e.date} buida`);
      continue;
    }
    if (!cell) { fail('cel·la buida inesperada'); continue; }
    const checks: [string, unknown, unknown][] = [];
    if (e.weight !== undefined) checks.push(['pes', cell.weight, e.weight]);
    if (e.unit !== undefined) checks.push(['unitat', cell.unit, e.unit]);
    if (e.reps !== undefined) checks.push(['reps', cell.reps, e.reps]);
    if (e.partialReps !== undefined) checks.push(['reps parcials', cell.partialReps, e.partialReps]);
    if (e.tutSeconds !== undefined) checks.push(['tut', cell.tutSeconds, e.tutSeconds]);
    if (e.notes !== undefined) checks.push(['marques', cell.notes.join(','), e.notes.join(',')]);
    let ok = true;
    for (const [label, got, want] of checks) {
      if (got !== want) { fail(`${label}: s'esperava ${want}, s'ha rebut ${got}`); ok = false; }
    }
    if (ok) console.log(`    ✓ ${e.exercise} ${e.date}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} comprovacions han fallat.`);
  process.exit(1);
}
console.log('\nTotes les comprovacions passen.');
