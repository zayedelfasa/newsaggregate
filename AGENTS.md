# AGENTS.md — Portal Berita Indonesia

> **BACA FILE INI DULU** setiap sesi baru. Ini single source of truth konteks bisnis + teknis.
> Detail per folder ada di `README.md` masing-masing folder. Arsitektur diagram di `ARCHITECTURE.md`. Fitur Market di `docs/DOC_FITUR_MARKET_TENTANG.md`, Cuaca di `docs/PLAN_CUACA.md`, changelog di `docs/CHANGELOG.md`.

## 1. Apa Ini?

Portal **agregator berita + market + cuaca** lokal Indonesia. Mobile-first `max-w-[420px]` (mirip app native), deploy **Vercel**.
- **11 media**: Detik, CNN Indonesia, Antara, CNBC Indonesia, Tempo, Republika, Okezone, Kumparan, JPNN, Media Indonesia, iNews (3 berita teratas/media).
- **Fitur Harian — PRIORITAS #1**: Daily Briefing, Gempa BMKG, Harga Harian (Logam PAXG+KAG + Tren Sembako 7d + BBM&LPG), Kalender Hijriah + Hari Penting Per Bulan, Skor Bola (7 liga: Liga 1 + EPL/LaLiga/SerieA/Bundesliga/Ligue1/UCL). Sholat dihapus 2026-08-29. Ikuti `docs/PLAN_FITUR_HARIAN.md` + `docs/PLAN_HARGA_TRENDS.md`.
- **Fitur Wanita — sebagian DITUNDA**: Resep Harian dan Kalender Haid tidak dikembangkan saat ini. Katalog film `/hiburan` via **TMDB API** tercatat di `docs/PLAN_HIBURAN.md`. Drakor/serial TV diabaikan dulu. TVMaze/Kitsu tidak digunakan.
- **Cuaca — DONE**: Suhu + forecast 7 hari + per jam + polusi AQI/PM2.5 via **Open-Meteo** gratis tanpa key.
- **Market — PRIORITAS #3**: Fokus TradingView widget/embed read-only. Jangan kembangkan provider custom Yahoo/TwelveData/IDX atau data market dummy. Ikuti `docs/PLAN_MARKET_TRADINGVIEW.md`.
- **3 tab aktif** via BottomNav → **4 tab sejak 2026-08-31**: `Berita /` · `Cuaca /cuaca` · `Harian /harian` (Fitur Harian: briefing+gempa+harga+kalender+bola) · `Tentang /tentang`.

**Goal bisnis:** Satu tempat baca headline 11 media + pantau cuaca/polusi harian + market (saat provider ready). Bukan full trading app, bukan scrape isi penuh — klik judul → situs asli. **Bukan rekomendasi investasi.**

## 2. Tech Stack

| Layer | Stack | Catatan |
|-------|-------|---------|
| Framework | **SvelteKit 2 + Svelte 5 runes** (`$state`, `$derived`, `$effect`, `$props`) | `adapter-vercel`, `runes: true` kecuali `node_modules` |
| Styling | **Tailwind CSS v4** (`@tailwindcss/vite`) | `app.css` entry, dark mode via `dark:` + `documentElement.classList` |
| Parser | `fast-xml-parser` | RSS XML |
| PWA | `vite-plugin-pwa` (`generateSW`, `NetworkFirst` untuk navigate) | `static/icon-*.png`, `manifest.webmanifest` |
| Bahasa | TypeScript `6.0` | `svelte-check` |
| Deploy | Vercel Hobby | `s-maxage=600` CDN |

**Jangan tambah** heavy UI lib (shadcn dll) tanpa alasan — portal list-based, Tailwind cukup.

## 3. Perintah Penting

```bash
npm install
npm run dev          # vite dev
npm run build        # vite build (cek sebelum push)
npm run preview      # preview build
npm run check        # svelte-kit sync + svelte-check (harus 0 error)
```

**Branch aktif:** `dev` (tracking `origin/dev`). `main` = stabil. Jangan push langsung ke `main`.

### Deployment Vercel

Vercel saat ini deploy dari repository berbeda:

```text
Vercel repo: github.com/zayedelfasa/newsaggregate
Source repo: github.com/zayedelfasa/svelte.portal.berita.indonesia.rev.zayed
```

Gunakan remote tambahan `vercel`; jangan ganti atau hapus `origin`:

