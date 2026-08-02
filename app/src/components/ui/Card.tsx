import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('bg-surface border border-line rounded-card shadow-soft', className)}>
      {children}
    </div>
  )
}

export function Badge({
  className,
  children,
  icon,
}: {
  className?: string
  children: ReactNode
  icon?: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium',
        'bg-raised text-ink-2 border border-line',
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}

/** Encabezado de seccion reutilizable: titulo grande + bajada opcional. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
}: {
  eyebrow?: string
  title: string
  lead?: string
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="text-brand text-sm font-semibold tracking-wide uppercase">{eyebrow}</p>
      )}
      <h1 className="mt-2 text-3xl font-bold text-balance sm:text-4xl">{title}</h1>
      {lead && <p className="text-ink-2 mt-3 leading-relaxed text-pretty">{lead}</p>}
    </div>
  )
}
