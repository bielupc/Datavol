/**
 * Tots els textos de la interfície, en català.
 * Si cal canviar una paraula, es canvia aquí i prou.
 */
export const ca = {
  app: {
    title: 'Registre d’entrenament',
    subtitle: 'Evolució i estadístiques',
    loading: 'Carregant…',
    error: 'Hi ha hagut un error',
    retry: 'Torna-ho a provar',
    profile: 'Perfil',
  },

  nav: {
    resum: 'Resum',
    exercicis: 'Exercicis',
    sessions: 'Sessions',
    importar: 'Importar',
    perfil: 'Perfil',
  },

  /** Full de selecció de perfil (només a mòbil: a l'escriptori hi ha el selector de la capçalera). */
  profileSheet: {
    title: 'Qui entrena?',
    hint: 'Tria de qui vols veure les dades.',
    close: 'Tanca',
  },

  units: {
    kg: 'kg',
    p: 'plaques',
    pShort: 'pl.',
    reps: 'reps',
    seconds: 's',
  },

  overview: {
    heading: 'Resum',
    sessions: 'Sessions',
    exercises: 'Exercicis',
    entries: 'Registres',
    totalVolume: 'Volum total',
    totalTut: 'Temps sota tensió',
    avgProgress: 'Progressió mitjana',
    lastSession: 'Última sessió',
    daysAgo: (n: number) => (n === 0 ? 'avui' : n === 1 ? 'fa 1 dia' : `fa ${n} dies`),
    volumeChart: 'Evolució per sessió',
    volumeChartHint: 'Volum = pes × repeticions completes',
    progressChart: 'Progressió per exercici',
    progressChartHint: 'Variació de pes entre la primera i l’última sessió',
    records: 'Millors marques',
    recordsHint: 'El pes més alt assolit a cada exercici',
    muscleGroups: 'Grups musculars treballats',
    muscleSplit: 'Repartiment per grup muscular',
    noData: 'Encara no hi ha dades en aquest perfil.',
    noDataHint: 'Ves a «Importar» i puja un PDF de l’entrenador per començar.',
  },

  exercises: {
    heading: 'Exercicis',
    count: (n: number) => (n === 1 ? '1 exercici' : `${n} exercicis`),
    filterAll: 'Tots',
    filterGroup: 'Grup muscular',
    search: 'Cerca un exercici…',
    clearSearch: 'Netejar la cerca',
    noResults: 'Cap exercici coincideix amb la cerca.',
    sessions: (n: number) => (n === 1 ? '1 sessió' : `${n} sessions`),
    current: 'Actual',
    record: 'Rècord',
    progress: 'Progressió',
    noMedia: 'Sense imatge',
  },

  detail: {
    back: 'Tornar als exercicis',
    weight: 'Pes',
    reps: 'Repeticions',
    tut: 'Temps sota tensió',
    volume: 'Volum',
    weightChart: 'Evolució del pes',
    repsChart: 'Repeticions per sessió',
    tutChart: 'Temps sota tensió',
    volumeChart: 'Volum per sessió',
    volumeChartHint: 'Pes × repeticions completes d’aquest exercici',
    history: 'Historial de sessions',
    date: 'Data',
    change: 'Canvi',
    partialNote: 'completes + incompletes',
    partialTooltip:
      'L’entrenador anota «8+1» quan l’última repetició no s’ha pogut completar.',
    stats: {
      sessions: 'Sessions',
      record: 'Rècord',
      progress: 'Progressió',
      avgTut: 'TST mitjà',
      totalVolume: 'Volum acumulat',
      streak: 'Ratxa sense baixar',
      streakUnit: (n: number) => (n === 1 ? '1 sessió' : `${n} sessions`),
    },
    muscles: 'Músculs',
    primaryMuscle: 'Principal',
    secondaryMuscles: 'Secundaris',
    equipment: 'Equipament',
    bodyPart: 'Zona',
    changeMedia: 'Canviar l’exercici il·lustrat',
    noMedia: 'Aquest exercici no té cap animació assignada',
    noMediaHint: 'Tria’n una del catàleg per veure com es fa.',
    pickMedia: 'Triar del catàleg',
    total: 'Total',
    pickerTitle: 'Tria l’exercici que s’hi assembla',
    pickerSearch: 'Cerca al catàleg (en anglès)…',
    pickerEmpty: 'Cap resultat.',
    pickerClear: 'Treure l’assignació',
    pickerCancel: 'Cancel·lar',
    mediaSavedToast: 'Animació desada.',
    mediaClearedToast: 'S’ha tret l’animació.',
  },

  /** Mètriques que es poden triar als gràfics i al formatget. */
  metrics: {
    volume: 'Volum',
    reps: 'Repeticions',
    tut: 'Temps',
    exercises: 'Exercicis',
    tutLong: 'Temps sota tensió',
  },

  sessions: {
    heading: 'Sessions',
    count: (n: number) => (n === 1 ? '1 sessió' : `${n} sessions`),
    exercises: (n: number) => (n === 1 ? '1 exercici' : `${n} exercicis`),
    volume: 'Volum',
    duration: 'Temps sota tensió',
    empty: 'Encara no hi ha cap sessió.',
    year: 'Any',
    yearHeatmap: 'Constància durant l’any',
    yearHint: 'Com més fosc, més volum aquell dia',
    streak: (n: number) =>
      n === 0
        ? 'Cap setmana seguida ara mateix'
        : n === 1
          ? '1 setmana seguida'
          : `${n} setmanes seguides`,
    streakLabel: 'Ratxa actual',
    prevMonth: 'Mes anterior',
    nextMonth: 'Mes següent',
    today: 'Avui',
    pickDay: 'Tria un dia amb entrenament per veure’n el detall',
    noSessionsMonth: 'Cap entrenament aquest mes',
    close: 'Tancar',
    dayModalHint: 'Fes clic a un exercici per veure’n l’evolució',
    months: [
      'Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny',
      'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre',
    ],
    /** Comença en dilluns, com el calendari d'aquí. */
    weekdaysShort: ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'],
  },

  import: {
    heading: 'Importar un PDF',
    intro:
      'Puja el PDF que et dóna l’entrenador. Es llegeix la taula, es comprova què hi ha de nou i tu decideixes si s’afegeix.',
    dropzone: 'Arrossega el PDF aquí o fes clic per triar-lo',
    dropzoneActive: 'Deixa anar el fitxer',
    analysing: 'Llegint el PDF…',
    intoProfile: (name: string) => `S’afegirà al perfil ${name}`,
    previewTitle: 'Què s’afegirà',
    alreadyImported: 'Aquest PDF ja s’havia importat abans.',
    newSessions: 'Sessions noves',
    knownSessions: 'Sessions que ja hi eren',
    newExercises: 'Exercicis nous',
    knownExercises: 'Exercicis que ja hi eren',
    newEntries: 'Registres nous',
    duplicateEntries: 'Registres que ja hi eren',
    nothingNew: 'No hi ha res de nou en aquest PDF.',
    matchedWith: 'S’il·lustrarà amb',
    noMatch: 'Sense animació — la podràs triar després',
    warnings: 'Avisos de lectura',
    confirm: 'Afegir les dades',
    cancel: 'Cancel·lar',
    close: 'Tancar',
    changeFile: 'Canviar fitxer',
    importing: 'Afegint…',
    done: (n: number) => `Fet: ${n} registres desats.`,
    failed: 'No s’ha pogut llegir el PDF.',
    history: 'Importacions fetes',
    historyEmpty: 'Encara no s’ha importat cap PDF en aquest perfil.',
    undo: 'Desfer',
    // Sense el nom del fitxer al títol: Sileo el posa en majúscules per
    // paraules ("2.pdf" → "2.Pdf"), es veu millor a la descripció.
    undoConfirmTitle: 'Desfer la importació?',
    undoConfirm: (filename: string) => `Es tornarà a l’estat d’abans d’importar ${filename}.`,
    undoneToast: (filename: string) => `S’ha desfet la importació de ${filename}.`,
    willAdd: (n: number) => (n === 1 ? 'S’afegirà 1 registre nou' : `S’afegiran ${n} registres nous`),
    detailsToggle: 'Veure detalls',
    entriesCount: (n: number) => (n === 1 ? '1 registre' : `${n} registres`),
  },

  chart: {
    noData: 'Sense dades per mostrar',
    session: 'Sessió',
  },
} as const;