```bash
git remote add vercel git@github.com:zayedelfasa/newsaggregate.git
git remote -v
```

Push preview dari branch `dev`:

```bash
git push -u vercel dev
```

Push production hanya jika memang diperlukan dan branch Vercel memakai `main`:

```bash
git push vercel dev:main
```

`origin/dev` tidak memicu deployment repository `newsaggregate`. Perintah `dev:main` mengubah branch production; jalankan sengaja setelah `npm run check` dan `npm run build` pass.

## 4. Struktur Project

```
/
├── AGENTS.md                         # ← kamu di sini (root)
├── ARCHITECTURE.md                   # diagram & alur data (root)
├── README.md                         # overview + 3 fitur (root)
├── docs/
│   ├── PLAN.md                       # plan awal + riset endpoint 11 media
│   ├── DOC_FITUR_MARKET_TENTANG.md   # detail ticker + BottomNav + /market + /tentang + roadmap Phase 0-3
│   ├── DOC_JANGAN_GUNAKAN_DUMMY.md   # kebijakan no-dummy market + harga
│   ├── CHANGELOG.md                  # log lintas fitur (single source)
│   ├── PLAN_CUACA.md                 # tab Cuaca & Polusi (Open-Meteo) — DONE
│   ├── PLAN_FITUR_HARIAN.md          # daily habit umum — baca
││   ├── PLAN_FITUR_WANITA.md          # Resep, Kalender Haid — baca jika scope dipilih
│   ├── PLAN_HIBURAN.md               # Katalog film TMDB `/hiburan` — baca sebelum implementasi
│   ├── PLAN_HARGA_TRENDS.md          # pivot Harga: hapus pangan.go.id + tren 7d + perak+LPG — DONE 2026-09-01
│   └── PLAN_MARKET_TRADINGVIEW.md    # Market TradingView read-only — baca
├── package.json, vite.config.ts, svelte.config.js
├── src/
│   ├── app.html, app.css, app.d.ts
│   ├── lib/
│   │   ├── types.ts                  # Article, SourceDef, CategoryId, SourceResult
│   │   ├── time.ts                   # timeAgo(), isNew()
│   │   ├── categories.ts             # 6 kategori + isCategoryId()
│   │   ├── hariPenting.ts            # HARI_PENTING statis 12 bulan (kurasi nasional) — dipakai kalender.ts
│   │   ├── harian.ts                 # BriefingData, GempaData, HargaData, KalenderData, BolaData, TrendsSembakoData
│   │   ├── components/               # Header, Footer, NewsItem, SourceSection, Ticker, MarketTicker, BottomNav, TrenSembakoCard, KalenderBolaCard...
│   │   ├── config/sources.ts         # registry 11 media (urutan = urutan tampil)
│   │   ├── server/                   # ⚠️ SERVER-ONLY — jangan import dari client
│   │   │   ├── cache.ts              # cached(key, fn) TTL 10m, peekCache(), invalidateCache() — split crypto 2m/IDX 15m/Forex 10m, harga 6j, trends 6j, hijri 12j
│   │   │   ├── http.ts               # fetchWithTimeout(7000-8000ms), stripHtml(), firstImgSrc()
│   │   │   ├── rss.ts                # parseRss()
│   │   │   ├── aggregator.ts         # fetchAggregator()
│   │   │   ├── market.ts             # fetchMarketData() → MarketData (CoinGecko+Yahoo) — TUNDA no dummy
│   │   │   ├── weather.ts            # fetchWeather/fetchAirQuality/searchCity/reverseGeocode → Open-Meteo (AKTIF C1/C2)
│   │   │   ├── harga.ts              # fetchHarga() → HargaData logam (PAXG+KAG per gram est) + BBM&LPG 6 item — pangan.go.id hapus 2026-09-01
│   │   │   ├── trends.ts             # fetchTrendsSembako() → TrendsSembakoData 5 keyword 7d, cached 6j, downsample hourly→daily, synthetic fallback
│   │   │   ├── kalender.ts           # fetchKalender() → KalenderData + hariBulan per bulan (Nager + HARI_PENTING)
│   │   │   └── sources/              # 1 file/media (detik.ts, cnn.ts, ...), pakai factory
│   │   └── utils/                    # *.svelte.ts runes: clock, bookmarks, settings, url
│   ├── routes/
│   │   ├── +layout.svelte            # wrapper 420px, Header (back direct menu) + MarketTicker(conditional) + main + Footer + BottomNav
│   │   ├── +layout.server.ts         # load market global (cached, try/catch, conditional)
│   │   ├── +page.svelte              # home: Ticker berita + chip kategori + filter sumber
│   │   ├── +page.server.ts           # home: Promise.allSettled 11 media, ?kategori
│   │   ├── cuaca/                    # /cuaca — suhu+polusi+forecast 7d+hourly (C1) + /cuaca/cari search kota (C2)
│   │   ├── market/                   # /market — tabel saham/crypto — HIDDEN dari nav, route tetap ada (TUNDA)
│   │   ├── tentang/                  # /tentang — static 5 card
│   │   ├── baca/                     # /baca?source=&u=&id= — detail + multi-pool lookup
│   │   ├── media/[source]/           # /media/:source — list 50 + load-more
│   │   ├── cari/                     # /cari?q= — search pool cache
│   │   ├── simpan/                   # /simpan — bookmarks localStorage
│   │   └── api/source/[id]/          # GET /api/source/:id?force=1 — retry per-section
│   └── lib/assets/favicon.svg
└── static/                           # favicon, icon-192/512, robots.txt
```

