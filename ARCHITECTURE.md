# ARCHITECTURE.md — Arsitektur Portal Berita Indonesia

> Peta besar project. Detail per folder ada di `README.md` masing-masing folder.

## Ringkasan

Portal agregator berita 11 media + Cuaca & Polusi (Open-Meteo) + Harian + Katalog Film TMDB `/hiburan` + Market read-only (hidden). SvelteKit 2 (Svelte 5 runes) + Tailwind CSS v4, Vercel, 4 tab BottomNav (Berita|Cuaca|Harian|Tentang), MarketTicker conditional.

```
Browser
   │  HTTP
   ▼
Vercel CDN (s-maxage=600)
   │
SvelteKit server (+layout.server.ts + +page.server.ts / +server.ts)
   │  Promise.allSettled paralel
   ├── lib/server/sources/*  ──►  lib/server/cache.ts (TTL split)
   │       ├─ RSS resmi ────────────────┤
   │       └─ aggregator berita-indo-api┘
   │                                    │
   │       Upstream media (detik.com, ...)
   │
   ├── lib/server/market.ts ──► cached('market:ticker') hidden
   │       ├─ CoinGecko API (BTC/ETH/...)
   │       └─ TwelveData + exchangerate.host (Forex, IDX tunda)
   │
   ├── lib/server/hiburan.ts ──► cached('hiburan:*') → TMDB API
   │       ├─ trending/popular/now-playing/upcoming
   │       ├─ search/genre
   │       └─ detail/credits/videos/similar
   │
   └── lib/server/weather.ts ──► cached('weather:*')
           ├─ api.open-meteo.com/v1/forecast (current+daily+hourly)
           ├─ air-quality-api.open-meteo.com (AQI/PM2.5/PM10)
           ├─ geocoding-api.open-meteo.com/v1/search (search kota)
           └─ reverse geocode (nama kota)
```

## Alur Data

1. `/` → `+layout.server.ts` load **MarketData** conditional + `+page.server.ts` load berita `fetchTop(3)` paralel `Promise.allSettled`
2. `/cuaca?lat=&lon=&name=` → `+page.server.ts` `Promise.allSettled([fetchWeather, fetchAirQuality, reverseGeocode])` → props `{weather, airQuality, cityName}`; fallback Jakarta -6.2088,106.8456; `localStorage 'cuaca:loc'` persist + `BottomNav` href dinamis, auto-restore
3. `/cuaca/cari?q=` → `searchCity(q)` 5 hasil → pick → `goto('/cuaca?lat=&lon=&name=')` + save loc; debounce 300ms
4. Adapter `lib/server/sources/*` cek `cached` → `fetchWithTimeout(7-8s)` → normalisasi `Article`
5. `/hiburan` → TMDB server helper → list rails/search/detail; MarketTicker hide di `/hiburan`; `/hiburan/movie/:id` tampil overview, rating, cast, trailer, film serupa.
6. Ringkasan Pagi load di `/` tab Berita; `/harian` fokus gempa, harga, kalender, bola.
7. Layout render MarketTicker conditional + `<BottomNav Berita|Cuaca|Harian|Tentang>` + shortcut Hiburan satu kali di atas chip kategori Berita.
8. CDN `s-maxage=600` (layout set header, child route reuse tanpa double).

## Pola Kunci

### Normalisasi Article
```ts
interface Article { source, title, url, publishedAt: ISO, summary, image? }
interface WeatherData { current: {temp, feelsLike, humidity, wind, code}, daily: [7], hourly: [24] }
interface AirQualityData { us_aqi, pm2_5, pm10, category }
```

### Adapter factory
- `makeRssSource` / `makeAggregatorSource` → `{ fetchTop, fetchCategory?, supportedCategories? }`

### Cache key convention
| Key | TTL | Isi |
|---|---|
| `rss:{id}` / `agg:{id}` | headline |
| `market:ticker` | MarketData (crypto 2m, idx 15m, forex 10m) |
| `weather:current:{lat,lon}` | WeatherData (10m) |
| `weather:air:{lat,lon}` | AirQualityData (10m) |
| `weather:geo:{q}` | search 5 kota (1j) |
| `weather:reverse:{lat,lon}` | nama kota (1d) |
| `hiburan:trending:{day|week}` | Film trending (1j) |
| `hiburan:popular` / `now-playing` / `upcoming` | Film list (1j) |
| `hiburan:search:{query}` / `genre:{id}` | Hasil film (1j) |
| `hiburan:detail:{id}` | Detail film (6j) |

### Multi-pool lookup di `/baca`
`u=` primary → `id` fallback → telusuri pool kategori.

### Cuaca persist
`localStorage 'cuaca:loc' = {lat,lon,name}` dibaca `BottomNav` (href dinamis) + `/cuaca` (onMount auto `goto` jika tanpa param) + `/cuaca/cari` (pick save). Geolocation `navigator.geolocation` → `goto` + save.

## Peta Folder

| Folder | Fungsi | README |
|---|---|---|
| `src/lib/components/` | UI Svelte (WeatherCard, AirQualityCard, ForecastStrip, MovieCard, MovieRail, MovieListItem, BottomNav, MarketTicker) | [README](src/lib/components/README.md) |
| `src/routes/hiburan/` | Katalog film TMDB + detail movie | [README](src/routes/README.md) |
| `src/lib/config/` | Registry 11 media | [README](src/lib/config/README.md) |
| `src/lib/server/` | Fetch & cache server-only (market.ts, weather.ts, cache.ts) | [README](src/lib/server/README.md) |
| `src/lib/server/sources/` | Adapter per media | [README](src/lib/server/sources/README.md) |
| `src/lib/utils/` | State runes + helper (clock, bookmarks, settings, url) | [README](src/lib/utils/README.md) |
| `src/routes/` | Routing (`/`, `/cuaca`, `/cuaca/cari`, `/market` hidden, `/tentang`) | [README](src/routes/README.md) |
| `static/` | Aset publik + icon PWA | [README](static/README.md) |

Loose: `src/lib/types.ts` (`Article`), `src/lib/weatherCode.ts` (WMO mapping), `src/lib/time.ts` (`timeAgo`), `src/lib/categories.ts`.
