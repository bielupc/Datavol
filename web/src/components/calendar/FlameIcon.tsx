/** Icona de flama (tres capes per donar-hi profunditat). */
export function FlameIcon({ size = 40, muted = false }: { size?: number; muted?: boolean }) {
  return (
    <svg
      width={size}
      height={size * 1.15}
      viewBox="0 0 24 28"
      aria-hidden
      style={{ opacity: muted ? 0.35 : 1, filter: muted ? 'grayscale(1)' : undefined }}
    >
      <path
        d="M12 27c-4.5 0-8-3.2-8-7.6 0-3.6 2-5.9 3.4-8.4C9 8.2 9.7 5.7 9 2c2.6 1.8 4.6 4.4 5 7.6.3-1 .4-2 .3-3.1 2.7 2.6 5.7 6.6 5.7 11.9 0 4.4-3.5 7.6-8 7.6Z"
        fill="#f97316"
      />
      <path
        d="M12.5 25.5c-3.1 0-5.6-2.2-5.6-5.3 0-2.6 1.5-4.2 2.5-6 .9 1.6 1.4 3.3 1.2 5.2.6-1.6 1-3.3.6-5.4 1.9 1.6 4 4.3 4 7.6 0 3.1-2.6 4.9-2.7 3.9Z"
        fill="#fb923c"
      />
      <path
        d="M12 24.5c-1.7 0-3.1-1.3-3.1-3.1 0-1.7 1-2.7 1.8-3.9.4 1.3.6 2.3.4 3.6.7-1.6.7-2.9.1-4.3 1.4 1.3 2.9 2.9 2.9 4.9 0 1.8-1 2.8-2.1 2.8Z"
        fill="#fde68a"
      />
    </svg>
  );
}
