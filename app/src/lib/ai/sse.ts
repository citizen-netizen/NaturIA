/**
 * Lector de Server-Sent Events para las respuestas del tutor.
 *
 * Dos detalles del formato de OpenRouter rompen los lectores ingenuos:
 *
 *  1. Manda comentarios keepalive `: OPENROUTER PROCESSING` para que la
 *     conexion no expire mientras el modelo piensa. Toda linea que empiece
 *     por `:` hay que descartarla ANTES de llamar a JSON.parse, o revienta.
 *  2. Cierra con `data: [DONE]`, que tampoco es JSON.
 */

/** Trocea el flujo en bloques de evento, separados por una linea en blanco. */
async function* readEventBlocks(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      // `stream: true` mantiene a salvo los caracteres multibyte (las tildes
      // y la eñe) que queden partidos entre dos fragmentos de red.
      buffer += decoder.decode(value, { stream: true })
      buffer = buffer.replace(/\r\n/g, '\n')

      let separator = buffer.indexOf('\n\n')
      while (separator !== -1) {
        yield buffer.slice(0, separator)
        buffer = buffer.slice(separator + 2)
        separator = buffer.indexOf('\n\n')
      }
    }

    // Un ultimo bloque sin salto final tambien cuenta.
    if (buffer.trim()) yield buffer
  } finally {
    reader.releaseLock()
  }
}

interface ChatChunk {
  choices?: Array<{ delta?: { content?: string } }>
}

/** Emite solo el texto nuevo de cada fragmento, en orden. */
export async function* streamDeltas(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  for await (const block of readEventBlocks(body)) {
    for (const line of block.split('\n')) {
      // Comentario keepalive: se ignora, segun la especificacion de SSE.
      if (line.startsWith(':')) continue
      if (!line.startsWith('data:')) continue

      const payload = line.slice('data:'.length).trim()
      if (payload === '[DONE]') return
      if (!payload) continue

      let chunk: ChatChunk
      try {
        chunk = JSON.parse(payload) as ChatChunk
      } catch {
        // Un fragmento corrupto no debe tumbar toda la respuesta.
        continue
      }

      const delta = chunk.choices?.[0]?.delta?.content
      if (delta) yield delta
    }
  }
}
