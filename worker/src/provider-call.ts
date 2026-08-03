import type { ChatMessage, Env } from './types'
import { LIMITS } from './guard'
import { resolveModel, resolveProvider } from './providers'

interface CallOptions {
  env: Env
  system: string
  messages: ChatMessage[]
  stream: boolean
  /** El evaluador necesita respuestas deterministas; el tutor, algo de soltura. */
  temperature?: number
  maxTokens?: number
}

/**
 * Llama al proveedor de IA configurado.
 *
 * El cuerpo es el de la API de OpenAI, que es el formato que hablan tanto
 * OpenRouter como el endpoint de compatibilidad de Gemini.
 */
export function callProvider({
  env,
  system,
  messages,
  stream,
  temperature = 0.6,
  maxTokens = LIMITS.maxTokens,
}: CallOptions): Promise<Response> {
  const provider = resolveProvider(env)
  const { model } = resolveModel(env, provider)

  return fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.AI_API_KEY}`,
      'content-type': 'application/json',
      ...provider.headers(env),
    },
    body: JSON.stringify({
      model,
      stream,
      temperature,
      max_tokens: maxTokens,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  })
}
