import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { stations } from '../data/stations'
import { promptCriteria, promptExamples } from '../data/promptExamples'
import { evaluatePrompt } from '../lib/ai/client'
import { AiError } from '../lib/ai/types'
import type { EvaluateResponse, TutorScope } from '../lib/ai/types'
import { Button } from '../components/ui/Button'
import { Card, SectionHeading } from '../components/ui/Card'
import { cn } from '../lib/cn'

const MAX_CHARS = 800

function scoreTone(score: number): { label: string; className: string } {
  if (score >= 75) return { label: 'Buen prompt', className: 'text-ok' }
  if (score >= 45) return { label: 'Va por buen camino', className: 'text-warn' }
  return { label: 'Necesita trabajo', className: 'text-danger' }
}

function ScoreDial({ score }: { score: number }) {
  const tone = scoreTone(score)
  return (
    <div className="flex items-center gap-4">
      <div
        className="border-line bg-raised flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-4"
        role="img"
        aria-label={`Puntaje: ${score} sobre 100`}
      >
        <span className="font-display text-2xl leading-none font-bold">{score}</span>
        <span className="text-ink-3 text-[10px]">/ 100</span>
      </div>
      <p className={cn('text-lg font-semibold', tone.className)}>{tone.label}</p>
    </div>
  )
}

export function PromptLab() {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [scope, setScope] = useState<TutorScope>('general')
  const [result, setResult] = useState<EvaluateResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // Si alguien navega fuera mientras se evalúa, se cancela la petición.
  useEffect(() => () => abortRef.current?.abort(), [])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const text = prompt.trim()
    if (text.length < 5 || busy) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setBusy(true)
    setError(null)
    setResult(null)

    try {
      setResult(await evaluatePrompt(text, scope, controller.signal))
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === 'AbortError') return
      setError(
        caught instanceof AiError
          ? caught.message
          : 'No pude evaluar tu prompt. Inténtalo de nuevo.',
      )
    } finally {
      setBusy(false)
      abortRef.current = null
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <SectionHeading
        eyebrow="Ejercicio"
        title="Laboratorio de Prompts"
        lead="Escribe el prompt que le harías a una IA para estudiar un tema. La IA lo va a calificar, te dirá qué le falta y te lo devolverá reescrito."
      />

      <Card className="mt-8 p-5 sm:p-6">
        <form onSubmit={handleSubmit}>
          <label htmlFor="tema" className="block text-sm font-medium">
            Tema
          </label>
          <select
            id="tema"
            value={scope}
            onChange={(event) => setScope(event.target.value as TutorScope)}
            className="border-line bg-surface text-ink mt-2 w-full rounded-md border px-3 py-2 text-sm"
          >
            <option value="general">General</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.title}
              </option>
            ))}
          </select>

          <label htmlFor="prompt" className="mt-5 block text-sm font-medium">
            Tu prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value.slice(0, MAX_CHARS))}
            rows={4}
            placeholder="Ejemplo: Actúa como profesor de biología y explícame por qué…"
            aria-describedby="contador"
            className="border-line bg-surface text-ink placeholder:text-ink-3 mt-2 w-full rounded-md border px-3 py-2 text-sm"
          />
          <p id="contador" className="text-ink-3 mt-1 text-right text-xs">
            {prompt.length} / {MAX_CHARS}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <Button type="submit" disabled={prompt.trim().length < 5 || busy}>
              {busy ? 'Evaluando…' : 'Evaluar mi prompt'}
            </Button>
            {prompt && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPrompt('')
                  setResult(null)
                  setError(null)
                }}
              >
                Limpiar
              </Button>
            )}
          </div>
        </form>
      </Card>

      <div aria-live="polite">
        {error && (
          <Card className="border-danger/40 bg-danger-soft mt-5 p-4">
            <p className="text-sm">{error}</p>
            <p className="text-ink-2 mt-2 text-sm">
              El evaluador necesita conexión. Mientras tanto, puedes compararte con los ejemplos de
              abajo.
            </p>
          </Card>
        )}

        {result && (
          <Card className="mt-5 p-5 sm:p-6">
            <ScoreDial score={result.score} />
            <p className="text-ink-2 mt-4 leading-relaxed">{result.verdict}</p>

            {result.strengths.length > 0 && (
              <>
                <h2 className="text-ok mt-6 text-sm font-semibold">Lo que ya haces bien</h2>
                <ul className="mt-2 space-y-1.5">
                  {result.strengths.map((item) => (
                    <li key={item} className="text-ink-2 flex gap-2 text-sm">
                      <span aria-hidden="true" className="text-ok">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {result.improvements.length > 0 && (
              <>
                <h2 className="text-warn mt-5 text-sm font-semibold">Qué puedes mejorar</h2>
                <ul className="mt-2 space-y-1.5">
                  {result.improvements.map((item) => (
                    <li key={item} className="text-ink-2 flex gap-2 text-sm">
                      <span aria-hidden="true" className="text-warn">
                        →
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {result.rewritten && (
              <div className="bg-raised border-line mt-6 rounded-card border p-4">
                <h2 className="text-sm font-semibold">Tu prompt, reescrito</h2>
                <p className="text-ink-2 mt-2 text-sm leading-relaxed italic">
                  "{result.rewritten}"
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => setPrompt(result.rewritten)}>
                    Usarlo como base
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      navigate(scope === 'general' ? '/tutor' : `/tutor/${scope}`)
                    }
                  >
                    Probarlo con el tutor
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Con qué se te califica</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {promptCriteria.map((criterion) => (
            <Card key={criterion.name} className="p-4">
              <dt className="font-semibold">{criterion.name}</dt>
              <dd className="text-ink-2 mt-1 text-sm leading-relaxed">{criterion.detail}</dd>
            </Card>
          ))}
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Ejemplos para inspirarte</h2>
        <ul className="mt-4 space-y-3">
          {promptExamples.map((example) => (
            <li key={example.good}>
              <Card className="p-4">
                <p className="text-danger text-sm font-semibold">
                  <span aria-hidden="true">✗ </span>Vago
                </p>
                <p className="text-ink-2 mt-1 text-sm italic">"{example.bad}"</p>
                <p className="text-ok mt-3 text-sm font-semibold">
                  <span aria-hidden="true">✓ </span>Efectivo
                </p>
                <p className="text-ink-2 mt-1 text-sm italic">"{example.good}"</p>
                <button
                  type="button"
                  onClick={() => setPrompt(example.good)}
                  className="text-brand mt-3 text-sm font-medium underline"
                >
                  Probar este prompt
                </button>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
