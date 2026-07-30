import { useCallback, useEffect, useState } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  reload: () => void;
}

// Cau en memòria entre navegacions: cada pàgina és un component diferent que
// React Router desmunta i torna a muntar en canviar de pestanya, així que
// sense això `data` sempre tornava a `null` i es veia l'estat de càrrega (un
// bloc petit i centrat) durant una fracció de segon abans del contingut
// definitiu — un salt d'alçada perceptible cada vegada que es canviava de
// pestanya. Amb la cau, si ja s'havia carregat abans es mostra a l'instant i
// es refresca en segon pla, sense tornar a passar per l'estat de càrrega.
const cache = new Map<string, unknown>();

/** Càrrega de dades amb estat de càrrega, error i recàrrega. `key`, si es
 * dona, identifica el recurs perquè es pugui reaprofitar entre muntatges. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[], key?: string): AsyncState<T> {
  const cacheKey = key ? `${key}:${JSON.stringify(deps)}` : null;
  const cached = cacheKey ? (cache.get(cacheKey) as T | undefined) : undefined;

  const [data, setData] = useState<T | null>(cached ?? null);
  const [loading, setLoading] = useState(cached === undefined);
  const [error, setError] = useState<Error | null>(null);
  const [nonce, setNonce] = useState(0);

  // La funció canvia a cada render; les dependències les controla qui crida el hook.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps);

  useEffect(() => {
    let cancelled = false;
    // Si ja hi ha dades en cau no es torna a mostrar l'estat de càrrega:
    // es refresca en silenci i només es reemplaça el contingut quan arriba.
    if (cache.get(cacheKey ?? '') === undefined) {
      setLoading(true);
      setError(null);
    }
    run()
      .then((result) => {
        if (cancelled) return;
        if (cacheKey) cache.set(cacheKey, result);
        setData(result);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err as Error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, nonce]);

  return { data, loading, error, reload: () => setNonce((n) => n + 1) };
}
