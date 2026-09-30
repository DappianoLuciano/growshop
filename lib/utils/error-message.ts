/** Mensaje legible de un error capturado en un catch (que es `unknown`). */
export function errorMessage(err: unknown, fallback = 'Error inesperado'): string {
  return err instanceof Error && err.message ? err.message : fallback
}
