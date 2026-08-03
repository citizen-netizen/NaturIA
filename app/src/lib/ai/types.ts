import type { StationId } from '../../data/stations'

/**
 * Espejo del contrato definido en `worker/src/types.ts`. Si uno cambia, el
 * otro debe seguirlo.
 */

export type TutorScope = StationId | 'general'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface EvaluateResponse {
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
  /** Cuota por minuto del proveedor: varias personas preguntando a la vez. */
  | 'provider_busy'
  | 'budget_exhausted'
  | 'upstream_error'
  | 'not_configured'
  /** Solo del lado del cliente: no se pudo llegar al Worker. */
  | 'network'

export class AiError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'AiError'
  }

  /**
   * Si conviene responder desde la base local en vez de mostrar un error.
   *
   * `rate_limited` se queda fuera a proposito: ahi el problema es que la
   * misma persona va demasiado rapido, y basta con que espere unos segundos.
   *
   * `provider_busy` si degrada, aunque tambien sea un 429: ahi el visitante
   * no hizo nada mal, simplemente coincidio con otros en la cola del stand.
   * Dejarlo sin respuesta seria castigarlo por algo ajeno.
   */
  get shouldFallBackOffline(): boolean {
    return this.code !== 'rate_limited' && this.code !== 'bad_request'
  }
}
