import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-pill ' +
  'transition-colors disabled:opacity-50 disabled:pointer-events-none select-none'

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-on-brand hover:bg-brand-hover',
  secondary: 'bg-raised text-ink border border-line hover:border-line-strong',
  ghost: 'text-ink-2 hover:text-ink hover:bg-raised',
  danger: 'bg-danger-soft text-danger border border-danger/30 hover:border-danger/60',
}

const sizes: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2.5',
}

interface CommonProps {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  )
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  className,
  children,
}: CommonProps & { to: string }) {
  return (
    <Link to={to} className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </Link>
  )
}
