export interface Profile {
  slug: string;
  name: string;
  color: string;
  sessions: number;
}

export interface SeriesPoint {
  date: string;
  weight: number;
  reps: number;
  partialReps: number;
  tutSeconds: number | null;
  volume: number;
  weightDelta: number | null;
}

export interface ExerciseStats {
  sessions: number;
  first: SeriesPoint | null;
  last: SeriesPoint | null;
  recordWeight: number;
  recordDate: string | null;
  progressPct: number | null;
  totalVolume: number;
  avgTut: number | null;
  streak: number;
}

export interface DatasetInfo {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string;
  muscleGroup: string;
  secondaryMuscles: string[];
  image: string;
  gif: string;
  attribution: string;
}

export interface Overview {
  totals: {
    sessions: number;
    exercises: number;
    entries: number;
    volume: number;
    tutSeconds: number;
  };
  avgProgressPct: number | null;
  lastSessionDate: string | null;
  daysSinceLast: number | null;
  volumeBySession: {
    date: string;
    volume: number;
    exercises: number;
    tutSeconds: number;
    reps: number;
  }[];
  exerciseProgress: {
    slug: string;
    name: string;
    unit: string;
    sessions: number;
    firstWeight: number;
    lastWeight: number;
    progressPct: number | null;
    recordWeight: number;
    recordDate: string | null;
    totalVolume: number;
    streak: number;
  }[];
  records: { slug: string; name: string; weight: number; date: string; unit: string }[];
  muscleGroups: { group: string; count: number }[];
  muscleBreakdown: {
    group: string;
    tutSeconds: number;
    volume: number;
    reps: number;
    exercises: number;
  }[];
}

export interface ExerciseSummary {
  slug: string;
  name: string;
  unit: string;
  muscleGroup: string | null;
  equipment: string | null;
  image: string | null;
  gif: string | null;
  datasetName: string | null;
  sessions: number;
  lastWeight: number;
  lastDate: string | null;
  progressPct: number | null;
  recordWeight: number;
  streak: number;
  sparkline: number[];
}

export interface ExerciseDetail {
  slug: string;
  name: string;
  unit: string;
  muscleGroup: string | null;
  datasetMatch: string | null;
  dataset: DatasetInfo | null;
  series: SeriesPoint[];
  stats: ExerciseStats;
}

export interface SessionDay {
  date: string;
  volume: number;
  tutSeconds: number;
  entries: {
    slug: string;
    name: string;
    weight: number;
    unit: string;
    reps: number;
    partialReps: number;
    tutSeconds: number | null;
    weightDelta: number | null;
    image: string | null;
    gif: string | null;
  }[];
}

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

export interface ImportRecord {
  id: number;
  filename: string;
  importedAt: string;
  entries: number;
  summary: { dates: string[]; exercises: string[] };
}

export interface DatasetSearchResult {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string;
  image: string;
  gif: string;
}