**README per folder:** `src/lib/README.md`, `components/README.md`, `server/README.md`, `server/sources/README.md`, `utils/README.md`, `routes/README.md` — baca sebelum ubah folder itu.

## 5. Arsitektur & Alur Data

```
Browser → Vercel CDN (s-maxage=600) → SvelteKit Server (Promise.allSettled)
                                              ├─ sources/* → cache.ts (TTL 10m) → RSS / berita-indo-api
                                              ├─ market.ts → cached('market:ticker') → CoinGecko + Yahoo Finance (TUNDA, hidden, no dummy)
                                              ├─ weather.ts → cached('weather:*') → Open-Meteo Weather + Air Quality + Geocoding (AKTIF C1/C2)
                                              ├─ harga.ts → cached('harga:harian',6j) → CoinGecko PAXG+KAG (logam est) + BBM&LPG statis
                                              ├─ trends.ts → cached('trends:sembako:v1',6j) → Google Trends api/explore→widgetdata, downsample, synthetic fallback
                                              └─ kalender.ts → cached('kalender:{date}',12j) → Aladhan gToH + Nager.Date + HARI_PENTING statis
```

- Semua fetch **server-side only** (`+page.server.ts` / `server/*`) → bebas CORS.
- `Promise.allSettled` — 1 sumber gagal ≠ halaman crash (weather: suhu gagal → polusi tetap tampil; trends 429 → synthetic fallback).
- Cache 2 lapis: memori `TTL 10m` (market split crypto 2m/IDX 15m/Forex 10m, weather 10m, geo 1j, reverse 1d, harga 6j, trends 6j, hijri 12j) + CDN `s-maxage=600, stale-while-revalidate=1800`.
- Market reuse key `market:ticker` untuk `+layout.server.ts` & `/market` — hemat quota (now conditional `{#if data?.market}`).
- Weather keys `weather:current:{lat,lon}`, `weather:air:{lat,lon}`, `weather:geo:{q}`, `weather:reverse:{lat,lon}` — unlimited Open-Meteo, cache 10m.
- Trends key `trends:sembako:v1` TTL 6j, peek stale 24j, 429 → synthetic deterministik agar grafik tetap tampil.
- Upstream timeout 7-8s (`AbortController`), UA browser. Peek stale cache 24j jika upstream 5xx.

**Types inti:**
```ts
interface Article { source, title, url, publishedAt: ISO, summary, image? }
interface MarketItem { symbol, name, price, change24h: number|null, currency: IDR|USD, type: idx|forex|crypto, sparkline?: number[] }
interface MarketData { items: MarketItem[], fetchedAt: ISO }
interface WeatherData { current: { temp, feelsLike, humidity, wind, code }, daily: { max, min, code }[7], hourly: { time, temp, code }[24] }
interface AirQualityData { us_aqi, pm2_5, pm10, category: 'Baik'|'Sedang'|... }
interface HargaItem { grup: 'logam'|'tren'|'bbm', harga: number|null, change24h: number|null, sumber: string, estimasi?: boolean }
interface TrendsSembakoData { keywords: string[], series: {keyword, scores[7], avg, delta, last}[], fetchedAt: ISO }
interface KalenderData { gregorianLabel, hijriLabel, holiday, hariBulan: {date,name,isLibur,isToday}[], bulanLabel }
```

