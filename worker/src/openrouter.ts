import type { ChatMessage, Env } from './types'
import { LIMITS } from './guard'

const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'

/**
 * Permite apuntar a un simulador local durante las pruebas. En produccion no
 * se define y se usa OpenRouter.
 */
function endpointFor(env: Env): string {
  return env.OPENROUTER_BASE_URL?.trim() || ENDPOINT
}

/**
 * Lista blanca de modelos.
 *
 * El cliente nunca elige modelo. Si en el futuro se configura `MODEL` con un
 * valor que no este aqui, el Worker cae al de por defecto en vez de gastar
 * en algo inesperadamente caro.
 */
const ALLOWED_MODELS = new Set([
  'google/gemini-2.0-flash-001',
  'google/gemini-flash-1.5',
  'openai/gpt-4o-mini',
  'anthropic/claude-3.5-haiku',
  'meta-llama/llama-3.3-70b-instruct',
  'deepseek/deepseek-chat',
])

const DEFAULT_MODEL = 'google/gemini-2.0-flash-001'

export function resolveModel(env: Env): string {
  const configured = env.MODEL?.trim()
  return configured && ALLOWED_MODELS.has(configured) ? configured : DEFAULT_MODEL
}

interface CallOptions {
  env: Env
  system: string
  messages: ChatMessage[]
  stream: boolean
  /** El evaluador necesita respuestas deterministas; el tutor, algo de soltura. */
  temperature?: number
  maxTokens?: number
}

export function callOpenRouter({
  env,
  system,
  messages,
  stream,
  temperature = 0.6,
  maxTokens = LIMITS.maxTokens,
}: CallOptions): Promise<Response> {
  return fetch(endpointFor(env), {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      'content-type': 'application/json',
      // OpenRouter usa estas dos para su ranking publico de aplicaciones.
      'http-referer': env.PUBLIC_URL,
      'x-title': 'NaturIA',
    },
    body: JSON.stringify({
      model: resolveModel(env),
      stream,
      temperature,
      max_tokens: maxTokens,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  })
}
