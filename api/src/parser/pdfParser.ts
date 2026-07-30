/**
 * Parser dels PDFs de registre d'entrenament.
 *
 * Els PDFs els genera jsPDF i són una graella: una columna per sessió (data al capdamunt)
 * i una fila per exercici (nom a l'esquerra). Cada cel·la conté pes, repeticions i temps
 * sota tensió. No hi ha estructura de taula al PDF — només text posicionat — així que
 * reconstruïm la graella a partir de les coordenades.
 *
 * La geometria (amplada de columna, alçada de fila) es MESURA a cada document en comptes
 * de codificar-la, perquè funcioni amb taules d'altres mides.
 */
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { parseDate, parseReps, parseTut, parseUnit } from './normalize.js';

export interface ParsedCell {
  weight: number;
  unit: 'kg' | 'p';
  reps: number;
  partialReps: number;
  tutSeconds: number | null;
  /** Marques de l'entrenador (AP/NS/MT). Es guarden però no es mostren: no estan documentades. */
  notes: string[];
}

export interface ParsedExercise {
  name: string;
  /** Una entrada per data; `null` quan la cel·la és buida o té "-". */
  cells: (ParsedCell | null)[];
}

export interface ParsedWorkout {
  /** Dates en format ISO (yyyy-mm-dd), en l'ordre de les columnes. */
  dates: string[];
  exercises: ParsedExercise[];
  warnings: string[];
}

interface Item {
  x: number;
  /** Y mesurat des de dalt de la pàgina. */
  y: number;
  text: string;
}

const DATE_RE = /^\d{2}\/\d{2}\/\d{4}$/;
const NUM_RE = /^\d+(?:[.,]\d+)?$/;
const MINUTES_RE = /^(\d+)'$/;
const SECONDS_RE = /^(\d+)"$/;
const NOTE_RE = /^[A-Z]{2,3}$/;

/** Agrupa valors propers (tolerància) i retorna el centre de cada grup, ordenats. */
function cluster(values: number[], tolerance: number): number[] {
  const sorted = [...values].sort((a, b) => a - b);
  const groups: number[][] = [];
  for (const v of sorted) {
    const last = groups[groups.length - 1];
    if (last && v - last[last.length - 1] <= tolerance) last.push(v);
    else groups.push([v]);
  }
  return groups.map((g) => g.reduce((a, b) => a + b, 0) / g.length);
}

/** Mediana de les diferències consecutives — el "pas" de la graella. */
function medianStep(centers: number[], fallback: number): number {
  if (centers.length < 2) return fallback;
  const diffs = centers.slice(1).map((v, i) => v - centers[i]).sort((a, b) => a - b);
  return diffs[Math.floor(diffs.length / 2)];
}

