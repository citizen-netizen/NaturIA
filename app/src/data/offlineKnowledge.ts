/**
 * Base de conocimiento local.
 *
 * Estos textos son los que el proyecto original devolvia desde
 * `generateEducationalResponse()`, una cadena de `if (input.includes(...))`
 * que se presentaba como si fuera un chatbot con IA. No lo era.
 *
 * Aqui cumplen el papel que si les corresponde: respaldo para cuando no hay
 * conexion en la feria, o cuando se agota la cuota diaria del modelo. La
 * interfaz los marca siempre con una insignia visible, de modo que nadie
 * confunda una respuesta enlatada con una respuesta generada.
 */

import type { StationId } from './stations'

export interface OfflineTopic {
  id: string
  /** Se comparan en minusculas y sin tildes contra la pregunta. */
  keywords: string[]
  /** Estacion con la que se relaciona, si aplica. */
  station?: StationId
  answer: string
}

export const offlineTopics: OfflineTopic[] = [
  {
    id: 'genetica',
    station: 'genetica',
    keywords: ['genetic', 'gen', 'herencia', 'dalton', 'adn', 'cromosoma', 'hereditari'],
    answer: `Excelente pregunta sobre genética. Los genes son segmentos de ADN que contienen instrucciones para construir proteínas, que son las moléculas que hacen funcionar tu cuerpo. Cada característica heredable, desde el color de tus ojos hasta tu tipo de sangre, está determinada por combinaciones específicas de genes que heredaste de tus padres.

Si hablamos específicamente del daltonismo, es una condición que afecta la percepción de colores y está ligada al cromosoma X. Por eso los hombres tienen más probabilidad de ser daltónicos, porque solo tienen un cromosoma X, mientras que las mujeres tienen dos (XX) y pueden compensar un gen defectuoso con el cromosoma X saludable.

¿Te gustaría explorar algún otro aspecto de la herencia genética o preguntar sobre otra enfermedad hereditaria?`,
  },
  {
    id: 'moleculas',
    station: 'moleculas',
    keywords: ['molecula', 'atomo', 'agua', 'h2o', 'quimica', 'enlace', 'co2'],
    answer: `¡Interesante pregunta sobre química! Las moléculas son como pequeñas construcciones hechas de átomos. Piensa en los átomos como bloques de LEGO y las moléculas como las figuras que construyes con ellos.

Por ejemplo, una molécula de agua (H₂O) está formada por dos átomos de hidrógeno unidos a un átomo de oxígeno. Esta estructura en forma de "V" no es casualidad: la geometría de la molécula determina todas las propiedades del agua, como su capacidad para disolver sustancias, su punto de ebullición, e incluso por qué el hielo flota.

Los enlaces químicos que mantienen unidos estos átomos son fuerzas electromagnéticas, como si fueran imanes invisibles que mantienen la estructura estable.

¿Quieres que exploremos otra molécula o profundicemos en algún concepto específico de la química?`,
  },
  {
    id: 'ecosistemas',
    station: 'ecosistemas',
    keywords: [
      'ecosistema',
      'biodiversidad',
      'selva',
      'paramo',
      'ambiente',
      'frailejon',
      'amazonia',
      'coral',
    ],
    answer: `Fascinante que preguntes sobre ecosistemas. Un ecosistema es como una comunidad viviente donde todos los organismos interactúan entre sí y con su entorno físico. Es un sistema complejo donde cada especie tiene un papel importante.

Colombia es uno de los países más biodiversos del mundo. Nuestros páramos, por ejemplo, son ecosistemas únicos que funcionan como "fábricas de agua" porque capturan y almacenan agua de la lluvia y la niebla. Las plantas del páramo, los frailejones, están perfectamente adaptadas a las condiciones extremas de altura, frío y radiación solar intensa.

La biodiversidad no es solo "muchas especies diferentes", es también la red de relaciones entre ellas. Si una especie desaparece, puede afectar a muchas otras que dependían de ella.

¿Te gustaría explorar un ecosistema específico de Colombia o entender mejor cómo el cambio climático está afectando estos sistemas?`,
  },
  {
    id: 'newton',
    station: 'newton',
    keywords: ['newton', 'fuerza', 'movimiento', 'fisica', 'ley', 'inercia', 'gravedad'],
    answer: `¡Excelente pregunta sobre física! Las leyes de Newton son los principios fundamentales que explican cómo y por qué se mueven las cosas en el universo.

La Primera Ley (inercia) nos dice que los objetos "prefieren" mantener su estado actual: si están quietos, quieren seguir quietos; si están en movimiento, quieren seguir moviéndose en línea recta. Por eso cuando vas en un bus y frena bruscamente, tu cuerpo sigue queriendo avanzar y te impulsas hacia adelante.

La Segunda Ley (F=ma) nos explica que la aceleración de un objeto depende de la fuerza que le apliques y de su masa. Es por esto que empujar un carrito de supermercado vacío es mucho más fácil que empujar uno lleno.

La Tercera Ley (acción-reacción) establece que cada fuerza tiene una fuerza de igual magnitud pero en dirección opuesta. Cuando caminas, empujas el suelo hacia atrás y el suelo te empuja a ti hacia adelante con la misma fuerza.

¿Quieres que analicemos alguna situación específica usando estas leyes?`,
  },
  {
    id: 'fotosintesis',
    keywords: ['fotosintesis', 'planta', 'cloroplasto', 'clorofila'],
    answer: `La fotosíntesis es uno de los procesos más importantes de la vida en la Tierra. Es como una fábrica química que opera dentro de las hojas de las plantas, específicamente en unos orgánulos llamados cloroplastos.

El proceso convierte energía solar en energía química almacenada en moléculas de glucosa. La ecuación simplificada es: 6CO₂ + 6H₂O + luz solar → C₆H₁₂O₆ + 6O₂

Las plantas toman dióxido de carbono del aire y agua del suelo, y usando la energía de la luz solar, producen glucosa (azúcar que les sirve de alimento) y liberan oxígeno como subproducto. Este oxígeno es el que nosotros respiramos.

Sin la fotosíntesis, no existiría la vida como la conocemos. Las plantas son la base de casi todas las cadenas alimenticias y son las responsables de mantener el oxígeno en nuestra atmósfera.

¿Te gustaría profundizar en alguna fase específica de la fotosíntesis o explorar cómo se relaciona con otros ciclos naturales?`,
  },
]