## 6. Peta Route & Konvensi

| Route | File | Fungsi |
|-------|------|--------|
| `/` | `routes/+page.*` | Home: 11 section ×3 artikel, `?kategori=` (6 kategori kanonik), filter sumber client, `Ticker` berita |
| `/cuaca` | `routes/cuaca/+page.*` | Cuaca (C1): `?lat=&lon=&name=` → 2 card suhu+polusi + forecast 7d + hourly, fallback Jakarta, geolocation client |
| `/cuaca/cari` | `routes/cuaca/cari/+page.*` | Cari kota (C2): `?q=` → geocoding 5 hasil → klik → `/cuaca?lat=&lon=` |
| `/harian` | `routes/harian/+page.*` | Tab Harian: briefing + gempa + harga+tren + kalender+hari penting + bola (widget stack, conditional) |
| `/harian/briefing` | `routes/harian/briefing/+page.*` | Ringkasan pagi 10 berita + Web Speech |
| `/harian/gempa` | `routes/harian/gempa/+page.*` | List 15-20 gempa BMKG + filter M≥5 + link peta |
| `/harian/harga` | `routes/harian/harga/+page.*` | Logam Mulia (PAXG+KAG) + Tren 7d (sparkline full-width per keyword, skor tiap titik) + BBM&LPG 6 item |
| `/harian/kalender` | `routes/harian/kalender/+page.*` | Hari penting nasional per bulan (Nager + kurasi statis) — detail full list |
| `/harian/bola` | `routes/harian/bola/+page.*` | Live/Selesai/Minggu Ini (7 liga) + chip liga + timeline jam kiri/divider/logo + `?week=1&force=1` |
| `/market` | `routes/market/+page.*` | Market — HIDDEN dari BottomNav (TUNDA): IHSG/LQ45/USDIDR + crypto top 5, badge 24h, route tetap ada |
| `/tentang` | `routes/tentang/+page.svelte` | Static: 5 card info aplikasi |
| `/baca` | `routes/baca/+page.*` | Detail: `u=` primary → `id` fallback → scan pool kategori |
| `/media/:source` | `routes/media/[source]/+page.*` | List 50 + load-more +10 |
| `/cari?q=` | `routes/cari/+page.*` | Search pool 100/media, max 50 |
| `/simpan` | `routes/simpan/+page.svelte` | Bookmarks localStorage snapshot |
| `GET /api/source/:id` | `routes/api/source/[id]/+server.ts` | Retry per-section, `?force=1` invalidate |

**Layout:** `+layout.svelte` = `Header` sticky (back direct menu: /harian→/harian, /cuaca→/cuaca, else /) + `MarketTicker` conditional (`{#if data?.market && !isCuaca && !isHarian && !isTentang}`) + `main pb-[calc(56px+safe-area)]` + `Footer` + `BottomNav` fixed 4 tab (`Berita|Cuaca|Harian|Tentang`). `+layout.server.ts` load market try/catch (boleh kosong).

**Konvensi:**
- Svelte 5 runes: `$props()`, `$state`, `$derived`, `$effect`, `onclick={}` (bukan `on:click`)
- Dark mode: `class="dark:bg-..."` + toggle `documentElement.classList.toggle('dark')`
- Waktu relatif: `clock.now` update 30s di layout, `timeAgo(iso, clock.now)`
- Icon: inline SVG `stroke="currentColor"` tanpa lib
- Cache key: `rss:{id}`, `agg:{id}`, `market:ticker`, `weather:current:{lat,lon}`, `weather:air:{lat,lon}`, `weather:geo:{q}`, `weather:reverse:{lat,lon}`, `gempa:terkini`, `harga:harian`, `trends:sembako:v1`, `bola:scoreboard`, `bola:scoreboard:week`, `briefing:v1`, `kalender:{date}`; kategori = headline → dedup

## 7. Data Sources

