import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { ApiErrorCode, EvaluateResponse, Env } from './types'
import { EVALUATOR_PROMPT, systemPromptFor } from './prompts'
import { LIMITS, consumeDailyBudget, isTutorScope, sanitizeMessages, withinRateLimit } from './guard'
import { callProvider } from './provider-call'
import type { Provider } from './providers'
import { resolveModel, resolveProvider } from './providers'

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
  provider_busy: 429,
  budget_exhausted: 429,
  upstream_error: 502,
  not_configured: 503,
}

function fail(code: ApiErrorCode, message: string) {
  return Response.json({ error: { code, message } }, { status: STATUS[code] })
}

/**
 * Traduce un fallo del proveedor en algo que el visitante entienda.
 *
 * El 429 se separa del resto a proposito. Los niveles gratuitos tienen un
 * limite por minuto bastante bajo (10 a 15 peticiones en Gemini), asi que en
 * un stand con cola es lo que mas se va a ver. No es una averia ni un abuso:
 * es simplemente que varias personas preguntaron a la vez, y decirlo asi
 * evita que parezca que la aplicacion se rompio.
 */
function falloDeProveedor(estado: number) {
  if (estado === 429) {
    return fail(
      'provider_busy',
      'Hay varias personas preguntando al mismo tiempo y el servicio de IA pidió una pausa. Te respondo desde la base local; vuelve a intentar en un momento.',
    )
  }
  return fail('upstream_error', 'El servicio de IA no está disponible en este momento.')
}

