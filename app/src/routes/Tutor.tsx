import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { getStation, stations } from '../data/stations'
import { promptExamples } from '../data/promptExamples'
import { useChat } from '../hooks/useChat'
import type { TutorScope } from '../lib/ai/types'
import { Button } from '../components/ui/Button'
import { Badge, Card } from '../components/ui/Card'
import { accentText } from '../lib/accents'
import { cn } from '../lib/cn'

function PromptGuide() {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="border-line bg-surface hover:border-line-strong flex w-full items-center justify-between rounded-card border px-4 py-3 text-left text-sm font-medium transition-colors"
      >
        <span>
          <span aria-hidden="true">💡 </span>
          Guía: cómo hacer buenos prompts
        </span>
        <span aria-hidden="true" className="text-ink-3">
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <p className="text-ink-2 text-sm leading-relaxed">
            Un prompt efectivo es claro, específico y contextualizado. Así se transforma una
            pregunta vaga en una que genera respuestas útiles:
          </p>
          {promptExamples.map((example) => (
            <Card key={example.good} className="p-4">
              <p className="text-danger text-sm font-semibold">
                <span aria-hidden="true">✗ </span>Prompt vago
              </p>
              <p className="text-ink-2 mt-1 text-sm italic">"{example.bad}"</p>

              <p className="text-ok mt-3 text-sm font-semibold">
                <span aria-hidden="true">✓ </span>Prompt efectivo
              </p>
              <p className="text-ink-2 mt-1 text-sm italic">"{example.good}"</p>

              <p className="bg-raised text-ink-2 mt-3 rounded-md p-3 text-sm">
                <span className="text-ink font-semibold">Por qué funciona mejor: </span>
                {example.reason}
              </p>
            </Card>
          ))}
          <p className="text-ink-3 text-sm">
            ¿Quieres que la IA califique tu propio prompt?{' '}
            <Link to="/laboratorio" className="text-brand font-medium underline">
              Ve al Laboratorio de Prompts
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  )
}

export function Tutor() {
  const { stationId } = useParams()
  const station = getStation(stationId)
  const scope: TutorScope = station ? station.id : 'general'

  const { messages, status, notice, send, stop, reset } = useChat(scope)
  const [draft, setDraft] = useState('')
  const streamEndRef = useRef<HTMLDivElement>(null)

  const streaming = status === 'streaming'

  // Al cambiar de estación se empieza una conversación nueva: el tutor de
  // Newton no debería arrastrar el historial de genética.
  useEffect(() => {
    reset()
    setDraft('')
  }, [scope, reset])

  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [messages])

  function submit(text: string) {
    void send(text)
    setDraft('')
  }

  const suggestions = station?.suggestions ?? [
    '¿Por qué el hielo flota en el agua?',
    'Explícame la fotosíntesis con una analogía de una fábrica',
    'Dame tres ejemplos cotidianos de la Tercera Ley de Newton',
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header>
        <p className="text-brand text-sm font-semibold tracking-wide uppercase">Tutor con IA</p>
        <h1 className="font-display mt-2 text-3xl font-bold">
          {station ? station.title : 'Pregunta lo que quieras'}
        </h1>
        <p className="text-ink-2 mt-2 leading-relaxed">
          {station
            ? station.content.interactivePrompt
            : 'Escribe una pregunta sobre Ciencias Naturales. Entre más específica, mejor será la respuesta.'}
        </p>
      </header>

      <nav aria-label="Elegir tutor" className="mt-5 flex flex-wrap gap-2">
        <Link
          to="/tutor"
          className={cn(
            'rounded-pill border px-3 py-1.5 text-sm font-medium transition-colors',
            scope === 'general'
              ? 'bg-brand-soft border-brand/40 text-brand'
              : 'border-line text-ink-2 hover:border-line-strong',
          )}
        >
          General
        </Link>
        {stations.map((item) => (
          <Link
            key={item.id}
            to={`/tutor/${item.id}`}
            className={cn(
              'rounded-pill border px-3 py-1.5 text-sm font-medium transition-colors',
              scope === item.id
                ? cn('bg-raised border-line-strong', accentText[item.accent])
                : 'border-line text-ink-2 hover:border-line-strong',
            )}
          >
            <span aria-hidden="true">{item.emoji} </span>
            {item.title}
          </Link>
        ))}
      </nav>

      <PromptGuide />

      <Card className="mt-6 overflow-hidden">
        <div
          /* Con altura acotada el panel scrollea por dentro y el campo de
             escritura no se aleja tras unos cuantos turnos. */
          className="min-h-64 max-h-[55vh] space-y-4 overflow-y-auto p-4 sm:max-h-[28rem]"
          /* El lector de pantalla anuncia la respuesta cuando termina de
             escribirse, sin interrumpir en cada token. */
          aria-live="polite"
          aria-busy={streaming}
        >
          {messages.length === 0 ? (
            <div className="text-ink-3 py-10 text-center">
              <p aria-hidden="true" className="text-4xl">
                💬
              </p>
              <p className="mt-3">Hazme una pregunta para empezar.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-card px-4 py-3',
                    message.role === 'user'
                      ? 'bg-brand text-on-brand'
                      : 'bg-raised text-ink border-line border',
                  )}
                >
                  {message.role === 'assistant' && message.source === 'offline' && (
                    <Badge className="border-warn/40 bg-warn-soft mb-2">
                      <span aria-hidden="true">📡</span>
                      Sin conexión · base local
                    </Badge>
                  )}
                  <p className="leading-relaxed whitespace-pre-line">
                    {message.content}
                    {streaming && message.role === 'assistant' && !message.content && (
                      <span className="text-ink-3">Pensando…</span>
                    )}
                    {streaming && message.role === 'assistant' && message.content && (
                      <span aria-hidden="true" className="animate-blink">
                        ▍
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={streamEndRef} />
        </div>

        {notice && (
          <p role="status" className="bg-warn-soft text-ink border-line border-t px-4 py-2 text-sm">
            {notice}
          </p>
        )}

        <div className="border-line bg-raised border-t p-3">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              submit(draft)
            }}
            className="flex gap-2"
          >
            <label htmlFor="pregunta" className="sr-only">
              Tu pregunta
            </label>
            <input
              id="pregunta"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Escribe tu pregunta…"
              autoComplete="off"
              disabled={streaming}
              className="bg-surface border-line text-ink placeholder:text-ink-3 flex-1 rounded-pill border px-4 py-2.5 text-sm"
            />
            {streaming ? (
              <Button type="button" variant="danger" onClick={stop}>
                Detener
              </Button>
            ) : (
              <Button type="submit" disabled={!draft.trim()}>
                Enviar
              </Button>
            )}
          </form>

          {messages.length === 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    onClick={() => submit(suggestion)}
                    className="border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink rounded-pill border px-3 py-1.5 text-left text-xs transition-colors"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {messages.length > 0 && (
            <div className="mt-2 flex justify-end">
              <Button variant="ghost" size="sm" onClick={reset}>
                Empezar de nuevo
              </Button>
            </div>
          )}
        </div>
      </Card>

      <p className="text-ink-3 mt-4 text-sm leading-relaxed">
        <span aria-hidden="true">⚖️ </span>
        La IA puede equivocarse. Contrasta lo que leas aquí con tu libro, tu profesor y tus propios
        experimentos: de eso trata la{' '}
        <Link to="/metacognicion" className="underline">
          sección de metacognición
        </Link>
        .
      </p>
    </div>
  )
}