| Sumber | Endpoint | Key | Catatan |
|--------|----------|-----|---------|
| Berita RSS | `news.detik.com/rss`, `cnnindonesia.com/rss`, `jpnn.com/rss`, `mediaindonesia.com/feed`, `inews.id/feed` | — | `fast-xml-parser`, enclosure/image |
| Berita aggregator | `berita-indo-api.vercel.app/v1/{antara,cnbc,tempo,...}` | — | fallback RSS bila 500 |
| Crypto | `api.coingecko.com/api/v3/coins/markets?ids=bitcoin,ethereum,solana,binancecoin,tether` | tanpa key | 10-50 req/menit, sparkline+trending, cache split 2m |
| Saham/Forex | `query1.finance.yahoo.com/v8/finance/chart/^JKSE,IDR=X` (+ `query2` fallback, `exchangerate.host` untuk USD/IDR) | tanpa key | **TUNDA** — Yahoo 403, no dummy, stale cache 24j → empty jujur, LQ45 derived `IHSG*0.135` label `est` |
| Cuaca current+forecast | `api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum&hourly=temperature_2m,weather_code&timezone=Asia/Jakarta&forecast_days=7` | tanpa | Unlimited, TTL 10m |
| Polusi AQI | `air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide&timezone=Asia/Jakarta` | tanpa | Unlimited, TTL 10m |
| Geocoding kota | `geocoding-api.open-meteo.com/v1/search?name={q}&count=5&language=id` + reverse | tanpa | Unlimited, TTL 1j (search) / 1d (reverse) |
| Logam Mulia | `api.coingecko.com/api/v3/simple/price?ids=pax-gold,kinesis-silver&vs_currencies=idr&include_24hr_change=true` | tanpa | PAXG emas + KAG perak per-ounce → per-gram /31.1035, label `est`, TTL 6j, fallback KAG→tether-silver |
| Hari libur | `date.nager.at/api/v3/publicholidays/{tahun}/ID` | tanpa | Nager aktif, dayoffapi 402, TTL 24j, digabung HARI_PENTING statis per bulan |
| Hari penting statis | `src/lib/hariPenting.ts` | — | Kurasi Wikipedia Daftar hari penting Indonesia, 12 bulan, dipakai kalender.ts |
| Gempa BMKG | `data.bmkg.go.id/DataMKG/TEWS/{autogempa,gempaterkini}.json` | tanpa | TTL 5m, kadang 403 → empty jujur |
| Skor bola | `site.api.espn.com/.../soccer/{eng.1,esp.1,ita.1,ger.1,fra.1,uefa.champions,idn.1}/scoreboard?dates=YYYYMMDD` + `thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=4790` (Liga 1 fallback) | tanpa | 7 liga, TTL 5m, ESPN WAF block Mozilla → UA `axios/1.7.0`, week view 7 hari, logo club |
| Hijriah | `api.aladhan.com/v1/gToH?date=DD-MM-YYYY` | tanpa | perlu follow redirect (301), TTL 12j |
| Tren Sembako | `trends.google.com/trends/api/explore` + `/widgetdata/multiline` | tanpa | 5 keyword geo ID now 7-d, TTL 6j, 429→synthetic fallback deterministik agar grafik tetap tampil |

**Jangan** hardcode API key saham/crypto berbayar — pakai yang gratis di atas. Selalu `cached()` + CDN. **Jangan pakai dummy harga** — lihat `DOC_JANGAN_GUNAKAN_DUMMY.md`.

## 8. Aturan Untuk Agent (Wajib Patuh)

1. **Jangan import `$lib/server/*` dari komponen client** — hanya dari `+page.server.ts` / `+server.ts` / file `server/*`.
2. **Svelte 5 runes only** — jangan pakai `export let`, `on:click`, store `writable` lama.
3. **Server load harus `Promise.allSettled` + `s-maxage`** — jangan `Promise.all` yang jatuhkan halaman.
4. **Cache TTL 10m** — bungkus fetch baru dengan `cached(key, fn)` (crypto 2m/IDX 15m/Forex 10m, weather 10m, geo 1j, harga 6j, trends 6j, hijri 12j).
5. **BottomNav 4 tab** — `Berita|Cuaca|Harian|Tentang` (Harian baru 2026-08-31; Market hidden, route `/market` tetap ada tapi tidak di nav).
6. **Mobile-first 420px** — jangan melebar desktop, jangan ubah `max-w-[420px]` tanpa diskusi.
7. **Cek sebelum push:** `npm run check` 0 error + `npm run build` pass.
8. **Branch:** kerja di `dev`, jangan push ke `main` langsung. Commit message `feat|fix|docs|refactor(scope): ...`.
9. **Header back** — langsung ke menu tab (`/harian`→`/harian`, `/cuaca`→`/cuaca`, else `/`), jangan `history.back()`.

