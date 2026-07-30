import { useEffect, useState } from 'react';

interface Props {
  image: string | null;
  gif: string | null;
  alt: string;
  className?: string;
  /** A les targetes es mostra la miniatura i el GIF només en passar-hi el ratolí. */
  playOnHover?: boolean;
  fallback: string;
}

/** Cert només amb ratolí de debò: en tàctil el `hover` es dispara en tocar i es queda. */
function useFinePointer(): boolean {
  const [fine, setFine] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const onChange = (e: MediaQueryListEvent) => setFine(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return fine;
}

/**
 * Imatge d'un exercici. El catàleg són 126 MB de GIFs, així que per defecte es
 * carrega la miniatura i el GIF només quan cal.
 */
export function ExerciseMedia({
  image,
  gif,
  alt,
  className = '',
  playOnHover = false,
  fallback,
}: Props) {
  const [hovering, setHovering] = useState(false);
  const [failed, setFailed] = useState(false);
  const finePointer = useFinePointer();

  const src = playOnHover ? (hovering && gif ? gif : image) : (gif ?? image);

  if (!src || failed) {
    return (
      <div className={`grid place-items-center bg-paper text-sm text-ink-400 ${className}`}>
        {fallback}
      </div>
    );
  }

  const hoverHandlers =
    playOnHover && finePointer
      ? { onMouseEnter: () => setHovering(true), onMouseLeave: () => setHovering(false) }
      : {};

  return (
    <img
      src={`/dataset/${src}`}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      {...hoverHandlers}
      className={`object-contain ${className}`}
    />
  );
}
