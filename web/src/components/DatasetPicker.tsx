import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { DatasetSearchResult } from '../api/types';
import { ca, translateEquipment } from '../i18n/ca';
import { ModalShell } from './ui/ModalShell';

interface Props {
  open: boolean;
  currentId: string | null;
  /** Suggeriment de cerca inicial: el nom de l'exercici. */
  initialQuery: string;
  onClose: () => void;
  onPick: (datasetId: string | null) => void;
}

/** Diàleg per triar a mà quina animació del catàleg il·lustra un exercici. */
export function DatasetPicker({ open, currentId, initialQuery, onClose, onPick }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<DatasetSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const timer = setTimeout(() => {
      api
        .searchDataset(query)
        .then(setResults)
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [query, open]);

  useEffect(() => {
    if (open) setQuery(initialQuery);
  }, [open, initialQuery]);

  return (
    <ModalShell open={open} onClose={onClose}>
      <div className="border-b border-line p-5">
        <h3 className="mb-3 text-lg font-semibold tracking-title text-ink-900">
          {ca.detail.pickerTitle}
        </h3>
        <input
          autoFocus
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={ca.detail.pickerSearch}
          className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-ink-900
                     outline-none transition-colors duration-150 placeholder:text-ink-400
                     focus:border-ink-400"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading && <p className="p-4 text-ink-500">{ca.app.loading}</p>}
        {!loading && results.length === 0 && (
          <p className="p-4 text-ink-500">{ca.detail.pickerEmpty}</p>
        )}
        <div className="grid gap-2 sm:grid-cols-2">
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onPick(r.id)}
              className={`pressable flex items-center gap-3 rounded-xl border p-2.5 text-left
                          transition-colors duration-150 ${
                            r.id === currentId
                              ? 'border-ink-400 bg-paper'
                              : 'border-line hover:bg-paper'
                          }`}
            >
              <img
                src={`/dataset/${r.image}`}
                alt={r.name}
                loading="lazy"
                className="h-16 w-16 shrink-0 rounded-lg bg-paper object-contain"
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink-900">{r.name}</span>
                <span className="block truncate text-sm text-ink-500">
                  {translateEquipment(r.equipment)}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between gap-2 border-t border-line p-4">
        <button
          type="button"
          onClick={() => onPick(null)}
          className="pressable rounded-xl px-4 py-2 text-sm text-ink-500
                     transition-colors duration-150 hover:text-down"
        >
          {ca.detail.pickerClear}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="pressable rounded-xl border border-line bg-surface px-5 py-2 text-sm
                     text-ink-700 transition-colors duration-150 hover:bg-paper"
        >
          {ca.detail.pickerCancel}
        </button>
      </div>
    </ModalShell>
  );
}
