import { Link, useParams } from 'react-router'
import { getStation } from '../data/stations'
import { ButtonLink } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { accentBar, accentSoftBg, accentText } from '../lib/accents'
import { cn } from '../lib/cn'
import { NotFound } from './NotFound'

export function StationDetail() {
  const { stationId } = useParams()
  const station = getStation(stationId)

  if (!station) return <NotFound />

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/estaciones" className="text-ink-2 hover:text-ink text-sm font-medium">
        <span aria-hidden="true">←</span> Volver a estaciones
      </Link>

      <header className={cn('rounded-card mt-6 overflow-hidden border-line border')}>
        <div className={cn('h-2 w-full', accentBar[station.accent])} aria-hidden="true" />
        <div className={cn('p-6 sm:p-8', accentSoftBg[station.accent])}>
          <span aria-hidden="true" className="text-5xl">
            {station.emoji}
          </span>
          <h1 className="font-display mt-3 text-3xl font-bold sm:text-4xl">{station.title}</h1>
          <p className={cn('mt-1 text-lg font-medium', accentText[station.accent])}>
            {station.subtitle}
          </p>
        </div>
      </header>

      <Card className="mt-6 p-6 sm:p-8">
        <h2 className="text-xl font-semibold">¿Qué aprenderás aquí?</h2>
        <p className="text-ink-2 mt-3 leading-relaxed">{station.content.intro}</p>

        <h3 className="mt-8 text-lg font-semibold">Conceptos clave</h3>
        <ul className="mt-3 space-y-3">
          {station.content.keyPoints.map((point) => (
            <li key={point} className="flex gap-3">
              <span
                aria-hidden="true"
                className={cn('mt-2 h-1.5 w-1.5 shrink-0 rounded-full', accentBar[station.accent])}
              />
              <span className="text-ink-2 leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mt-6 p-6 sm:p-8">
        <h2 className="text-xl font-semibold">
          <span aria-hidden="true">💬 </span>
          Explora con IA
        </h2>
        <p className="text-ink-2 mt-3 leading-relaxed">{station.content.interactivePrompt}</p>
        <ButtonLink to={`/tutor/${station.id}`} className="mt-5">
          Abrir el tutor de esta estación
        </ButtonLink>
      </Card>
    </div>
  )
}
