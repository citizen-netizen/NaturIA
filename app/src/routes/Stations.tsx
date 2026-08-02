import { Link } from 'react-router'
import { stations } from '../data/stations'
import { SectionHeading } from '../components/ui/Card'
import { accentBar, accentText } from '../lib/accents'
import { cn } from '../lib/cn'

export function Stations() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <SectionHeading
        eyebrow="Recorrido"
        title="Estaciones interactivas"
        lead="Cuatro temas de Ciencias Naturales. Lee los conceptos clave y luego pregúntale al tutor de esa estación lo que quieras profundizar."
      />

      <ul className="mt-10 grid gap-5 sm:grid-cols-2">
        {stations.map((station) => (
          <li key={station.id}>
            <Link
              to={`/estaciones/${station.id}`}
              className="bg-surface border-line rounded-card shadow-soft hover:shadow-lift hover:border-line-strong group block overflow-hidden border transition-all"
            >
              <div className={cn('h-1.5 w-full', accentBar[station.accent])} aria-hidden="true" />
              <div className="p-6">
                <span aria-hidden="true" className="text-4xl">
                  {station.emoji}
                </span>
                <h2 className="mt-3 text-xl font-semibold">{station.title}</h2>
                <p className={cn('mt-1 text-sm font-medium', accentText[station.accent])}>
                  {station.subtitle}
                </p>
                <p className="text-ink-2 mt-3 leading-relaxed">{station.description}</p>
                <span className="text-brand mt-4 inline-block text-sm font-medium">
                  Explorar <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
