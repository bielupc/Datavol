/**
 * Emparellament entre els noms d'exercici del PDF i el dataset.
 *
 * Els noms del PDF són del gimnàs, en una barreja de català i castellà, sovint amb la marca
 * de la màquina ("MEDX") o l'accessori ("barra B"). El dataset és en anglès. Fem servir:
 *   1. un mapa curat per als exercicis que ja coneixem,
 *   2. si no, una puntuació per paraules amb traducció dels termes habituals.
 */
import { slugify } from '../parser/normalize.js';
import { loadDataset, type DatasetExercise } from './loader.js';

export type MatchKind = 'curat' | 'automatic' | 'manual';

/** Correspondències verificades a mà per als exercicis dels PDFs actuals. */
const CURATED: Record<string, string> = {
  'hip-abduccion': '0597', // lever seated hip abduction
  'delt-press-medx': '0603', // lever shoulder press
  'leg-press': '1463', // sled 45° leg press (side pov)
  'lumbar-extension': '0573', // lever back extension
  'lumbar-medx': '0573',
  'rem-medx': '0588', // lever narrow grip seated row
  'abdominal-medx': '1452', // lever seated crunch
  'triceps-barra-b': '0201', // cable pushdown
  'pectoral-press-b': '0577', // lever chest press
  'leg-extension': '0585', // lever leg extension
  'leg-curl': '0599', // lever seated leg curl
  'pull-down-medx': '0579', // lever front pulldown
};

/** Els mateixos, per nom, per si els identificadors canvien entre versions del dataset. */
const CURATED_BY_NAME: Record<string, string> = {
  'hip-abduccion': 'lever seated hip abduction',
  'delt-press-medx': 'lever shoulder press',
  'leg-press': 'sled 45° leg press (side pov)',
  'lumbar-extension': 'lever back extension',
  'lumbar-medx': 'lever back extension',
  'rem-medx': 'lever narrow grip seated row',
  'abdominal-medx': 'lever seated crunch',
  'triceps-barra-b': 'cable pushdown',
  'pectoral-press-b': 'lever chest press',
  'leg-extension': 'lever leg extension',
  'leg-curl': 'lever seated leg curl',
  'pull-down-medx': 'lever front pulldown',
};

/**
 * Exercicis que sabem que NO tenen equivalent al dataset. Sense això, la cerca automàtica
 * els assigna coses absurdes (ROTARY → "lever rotary calf", que són bessons).
 * Val més deixar-los sense GIF i que l'usuari en triï un des de la UI.
 */
const NO_MATCH = new Set(['rotary-esquerre', 'rotary-dreta']);

/** Marques i accessoris que no aporten res a la cerca. */
const NOISE = new Set(['medx', 'b', 'barra', 'maquina', 'machine']);

/** Termes cat/es → en per acostar els noms al vocabulari del dataset. */
const TRANSLATIONS: Record<string, string> = {
  rem: 'row',
  pectoral: 'chest press',
  abdominal: 'crunch',
  lumbar: 'back extension',
  esquerre: '',
  esquerra: '',
  dreta: '',
  dret: '',
  abduccion: 'abduction',
  abduccio: 'abduction',
  adduccion: 'adduction',
  adduccio: 'adduction',
  cama: 'leg',
  cames: 'leg',
  pierna: 'leg',
  piernas: 'leg',
  espatlla: 'shoulder',
  hombro: 'shoulder',
  esquena: 'back',
  espalda: 'back',
  biceps: 'biceps',
  triceps: 'triceps',
  gluti: 'glute',
  gluteo: 'glute',
  panxa: 'abs',
  delt: 'shoulder',
  premsa: 'press',
  prensa: 'press',
};

function tokenize(name: string): string[] {
  const out: string[] = [];
  for (const word of slugify(name).split('-')) {
    if (!word || NOISE.has(word)) continue;
    const translated = TRANSLATIONS[word];
    if (translated === '') continue;
    for (const part of (translated ?? word).split(' ')) if (part) out.push(part);
  }
  return out;
}

export interface MatchResult {
  exercise: DatasetExercise;
  kind: MatchKind;
  score: number;
}

/**
 * Busca l'exercici del dataset que correspon a un nom del PDF.
 * Retorna null quan no hi ha prou confiança: val més cap GIF que un de fals.
 */
export function matchExercise(pdfName: string): MatchResult | null {
  const dataset = loadDataset();
  if (dataset.length === 0) return null;

  const slug = slugify(pdfName);
  if (NO_MATCH.has(slug)) return null;

  const curatedName = CURATED_BY_NAME[slug];
  if (curatedName) {
    const hit = dataset.find((e) => e.name.toLowerCase() === curatedName.toLowerCase());
    if (hit) return { exercise: hit, kind: 'curat', score: 1 };
  }
  const curatedId = CURATED[slug];
  if (curatedId) {
    const hit = dataset.find((e) => e.id === curatedId);
    if (hit) return { exercise: hit, kind: 'curat', score: 1 };
  }

  const tokens = tokenize(pdfName);
  if (tokens.length === 0) return null;

  let best: MatchResult | null = null;
  for (const candidate of dataset) {
    const hay = candidate.name.toLowerCase();
    const hayTokens = new Set(hay.split(/[^a-z0-9]+/).filter(Boolean));

    let matched = 0;
    for (const t of tokens) if (hayTokens.has(t)) matched++;
    if (matched === 0) continue;

    // Proporció de paraules del PDF trobades, penalitzant noms molt llargs (variants rares).
    let score = matched / tokens.length - hayTokens.size * 0.02;
    // Les màquines del gimnàs són "leverage machine" al dataset.
    if (candidate.equipment === 'leverage machine') score += 0.15;
    if (candidate.equipment === 'cable') score += 0.05;

    if (!best || score > best.score) best = { exercise: candidate, kind: 'automatic', score };
  }

  // Llindar conservador: per sota, millor deixar-ho sense assignar.
  if (!best || best.score < 0.5) return null;
  return best;
}
