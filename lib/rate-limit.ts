/**
 * Rate limiter simple en memoria (ventana fija).
 *
 * En Vercel cada instancia serverless tiene su propia memoria, así que el límite
 * es "por instancia": frena bots y fuerza bruta básica, pero no es exacto.
 * Si se necesita un límite global, reemplazar por Upstash Redis (@upstash/ratelimit).
 */

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()

  // Limpieza ocasional para que el Map no crezca indefinidamente
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k)
  }

  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfter: 0 }
  }

  bucket.count++
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) }
  }
  return { ok: true, retryAfter: 0 }
}

/** Consulta si la clave ya superó el límite, sin sumar un intento. */
export function isRateLimited(key: string, limit: number) {
  const bucket = buckets.get(key)
  return Boolean(bucket && bucket.resetAt > Date.now() && bucket.count >= limit)
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  )
}
