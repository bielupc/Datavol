import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Amplada màxima de la targeta (classe de Tailwind). */
  maxWidthClass?: string;
}

/**
 * Base compartida per als diàlegs de l'aplicació (DatasetPicker, SessionDayModal).
 *
 * Resol quatre problemes que tenien tots dos per separat:
 *
 * 1. **Es renderitza amb un portal a `document.body`.** Si es renderitzés dins de l'arbre normal,
 *    quedaria dins del `motion.div` animat de la pàgina — i qualsevol avantpassat amb `transform`
 *    (Framer Motion en deixa un fins i tot "en repòs") crea un nou contenidor de referència per als
 *    fills `position: fixed`, fent que el fons deixi de cobrir tot el viewport (es veia una franja
 *    per sobre, allà on comença l'avantpassat transformat).
 * 2. **Bloqueja el scroll del `body`** mentre és obert.
 * 3. **Només tanca en clicar el fons si el clic ha començat I acabat al fons.** Amb només
 *    `onClick={onClose}` al fons, seleccionar text dins la targeta i deixar anar el ratolí fora
 *    (per exemple arrossegant més enllà d'un camp de cerca) genera un `click` amb el fons com a
 *    diana — i el tancava sense voler-ho.
 * 4. **Mida fixa**: la targeta té una alçada constant, no depèn de si el contingut n'omple poc o
 *    molt — evita el salt de mida en obrir diàlegs amb continguts de llargada molt diferent.
 */
export function ModalShell({ open, onClose, children, maxWidthClass = 'max-w-2xl' }: Props) {
  const mouseDownOnBackdrop = useRef(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 p-0
                     backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onMouseDown={(e) => {
            mouseDownOnBackdrop.current = e.target === e.currentTarget;
          }}
          onClick={(e) => {
            if (mouseDownOnBackdrop.current && e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className={`card flex h-[34rem] w-full ${maxWidthClass} flex-col overflow-hidden p-0 shadow-pop`}
            // Diàleg: es queda centrat, no s'ancora a cap disparador.
            initial={{ opacity: 0, transform: 'translateY(16px) scale(0.97)' }}
            animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
            exit={{ opacity: 0, transform: 'translateY(8px) scale(0.98)' }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.1 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
