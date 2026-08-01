import { NavLink, Outlet, ScrollRestoration } from 'react-router'
import { useTheme } from '../hooks/useTheme'
import { useOnline } from '../hooks/useOnline'
import { cn } from '../lib/cn'

const NAV = [
  { to: '/', label: 'Inicio', icon: '🏠', end: true },
  { to: '/estaciones', label: 'Estaciones', icon: '🔬', end: false },
  { to: '/tutor', label: 'Tutor IA', icon: '💬', end: false },
  { to: '/laboratorio', label: 'Prompts', icon: '🧪', end: false },
  { to: '/metacognicion', label: 'Metacognición', icon: '🧠', end: false },
]

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      className="text-ink-2 hover:text-ink hover:bg-raised rounded-pill p-2 text-lg transition-colors"
      /* El icono es decorativo; el nombre accesible lo da aria-label. */
      aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      aria-pressed={isDark}
    >
      <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
    </button>
  )
}

function OfflineBanner() {
  const online = useOnline()
  if (online) return null

  return (
    <div
      role="status"
      className="bg-warn-soft text-ink border-line border-b px-4 py-2 text-center text-sm"
    >
      <span aria-hidden="true">📡 </span>
      Sin conexión. Puedes seguir explorando; el tutor responderá desde la base local.
    </div>
  )
}

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="bg-brand text-on-brand focus:ring-brand sr-only rounded-md px-4 py-2 focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
      >
        Saltar al contenido
      </a>

      <OfflineBanner />

      <header className="border-line bg-canvas/85 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <span aria-hidden="true" className="text-xl">
              🧬
            </span>
            <span className="font-display text-lg tracking-tight">NaturIA</span>
          </NavLink>

          <nav aria-label="Principal" className="ml-auto hidden sm:block">
            <ul className="flex items-center gap-1">
              {NAV.slice(1).map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'rounded-pill px-3 py-1.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-brand-soft text-brand'
                          : 'text-ink-2 hover:text-ink hover:bg-raised',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto sm:ml-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main id="contenido" className="flex-1">
        <Outlet />
      </main>

      <footer className="border-line text-ink-3 mt-16 border-t px-4 py-8 text-center text-sm">
        <p>Feria de la Ciencia · I.E. Luis Andrade Valderrama</p>
        <p className="mt-1">Giraldo, Antioquia</p>
      </footer>

      {/* Navegacion inferior: en un celular el pulgar no llega arriba. */}
      <nav
        aria-label="Principal"
        className="border-line bg-canvas/95 sticky bottom-0 z-40 border-t backdrop-blur sm:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <ul className="flex">
          {NAV.map((item) => (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors',
                    isActive ? 'text-brand' : 'text-ink-3',
                  )
                }
              >
                <span aria-hidden="true" className="text-base">
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <ScrollRestoration />
    </div>
  )
}
