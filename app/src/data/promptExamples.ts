/**
 * Ejemplos de la guia "como hacer buenos prompts". Texto original del
 * proyecto. Alimentan tanto la guia estatica como el Laboratorio de Prompts.
 */

export interface PromptExample {
  bad: string
  good: string
  reason: string
}

export const promptExamples: PromptExample[] = [
  {
    bad: 'Dime sobre genética',
    good: 'Explícame cómo funciona la herencia del daltonismo usando un ejemplo de árbol genealógico',
    reason:
      'El segundo prompt es específico sobre qué aspecto de la genética quieres entender y pide un formato concreto (árbol genealógico)',
  },
  {
    bad: 'Cuéntame de las moléculas',
    good: 'Actúa como un profesor de química y explícame por qué el agua tiene propiedades únicas debido a su estructura molecular',
    reason:
      'El segundo prompt define un rol para la IA y conecta la estructura con las propiedades, mostrando qué tipo de comprensión buscas',
  },
  {
    bad: 'Info sobre Newton',
    good: 'Dame tres ejemplos cotidianos de la Primera Ley de Newton y explica la física detrás de cada uno',
    reason:
      'El segundo prompt pide ejemplos concretos y solicita explicación, no solo información superficial',
  },
]

/** Los cuatro criterios con los que el Laboratorio de Prompts califica. */
export const promptCriteria = [
  {
    name: 'Claridad',
    detail: 'Se entiende exactamente qué estás preguntando, sin ambigüedad.',
  },
  {
    name: 'Especificidad',
    detail: 'Apunta a un aspecto concreto del tema en vez de pedirlo "todo".',
  },
  {
    name: 'Contexto',
    detail: 'Dice para quién es la respuesta y qué sabes ya del tema.',
  },
  {
    name: 'Formato',
    detail: 'Pide una forma concreta: ejemplos, comparación, pasos, analogía.',
  },
] as const
