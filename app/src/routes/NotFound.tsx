import { ButtonLink } from '../components/ui/Button'

export function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p aria-hidden="true" className="text-5xl">
        🧭
      </p>
      <h1 className="font-display mt-4 text-3xl font-bold">Esta página no existe</h1>
      <p className="text-ink-2 mt-3">
        Puede que el enlace esté mal escrito o que la sección haya cambiado de nombre.
      </p>
      <ButtonLink to="/" className="mt-6">
        Volver al inicio
      </ButtonLink>
    </div>
  )
}
