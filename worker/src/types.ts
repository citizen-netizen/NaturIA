/**
 * Contrato de API entre la PWA y el Worker.
 *
 * Se duplica a proposito en `app/src/lib/ai/types.ts`. Son treinta lineas y
 * evitan montar un paquete compartido entre dos artefactos que se despliegan
 * a plataformas distintas. Si uno de los dos cambia, el otro debe seguirlo.
 */

export const STATION_IDS = ['genetica', 'moleculas', 'ecosistemas', 'newton'] as const
export type StationId = (typeof STATION_IDS)[number]

/** Un tutor por estacion, mas el tutor general del chat abierto. */
export type TutorScope = StationId | 'general'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  scope: TutorScope
  messages: ChatMessage[]
}

export interface EvaluateRequest {
  prompt: string
  scope: TutorScope
}

export interface EvaluateResponse {
  /** 0 a 100. */
  score: number
  verdict: string
  strengths: string[]
  improvements: string[]
  rewritten: string
}

export type ApiErrorCode =
  | 'bad_request'
  /** Ritmo del propio visitante: nuestro limitador por IP. */
  | 'rate_limited'
  /** Cuota por minuto del proveedor: hay varias personas preguntando a la vez. */
  | 'provider_busy'
  | 'budget_exhausted'
  | 'upstream_error'
  | 'not_configured'

export interface ApiError {
  error: {
    code: ApiErrorCode
    /** Mensaje ya redactado en español, listo para mostrarle a un estudiante. */
    message: string
  }
}

export interface Env {
  /** Secreto: `wrangler secret put AI_API_KEY`. Nunca en el repo. */
  AI_API_KEY?: string
  /** 'gemini' (por defecto) u 'openrouter'. Ver `providers.ts`. */
  AI_PROVIDER?: string
  /** Origenes permitidos, separados por coma. */
  ALLOWED_ORIGINS: string
  /** Identificador del modelo, tal como lo nombra el proveedor elegido. */
  MODEL: string
  /** Tope de peticiones al modelo por dia, en todo el sitio. */
  DAILY_BUDGET: string
  /** URL publica de la app, para la cabecera de ranking de OpenRouter. */
  PUBLIC_URL: string
  /**
   * Sobreescribe la URL del proveedor. Sirve para apuntar a un simulador
   * durante las pruebas, o a un proveedor compatible con OpenAI que no este
   * en la lista de `providers.ts`.
   */
  AI_BASE_URL?: string
  BUDGET: KVNamespace
  CHAT_LIMITER: RateLimit
}

/** El binding `ratelimit` de Workers no trae tipos propios todavia. */
export interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>
}