const FALLBACK_ANSWER = `Estás sin conexión, así que estoy respondiendo desde la base de conocimiento guardada en tu teléfono, que cubre solo los temas de la feria:

🧬 Genética y herencia
⚛️ Moléculas y química
🌿 Ecosistemas y biodiversidad
⚡ Leyes de Newton y física del movimiento
🌱 Fotosíntesis

Prueba a preguntar por uno de ellos. Cuando vuelva la conexión, el tutor con IA podrá responderte cualquier pregunta y adaptarse a lo que ya sabes.`

/** Quita tildes y pasa a minusculas para que "paramo" encuentre "páramo". */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/**
 * Elige la mejor respuesta local para una pregunta.
 *
 * Si la pregunta se hizo dentro de una estacion, esa estacion desempata:
 * preguntar "¿y el agua?" en Zoom Atomico deberia hablar de moleculas.
 */
export function answerOffline(question: string, stationId?: StationId): string {
  const normalized = normalize(question)

  let best: { topic: OfflineTopic; score: number } | undefined

  for (const topic of offlineTopics) {
    let score = 0
    for (const keyword of topic.keywords) {
      if (normalized.includes(normalize(keyword))) score += 1
    }
    if (score === 0) continue
    if (topic.station && topic.station === stationId) score += 0.5

    if (!best || score > best.score) best = { topic, score }
  }

  if (best) return best.topic.answer

  // Sin coincidencias: si estamos dentro de una estacion, al menos damos su tema.
  if (stationId) {
    const stationTopic = offlineTopics.find((topic) => topic.station === stationId)
    if (stationTopic) return stationTopic.answer
  }

  return FALLBACK_ANSWER
}
