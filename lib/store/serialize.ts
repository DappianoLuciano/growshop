// Mismo formato que devuelven las APIs (Decimal -> string, Date -> ISO), apto para
// pasar de un Server Component a un Client Component
export const toPlain = <T>(data: unknown) => JSON.parse(JSON.stringify(data)) as T

// Las descripciones se cargan como HTML desde el panel
export const toMetaDescription = (html: string | null | undefined) =>
  html?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) || ''
