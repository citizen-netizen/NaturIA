import { AiError } from './types'
import type { ApiErrorCode, ChatMessage, EvaluateResponse, TutorScope } from './types'
import { streamDeltas } from './sse'

/**
 * URL del Worker. Se inyecta en el build con VITE_API_URL; si falta, la app
 * sigue funcionando pero solo con la base de conocimiento local.
 */
const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export const isAiConfigured = API_URL.length > 0

const NOT_CONFIGURED = new AiError(
  'not_configured',
  'La app no tiene configurado el servicio de IA, así que responderé desde la base local.',
)

interface ErrorPayload {
  error?: { code?: string; message?: string }
}

const KNOWN_CODES: ApiErrorCode[] = [
  'bad_request',
  'rate_limited',
  'provider_busy',
  'budget_exhausted',
  'upstream_error',
  'not_configured',
]

/** Traduce una respuesta no-OK del Worker en un AiError con codigo util. */
async function toAiError(response: Response): Promise<AiError> {
  const payload = (await response.json().catch(() => null)) as ErrorPayload | null
  const code = payload?.error?.code
  const known = KNOWN_CODES.find((candidate) => candidate === code) ?? 'upstream_error'
  return new AiError(known, payload?.error?.message ?? 'El servicio de IA falló.')
}

interface StreamChatOptions {
  scope: TutorScope
  messages: ChatMessage[]
  signal: AbortSignal
  /** Se llama con cada fragmento nuevo de texto. */
  onDelta: (text: string) => void
}

/**
 * Pide una respuesta al tutor y va entregando el texto conforme llega.
 *
 * Lanza `AiError` si algo falla, y deja pasar el `AbortError` del navegador
 * cuando la persona pulsa "Detener": cancelar no es un error.
 */
export async function streamChat({
  scope,
  messages,
  signal,
  onDelta,
}: StreamChatOptions): Promise<void> {
  if (!isAiConfigured) throw NOT_CONFIGURED

  let response: Response
  try {
    response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ scope, messages }),
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new AiError('network', 'No pude conectarme. Revisa tu conexión a internet.')
  }

  if (!response.ok) throw await toAiError(response)
  if (!response.body) throw new AiError('upstream_error', 'La respuesta llegó vacía.')

  for await (const delta of streamDeltas(response.body)) {
    onDelta(delta)
  }
}

/** Pide al evaluador que califique el prompt de un estudiante. */
export async function evaluatePrompt(
  prompt: string,
  scope: TutorScope,
  signal: AbortSignal,
): Promise<EvaluateResponse> {
  if (!isAiConfigured) throw NOT_CONFIGURED

  let response: Response
  try {
    response = await fetch(`${API_URL}/api/evaluate-prompt`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt, scope }),
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new AiError('network', 'No pude conectarme. Revisa tu conexión a internet.')
  }

  if (!response.ok) throw await toAiError(response)
  return (await response.json()) as EvaluateResponse
}
