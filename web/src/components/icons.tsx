/**
 * Icones mínimes en línia (24×24, `currentColor`) per no afegir cap llibreria
 * només per a quatre pictogrames de la barra de navegació.
 */
import type { SVGProps } from 'react';

function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={18}
      height={18}
      aria-hidden
      {...props}
    />
  );
}

export function IconChart(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M4 19V10M11 19V5M18 19v-6" />
    </Icon>
  );
}

export function IconDumbbell(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M6.5 8.5v7M17.5 8.5v7M2.5 10.5v3M21.5 10.5v3M6.5 12h11" />
    </Icon>
  );
}

export function IconCalendar(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v3.4M16 3v3.4" />
    </Icon>
  );
}

export function IconUpload(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 15V4M8 8l4-4 4 4" />
      <path d="M4.5 15v3a2.5 2.5 0 0 0 2.5 2.5h10a2.5 2.5 0 0 0 2.5-2.5v-3" />
    </Icon>
  );
}

/** Flama plena (no d'stroke): fa de base per a l'indicador de ratxa. */
export function IconFlame(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={22} height={22} aria-hidden {...props}>
      <path d="M12.5 2c.3 2.4-.5 3.8-1.8 5.2-1.5 1.6-3.2 3.4-3.2 6.3a4.5 4.5 0 0 0 9 0c0-1-.3-1.8-.7-2.5.9.6 1.7 1.7 1.7 3.3a5.5 5.5 0 1 1-11 0c0-4.4 3-6.6 4.8-8.7C12.4 4.4 12.7 3.3 12.5 2Z" />
    </svg>
  );
}

export function IconSearch(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon width={20} height={20} {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M19 19l-4.35-4.35" />
    </Icon>
  );
}

export function IconClose(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon width={20} height={20} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  );
}

export function IconCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon width={20} height={20} {...props}>
      <path d="M5 13l4.5 4.5L19 7" />
    </Icon>
  );
}

export function IconTrash(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M4.5 7h15M9.5 7V4.8c0-.4.4-.8.9-.8h3.2c.5 0 .9.4.9.8V7" />
      <path d="M6.5 7l.9 12.1c.1 1 .9 1.9 1.9 1.9h5.4c1 0 1.8-.8 1.9-1.9L17.5 7" />
      <path d="M10.2 11v6M13.8 11v6" />
    </Icon>
  );
}

export function IconFile(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M7 3.5h6.5l4 4V19a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z" />
      <path d="M13.2 3.5V8h4.3" />
    </Icon>
  );
}
