/**
 * Los cuatro pasos del proceso de metacognicion y las preguntas de
 * pensamiento critico. Texto original del proyecto, sin cambios.
 */

import type { StationAccent } from './stations'

export interface MetacognitionStep {
  number: number
  title: string
  description: string
  icon: string
  accent: StationAccent
}

export const metacognitionSteps: MetacognitionStep[] = [
  {
    number: 1,
    title: 'Nuestra duda era...',
    description:
      'Identificamos qué no entendíamos o qué queríamos investigar. Por ejemplo: "No entendemos por qué algunos niños heredan el daltonismo de su madre pero ella no lo tiene."',
    icon: '🤔',
    accent: 'cyan',
  },
  {
    number: 2,
    title: 'Le pedimos a la IA que...',
    description:
      'Diseñamos un prompt específico y claro. Por ejemplo: "Actúa como un profesor de genética. Explícame por qué el daltonismo se hereda más en hombres aunque las madres sean portadoras sin manifestar la condición. Usa un ejemplo de árbol genealógico."',
    icon: '💬',
    accent: 'violet',
  },
  {
    number: 3,
    title: 'La IA nos respondió...',
    description:
      'Recibimos una explicación sobre herencia ligada al cromosoma X, incluyendo conceptos como genes dominantes/recesivos, portadores, y por qué los hombres (XY) tienen mayor probabilidad de expresar la condición que las mujeres (XX) que tienen un segundo cromosoma X de respaldo.',
    icon: '🤖',
    accent: 'green',
  },
  {
    number: 4,
    title: 'Nosotros lo comprobamos/complementamos con...',
    description:
      'Buscamos fuentes confiables (libros de biología, artículos científicos, simuladores genéticos), construimos nuestro propio árbol genealógico con materiales físicos, consultamos con el profesor, y verificamos que la explicación de la IA era correcta. También identificamos si había algo que necesitara más investigación.',
    icon: '🔬',
    accent: 'amber',
  },
]

export interface CriticalThinkingItem {
  question: string
  answer: string
}

export const criticalThinking: CriticalThinkingItem[] = [
  {
    question: '¿La IA siempre tiene razón?',
    answer:
      'No. La IA puede generar información incorrecta o desactualizada. Por eso siempre debemos verificar con fuentes confiables.',
  },
  {
    question: '¿Cómo sabemos si la información es confiable?',
    answer:
      'Contrastando con múltiples fuentes, preguntando a expertos, y usando nuestro pensamiento crítico para evaluar si la respuesta tiene sentido científico.',
  },
  {
    question: '¿La IA reemplaza al profesor?',
    answer:
      'No. La IA es una herramienta de apoyo, pero el profesor guía el proceso de aprendizaje, ayuda a interpretar la información y desarrolla nuestro pensamiento crítico.',
  },
  {
    question: '¿Qué aprendemos al usar IA conscientemente?',
    answer:
      'Aprendemos a formular mejores preguntas, a evaluar información críticamente, a verificar fuentes, y a ser usuarios responsables de la tecnología.',
  },
]
