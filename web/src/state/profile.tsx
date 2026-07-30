import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../api/client';
import type { Profile } from '../api/types';

interface ProfileContextValue {
  profiles: Profile[];
  active: Profile | null;
  setActive: (slug: string) => void;
  loading: boolean;
  /** Puja quan s'importa alguna cosa, per refrescar les pàgines. */
  version: number;
  refresh: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

const STORAGE_KEY = 'perfil-actiu';

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY),
  );
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    api
      .profiles()
      .then((list) => {
        setProfiles(list);
        setActiveSlug((current) =>
          current && list.some((p) => p.slug === current) ? current : (list[0]?.slug ?? null),
        );
      })
      .finally(() => setLoading(false));
  }, [version]);

  const active = useMemo(
    () => profiles.find((p) => p.slug === activeSlug) ?? profiles[0] ?? null,
    [profiles, activeSlug],
  );

  // El color d'accent de tota la interfície segueix el perfil actiu.
  useEffect(() => {
    if (!active) return;
    const root = document.documentElement.style;
    root.setProperty('--accent', active.color);
    root.setProperty('--accent-soft', `color-mix(in srgb, ${active.color} 10%, transparent)`);
  }, [active]);

  const value = useMemo<ProfileContextValue>(
    () => ({
      profiles,
      active,
      loading,
      version,
      setActive: (slug) => {
        setActiveSlug(slug);
        localStorage.setItem(STORAGE_KEY, slug);
      },
      refresh: () => setVersion((v) => v + 1),
    }),
    [profiles, active, loading, version],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile fora de ProfileProvider');
  return ctx;
}
