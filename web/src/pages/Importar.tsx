import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { sileo } from 'sileo';
import { api } from '../api/client';
import type { ImportPreview } from '../api/types';
import { IconCheck, IconClose, IconDumbbell, IconFile, IconTrash } from '../components/icons';
import { Card, SectionTitle } from '../components/ui/Card';
import { ErrorState, Loading } from '../components/ui/States';
import { ca } from '../i18n/ca';
import { fmt } from '../lib/format';
import { EASE_OUT, riseIn, stagger } from '../lib/motion';
import { useAsync } from '../lib/useAsync';
import { useProfile } from '../state/profile';

// Els desenllaços efímers (èxit, error) es mostren amb Sileo; l'estat aquí
// només cobreix el que ha de quedar-se a la pantalla mentre l'usuari decideix.
type Phase = 'idle' | 'analysing' | 'preview' | 'importing';

export function Importar() {
  const { active, refresh, version } = useProfile();
  const profile = active!;

  const [phase, setPhase] = useState<Phase>('idle');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const history = useAsync(
    () => api.imports(profile.slug),
    [profile.slug, version],
    'importHistory',
  );

  async function handleFile(selected: File) {
    setFile(selected);
    setPhase('analysing');
    try {
      const result = await api.previewImport(profile.slug, selected);
      setPreview(result);
      setPhase('preview');
    } catch (err) {
      sileo.error({ title: ca.import.failed, description: (err as Error).message });
      reset();
    }
  }

  async function confirm() {
    if (!file) return;
    setPhase('importing');
    try {
      const result = await api.commitImport(profile.slug, file);
      sileo.success({ title: ca.import.done(result.entriesWritten) });
      reset();
      refresh();
    } catch (err) {
      // Es queda a la previsualització: la lectura ja va anar bé, només cal
      // tornar-ho a provar sense haver de tornar a triar el fitxer.
      sileo.error({ title: ca.import.failed, description: (err as Error).message });
      setPhase('preview');
    }
  }

  function reset() {
    setPhase('idle');
    setPreview(null);
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  // Toast amb botó d'acció en comptes de window.confirm: si l'usuari no hi fa
  // res, desapareix sol i no passa res — el mateix comportament, integrat
  // visualment amb la resta de l'app.
  function confirmUndo(id: number, filename: string) {
    // sileo.action() always forces state:"action" (blue) regardless of `type` —
    // sileo.show() is the variant that actually honours `type` for the colour.
    sileo.show({
      title: ca.import.undoConfirmTitle,
      description: ca.import.undoConfirm(filename),
      type: 'error',
      icon: <IconTrash width={16} height={16} />,
      duration: 6000,
      button: {
        title: ca.import.undo,
        onClick: async () => {
          await api.undoImport(id);
          sileo.success({ title: ca.import.undoneToast(filename) });
          refresh();
        },
      },
    });
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={riseIn}>
        <Card animated={false}>
          <SectionTitle title={ca.import.heading} hint={ca.import.intro} />

          {phase === 'idle' ? (
            // Zona d'arrossegar: només ocupa espai mentre encara cal triar un fitxer.
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const dropped = e.dataTransfer.files[0];
                if (dropped) handleFile(dropped);
              }}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl
                          border-2 border-dashed px-4 py-10 text-center sm:px-6 sm:py-14
                          transition-[border-color,background-color] duration-200 ease-out ${
                            dragging ? 'bg-paper' : 'border-line hover:bg-paper'
                          }`}
              style={dragging ? { borderColor: 'var(--accent)' } : undefined}
            >
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) handleFile(selected);
                }}
              />
              <motion.span
                className="text-4xl"
                animate={{ transform: dragging ? 'translateY(-4px) scale(1.1)' : 'translateY(0px) scale(1)' }}
                transition={{ type: 'spring', duration: 0.3, bounce: 0.25 }}
                aria-hidden
              >
                📄
              </motion.span>
              <p className="font-medium text-ink-900">
                {dragging ? ca.import.dropzoneActive : ca.import.dropzone}
              </p>
              <p className="mt-1 text-sm text-ink-500">{ca.import.intoProfile(profile.name)}</p>
            </label>
          ) : (
            // Un cop triat el fitxer, la zona d'arrossegar deixa pas a una fila
            // compacta: el mateix espai gran ja no aporta res i competia
            // visualment amb el resultat de sota.
            <div className="flex items-center gap-3 rounded-xl border border-line bg-paper px-4 py-3">
              <IconFile className="shrink-0 text-ink-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-900">{file?.name}</p>
                <p className="text-xs text-ink-500">{ca.import.intoProfile(profile.name)}</p>
              </div>
              {phase !== 'importing' && (
                <button
                  type="button"
                  onClick={reset}
                  className="pressable shrink-0 text-sm font-medium text-ink-500 transition-colors
                             duration-150 hover:text-ink-900"
                >
                  {ca.import.changeFile}
                </button>
              )}
            </div>
          )}

          <AnimatePresence mode="wait">
            {phase === 'analysing' && (
              <motion.p
                key="analysing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-center text-ink-500"
              >
                {ca.import.analysing}
              </motion.p>
            )}

            {phase === 'preview' && preview && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, transform: 'translateY(8px)' }}
                animate={{ opacity: 1, transform: 'translateY(0px)' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                className="mt-6 rounded-2xl border border-line bg-paper p-4 sm:p-5"
              >
                {/* Només quan aporta informació nova al missatge principal: si no
                    hi ha res de nou, "ja s'havia importat" i "no hi ha res de nou"
                    dirien la mateixa cosa dues vegades. */}
                {preview.alreadyImported && preview.newEntries > 0 && (
                  <p className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    {ca.import.alreadyImported}
                  </p>
                )}

                {/* Missatge principal: un de sol, sense competència visual */}
                <p className="text-xl font-semibold tracking-title text-ink-900 sm:text-2xl">
                  {preview.newEntries === 0 ? ca.import.nothingNew : ca.import.willAdd(preview.newEntries)}
                </p>

                {/* Xips secundaris: només els que aportin alguna cosa (>0) */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {preview.newSessions.length > 0 && (
                    <span className="chip">{preview.newSessions.length} · {ca.import.newSessions}</span>
                  )}
                  {preview.newExercises.length > 0 && (
                    <span className="chip">{preview.newExercises.length} · {ca.import.newExercises}</span>
                  )}
                  {preview.duplicateEntries > 0 && (
                    <span className="chip opacity-70">
                      {preview.duplicateEntries} · {ca.import.duplicateEntries}
                    </span>
                  )}
                </div>

                {/* Detalls, tancats per defecte: no calen per decidir si confirmar */}
                {(preview.newSessions.length > 0 ||
                  preview.knownSessions.length > 0 ||
                  preview.newExercises.length > 0 ||
                  preview.knownExercises.length > 0 ||
                  preview.warnings.length > 0) && (
                  <details className="group mt-4">
                    <summary className="cursor-pointer list-none text-sm font-medium text-ink-600
                                         transition-colors duration-150 hover:text-ink-900">
                      <span className="inline-block transition-transform duration-150 group-open:rotate-90">
                        ›
                      </span>{' '}
                      {ca.import.detailsToggle}
                    </summary>

                    <div className="mt-4 space-y-4">
                      {preview.newSessions.length > 0 && (
                        <Detail label={ca.import.newSessions}>
                          <p className="rounded-xl bg-surface px-4 py-3 text-sm leading-relaxed text-ink-700">
                            {preview.newSessions.map(fmt.dateMedium).join(' · ')}
                          </p>
                        </Detail>
                      )}

                      {preview.knownSessions.length > 0 && (
                        <Detail label={ca.import.knownSessions}>
                          <p className="rounded-xl bg-surface px-4 py-3 text-sm leading-relaxed text-ink-500">
                            {preview.knownSessions.map(fmt.dateMedium).join(' · ')}
                          </p>
                        </Detail>
                      )}

                      {preview.newExercises.length > 0 && (
                        <Detail label={ca.import.newExercises}>
                          <ul className="divide-y divide-lineSoft overflow-hidden rounded-xl bg-surface">
                            {preview.newExercises.map((e) => (
                              <li key={e.slug} className="flex items-start gap-3 px-4 py-2.5">
                                <IconDumbbell className="mt-0.5 shrink-0 text-ink-400" />
                                <div className="min-w-0 flex-1 text-sm">
                                  <p className="font-medium text-ink-900">{e.name}</p>
                                  {e.matchedName ? (
                                    <p className="text-ink-500">
                                      {ca.import.matchedWith}{' '}
                                      <span className="text-ink-700">{e.matchedName}</span>
                                    </p>
                                  ) : (
                                    <p className="text-amber-700">{ca.import.noMatch}</p>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </Detail>
                      )}

                      {preview.knownExercises.length > 0 && (
                        <Detail label={ca.import.knownExercises}>
                          <p className="rounded-xl bg-surface px-4 py-3 text-sm leading-relaxed text-ink-500">
                            {preview.knownExercises.join(', ')}
                          </p>
                        </Detail>
                      )}

                      {preview.warnings.length > 0 && (
                        <Detail label={ca.import.warnings}>
                          <ul className="space-y-1 text-sm text-amber-800">
                            {preview.warnings.map((w, i) => (
                              <li key={i}>{w}</li>
                            ))}
                          </ul>
                        </Detail>
                      )}
                    </div>
                  </details>
                )}

                {/* A mòbil, botons a tot l'ample i apilats. `col-reverse`
                    perquè el botó principal (que al DOM va l'últim, com toca a
                    l'escriptori) quedi a dalt, sota el dit. */}
                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                  {preview.newEntries > 0 ? (
                    <>
                      <button
                        type="button"
                        onClick={reset}
                        className="pressable flex w-full items-center justify-center gap-1.5 rounded-xl
                                   border border-line bg-surface px-4 py-2.5 text-ink-700
                                   transition-colors duration-150 hover:bg-paper sm:w-auto"
                      >
                        <IconClose width={18} height={18} />
                        {ca.import.cancel}
                      </button>
                      <button
                        type="button"
                        onClick={confirm}
                        className="pressable flex w-full items-center justify-center gap-1.5 rounded-xl
                                   px-4 py-2.5 font-semibold text-white sm:w-auto"
                        style={{ background: 'var(--accent)' }}
                      >
                        <IconCheck width={18} height={18} />
                        {ca.import.confirm}
                      </button>
                    </>
                  ) : (
                    // Res a afegir: un botó actiu de "Afegir les dades" seria un
                    // no-op enganyós. Només cal tancar.
                    <button
                      type="button"
                      onClick={reset}
                      className="pressable flex w-full items-center justify-center gap-1.5 rounded-xl
                                 border border-line bg-surface px-4 py-2.5 text-ink-700
                                 transition-colors duration-150 hover:bg-paper sm:w-auto"
                    >
                      <IconClose width={18} height={18} />
                      {ca.import.close}
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {phase === 'importing' && (
              <motion.p
                key="importing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-center text-ink-500"
              >
                {ca.import.importing}
              </motion.p>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Historial d'importacions: secundari, per això amb menys pes tipogràfic */}
      <motion.div variants={riseIn}>
        <Card animated={false} className="bg-paper shadow-none">
          <h2 className="mb-4 text-sm font-medium text-ink-500">{ca.import.history}</h2>
          {history.loading ? (
            <Loading />
          ) : history.error ? (
            <ErrorState onRetry={history.reload} />
          ) : (history.data ?? []).length === 0 ? (
            <p className="py-2 text-sm text-ink-500">{ca.import.historyEmpty}</p>
          ) : (
            <ul className="divide-y divide-lineSoft">
              {(history.data ?? []).map((imp) => (
                <li key={imp.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5">
                  <div className="min-w-[12rem] flex-1">
                    <p className="truncate text-sm text-ink-700">{imp.filename}</p>
                    <p className="text-xs text-ink-500">
                      {imp.importedAt} · {ca.import.entriesCount(imp.entries)} ·{' '}
                      {imp.summary.dates.length} {ca.overview.sessions.toLowerCase()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => confirmUndo(imp.id, imp.filename)}
                    className="pressable flex shrink-0 items-center gap-1.5 rounded-lg border border-line
                               px-3 py-2 text-xs text-ink-500 transition-colors duration-150
                               hover:border-rose-300 hover:text-down sm:py-1.5"
                  >
                    <IconTrash width={14} height={14} />
                    {ca.import.undo}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink-500">{label}</p>
      {children}
    </div>
  );
}
