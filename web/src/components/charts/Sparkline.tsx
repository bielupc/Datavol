import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useMemo, useRef } from 'react';

/**
 * Mini-gràfic per a les targetes d'exercici. El traç es dibuixa progressivament
 * animant `pathLength`, que és la manera més neta de fer-ho en SVG.
 */
export function Sparkline({
  values,
  width = 120,
  height = 34,
}: {
  values: number[];
  width?: number;
  height?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });
  const reduced = useReducedMotion();

  const { line, area } = useMemo(() => {
    if (values.length < 2) return { line: '', area: '' };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const pad = 3;
    const points = values.map((v, i) => {
      const x = (i / (values.length - 1)) * (width - pad * 2) + pad;
      const y = height - pad - ((v - min) / range) * (height - pad * 2);
      return [x, y] as const;
    });
    const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    const area = `${line} L${points[points.length - 1][0].toFixed(1)},${height} L${points[0][0].toFixed(1)},${height} Z`;
    return { line, area };
  }, [values, width, height]);

  if (!line) return <div style={{ width, height }} />;

  const gradientId = `spark-${values.join('-').slice(0, 24)}`;

  return (
    <svg ref={ref} width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill={`url(#${gradientId})`}
        initial={{ opacity: reduced ? 1 : 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.3, delay: 0.2 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        // L'opacitat evita que es vegi un punt solt abans que comenci el traç.
        initial={{ pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0 }}
        animate={inView ? { pathLength: 1, opacity: 1 } : {}}
        transition={{
          pathLength: { duration: reduced ? 0 : 0.5, ease: [0.23, 1, 0.32, 1] },
          opacity: { duration: 0.15 },
        }}
      />
    </svg>
  );
}
