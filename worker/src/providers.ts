import type { Env } from './types'

/**
 * Proveedores de IA compatibles con la API de OpenAI.
 *
 * Google expone Gemini en un endpoint con el mismo formato que OpenAI
 * (`/chat/completions`, Bearer, SSE), asi que cambiar de proveedor es
 * configuracion y no una reescritura. El Worker solo necesita saber a que
 * URL llamar y que cabeceras añadir.
 */

export type ProviderId = 'gemini' | 'openrouter'

export interface Provider {
  id: ProviderId
  nombre: string
  baseUrl: string
  /** Modelo que se usa si no se configura ninguno. */
  modeloPorDefecto: string
  /** Dónde consultar el catálogo vigente cuando un modelo deja de existir. */
  catalogo: string
  /** Cabeceras propias del proveedor, además de la autenticación. */
  headers(env: Env): Record<string, string>
  /**
   * Heurística, no garantía: si el modelo parece pertenecer al nivel
   * gratuito. Sirve para avisar, nunca para bloquear.
   */
  pareceGratuito(model: string): boolean
  /** Cuota del nivel gratuito, para explicarla en los diagnósticos. */
  limiteGratuito: string
}

const PROVIDERS: Record<ProviderId, Provider> = {
  gemini: {
    id: 'gemini',
    nombre: 'Gemini (Google AI Studio)',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    // Flash equilibra cuota y calidad. Flash-Lite da 1.000 peticiones al día
    // en vez de 250, a cambio de respuestas más flojas.
    modeloPorDefecto: 'gemini-2.5-flash',
    catalogo: 'https://ai.google.dev/gemini-api/docs/models',
    headers: () => ({}),
    // Desde el 1 de abril de 2026 los modelos Pro salieron del nivel
    // gratuito: solo quedan Flash y Flash-Lite.
    pareceGratuito: (model) => /flash/i.test(model),
    limiteGratuito: '250 peticiones al día con Flash (1.000 con Flash-Lite) y 10-15 por minuto',
  },

  openrouter: {
    id: 'openrouter',
    nombre: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    modeloPorDefecto: 'google/gemma-4-31b-it:free',
    catalogo: 'https://openrouter.ai/models',
    headers: (env) => ({
      // OpenRouter las usa para su ranking público de aplicaciones.
      'http-referer': env.PUBLIC_URL,
      'x-title': 'NaturIA',
    }),
    pareceGratuito: (model) => model.endsWith(':free'),
    limiteGratuito: '50 peticiones al día y 20 por minuto',
  },
}

export function resolveProvider(env: Env): Provider {
  const configurado = env.AI_PROVIDER?.trim().toLowerCase()
  const provider = configurado === 'openrouter' ? PROVIDERS.openrouter : PROVIDERS.gemini

  // `AI_BASE_URL` permite apuntar a un simulador durante las pruebas, o a un
  // proveedor compatible que no esté en esta lista.
  const override = env.AI_BASE_URL?.trim()
  return override ? { ...provider, baseUrl: override.replace(/\/$/, '') } : provider
}

export interface ModelResolution {
  model: string
  /** true si viene del proveedor por no haberse configurado ninguno. */
  porDefecto: boolean
  /** Heurística: si parece del nivel gratuito. */
  pareceGratuito: boolean
}

/**
 * Resuelve el modelo a usar.
 *
 * A diferencia de la versión anterior, aquí no hay lista blanca ni cambio
 * silencioso: se usa exactamente lo que diga la configuración. El motivo es
 * que el modelo solo lo puede fijar quien tiene acceso al repositorio o a
 * Cloudflare — el navegador nunca lo elige— así que una lista blanca no
 * protegía de un atacante, solo escondía las erratas propias cambiando el
 * modelo por detrás. Ahora el riesgo se gestiona haciéndolo visible:
 * `/api/health` y `/api/diagnostico` dicen qué modelo está en uso y si parece
 * de pago.
 */
export function resolveModel(env: Env, provider: Provider): ModelResolution {
  const configurado = env.MODEL?.trim()
  const model = configurado || provider.modeloPorDefecto

  return {
    model,
    porDefecto: !configurado,
    pareceGratuito: provider.pareceGratuito(model),
  }
}
