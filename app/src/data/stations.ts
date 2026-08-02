/**
 * Contenido de las cuatro estaciones de la feria.
 *
 * Los textos vienen del proyecto original y se conservan tal cual: son el
 * trabajo pedagogico de los estudiantes. Lo que cambia es la forma de
 * expresarlos: antes vivian dentro del componente como un array con clases
 * de Tailwind incrustadas (`from-purple-500 to-pink-500`); ahora el color es
 * un token semantico que el design system resuelve en claro y en oscuro.
 */

export const STATION_IDS = ['genetica', 'moleculas', 'ecosistemas', 'newton'] as const

export type StationId = (typeof STATION_IDS)[number]

/** Identidad cromatica de cada estacion. Se resuelve en `theme.css`. */
export type StationAccent = 'violet' | 'cyan' | 'green' | 'amber'

export interface Station {
  id: StationId
  title: string
  subtitle: string
  emoji: string
  accent: StationAccent
  description: string
  content: {
    intro: string
    keyPoints: string[]
    interactivePrompt: string
  }
  /** Preguntas de arranque que se ofrecen al abrir el tutor de la estacion. */
  suggestions: string[]
}

export const stations: Station[] = [
  {
    id: 'genetica',
    title: 'El Código de la Vida',
    subtitle: 'Descifrando la Genética con IA',
    emoji: '🧬',
    accent: 'violet',
    description:
      'Explora cómo la inteligencia artificial puede ayudarte a comprender los misterios de la herencia genética y las enfermedades hereditarias.',
    content: {
      intro:
        'La genética es el estudio de cómo las características se transmiten de padres a hijos a través de los genes. Imagina que cada célula de tu cuerpo contiene un manual de instrucciones escrito en un código especial llamado ADN.',
      keyPoints: [
        'Los genes son como recetas que determinan características como el color de ojos o el tipo de sangre',
        'Algunas enfermedades se heredan siguiendo patrones predecibles que podemos estudiar',
        'El daltonismo, por ejemplo, está ligado al cromosoma X, por eso afecta más a hombres que a mujeres',
      ],
      interactivePrompt:
        '¿Qué enfermedad hereditaria te gustaría investigar? Puedes preguntar sobre: daltonismo, hemofilia, fibrosis quística, o cualquier otra que conozcas.',
    },
    suggestions: [
      'Explícame cómo se hereda el daltonismo usando un árbol genealógico de tres generaciones',
      '¿Por qué una madre portadora de hemofilia puede no tener la enfermedad?',
      'Compara un gen dominante y uno recesivo con un ejemplo de mi vida diaria',
    ],
  },
  {
    id: 'moleculas',
    title: 'Zoom Atómico',
    subtitle: 'Construyendo Moléculas en 3D',
    emoji: '⚛️',
    accent: 'cyan',
    description:
      'Descubre la estructura microscópica de la materia y cómo los átomos se unen para formar todo lo que existe en el universo.',
    content: {
      intro:
        'Todo lo que ves a tu alrededor está hecho de átomos que se combinan formando moléculas. El agua que bebes, el oxígeno que respiras, incluso tu propio cuerpo, son enormes colecciones de moléculas microscópicas.',
      keyPoints: [
        'Una molécula de agua (H₂O) tiene dos átomos de hidrógeno y uno de oxígeno unidos como si fueran piezas de LEGO',
        'Los enlaces químicos son las "fuerzas invisibles" que mantienen unidos a los átomos',
        'La forma tridimensional de una molécula determina sus propiedades y funciones',
      ],
      interactivePrompt:
        'Elige una molécula para explorar: agua (H₂O), dióxido de carbono (CO₂), glucosa (C₆H₁₂O₆), o ADN.',
    },
    suggestions: [
      '¿Por qué el hielo flota en el agua si es la misma sustancia?',
      'Explícame el enlace covalente del H₂O como si tuviera 15 años, con un ejemplo cotidiano',
      '¿Qué hace que el CO₂ sea un gas y el agua un líquido a temperatura ambiente?',
    ],
  },
  {
    id: 'ecosistemas',
    title: 'Ecosistemas del Futuro',
    subtitle: 'Un Viaje Sonoro',
    emoji: '🌿',
    accent: 'green',
    description:
      'Sumérgete en los sonidos de diferentes ecosistemas y aprende sobre la biodiversidad que los hace únicos.',
    content: {
      intro:
        'Un ecosistema es como una gran orquesta donde cada ser vivo toca su propio instrumento. Desde el rugido de un jaguar en la Amazonía hasta el canto de las aves en un páramo, cada sonido nos cuenta una historia sobre la vida en ese lugar.',
      keyPoints: [
        'La biodiversidad es la variedad de seres vivos en un ecosistema, y cada uno cumple un papel importante',
        'Los ecosistemas colombianos como páramos y selvas son únicos en el mundo',
        'El cambio climático está alterando estos delicados equilibrios naturales',
      ],
      interactivePrompt:
        'Selecciona un ecosistema para explorar: Amazonía, Páramo, Arrecife de Coral, o Bosque Andino.',
    },
    suggestions: [
      '¿Por qué se dice que los páramos son "fábricas de agua"? Explícalo paso a paso',
      '¿Qué pasaría en el bosque andino de Antioquia si desapareciera una sola especie polinizadora?',
      'Dame tres ejemplos de cómo el cambio climático afecta los frailejones',
    ],
  },
  {
    id: 'newton',
    title: 'Newton en Acción',
    subtitle: 'Simulaciones de Física',
    emoji: '⚡',
    accent: 'amber',
    description:
      'Experimenta con las leyes fundamentales que gobiernan el movimiento de todos los objetos en el universo.',
    content: {
      intro:
        'Isaac Newton descubrió tres leyes que explican por qué las cosas se mueven como lo hacen. Estas leyes no son solo teoría abstracta, las experimentas cada día cuando caminas, juegas fútbol o viajas en bus.',
      keyPoints: [
        'Primera Ley: Un objeto en reposo permanece en reposo a menos que una fuerza actúe sobre él (por eso te empujas hacia adelante cuando el bus frena)',
        'Segunda Ley: La fuerza es igual a masa por aceleración (F=ma), por eso es más difícil mover una piedra grande que una pequeña',
        'Tercera Ley: Por cada acción hay una reacción igual y opuesta (cuando saltas, empujas la tierra hacia abajo y ella te empuja hacia arriba)',
      ],
      interactivePrompt:
        'Plantea una situación física que te genere curiosidad. Por ejemplo: ¿Por qué los astronautas flotan en el espacio? ¿Por qué es más fácil empujar un carrito vacío que uno lleno?',
    },
    suggestions: [
      'Dame tres ejemplos cotidianos de la Primera Ley de Newton y la física detrás de cada uno',
      '¿Por qué los astronautas flotan si la gravedad sigue actuando sobre ellos?',
      'Explícame con F=ma por qué duele más caerse en cemento que en arena',
    ],
  },
]

export function getStation(id: string | undefined): Station | undefined {
  return stations.find((station) => station.id === id)
}

export function isStationId(value: string): value is StationId {
  return (STATION_IDS as readonly string[]).includes(value)
}