## 9. State Saat Ini (dev — 2026-09-01)

**Done (2026-09-01) — Pivot Harga + Tren + Kalender Hari Penting + Header Back:**
- Harga pivot: hapus `pangan.go.id` (SEMBAKO_NAMA, fetchSembako, parsePanganPrice) → ganti `🔥 Tren Sembako 7d geo ID skor 0-100` via `trends.ts` (Google Trends api/explore→multiline, 5 keyword cabai/bawang/beras/minyak/telur, TTL 6j, downsample hourly→daily, synthetic fallback deterministik agar grafik tetap tampil jika 429) + Logam 2 item PAXG+KAG per gram est + BBM 4→6 tambah LPG 3kg 16k & Bright Gas 12kg 192k. UI `/harian/harga` 3 grup (Logam + Tren full-width 340×48 per keyword skor tiap titik + BBM&LPG) + `/harian` widget ringkas. `DOC_JANGAN_GUNAKAN_DUMMY` §6, `CHANGELOG 2026-09-01`.
- Grafik Tren: full-width per keyword `340×48` + grid + dot + label skor 7 titik + tanggal 7 di bawah (HTML grid), warna by delta (merah naik/biru turun/hijau flat), info box `Apa itu skor 0-100?` (relatif, bukan Rp). Fix 404 embed → custom SVG, fix berantakan 168 titik → downsample, fix ga keliatan → synthetic fallback.
- Kalender: `hariPenting.ts` statis 12 bulan (kurasi Wikipedia), `kalender.ts` merge Nager libur bulan ini + statis → `hariBulan` + `bulanLabel` + `isToday`, `KalenderData` extend, `KalenderBolaCard` preview 4 + `+X lagi • lihat semua` → detail `/harian/kalender` full list per bulan (12 Sept: Polwan, Aksara, Haornas, RRI, Tani, Kereta, G30S etc.).
- Header: `Header.svelte` `goBack()` ganti `history.back()` → `goto` direct menu (`/harian`→`/harian`, `/cuaca`→`/cuaca`, else `/`), semua tab konsisten.
- `check 0` `build pass` `vitest 9` `kinesis-silver 200 OK` `downsample 7` `hapus header lihat hari penting` (keep lihat semua bawah)

**Done (2026-08-31) — FITUR HARIAN tab `/harian` + Bola 7 liga + Timeline:**
- 5 fitur terangkum 1 tab: BriefingCard + GempaCard + HargaCard + KalenderBolaCard (widget stack conditional) + 4 detail route `/harian/{briefing,gempa,harga,bola}`
- Bola expand 1→7 liga: `idn.1` (Liga 1 fallback TheSportsDB 4790) + EPL/LaLiga/SerieA/Bundesliga/Ligue1/UCL; ESPN UA fix `axios/1.7.0` (Mozilla diblokir 403); week view 7 hari Mon-Sun `?week=1`; cache `bola:scoreboard` + `bola:scoreboard:week`
- Timeline Opsi C: `jam WIB kiri 52px | divider | logo tim stack 2 baris + skor | LIVE/FT/badge` — `py-3 gap-3 rounded-xl`, dark fix widget `text-gray-900 dark:text-neutral-100`
- Server: `briefing.ts`, `gempa.ts`, `harga.ts`, `kalender.ts`, `bola.ts` + TTL baru gempa/bola 5m, harga 6j, hijri 12j, libur 24j; `parsers.ts` + `harian.ts` logo fields
- BottomNav 4 tab `Berita|Cuaca|Harian|Tentang`; MarketTicker+Footer hide di `/harian`
- Detail riset endpoint → `docs/PLAN_FITUR_HARIAN.md` §13

**Done (CHANGELOG 2026-01-05 & 2026-08-26):**
- Market Phase 0 + Phase 1: ticker global + `/market` + `/market/[symbol]` + gainer/loser + trending + kalkulator + auto-tag + filter/sort + sparkline (build pass, `svelte-check 0`)
- No-dummy policy: `DOC_JANGAN_GUNAKAN_DUMMY.md`, cache split, peekCache, empty jujur
- README 5 folder + `ARCHITECTURE.md` + semua plan fitur

