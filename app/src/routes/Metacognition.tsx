import { criticalThinking, metacognitionSteps } from '../data/metacognition'
import { Card, SectionHeading } from '../components/ui/Card'
import { accentBar, accentSoftBg, accentText } from '../lib/accents'
import { cn } from '../lib/cn'

export function Metacognition() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <SectionHeading
        eyebrow="Pensamiento crítico"
        title="Proceso de metacognición"
        lead="Cómo pensamos sobre nuestro propio aprendizaje y validamos la información que nos da la IA."
      />

      <Card className="mt-8 p-6 sm:p-8">
        <h2 className="text-xl font-semibold">¿Qué es la metacognición?</h2>
        <p className="text-ink-2 mt-3 leading-relaxed">
          La metacognición es "pensar sobre cómo pensamos". Es ser conscientes de nuestro propio
          proceso de aprendizaje, reflexionar sobre qué estrategias usamos para entender algo
          nuevo, y evaluar si esas estrategias están funcionando.
        </p>
        <p className="text-ink-2 mt-3 leading-relaxed">
          En el contexto de usar Inteligencia Artificial para aprender, la metacognición es
          especialmente importante porque nos ayuda a no aceptar pasivamente la información que
          nos da una máquina, sino a cuestionarla, verificarla y construir conocimiento real.
        </p>
      </Card>

      <h2 className="mt-12 text-2xl font-bold">Nuestro proceso de aprendizaje con IA</h2>
      <ol className="mt-6 space-y-4">
        {metacognitionSteps.map((step) => (
          <li
            key={step.number}
            className={cn(
              'rounded-card border-line overflow-hidden border',
              accentSoftBg[step.accent],
            )}
          >
            <div className={cn('h-1 w-full', accentBar[step.accent])} aria-hidden="true" />
            <div className="flex gap-4 p-6">
              <span aria-hidden="true" className="text-3xl">
                {step.icon}
              </span>
              <div>
                <p
                  className={cn(
                    'text-xs font-semibold tracking-wide uppercase',
                    accentText[step.accent],
                  )}
                >
                  Paso {step.number}
                </p>
                <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                <p className="text-ink-2 mt-2 leading-relaxed">{step.description}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-12 text-2xl font-bold">Pensamiento crítico y uso ético de la IA</h2>
      <p className="text-ink-2 mt-2 leading-relaxed">
        Usar IA de manera responsable significa hacernos preguntas constantemente sobre la
        información que recibimos y nuestro proceso de aprendizaje.
      </p>

      <dl className="mt-6 space-y-3">
        {criticalThinking.map((item) => (
          <Card key={item.question} className="p-5">
            <dt className="font-semibold">{item.question}</dt>
            <dd className="text-ink-2 mt-2 leading-relaxed">{item.answer}</dd>
          </Card>
        ))}
      </dl>

      <Card className="bg-warn-soft mt-8 p-6">
        <h2 className="text-lg font-semibold">
          <span aria-hidden="true">💡 </span>
          Principio fundamental
        </h2>
        <p className="text-ink-2 mt-3 leading-relaxed">
          La IA es una herramienta poderosa, pero nunca debe reemplazar tu capacidad de pensar,
          cuestionar y aprender. El verdadero aprendizaje ocurre cuando usas la IA como punto de
          partida para la investigación, no como punto final. Tu curiosidad, creatividad y
          pensamiento crítico son insustituibles.
        </p>
      </Card>
    </div>
  )
}
