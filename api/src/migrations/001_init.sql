CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  default_unit TEXT NOT NULL DEFAULT 'kg',
  dataset_id TEXT,
  dataset_match TEXT,
  muscle_group TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  profile_id INT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  UNIQUE (profile_id, date)
);

CREATE TABLE IF NOT EXISTS entries (
  id SERIAL PRIMARY KEY,
  session_id INT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  exercise_id INT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  weight NUMERIC(7,2) NOT NULL,
  unit TEXT NOT NULL,
  reps INT NOT NULL,
  partial_reps INT NOT NULL DEFAULT 0,
  tut_seconds INT,
  -- Marques de l'entrenador (AP/NS/MT). Es guarden per no perdre informació,
  -- però no es mostren enlloc: no estan documentades.
  notes TEXT[] NOT NULL DEFAULT '{}',
  import_id INT,
  UNIQUE (session_id, exercise_id)
);

CREATE TABLE IF NOT EXISTS imports (
  id SERIAL PRIMARY KEY,
  profile_id INT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  summary JSONB NOT NULL,
  UNIQUE (profile_id, sha256)
);

CREATE INDEX IF NOT EXISTS entries_exercise_idx ON entries (exercise_id);
CREATE INDEX IF NOT EXISTS entries_session_idx ON entries (session_id);
CREATE INDEX IF NOT EXISTS sessions_profile_date_idx ON sessions (profile_id, date);
