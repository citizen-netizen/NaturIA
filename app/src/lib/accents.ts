import type { StationAccent } from '../data/stations'

/**
 * Tailwind extrae las clases leyendo el codigo fuente, asi que no puede
 * resolver nombres construidos en tiempo de ejecucion (`text-${accent}`).
 * Este mapa mantiene las clases completas y visibles para el compilador.
 */
export const accentText: Record<StationAccent, string> = {
  violet: 'text-violet',
  cyan: 'text-cyan',
  green: 'text-green',
  amber: 'text-amber',
}

export const accentSoftBg: Record<StationAccent, string> = {
  violet: 'bg-violet-soft',
  cyan: 'bg-cyan-soft',
  green: 'bg-green-soft',
  amber: 'bg-amber-soft',
}

export const accentBorder: Record<StationAccent, string> = {
  violet: 'border-violet/35',
  cyan: 'border-cyan/35',
  green: 'border-green/35',
  amber: 'border-amber/35',
}

export const accentBar: Record<StationAccent, string> = {
  violet: 'bg-violet',
  cyan: 'bg-cyan',
  green: 'bg-green',
  amber: 'bg-amber',
}
