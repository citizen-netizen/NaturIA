import type { ChatMessage, Env, TutorScope } from './types'
import { STATION_IDS } from './types'

/**
 * Limites de entrada.
 *
 * La URL del Worker va impresa en un codigo QR pegado a una pared: es una
 * API publica de la que no controlamos quien es el cliente. Todo lo que
 * entra se acota antes de gastar un token del modelo.
 */
export const LIMITS = {
  /** Un estudiante no escribe mas que esto en un celular. */
  maxMessageChars: 1200,
  /** Turnos de historial que se reenvian; recorta el costo por peticion. */
  maxHistory: 12,
  maxPromptChars: 800,
  /** Tope de salida, fijado por el servidor y no negociable por el cliente. */
  maxTokens: 700,
} as const

export function isTutorScope(value: unknown): value is TutorScope {
  return (
    typeof value === 'string' &&
    (value === 'general' || (STATION_IDS as readonly string[]).includes(value))
  )
}

/**
 * Valida y normaliza el historial. Devuelve `null` si la forma es invalida.
 * Recorta a los ultimos turnos y exige que el ultimo sea del usuario.
 */
export function sanitizeMessages(input: unknown): ChatMessage[] | null {
  if (!Array.isArray(input) || input.length === 0) return null

  const messages: ChatMessage[] = []
  for (const raw of input) {
    if (typeof raw !== 'object' || raw === null) return null
    const { role, content } = raw as Record<string, unknown>
    if (role !== 'user' && role !== 'assistant') return null
    if (typeof content !== 'string') return null

    const trimmed = content.trim()
    if (trimmed.length === 0) continue
    messages.push({ role, content: trimmed.slice(0, LIMITS.maxMessageChars) })
  }

  if (messages.length === 0) return null

  const recent = messages.slice(-LIMITS.maxHistory)
  if (recent[recent.length - 1]?.role !== 'user') return null
  return recent
}

/** IP del visitante segun Cloudflare; sirve de clave del limitador. */
export function clientKey(request: Request): string {
  return request.headers.get('cf-connecting-ip') ?? 'desconocido'
}

/** Ráfagas: frena a un solo dispositivo que pulse "enviar" sin parar. */
export async function withinRateLimit(env: Env, request: Request): Promise<boolean> {
  const { success } = await env.CHAT_LIMITER.limit({ key: clientKey(request) })
  return success
}

/**
 * Presupuesto diario para todo el sitio.
 *
 * El binding `ratelimit` solo admite ventanas de 10 o 60 segundos, asi que
 * no puede expresar "N por dia", que es justo el limite que protege la
 * cuenta de OpenRouter. Este contador en KV cubre ese hueco.
 *
 * KV es de consistencia eventual: con varias peticiones simultaneas la
 * cuenta puede quedarse corta y dejar pasar algunas de mas. Es un tope
 * blando, suficiente para una feria escolar. Un limite exacto exigiria un
 * Durable Object, que aqui no compensa la complejidad.
 */
export async function consumeDailyBudget(env: Env): Promise<boolean> {
  const budget = Number(env.DAILY_BUDGET)
  if (!Number.isFinite(budget) || budget <= 0) return true

  const key = `budget:${new Date().toISOString().slice(0, 10)}`
  const used = Number((await env.BUDGET.get(key)) ?? '0')

  if (used >= budget) return false

  await env.BUDGET.put(key, String(used + 1), {
    // Dos dias: sobrevive al cambio de fecha en cualquier huso horario.
    expirationTtl: 60 * 60 * 48,
  })
  return true
}
