import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { ApiErrorCode, EvaluateResponse, Env } from './types'
import { EVALUATOR_PROMPT, systemPromptFor } from './prompts'
import { LIMITS, consumeDailyBudget, isTutorScope, sanitizeMessages, withinRateLimit } from './guard'
import { callOpenRouter, resolveModel } from './openrouter'

const app = new Hono<{ Bindings: Env }>()

/**
 * CORS restringido a los origenes configurados.
 *
 * Esto impide que otra pagina web use el Worker desde el navegador, pero no
 * detiene a quien llame con curl: el navegador es el unico que respeta CORS.
 * Por eso el limitador y el presupuesto diario son las defensas de verdad.
 */
app.use(
  '/api/*',
  cors({
    origin: (origin, c) => {
      // El callback de `cors` recibe un Context sin Bindings, asi que `env`
      // llega sin tipar y hay que reafirmarlo.
      const env = c.env as Env
      const allowed = (env.ALLOWED_ORIGINS ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
      if (allowed.includes('*')) return origin
      return allowed.includes(origin) ? origin : null
    },
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    allowHeaders: ['content-type'],
    maxAge: 86400,
  }),
)

const STATUS: Record<ApiErrorCode, 400 | 429 | 500 | 502 | 503> = {
  bad_request: 400,
  rate_limited: 429,
  budget_exhausted: 429,
  upstream_error: 502,
  not_configured: 503,
}

function fail(code: ApiErrorCode, message: string) {
  return Response.json({ error: { code, message } }, { status: STATUS[code] })
}

/** Comprobaciones comunes a los dos endpoints que gastan tokens. */
async function preflight(env: Env, request: Request): Promise<Response | null> {
  if (!env.OPENROUTER_API_KEY) {
    return fail(
      'not_configured',
      'El servicio de IA todavía no está configurado. Avísale a quien montó el stand.',
    )
  }
  if (!(await withinRateLimit(env, request))) {
    return fail('rate_limited', 'Vas muy rápido. Espera unos segundos y vuelve a intentarlo.')
  }
  if (!(await consumeDailyBudget(env))) {
    return fail(
      'budget_exhausted',
      'Se agotó la cuota de IA de hoy. Puedes seguir usando la app: las respuestas vendrán de la base de conocimiento local.',
    )
  }
  return null
}

app.get('/api/health', (c) =>
  c.json({
    ok: true,
    configured: Boolean(c.env.OPENROUTER_API_KEY),
    model: resolveModel(c.env),
  }),
)

app.post('/api/chat', async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return fail('bad_request', 'La petición no es JSON válido.')
  }

  const { scope, messages } = (body ?? {}) as Record<string, unknown>

  if (!isTutorScope(scope)) {
    return fail('bad_request', 'La estación indicada no existe.')
  }

  const history = sanitizeMessages(messages)
  if (!history) {
    return fail('bad_request', 'No recibí ninguna pregunta válida.')
  }

  const blocked = await preflight(c.env, c.req.raw)
  if (blocked) return blocked

  let upstream: Response
  try {
    upstream = await callOpenRouter({
      env: c.env,
      system: systemPromptFor(scope),
      messages: history,
      stream: true,
    })
  } catch {
    return fail('upstream_error', 'No pude comunicarme con el servicio de IA.')
  }

  if (!upstream.ok || !upstream.body) {
    // El cuerpo del error de OpenRouter puede traer la clave o detalles de
    // facturacion: se registra en el log del Worker y no se le devuelve a nadie.
    console.error('OpenRouter respondió', upstream.status, await upstream.text().catch(() => ''))
    return fail('upstream_error', 'El servicio de IA no está disponible en este momento.')
  }

  /*
    Se devuelve `upstream.body` tal cual. Al no leerlo aqui, los fragmentos
    viajan al navegador a medida que llegan y el Worker no acumula la
    respuesta en memoria.
  */
  return new Response(upstream.body, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-store',
      connection: 'keep-alive',
    },
  })
})

/**
 * Los modelos devuelven JSON con envoltorios: bloques ```json, una frase
 * introductoria, texto sobrante al final. `response_format` no se puede
 * exigir porque no todos los modelos de OpenRouter lo soportan, asi que se
 * extrae el objeto a mano.
 */
function extractJson(raw: string): unknown {
  const withoutFences = raw.replace(/^\s*```(?:json)?/i, '').replace(/```\s*$/, '')
  const start = withoutFences.indexOf('{')
  const end = withoutFences.lastIndexOf('}')
  if (start === -1 || end <= start) return null
  try {
    return JSON.parse(withoutFences.slice(start, end + 1))
  } catch {
    return null
  }
}

function asStringArray(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string').slice(0, max)
}

app.post('/api/evaluate-prompt', async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return fail('bad_request', 'La petición no es JSON válido.')
  }

  const { prompt, scope } = (body ?? {}) as Record<string, unknown>

  if (typeof prompt !== 'string' || prompt.trim().length < 5) {
    return fail('bad_request', 'Escribe un prompt un poco más largo para poder evaluarlo.')
  }
  if (!isTutorScope(scope)) {
    return fail('bad_request', 'La estación indicada no existe.')
  }

  const blocked = await preflight(c.env, c.req.raw)
  if (blocked) return blocked

  let upstream: Response
  try {
    upstream = await callOpenRouter({
      env: c.env,
      system: EVALUATOR_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Tema de la estación: ${scope}\n\nPrompt del estudiante:\n"""\n${prompt.trim().slice(0, LIMITS.maxPromptChars)}\n"""`,
        },
      ],
      stream: false,
      // Calificar tiene que dar resultados estables ante el mismo prompt.
      temperature: 0.2,
      maxTokens: 600,
    })
  } catch {
    return fail('upstream_error', 'No pude comunicarme con el servicio de IA.')
  }

  if (!upstream.ok) {
    console.error('OpenRouter respondió', upstream.status, await upstream.text().catch(() => ''))
    return fail('upstream_error', 'El servicio de IA no está disponible en este momento.')
  }

  const payload = (await upstream.json().catch(() => null)) as {
    choices?: Array<{ message?: { content?: string } }>
  } | null

  const content = payload?.choices?.[0]?.message?.content
  const parsed = typeof content === 'string' ? extractJson(content) : null

  if (!parsed || typeof parsed !== 'object') {
    return fail('upstream_error', 'La evaluación llegó en un formato que no pude leer.')
  }

  const raw = parsed as Record<string, unknown>
  const score = Number(raw.score)

  const result: EvaluateResponse = {
    score: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0,
    verdict: typeof raw.verdict === 'string' ? raw.verdict : 'Sin veredicto.',
    strengths: asStringArray(raw.strengths, 3),
    improvements: asStringArray(raw.improvements, 3),
    rewritten: typeof raw.rewritten === 'string' ? raw.rewritten : '',
  }

  return c.json(result)
})

app.all('/api/*', () => fail('bad_request', 'Ese endpoint no existe.'))

export default app
