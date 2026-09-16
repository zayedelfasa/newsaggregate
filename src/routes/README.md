# routes/ — File-Based Routing SvelteKit

Konvensi: tiap folder = 1 route/halaman. File `+page.server.ts` = load data server-side, `+page.svelte` = UI.

## Peta Route

| Folder | URL | File kunci | Fungsi |
|---|---|---|---|
| `routes/` | `/` | `+page.server.ts` | Home: `Promise.allSettled` fetchTop(3) per media; filter `?kategori=` + `unsupported` count |
| `routes/cuaca/` | `/cuaca` | `+page.server.ts` + `+page.svelte` | **Cuaca**: `?lat=&lon=&name=` default Jakarta -6.2088,106.8456, `Promise.allSettled` weather+air+reverse, 2 card `WeatherCard`+`AirQualityCard` + `ForecastStrip` 7 hari+24 jam, tombol atas `Lokasi Saya` (geolocation) + `Cari Kota`, persist `localStorage 'cuaca:loc'` + auto-restore, Footer hide di layout |
| `routes/cuaca/cari/` | `/cuaca/cari?q=` | `+page.server.ts` + `+page.svelte` | **Cari Kota**: `?q=` debounce 300ms → `searchCity` 5 hasil, kartu Kota Populer, pick → `/cuaca?lat=&lon=&name=` + save `cuaca:loc` |
| `routes/market/` | `/market` | `+page.server.ts` + `+page.svelte` | **Market (HIDDEN dari BottomNav)**: tabel Saham/Forex + Crypto Top 5, reuse `market:ticker`, badge 24h, sparkline, filter/sort |
| `routes/market/[symbol]/` | `/market/:symbol` | `+page.server.ts` + `+page.svelte` | Detail symbol + sparkline |
| `routes/harian/` | `/harian` | `+page.server.ts` + `+page.svelte` | Tab Harian: Gempa, Harga, Kalender, Bola; Ringkasan Pagi dipindahkan ke `/` (tab Berita); detail `/harian/{briefing,gempa,harga,bola}` — bola chip liga + `?week=1` |
| `routes/hiburan/` | `/hiburan` | `+page.server.ts` + `+page.svelte` | Katalog film TMDB: trending, populer, sedang tayang, upcoming, search, genre; detail `/hiburan/movie/:id` dengan overview, cast, trailer, film serupa |
| `routes/tentang/` | `/tentang` | `+page.svelte` static | Info aplikasi, fitur Berita/Cuaca/Harian/Market/Hiburan, sumber data, versi |
| `routes/media/[source]/` | `/media/:source` | `+page.server.ts` | List 50 artikel 1 media + load-more +10 |
| `routes/baca/` | `/baca?source=&u=&id=` | `+page.server.ts` | Detail: `u` primary → `id` fallback → pool kategori; `more` 3 artikel |
| `routes/cari/` | `/cari?q=` | `+page.server.ts` | Search pool 100/media, max 50, `s-maxage=120` |
| `routes/simpan/` | `/simpan` | `+page.svelte` | Bookmarks localStorage snapshot, inline `ArticleView` |
| `routes/api/source/[id]/` | `GET /api/source/:id?force=1` | `+server.ts` | Retry per-section; `force=1` → `invalidateCache` |

## Layout

`+layout.svelte` — wrapper `max-w-[420px]` putih di backdrop abu; sticky `Header`; **MarketTicker** conditional hide di `/cuaca`, `/harian`, `/hiburan`, `/tentang`/`/about`; `main pb-[calc(56px+safe-area)]`; `Footer` hide di `/cuaca`, `/harian`, `/tentang`; `BottomNav` fixed 4 tab (`Berita|Cuaca|Harian|Tentang`, `cuacaHref` dinamis dari `localStorage`). Header Berita menampilkan shortcut Hiburan sekali di atas chip kategori.
`+layout.server.ts` — load `market: MarketData | null` via `fetchMarketData()` (try/catch), header `s-maxage=600` (cuaca reuse tanpa set ulang).

## Konvensi

- Load berita & cuaca pakai `Promise.allSettled` + tanpa `setHeaders` double (s-maxage via layout)
- `cache-control: public, s-maxage=600, stale-while-revalidate=1800` (layout); `?force=1` detail Harian → `no-store` + invalidasi cache fitur; cuaca/Harian `cached` TTL split
- Svelte 5 runes: `$props()`, `$state`, `$derived`, `$effect`, `onclick={}`
- Cuaca persist: `localStorage 'cuaca:loc'` dibaca `BottomNav` + `/cuaca` (goto replaceState)
- Detail lebih dari pool umum dicari di pool kategori (baca)

## Menambah halaman baru

```bash
mkdir -p src/routes/contoh
# +page.server.ts
export const load: PageServerLoad = async () => ({ hello: 'world' });
# +page.svelte
<script lang="ts"> let { data } = $props(); </script>
<p>{data.hello}</p>
```