/** Comprobaciones comunes a los dos endpoints que gastan tokens. */
async function preflight(env: Env, request: Request): Promise<Response | null> {
  if (!env.AI_API_KEY) {
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

app.get('/api/health', (c) => {
  const provider = resolveProvider(c.env)
  const modelo = resolveModel(c.env, provider)

  return c.json({
    ok: true,
    configured: Boolean(c.env.AI_API_KEY),
    proveedor: provider.nombre,
    model: modelo.model,
    // Que un modelo de pago se cuele por una errata no puede pasar
    // desapercibido: aqui queda a la vista sin necesidad de leer registros.
    ...(modelo.pareceGratuito
      ? {}
      : {
          aviso: `El modelo "${modelo.model}" no parece pertenecer al nivel gratuito de ${provider.nombre}. Si no es lo que esperabas, revisa MODEL en wrangler.jsonc.`,
        }),
  })
})

/** Oculta cualquier cosa con forma de API key antes de devolver un error ajeno. */
function redactar(texto: string): string {
  return texto.replace(/(sk-|AIza)[a-zA-Z0-9_-]{8,}/g, '$1***').slice(0, 300)
}

/** Traduce el estado del proveedor a algo accionable, en español. */
function explicarUpstream(
  estado: number,
  provider: Provider,
): { causa: string; mensaje: string } {
  switch (estado) {
    case 400:
      return {
        causa: 'peticion_rechazada',
        mensaje: `${provider.nombre} rechazó la petición. Lo más común es que el identificador del modelo esté mal escrito. Consulta el catálogo en ${provider.catalogo}.`,
      }
    case 401:
    case 403:
      return {
        causa: 'llave_invalida',
        mensaje: `${provider.nombre} rechazó la API key. Revisa que la copiaste completa, que sigue activa y que corresponde al proveedor configurado (AI_PROVIDER).`,
      }
    case 402:
      return {
        causa: 'sin_creditos',
        mensaje: `Tu cuenta de ${provider.nombre} no tiene saldo para este modelo. Cambia MODEL por uno del nivel gratuito o carga créditos.`,
      }
    case 404:
      return {
        causa: 'modelo_inexistente',
        mensaje: `El modelo no existe o dejó de estar disponible. Los catálogos cambian seguido: busca uno vigente en ${provider.catalogo} y ponlo en MODEL.`,
      }
    case 429:
      return {
        causa: 'limite_proveedor',
        mensaje: `${provider.nombre} está limitando las peticiones. En su nivel gratuito son ${provider.limiteGratuito}. Espera un momento y vuelve a intentar.`,
      }
    default:
      return {
        causa: 'error_proveedor',
        mensaje: `${provider.nombre} respondió con un error inesperado.`,
      }
  }
}

/**
 * Comprobación en vivo del montaje.
 *
 * Hace una llamada real de un solo token y explica en español qué falló. Está
 * pensada para abrirse desde el navegador de un celular durante la
 * instalación, cuando no hay terminal a mano para leer registros.
 *
 * Consume presupuesto y pasa por el limitador como cualquier otra llamada:
 * gasta una petición real de la cuota, y no tendría sentido que fuera la vía
 * para saltarse los topes.
 */
app.get('/api/diagnostico', async (c) => {
  const provider = resolveProvider(c.env)
  const modelo = resolveModel(c.env, provider)
  const contexto = {
    proveedor: provider.nombre,
    modelo: modelo.model,
    modeloPorDefecto: modelo.porDefecto,
    pareceGratuito: modelo.pareceGratuito,
    limiteDelNivelGratuito: provider.limiteGratuito,
  }

  if (!c.env.AI_API_KEY) {
    return c.json({
      ok: false,
      causa: 'sin_llave',
      mensaje:
        'Falta el secreto AI_API_KEY en el Worker. Añádelo en GitHub y vuelve a lanzar el workflow "Desplegar el Worker de IA".',
      ...contexto,
    })
  }

  if (!(await withinRateLimit(c.env, c.req.raw))) {
    return c.json({
      ok: false,
      causa: 'ritmo',
      mensaje: 'Vas muy rápido. Espera unos segundos y recarga.',
      ...contexto,
    })
  }

  if (!(await consumeDailyBudget(c.env))) {
    return c.json({
      ok: false,
      causa: 'presupuesto_agotado',
      mensaje:
        'Se agotó el presupuesto diario que fija DAILY_BUDGET. El Worker está bien; simplemente no queda cuota por hoy.',
      ...contexto,
    })
  }

  let upstream: Response
  try {
    upstream = await callProvider({
      env: c.env,
      system: 'Responde únicamente con la palabra: listo',
      messages: [{ role: 'user', content: 'ping' }],
      stream: false,
      temperature: 0,
      maxTokens: 1,
    })
  } catch {
    return c.json({
      ok: false,
      causa: 'red',
      mensaje: `El Worker no pudo comunicarse con ${provider.nombre}.`,
      ...contexto,
    })
  }

  if (upstream.ok) {
    return c.json({
      ok: true,
      mensaje: `Todo listo: ${provider.nombre} respondió correctamente. El tutor debería funcionar.`,
      ...contexto,
    })
  }

  const cuerpo = await upstream.text().catch(() => '')
  console.error('Diagnóstico:', provider.id, upstream.status, cuerpo)

  return c.json({
    ok: false,
    ...explicarUpstream(upstream.status, provider),
    estadoDelProveedor: upstream.status,
    detalle: redactar(cuerpo),
    ...contexto,
  })
})

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
    upstream = await callProvider({
      env: c.env,
      system: systemPromptFor(scope),
      messages: history,
      stream: true,
    })
  } catch {
    return fail('upstream_error', 'No pude comunicarme con el servicio de IA.')
  }

  if (!upstream.ok || !upstream.body) {
    // El cuerpo del error del proveedor puede traer la clave o detalles de
    // facturacion: se registra en el log del Worker y no se le devuelve a nadie.
    console.error('Proveedor respondió', upstream.status, await upstream.text().catch(() => ''))
    return falloDeProveedor(upstream.status)
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
    upstream = await callProvider({
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
    console.error('Proveedor respondió', upstream.status, await upstream.text().catch(() => ''))
    return falloDeProveedor(upstream.status)
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