export async function parseWorkoutPdf(data: Uint8Array): Promise<ParsedWorkout> {
  const warnings: string[] = [];
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1 });
  const content = await page.getTextContent();

  // jsPDF pinta cada text DUES vegades a la mateixa posició (per simular negreta),
  // així que deduplicem per posició + contingut.
  //
  // A més, pdf.js retorna cada crida de dibuix sencera ("58 Kg" en un sol tros), així que
  // partim per espais: cada testimoni s'ha de poder classificar per separat.
  const seen = new Set<string>();
  const items: Item[] = [];
  for (const raw of content.items as any[]) {
    const text = String(raw.str ?? '').trim();
    if (!text) continue;
    const x = raw.transform[4] as number;
    const y = viewport.height - (raw.transform[5] as number);
    const key = `${x.toFixed(1)}|${y.toFixed(1)}|${text}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const parts = text.split(/\s+/).filter(Boolean);
    const width = (raw.width as number) || 0;
    parts.forEach((part, i) => {
      // Repartim l'amplada entre els testimonis perquè conservin l'ordre horitzontal.
      const offset = parts.length > 1 ? (width * i) / parts.length : 0;
      items.push({ x: x + offset, y, text: part });
    });
  }
  await doc.destroy();

  // --- Columnes: les capçaleres de data ---
  const dateItems = items.filter((i) => DATE_RE.test(i.text)).sort((a, b) => a.x - b.x);
  if (dateItems.length === 0) {
    return { dates: [], exercises: [], warnings: ['No s\'ha trobat cap data al PDF.'] };
  }
  const colXs = dateItems.map((i) => i.x);
  const colStep = medianStep(colXs, 76.5);
  const headerY = Math.min(...dateItems.map((i) => i.y));

  // --- Files: els noms d'exercici, a l'esquerra de la primera columna ---
  const labelMaxX = colXs[0] - 20;
  const labelItems = items.filter(
    (i) => i.x < labelMaxX && i.y > headerY + 5 && !/^-+$/.test(i.text),
  );
  const rowYs = cluster(labelItems.map((i) => i.y), 3);
  const rowStep = medianStep(rowYs, 56.7);

  const exercises: ParsedExercise[] = rowYs.map((rowY) => {
    const parts = labelItems
      .filter((i) => Math.abs(i.y - rowY) <= 3)
      .sort((a, b) => a.x - b.x)
      .map((i) => i.text);
    return { name: parts.join(' ').replace(/\s+/g, ' ').trim(), cells: [] };
  });

  // --- Cel·les ---
  // La banda de valors ocupa la part alta del bloc; la fila de marques (fletxes + AP/NS/MT)
  // n'ocupa la part baixa.
  const valueBandEnd = rowStep * 0.62;

  for (let r = 0; r < rowYs.length; r++) {
    const rowY = rowYs[r];
    for (let c = 0; c < colXs.length; c++) {
      const colX = colXs[c];
      const inColumn = (i: Item) => i.x >= colX - colStep * 0.15 && i.x <= colX + colStep * 0.95;

      const valueItems = items
        .filter((i) => inColumn(i) && i.y >= rowY - 2 && i.y <= rowY + valueBandEnd)
        .sort((a, b) => a.y - b.y || a.x - b.x);

      const noteItems = items.filter(
        (i) =>
          inColumn(i) &&
          i.y > rowY + valueBandEnd &&
          i.y < rowY + rowStep - 2 &&
          NOTE_RE.test(i.text),
      );

      const tokens = valueItems.map((i) => i.text);
      let weight: number | null = null;
      let unit: 'kg' | 'p' | null = null;
      let reps: number | null = null;
      let partialReps = 0;
      let minutes: string | null = null;
      let seconds: string | null = null;

      for (let t = 0; t < tokens.length; t++) {
        const tok = tokens[t];
        if (weight === null && NUM_RE.test(tok)) {
          const u = t + 1 < tokens.length ? parseUnit(tokens[t + 1]) : null;
          if (u) {
            weight = parseFloat(tok.replace(',', '.'));
            unit = u;
            t++;
            continue;
          }
        }
        const rep = parseReps(tok);
        if (rep && reps === null) {
          reps = rep.reps;
          partialReps = rep.partialReps;
          continue;
        }
        const min = MINUTES_RE.exec(tok);
        if (min && minutes === null) {
          minutes = min[1];
          continue;
        }
        const sec = SECONDS_RE.exec(tok);
        if (sec && seconds === null) {
          seconds = sec[1];
          continue;
        }
      }

      // Cel·la buida ("-" o res): no és cap dada, no s'ha de guardar com a 0.
      if (weight === null || unit === null || reps === null) {
        exercises[r].cells.push(null);
        if (weight !== null || reps !== null) {
          warnings.push(
            `Cel·la incompleta a «${exercises[r].name}» / columna ${c + 1}: ${tokens.join(' ')}`,
          );
        }
        continue;
      }

      exercises[r].cells.push({
        weight,
        unit,
        reps,
        partialReps,
        tutSeconds: minutes !== null && seconds !== null ? parseTut(minutes, seconds) : null,
        notes: noteItems.sort((a, b) => a.x - b.x).map((i) => i.text),
      });
    }
  }

  return { dates: dateItems.map((i) => parseDate(i.text)), exercises, warnings };
}