/** Grups musculars del catàleg (en anglès) traduïts al català. */
export const MUSCLE_GROUPS_CA: Record<string, string> = {
  'upper legs': 'Cames (superior)',
  'lower legs': 'Cames (inferior)',
  'upper arms': 'Braços (superior)',
  'lower arms': 'Avantbraços',
  back: 'Esquena',
  chest: 'Pit',
  shoulders: 'Espatlles',
  waist: 'Zona mitjana',
  neck: 'Coll',
  cardio: 'Cardiovascular',
  altres: 'Sense classificar',
};

/** Músculs concrets del catàleg traduïts al català. */
export const MUSCLES_CA: Record<string, string> = {
  abs: 'abdominals',
  abductors: 'abductors',
  adductors: 'adductors',
  biceps: 'bíceps',
  calves: 'bessons',
  cardiovascular: 'sistema cardiovascular',
  'cardiovascular system': 'sistema cardiovascular',
  delts: 'deltoides',
  forearms: 'avantbraços',
  glutes: 'glutis',
  hamstrings: 'isquiotibials',
  'hip flexors': 'flexors del maluc',
  lats: 'dorsals',
  'levator scapulae': 'elevador de l’escàpula',
  'lower back': 'lumbars',
  pectorals: 'pectorals',
  quads: 'quàdriceps',
  serratus: 'serrat',
  'serratus anterior': 'serrat anterior',
  spine: 'columna',
  traps: 'trapezis',
  triceps: 'tríceps',
  'upper back': 'esquena alta',
};

