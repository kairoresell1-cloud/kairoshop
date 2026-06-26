// Rate limiting semplice in-memory. Non è distribuito (su più server si
// resetterebbe), ma per un singolo container Railway è più che sufficiente
// a bloccare spam di login, generazione codici, o richieste ripetute.

const buckets = new Map();
const WINDOW_MS = 60_000; // 1 minuto
const MAX_REQUESTS = 60; // richieste massime per IP al minuto

export function isRateLimited(ip) {
  const now = Date.now();
  const bucket = buckets.get(ip) || { count: 0, resetAt: now + WINDOW_MS };

  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + WINDOW_MS;
  }

  bucket.count += 1;
  buckets.set(ip, bucket);

  // Pulizia occasionale per non far crescere la mappa all'infinito
  if (buckets.size > 5000) {
    for (const [key, val] of buckets) {
      if (now > val.resetAt) buckets.delete(key);
    }
  }

  return bucket.count > MAX_REQUESTS;
}
