import { useCallback, useRef, useState } from 'react'
import { AiError } from '../lib/ai/types'
import type { ChatMessage, TutorScope } from '../lib/ai/types'
import { isAiConfigured, streamChat } from '../lib/ai/client'
import { answerOffline } from '../data/offlineKnowledge'

export type ChatStatus = 'idle' | 'streaming' | 'error'

/** De donde salio la respuesta. La interfaz lo muestra siempre. */
export type MessageSource = 'ai' | 'offline'

export interface UiMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  source: MessageSource
}

function newId(): string {
  return crypto.randomUUID()
}

export function useChat(scope: TutorScope) {
  const [messages, setMessages] = useState<UiMessage[]>([])
  const [status, setStatus] = useState<ChatStatus>('idle')
  /** Explicacion visible de por que la respuesta no vino del modelo. */
  const [notice, setNotice] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setStatus('idle')
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setMessages([])
    setNotice(null)
    setStatus('idle')
  }, [])

  const send = useCallback(
    async (text: string) => {
      const question = text.trim()
      if (!question || status === 'streaming') return

      const userMessage: UiMessage = {
        id: newId(),
        role: 'user',
        content: question,
        source: 'ai',
      }
      const assistantId = newId()

      // El historial que viaja al Worker se arma antes de insertar el hueco
      // de la respuesta, y sin mensajes vacios de intentos fallidos.
      const history: ChatMessage[] = [...messages, userMessage]
        .filter((message) => message.content.trim().length > 0)
        .map(({ role, content }) => ({ role, content }))

      setMessages((previous) => [
        ...previous,
        userMessage,
        { id: assistantId, role: 'assistant', content: '', source: 'ai' },
      ])
      setNotice(null)
      setStatus('streaming')

      const fallBack = (reason: string) => {
        const local = answerOffline(question, scope === 'general' ? undefined : scope)
        setMessages((previous) =>
          previous.map((message) =>
            message.id === assistantId ? { ...message, content: local, source: 'offline' } : message,
          ),
        )
        setNotice(reason)
        setStatus('idle')
      }

      // Sin red no tiene sentido intentar la peticion y esperar el timeout.
      if (!navigator.onLine || !isAiConfigured) {
        fallBack(
          isAiConfigured
            ? 'Estás sin conexión: esta respuesta viene de la base local.'
            : 'El tutor con IA no está configurado en esta instalación.',
        )
        return
      }

      const controller = new AbortController()
      abortRef.current = controller

      try {
        await streamChat({
          scope,
          messages: history,
          signal: controller.signal,
          onDelta: (delta) => {
            setMessages((previous) =>
              previous.map((message) =>
                message.id === assistantId
                  ? { ...message, content: message.content + delta }
                  : message,
              ),
            )
          },
        })
        setStatus('idle')
      } catch (error) {
        // Cancelar no es fallar: se conserva lo que alcanzo a escribirse.
        if (error instanceof DOMException && error.name === 'AbortError') {
          setStatus('idle')
          return
        }

        if (error instanceof AiError && error.shouldFallBackOffline) {
          fallBack(error.message)
          return
        }

        setMessages((previous) => previous.filter((message) => message.id !== assistantId))
        setNotice(error instanceof Error ? error.message : 'Algo salió mal.')
        setStatus('error')
      } finally {
        abortRef.current = null
      }
    },
    [messages, scope, status],
  )

  return { messages, status, notice, send, stop, reset }
}
