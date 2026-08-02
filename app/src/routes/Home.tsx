import { Link } from 'react-router'
import { stations } from '../data/stations'
import { ButtonLink } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { accentSoftBg, accentText } from '../lib/accents'
import { cn } from '../lib/cn'

const ENTRIES = [
  {
    to: '/estaciones',
    icon: '🔬',
    title: 'Estaciones interactivas',
    body: 'Genética, moléculas, ecosistemas y las leyes de Newton, con un tutor de IA especializado en cada tema.',
  },
  {
    to: '/tutor',
    icon: '💬',
    title: 'Tutor con IA',
    body: 'Pregunta lo que quieras sobre Ciencias Naturales y recibe la respuesta escribiéndose en vivo.',
  },
  {
    to: '/laboratorio',
    icon: '🧪',
    title: 'Laboratorio de prompts',
    body: 'Escribe un prompt y deja que la IA lo califique y te muestre cómo mejorarlo.',
  },
  {
    to: '/metacognicion',
    icon: '🧠',
    title: 'Metacognición',
    body: 'Cómo verificamos lo que responde la IA y por qué nunca nos quedamos con su primera respuesta.',
  },
]

export function Home() {
  return (
    <>
      <section className="border-line relative overflow-hidden border-b">
        <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl px-4 py-16 text-center sm:py-24">
          <p className="text-brand text-sm font-semibold tracking-wide uppercase">
            Feria de la Ciencia
          </p>
          <h1 className="font-display mt-3 text-4xl font-bold text-balance sm:text-6xl">
            Ciencias Naturales,
            <span className="text-brand"> pensadas con IA</span>
          </h1>
          <p className="text-ink-2 mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-pretty">
            La inteligencia artificial está transformando la forma en que aprendemos. Aquí
            exploramos cómo puede ayudarnos a comprender conceptos complejos, pero siempre
            manteniendo una postura crítica y reflexiva. No se trata de que la IA piense por
            nosotros, sino de que sea una aliada en nuestro proceso de aprendizaje.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink to="/estaciones">Recorrer las estaciones</ButtonLink>
            <ButtonLink to="/tutor" variant="secondary">
              Hablar con el tutor
            </ButtonLink>
          </div>
          <p className="text-ink-3 mt-6 text-sm">
            I.E. Luis Andrade Valderrama · Giraldo, Antioquia
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14">
        <h2 className="sr-only">Secciones de la aplicación</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {ENTRIES.map((entry) => (
            <Link
              key={entry.to}
              to={entry.to}
              className="bg-surface border-line rounded-card shadow-soft hover:shadow-lift hover:border-line-strong block border p-6 transition-all"
            >
              <span aria-hidden="true" className="text-3xl">
                {entry.icon}
              </span>
              <h3 className="mt-3 text-xl font-semibold">{entry.title}</h3>
              <p className="text-ink-2 mt-2 leading-relaxed">{entry.body}</p>
              <span className="text-brand mt-4 inline-block text-sm font-medium">
                Entrar <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Las cuatro estaciones</h2>
        <p className="text-ink-2 mt-2">Cada una con su propio tutor especializado.</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {stations.map((station) => (
            <li key={station.id}>
              <Link
                to={`/estaciones/${station.id}`}
                className={cn(
                  'rounded-card flex items-center gap-4 border p-4 transition-colors',
                  accentSoftBg[station.accent],
                  'border-line hover:border-line-strong',
                )}
              >
                <span aria-hidden="true" className="text-2xl">
                  {station.emoji}
                </span>
                <span>
                  <span className={cn('block font-semibold', accentText[station.accent])}>
                    {station.title}
                  </span>
                  <span className="text-ink-2 block text-sm">{station.subtitle}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <Card className="p-6 sm:p-8">
          <h2 className="text-xl font-semibold">
            <span aria-hidden="true">⚖️ </span>
            Una advertencia honesta
          </h2>
          <p className="text-ink-2 mt-3 leading-relaxed">
            La IA de esta aplicación puede equivocarse, igual que cualquier otra. Está pensada
            para darte un punto de partida, no una verdad final. Contrasta siempre lo que leas
            aquí con tu libro, tu profesor y tus propios experimentos.
          </p>
          <ButtonLink to="/metacognicion" variant="secondary" className="mt-5">
            Ver cómo lo verificamos
          </ButtonLink>
        </Card>
      </section>
    </>
  )
}
