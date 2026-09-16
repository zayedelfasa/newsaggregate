/**
 * Cache memori sederhana per-instance serverless.
 * TTL 10 menit — supaya tidak menembak API publik terus-menerus.
 * (CDN Vercel juga ikut cache via header `s-maxage` di route.)
 */

interface Entry<T> {
	value: T;
	expires: number;
}

const store = new Map<string, Entry<unknown>>();
const TTL_MS = 10 * 60 * 1000;
const TTL_CRYPTO_MS = 2 * 60 * 1000;
const TTL_IDX_MS = 15 * 60 * 1000;
const TTL_FOREX_MS = 10 * 60 * 1000;
const TTL_TRENDING_MS = 60 * 60 * 1000;
const TTL_WEATHER_MS = 10 * 60 * 1000;
const TTL_GEO_MS = 60 * 60 * 1000;
const TTL_REVERSE_MS = 24 * 60 * 60 * 1000;
const TTL_GEMPA_MS = 5 * 60 * 1000;
const TTL_BOLA_MS = 5 * 60 * 1000;
const TTL_HARGA_MS = 6 * 60 * 60 * 1000;
const TTL_TRENDS_MS = 6 * 60 * 60 * 1000;
const TTL_HIJRI_MS = 12 * 60 * 60 * 1000;
const TTL_LIBUR_MS = 24 * 60 * 60 * 1000;
const TTL_HIBURAN_MS = 60 * 60 * 1000;
const TTL_HIBURAN_DETAIL_MS = 6 * 60 * 60 * 1000;
const TTL_HIBURAN_GENRES_MS = 24 * 60 * 60 * 1000;
export const TTL = { default: TTL_MS, crypto: TTL_CRYPTO_MS, idx: TTL_IDX_MS, forex: TTL_FOREX_MS, trending: TTL_TRENDING_MS, weather: TTL_WEATHER_MS, geo: TTL_GEO_MS, reverse: TTL_REVERSE_MS, gempa: TTL_GEMPA_MS, bola: TTL_BOLA_MS, harga: TTL_HARGA_MS, trends: TTL_TRENDS_MS, hijri: TTL_HIJRI_MS, libur: TTL_LIBUR_MS, hiburan: TTL_HIBURAN_MS, hiburanDetail: TTL_HIBURAN_DETAIL_MS, hiburanGenres: TTL_HIBURAN_GENRES_MS };

export function invalidateCache(prefix: string) {
	for (const k of [...store.keys()]) if (k === prefix || k.startsWith(prefix + ':') || k.startsWith(prefix + '/')) store.delete(k);
}

export function peekCache<T>(key: string): T | undefined {
	const hit = store.get(key);
	if (hit) return hit.value as T;
	return undefined;
}

export async function cached<T>(key: string, fn: () => Promise<T>, ttlMs: number = TTL_MS): Promise<T> {
	const hit = store.get(key);
	if (hit && hit.expires > Date.now()) return hit.value as T;

	try {
		const value = await fn();
		store.set(key, { value, expires: Date.now() + ttlMs });
		// buang entri kadaluarsa biar map tidak bengkak
		if (store.size > 200) {
			const now = Date.now();
			for (const [k, v] of store) if (v.expires <= now) store.delete(k);
		}
		return value;
	} catch (e) {
		// JANGAN GUNAKAN DUMMY: fallback ke stale cache jika fetch throw, jangan hardcode
		if (hit) return hit.value as T;
		throw e;
	}
}
