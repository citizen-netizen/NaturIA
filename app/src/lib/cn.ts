/** Une clases ignorando falsos, para condicionales legibles en JSX. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