**Done (2026-08-27) — PLAN_CUACA Phase C1/C2:**
- `weather.ts` + `weatherCode.ts` + `cache` weather/geo/reverse + `/cuaca` + `/cuaca/cari` + `WeatherCard`/`AirQualityCard`/`ForecastStrip` → Open-Meteo gratis, `check 0` `build pass`
- Standar UI `rounded-xl border-gray-100` (samakan `tentang`/`market`), tombol atas `Lokasi Saya`+`Cari Kota` (hapus duplikat), Footer hide di `/cuaca`, fix 500 double `cache-control`
- Persist lokasi `localStorage 'cuaca:loc'` → `BottomNav` href dinamis + auto-restore → pindah Berita → balik Cuaca tetap lokasi terakhir
- 7 issues (#1-#7) closed

**Status prioritas eksekusi:**
1. **Fitur Harian** — ✅ SELESAI 5/5 via tab `/harian` (2026-09-01 extended): Briefing ✅ + Gempa ✅ + Harga pivot Logam+Tren+BBM ✅ + Kalender + Hari Penting per bulan ✅ + Bola 7 liga ✅. Lanjut optional: PWA notif. Lihat `docs/PLAN_FITUR_HARIAN.md` §13 + `docs/PLAN_HARGA_TRENDS.md`.
2. **Fitur Wanita** — ⏸ DITUNDA. Resep Harian ditunda karena API Bahasa Indonesia tidak stabil dan TheMealDB dominan Bahasa Inggris. Kalender Haid juga ditunda; jangan implementasi tanpa keputusan baru.
3. **Market TradingView** — widget/embed read-only saja. Baca `docs/PLAN_MARKET_TRADINGVIEW.md`. Jangan kembali ke Yahoo/TwelveData/custom market fetch.

Market custom lama tetap route legacy sampai migrasi TradingView selesai. No dummy.
Monetisasi QRIS Footer masih placeholder.

## 10. Cara Lanjut Sesi Baru

1. Baca `AGENTS.md` (ini) → `ARCHITECTURE.md` → `docs/CHANGELOG.md` → semua `docs/PLAN*.md` → `docs/DOC*.md` relevan scope → README folder target. Jangan asumsi plan belum ada; cek seluruh `docs/`.
2. `git status` + `git branch` (pastikan di `dev`).
3. `npm run check` sebelum ubah apa pun.
4. Tanya user mau fitur apa — jangan asumsi. Jika butuh API baru, cek gratis dulu (Open-Meteo untuk cuaca, CoinGecko/Yahoo untuk market — no paid key).
5. Setelah ubah: `npm run check` + `npm run build` → ringkas file yang diubah.

## 11. Protokol Baca Markdown

Sebelum ubah kode:

1. Baca `AGENTS.md`, `ARCHITECTURE.md`, `docs/CHANGELOG.md`.
2. Daftar semua `docs/PLAN*.md` dan baca plan relevan.
3. Daftar semua `docs/DOC*.md` dan baca dokumen relevan.
4. Baca README folder target.
5. Jika plan baru muncul, update daftar referensi ini.

Perintah cek: `find docs -maxdepth 1 -type f -name '*.md' -print`.

## 12. Pitfalls

- Yahoo 403 → **no dummy** — coba `query2` → `exchangerate.host` → stale cache 24j → empty jujur + `Muat ulang`, jangan hardcode `IHSG 7234`.
- CoinGecko 429 → cache split 2m + CDN `s-maxage=600`, jangan polling client.
- LQ45 Yahoo tidak reliable → derived `IHSG*0.135` label `est`, jangan fetch symbol aneh.
- Open-Meteo 5xx → `Promise.allSettled` — suhu gagal → polusi tetap tampil, card `Tidak tersedia`, fallback Jakarta.
- Geocoding 0 hasil → `Tidak ada kota → saran Jakarta/Surabaya/Medan`.
- pangan.go.id hapus 2026-09-01 → jangan kembalikan, 95% null + timeout 7s → ganti tren 0-100.
- Google Trends 429 → trends.ts synthetic fallback deterministik + cached 6j, downsample hourly→7 daily, jangan pakai iframe embed 404.
- `node_modules` runes exception di `vite.config.ts` — jangan hapus.
- PWA `workbox.runtimeCaching NetworkFirst` untuk navigate — jangan ubah ke CacheFirst.