/** Equipament del catàleg traduït al català. */
export const EQUIPMENT_CA: Record<string, string> = {
  'body weight': 'pes corporal',
  barbell: 'barra',
  dumbbell: 'manuelles',
  cable: 'polia',
  'leverage machine': 'màquina de palanca',
  'smith machine': 'màquina Smith',
  'sled machine': 'màquina de trineu',
  band: 'goma elàstica',
  kettlebell: 'kettlebell',
  weighted: 'amb llast',
  'stability ball': 'pilota d’estabilitat',
  'ez barbell': 'barra EZ',
  assisted: 'assistit',
  'medicine ball': 'pilota medicinal',
  rope: 'corda',
  'olympic barbell': 'barra olímpica',
  'resistance band': 'banda elàstica',
  'roller wheel': 'roda abdominal',
  'skierg machine': 'màquina SkiErg',
  'stationary bike': 'bicicleta estàtica',
  'stepmill machine': 'escaladora',
  'elliptical machine': 'el·líptica',
  'upper body ergometer': 'ergòmetre de braços',
  'tire': 'roda',
  'trap bar': 'barra hexagonal',
  'wheel roller': 'roda abdominal',
  'hammer': 'martell',
  'bosu ball': 'bosu',
};

export function translateMuscle(value: string): string {
  return MUSCLES_CA[value.toLowerCase()] ?? value;
}

export function translateEquipment(value: string): string {
  return EQUIPMENT_CA[value.toLowerCase()] ?? value;
}

export function translateGroup(value: string | null): string {
  if (!value) return MUSCLE_GROUPS_CA.altres;
  return MUSCLE_GROUPS_CA[value.toLowerCase()] ?? value;
}
