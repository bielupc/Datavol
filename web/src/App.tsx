import { useEffect, useLayoutEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { BottomTabBar } from './components/BottomTabBar';
import { MobilePageHeader } from './components/MobilePageHeader';
import { Nav } from './components/Nav';
import { ProfileSheet } from './components/ProfileSheet';
import { ProfileSwitcher } from './components/ProfileSwitcher';
import { Loading } from './components/ui/States';
import { ca } from './i18n/ca';
import { useIsDesktop } from './lib/useMediaQuery';
import { ExerciciDetall } from './pages/ExerciciDetall';
import { Exercicis } from './pages/Exercicis';
import { Importar } from './pages/Importar';
import { Resum } from './pages/Resum';
import { Sessions } from './pages/Sessions';
import { useProfile } from './state/profile';

export default function App() {
  const location = useLocation();
  const { active, loading } = useProfile();
  // A mòbil la navegació és a baix i el selector de perfil és un full; a
  // l'escriptori, la capçalera "illa" de sempre. Es tria amb JavaScript i no
  // amb classes `md:` perquè només n'hi pot haver una de muntada a la vegada
  // (vegeu el comentari de `useIsDesktop`).
  const isDesktop = useIsDesktop();
  const [profileOpen, setProfileOpen] = useState(false);

  // useLayoutEffect (no useEffect): ha de córrer ABANS que el navegador
  // pinti i abans que Framer Motion mesuri la posició del subratllat de
  // `Nav` (layoutId, també amb un layout effect). Amb `useEffect` normal el
  // scroll es reiniciava un frame més tard que aquella mesura, i el
  // subratllat calculava la seva transformació contra una posició de scroll
  // que encara no s'havia reiniciat — es notava com un tremolor en canviar
  // de pestanya. Sense això, a més, una pàgina més curta deixava la
  // finestra "penjada" a mig no-res del scroll anterior.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, active?.slug]);

  // En passar a escriptori el full de perfils es desmunta però l'estat es
  // quedava obert: en tornar a estrènyer la finestra reapareixia tot sol.
  useEffect(() => {
    if (isDesktop) setProfileOpen(false);
  }, [isDesktop]);

  return (
    <div className="min-h-screen">
      {/* Barra "illa": NO és un rectangle arrodonit — és una pastilla central
          (cantonades de dalt rectes, tocant la vora del viewport; de baix,
          arrodonides) més dos connectors còncaus als costats (`.island`,
          definit a index.css) que dibuixen la corba inversa cap al fons de
          la pàgina, en comptes d'un `border-radius` senzill. El
          `drop-shadow` viu al contenidor (`.island-shadow`) perquè segueixi
          la silueta composta sencera, no la capsa de cada peça per separat. */}
      {isDesktop && (
        <header className="sticky top-0 z-30 flex justify-center px-4">
          <div className="island-shadow flex w-fit max-w-full">
            {/* Fons de color d'accent (canvia amb el perfil actiu) en comptes
                de blanc: dona molt més contrast que un blanc sobre un fons
                gairebé blanc, i encaixa amb el "vestit propi" de cada perfil.
                Logotip invertit (cercle blanc, glif de color) perquè es vegi
                per sobre del nou fons. */}
            <div className="island flex items-center gap-4 px-5 py-3.5 sm:gap-5 sm:px-6">
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-base font-bold"
                  style={{ color: 'var(--accent)' }}
                  aria-hidden
                >
                  ⬈
                </span>
                <h1 className="hidden font-semibold leading-tight tracking-title text-white sm:block">
                  {ca.app.title}
                </h1>
              </div>
              <Nav />
              <ProfileSwitcher />
            </div>
          </div>
        </header>
      )}

      {/* El coixí de sota deixa lliure la barra inferior (alçada + marge +
          àrea segura del dispositiu): sense això l'última targeta de cada
          pàgina quedava mig amagada rere la barra. */}
      <main
        className="mx-auto max-w-6xl px-5 pt-6 sm:px-8 md:pt-10
                   pb-[calc(var(--tabbar-h)+env(safe-area-inset-bottom)+2.25rem)] md:pb-10"
      >
        {!isDesktop && <MobilePageHeader onOpenProfile={() => setProfileOpen(true)} />}

        {loading || !active ? (
          <Loading />
        ) : (
          // Sense cap fade propi: cada pàgina ja anima l'entrada dels seus blocs
          // (stagger/riseIn). Afegir-hi un fade exterior alhora que aquell
          // moviment intern generava, de tant en tant, un tremolor en superposar
          // dues animacions independents al mateix fotograma. La `key` (perfil +
          // ruta) ja força el remuntatge que retrigereja l'stagger de cada pàgina.
          <div key={`${active.slug}${location.pathname}`}>
            <Routes location={location}>
              <Route path="/" element={<Resum />} />
              <Route path="/exercicis" element={<Exercicis />} />
              <Route path="/exercicis/:slug" element={<ExerciciDetall />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/importar" element={<Importar />} />
            </Routes>
          </div>
        )}
      </main>

      {!isDesktop && (
        <>
          <BottomTabBar onOpenProfile={() => setProfileOpen(true)} profileOpen={profileOpen} />
          <ProfileSheet open={profileOpen} onClose={() => setProfileOpen(false)} />
        </>
      )}
    </div>
  );
}
