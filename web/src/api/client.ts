import type {
  DatasetSearchResult,
  ExerciseDetail,
  ExerciseSummary,
  ImportPreview,
  ImportRecord,
  Overview,
  Profile,
  SessionDay,
} from './types';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const api = {
  profiles: () => get<Profile[]>('/api/profiles'),

  overview: (profile: string) => get<Overview>(`/api/profiles/${profile}/overview`),

  exercises: (profile: string) => get<ExerciseSummary[]>(`/api/profiles/${profile}/exercises`),

  exercise: (profile: string, slug: string) =>
    get<ExerciseDetail>(`/api/profiles/${profile}/exercises/${slug}`),

  sessions: (profile: string) => get<SessionDay[]>(`/api/profiles/${profile}/sessions`),

  imports: (profile: string) => get<ImportRecord[]>(`/api/profiles/${profile}/imports`),

  searchDataset: (q: string) =>
    get<DatasetSearchResult[]>(`/api/dataset/search?q=${encodeURIComponent(q)}`),

  async previewImport(profile: string, file: File): Promise<ImportPreview> {
    const body = new FormData();
    body.append('file', file);
    const res = await fetch(`/api/profiles/${profile}/imports/preview`, { method: 'POST', body });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Error');
    return res.json();
  },

  async commitImport(profile: string, file: File) {
    const body = new FormData();
    body.append('file', file);
    const res = await fetch(`/api/profiles/${profile}/imports/commit`, { method: 'POST', body });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Error');
    return res.json() as Promise<{ entriesWritten: number; sessionsCreated: number }>;
  },

  async setDataset(exerciseSlug: string, datasetId: string | null) {
    const res = await fetch(`/api/exercises/${exerciseSlug}/dataset`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ datasetId }),
    });
    if (!res.ok) throw new Error('Error');
  },

  async undoImport(id: number) {
    const res = await fetch(`/api/imports/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error');
  },
};
