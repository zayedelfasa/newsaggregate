# Changelog Pekerjaan Project

## 2026-09-03 — Hiburan: Pagination, Detail, Widget Harian

- Search `/hiburan?q=...` mendukung pagination `page=` + tombol `Muat halaman berikutnya`.
- Search card menampilkan tanggal rilis, genre, durasi, jumlah vote, rating, dan overview.
- Detail film menampilkan deskripsi/overview, tagline, status, bahasa asli, negara produksi, jumlah vote, cast, trailer, dan film serupa.
- `/harian` tambah widget `Film Populer` dari TMDB dengan link `Lihat semua`.
- TMDB gagal → widget hiburan disembunyikan; `/harian` tetap tidak crash.
- Validasi: `npm run check` 0 error/0 warning, `npm run build` pass.

## 2026-09-03 — Eksekusi `/hiburan` Katalog Film TMDB

- Tambah backend server-only `src/lib/server/hiburan.ts`: trending day/week, popular, now playing, upcoming, search, genre, detail, credits, videos, similar.
- Credential hanya via `TMDB_API_KEY` atau `TMDB_API_TOKEN` (`$env/dynamic/private`); tanpa credential tampil error-state jujur, tanpa data dummy.
- Tambah cache TMDB: list/search/genre 1j, genre list 24j, detail 6j; `cached()` fallback stale instance.
- Tambah shared types `src/lib/hiburan.ts` + normalisasi poster/rating/tanggal/overview.
- Tambah `/hiburan` dengan search, filter section, genre chips, trending/popular/now-playing/upcoming rails, loading-safe empty/error state, dark mode, mobile-first.
- Tambah `/hiburan/movie/[id]` detail poster/backdrop, rating, genre, runtime, overview, cast, trailer link, similar movies.
- Tambah `MovieCard`, `MovieRail`, `MovieListItem`; header shortcut tunggal `🎬 Hiburan` tanpa ubah BottomNav 4 tab.
- Header Back dari detail film kembali ke `/hiburan`; list/detail menyembunyikan MarketTicker crypto.
- Label Genre/Jelajah dirapatkan; setiap rail punya `Lihat semua`.
- Overview tampil sebagai `Deskripsi`; search card menampilkan tanggal rilis `DD/MM/YYYY`, genre, durasi, jumlah vote, overview, dan rating bintang kuning.
- `Ringkasan Pagi` dipindahkan dari `/harian` ke tab Berita `/`.
- Shortcut Hiburan hanya muncul sekali di tab Berita, di atas chip kategori.
- Attribution TMDB di UI dihapus sesuai keputusan produk; source link TMDB tetap ada pada detail.
- Validasi: `npm run check` 0 error/0 warning, `npm run build` pass.

## 2026-09-03 — Plan Baru `/hiburan`: Katalog Film TMDB

- Tambah `docs/PLAN_HIBURAN.md` sebagai plan khusus halaman `/hiburan`.
- Scope diubah: fokus katalog film TMDB; drakor/serial TV diabaikan dulu.
- Konten rencana: trending, film populer, sedang tayang, upcoming, trailer, genre, search, detail.
- Integrasi Berita: satu shortcut `Hiburan → /hiburan` di header; tidak ada duplikasi card hiburan di bawah feed berita.
- BottomNav tetap 4 tab: `Berita | Cuaca | Harian | Tentang`.
- Detail rencana: cache, env TMDB server-only, normalisasi, error-state, route, komponen, verifikasi.

## 2026-09-03 — Keputusan Provider Hiburan: TMDB

- Provider hiburan ditetapkan **TMDB API** sebagai sumber utama.
- TVMaze, Kitsu, Jikan, dan provider hiburan lain tidak digunakan.
- TMDB dipakai untuk katalog drakor/serial Korea dan film Hollywood.
- Filter drakor: `with_origin_country=KR` + `with_original_language=ko`.
- Endpoint rencana: discover, search, detail, credits, season/episode.
- Credential memakai `TMDB_API_KEY` atau `TMDB_API_TOKEN`, server-only via environment variable.
- Poster memakai TMDB image CDN; `poster_path` null → placeholder UI, tanpa dummy image.
- Cache rencana: list/search 1 jam, detail 6 jam, stale fallback maksimal 24 jam.
- Jadwal hanya ditampilkan jika TMDB menyediakan air-date/episode; tidak boleh hardcode.
- Wajib attribution: `This product uses the TMDB API but is not endorsed or certified by TMDB.`
- Tidak ada implementasi kode pada perubahan ini; dokumentasi `docs/PLAN_FITUR_WANITA.md` diperbarui.

Dokumen ini mencatat pekerjaan terakhir lintas fitur agar perubahan dapat dicek ulang.

## 2026-01-05 — Phase 1 Market: Detail Symbol, Gainer/Loser, Kalkulator, Auto-Tag

Branch kerja: `dev`

### 1. Detail Symbol `/market/[symbol]` (tanpa TradingView)

- Route baru `src/routes/market/[symbol]/+page.server.ts` + `+page.svelte`.
- Param lowercase (`btc`, `eth`, `ihsg`, `usd-idr`) dipetakan via `src/lib/marketSlug.ts` (`slugify`/`symbolFromSlug`).
- Server: `find` dari `fetchMarketData()` reuse cache; simbol tak dikenal → `error(404)`.
- UI: Header symbol + price + badge 24j + tombol balik + `Diperbarui {timeAgo}` + IDR toggle.
- **Chart pakai Sparkline 7d yang sudah ada — keputusan: tidak pakai TradingView embed.**
- Setiap row di `/market` kini link ke `/market/{slug}` → unlock navigasi.

### 2. Top Gainer / Loser + Trending

- Gainer/Loser = `$derived` dari `items` (sort `change24h`, 3 hijau / 3 merah) — tanpa API baru.
- `fetchTrending()` di `market.ts` → cached `market:trending` TTL 1 jam (CoinGecko `/search/trending`, top 6).
- `TTL.trending` ditambah di `cache.ts`.
- UI: 2 card horizontal scroll `🔥 Top Gainer` / `💧 Top Loser` + strip `⭐ Trending` di atas tabel `/market`.
- Gagal/empty → card disembunyikan (jujur, tanpa dummy).

### 3. Kalkulator Lot & Converter

- Komponen baru `src/lib/components/MarketCalculator.svelte` (client only, tanpa fetch).
- IDX/Forex: 1 lot = 100 lembar → `price * qty * 100`; Crypto: `price * qty` USD + konversi IDR via kurs.
- Dipasang di `/market` (default BTC) + `/market/[symbol]`.

### 4. Auto-Tag Berita Market

- `src/lib/marketTag.ts` pure `tagArticle(article, marketItems)` — regex keyword (Bitcoin→BTC, IHSG→IHSG, dsb), filter hanya simbol market aktif.
- Badge `bg-slate-900 text-[10px]` di `NewsItem` (home) + `ArticleView` (detail `/baca`), klik → `/market/{slug}`.
- Wiring: `+page.svelte` home & `/baca` derive `marketPool` dari `data.market`, pass via `SourceSection` → `NewsItem`.

### 5. Refactor & File

- `src/lib/marketFormat.ts` baru — extract `fmtPrice`/`changeCls`/`changeBg`/`typeBadgeCls`/`typeLabel` agar dipakai `/market` & `/market/[symbol]` (hilangkan duplikasi).
- File baru: `marketSlug.ts`, `marketFormat.ts`, `marketTag.ts`, `MarketCalculator.svelte`, `market/[symbol]/+page.*`.
- File diubah: `cache.ts`, `market.ts`, `market/+page.server.ts`, `market/+page.svelte`, `+page.svelte`, `SourceSection.svelte`, `NewsItem.svelte`, `ArticleView.svelte`, `baca/+page.svelte`.

### 6. Validasi

- `npm run check` → 0 error, 0 warning.
- `npm run build` → pass.
- Tidak ada API key berbayar / embed TradingView. Semua data tetap gratis.

## 2026-08-26 — Improvisasi Market, Data Fallback, UI, dan Dokumentasi

Branch kerja: `dev`

### 1. Halaman Market `/market`

- Menambahkan filter chip:
  - `Semua`
  - `IDX`
  - `Forex`
  - `Crypto`
- Menambahkan badge tipe pada setiap item:
  - `IDX`
  - `FOREX`
  - `CRYPTO`
- Tab `Semua` memakai satu section gabungan `Saham & Forex`, seperti tampilan awal.
- Tab `IDX` hanya menampilkan data IDX.
- Tab `Forex` hanya menampilkan data Forex.
- Tab `Crypto` hanya menampilkan data crypto.
- Menambahkan jumlah item pada header section.
- Menambahkan empty-state per filter.
- Pesan empty-state tab `IDX` dan `Forex` disamakan dengan pesan pada tab `Semua`.
- Empty-state menggunakan bahasa sopan jika sumber data bermasalah.
- Menambahkan tombol `Muat ulang` pada empty-state.

### 2. Sorting dan Aksesibilitas

- Menambahkan sorting berdasarkan:
  - Nama
  - Harga
  - Perubahan 24 jam
- Menambahkan arah sorting:
  - `↑` naik
  - `↓` turun
  - `↕` belum aktif
- Sorting berlaku untuk data IDX, Forex, dan Crypto.
- Sorting kembali ke `Nama ↑` saat filter berubah.
- Menambahkan `aria-label` pada tombol sorting.
- Ticker marquee memiliki loop kedua dengan `aria-hidden="true"` agar screen reader tidak membaca data dua kali.

### 3. IDR Toggle dan Tampilan Crypto

- Toggle harga crypto antara USD dan IDR tetap tersedia.
- Konversi IDR menggunakan kurs USD/IDR yang tersedia.
- USDT tidak menampilkan perubahan 24 jam yang tidak bermakna.
- USDT menampilkan label `stablecoin`.

### 4. Sparkline

- Menambahkan `sparkline?: number[]` pada `MarketItem`.
- Yahoo Finance mengambil data `range=7d`.
- CoinGecko menggunakan `sparkline=true`.
- Data close/harga 7 hari disimpan sebagai maksimal 7 titik.
- Menambahkan komponen baru `src/lib/components/Sparkline.svelte`.
- Sparkline dibuat dengan SVG native tanpa library tambahan.
- Sparkline ditampilkan pada card IDX, Forex, dan Crypto.
- Warna garis mengikuti arah perubahan harga:
  - hijau untuk naik
  - merah untuk turun
  - abu-abu jika data tidak cukup/datar

### 5. Sumber Data dan Fallback

- Yahoo Finance mencoba dua host:
  1. `query1.finance.yahoo.com`
  2. `query2.finance.yahoo.com`
- USD/IDR memiliki fallback `exchangerate.host` tanpa API key.
- Jika sumber data gagal, sistem tidak lagi memakai harga dummy hardcode.
- Angka seperti `IHSG 7234.5` dan `USD/IDR 16220` dihapus.
- Jika data gagal:
  1. Coba sumber utama.
  2. Coba host fallback.
  3. Coba stale cache maksimal 24 jam.
  4. Jika tidak ada cache, tampilkan empty-state yang jujur.
- LQ45 derived tetap diberi label `estimasi` dan badge `est`.

### 6. Cache Market

- Cache dipisah berdasarkan jenis data:
  - Crypto: 2 menit
  - IDX: 15 menit
  - Forex: 10 menit
- Menambahkan `peekCache()` untuk membaca stale cache tanpa mengabaikan data expired.
- `cached()` mempertahankan last-known-good data jika fetch berikutnya gagal.
- Stale cache tidak dianggap sebagai data baru.
- Timestamp lama tetap dipakai agar banner stale tampil dengan benar.

### 7. Pesan Status di `/market`

Jika seluruh market tidak tersedia:

> Data market IHSG/LQ45 sementara tidak tersedia.
> Sumber Yahoo Finance sedang sibuk atau dibatasi aksesnya. Kami tidak menampilkan angka perkiraan agar tetap jujur.
> Silakan muat ulang beberapa saat lagi.

Jika stale cache tersedia:

> Menampilkan data terakhir — diperbarui X.
> Sumber Yahoo Finance / CoinGecko sedang sibuk atau dibatasi. Data di bawah adalah cache terakhir sebelum muat ulang.

### 8. Dokumentasi

- Memperbarui `docs/DOC_FITUR_MARKET_TENTANG.md`:
  - status fitur terbaru
  - endpoint dan parameter aktual
  - fallback tanpa dummy
  - status filter, sort, dan sparkline
  - status tracker roadmap
- Menambahkan `docs/DOC_JANGAN_GUNAKAN_DUMMY.md`:
  - kebijakan resmi data market
  - aturan fallback
  - aturan stale cache
  - checklist no-dummy
- Changelog ini menggantikan changelog khusus market agar seluruh pekerjaan terakhir tercatat di satu tempat.

### 9. File Baru

- `docs/CHANGELOG.md`
- `docs/DOC_JANGAN_GUNAKAN_DUMMY.md`
- `src/lib/components/Sparkline.svelte`

### 10. File Utama yang Diubah

- `src/lib/server/cache.ts`
- `src/lib/server/market.ts`
- `src/routes/market/+page.svelte`
- `src/lib/components/MarketTicker.svelte`
- `docs/DOC_FITUR_MARKET_TENTANG.md`

### 11. Validasi

- `npm run check` → pass, 0 error.
- `npm run build` → pass.
- Tidak ada harga dummy di source code market.
- Tidak ada API key berbayar yang ditambahkan.
- Tidak ada library UI berat yang ditambahkan.

## 2026-08-27 — Tunda Market, Switch ke PLAN_CUACA, Hide Tab Market

- Market ditunda: Yahoo 403, TwelveData tidak cover JKSE/IHSG (404), idx.co.id Cloudflare block, GoAPI IDX 550k paid → tidak ada provider free yang pas untuk IDX.
- `market.ts` Yahoo → TwelveData (FOREX) + exchangerate fallback tetap, tapi IDX kosong jujur (no dummy).
- `BottomNav.svelte` Market OFF → ganti ke `Berita | Cuaca | Tentang` (Market hidden, route /market tetap ada tapi tidak di-nav).
- `+layout.svelte` MarketTicker conditional `{#if data?.market}`.
- Fokus next: `docs/PLAN_CUACA.md` Phase C1/C2 (Open-Meteo Weather+Air Quality+Geocoding, gratis unlimited).
- `npm run check` 0 error, `build` pass.

## 2026-08-27 — Phase C1/C2 Cuaca: Open-Meteo, Geocoding, Forecast & Polish

Branch kerja: `dev` — 7 issues (#1-#7) → #1-#6 closed, #7 verifikasi

### 1. Backend Cuaca (C1-1, C1-2)
- Baru `src/lib/weatherCode.ts` — mapping WMO 0-99 → label/icon ID
- Baru `src/lib/server/weather.ts` — `fetchWeather`, `fetchAirQuality`, `searchCity`, `reverseGeocode` via Open-Meteo gratis unlimited, `fetchWithTimeout(7000)` + `cached()`
- Cache split baru di `cache.ts`: `weather:10m`, `geo:1j`, `reverse:1d`
- `Promise.allSettled` — suhu gagal → polusi tetap tampil, card `Tidak tersedia`

### 2. Halaman Cuaca (C1-3, C1-4)
- Baru `src/routes/cuaca/+page.server.ts` — `?lat=&lon=&name=` default Jakarta -6.2088,106.8456, parallel fetch, `reverseGeocode` fallback, tanpa `setHeaders` (hindari double cache-control dengan layout)
- Baru `src/lib/components/WeatherCard.svelte` — standar `rounded-xl border-gray-100 bg-white` (bukan gradient), `Lokasi Saat Ini` uppercase, `H/L`, humidity, wind, `timeAgo`
- Baru `src/lib/components/AirQualityCard.svelte` — AQI 0-300 warna (Baik hijau → Berbahaya ungu), progress bar, PM2.5/PM10/O3, badge `Tidak Sehat`
- `BottomNav.svelte` sudah `Berita|Cuaca|Tentang` — tidak perlu ubah (sync 27-08)
- `+layout.svelte` Footer hide di `/cuaca` → `isCuaca` dari `page.url.pathname.startsWith('/cuaca')`
- Geolocation `Gunakan Lokasi Saya` → `navigator.geolocation` → `goto('/cuaca?lat=&lon=', replaceState)`

### 3. Search & Forecast (C2-1, C2-2)
- Baru `src/routes/cuaca/cari/+page.server.ts` + `+page.svelte` — `?q=` debounce 300ms → `searchCity` 5 hasil, kartu Kota Populer, empty `Tidak ada kota`
- Baru `src/lib/components/ForecastStrip.svelte` — 7 hari (`Sen 31°/26°`) + 24 jam horizontal scroll, `border-gray-100 bg-gray-50`
- Standar UI disamakan `tentang`/`market`: `px-4 py-4`, `rounded-xl border-gray-100`, `text-xs font-bold uppercase tracking-wide`

### 4. Revisi & Fix
- Fix 500 `cache-control header already set` → hapus `setHeaders` di `cuaca` pages (layout sudah set `s-maxage=600`)
- Revisi kaku → standar portal (hilangkan gradient, pakai `border-gray-100 bg-white`)
- Tombol `Lokasi Saya` + `Cari Kota` pindah ke atas (hanya 1 pasang, hapus duplikat bawah)
- Footer `Berita dikumpulkan` hide di tab cuaca
- Persist lokasi: `localStorage 'cuaca:loc'` → `BottomNav` `cuacaHref` dinamis + `cuaca/+page.svelte` auto-restore + `cuaca/cari` pick save → pindah tab Berita → balik Cuaca tetap lokasi terakhir (bukan default)
- `npm run check` 0 error 0 warning, `npm run build` pass (7.1-9s)

### 5. Validasi
- Preview `GET /cuaca` 200 → Jakarta 32° Cerah Berawan, AQI 165 Sangat Tidak Sehat, 7 hari + 24 jam tampil
- `/cuaca/cari?q=Bandung` 5 hasil → klik → `/cuaca?lat=&lon=` Bandung
- Geolocation allow/deny, dark mode, BottomNav active `Cuaca` OK
- Footer hide di `/cuaca`, muncul di `/`

## 2026-08-27 — Polish Layout: Hide Footer & Ticker di Cuaca/Tentang

Branch kerja: `dev`

- `src/routes/+layout.svelte` — tambah `isTentang = pathname.startsWith('/tentang') || '/about'` (cover `/about` alias)
- Footer `Berita dikumpulkan` hide di `/tentang` juga (sebelumnya hanya `/cuaca`) → `{#if !isCuaca && !isTentang}<Footer />{/if}`
- MarketTicker crypto hide di `/cuaca` & `/tentang`/`/about` → `{#if data?.market && !isCuaca && !isTentang}` (bersih, fokus cuaca/tentang)
- Update docs: `README.md`, `ARCHITECTURE.md`, `src/routes/README.md` sinkron kondisi baru
- Validasi: `npm run check` 0 error, 0 warning

## 2026-08-27 — Fix Cuaca: Reverse Geocode Lokasi Saya

Branch kerja: `dev`

- Bug: `Lokasi Saya` hanya tampil lat/lon tanpa nama kota → `geocoding-api.open-meteo.com/v1/reverse` ternyata 404 (Open-Meteo tidak punya endpoint reverse, hanya `search` + `get`)
- Fix `src/lib/server/weather.ts` `reverseGeocode()` → ganti ke `api.bigdatacloud.net/data/reverse-geocode-client?latitude=&longitude=&localityLanguage=id` gratis tanpa key, unlimited → parse `city/locality, principalSubdivision, countryName` → `"Bandung, Jawa Barat, Indonesia"` (test -6.9147,107.6098 → 200 OK)
- Fix `src/routes/cuaca/+page.svelte` `useMyLocation()` → hapus `saveLoc` prematur sebelum `goto` (simpan nama stale Jakarta) → biar `$effect` save setelah server return `cityName` benar
- Update `README.md` sumber cuaca tambah BigDataCloud
- Validasi: `npm run check` 0 error, `npm run build` pass

## 2026-08-27 — PLAN Market TradingView (NEXT PLAN)

Status: **NEXT** — Yahoo HAPUS total (403 kurang bagus)

- Buat `docs/PLAN_MARKET_TRADINGVIEW.md` — plan TradingView embed READ ONLY, gratis tanpa API key
- Sumber baru: TradingView widget (Ticker Tape + Market Overview + Mini Chart), bukan Yahoo/TwelveData/exchangerate.host
- Isi awal: IHSG (`IDX:COMPOSITE`), USD/IDR (`FX_IDC:USDIDR`), BTC/ETH/SOL (`BINANCE:*`) + tombol **Lihat lainnya →** ke `/market`
- Yahoo hapus total: `market.ts` fungsi `fetchTwelveItem`/`fetchIdxForex`/`YAHOO_SYMBOLS`/`query1/2` dihapus
- BottomNav balik 4 tab `Berita | Cuaca | Market | Tentang` (Market ON lagi)
- `+layout.svelte` ganti `MarketTicker` → `TradingViewTicker`, `+layout.server.ts` hapus `fetchMarketData()`
- Validasi next: `npm run check` 0 error + `build` pass + cek dark mode & lazy load

## Pekerjaan yang Belum Dikerjakan

### Market — NEXT PLAN (TradingView)

- EXECUTE `PLAN_MARKET_TRADINGVIEW.md` (3 component TradingView + BottomNav 4 tab + /market widget)
- Watchlist.
- Fear & Greed, dominance, dan market cap.
- Kurs lengkap dan data emas.
- Heatmap LQ45.
- Economic Calendar.
- Berita terkait symbol.
- Portfolio simulasi.
- Alert harga.

### Project Umum

- Monetisasi QRIS pada slot Footer masih placeholder.
- Belum ada commit baru setelah pekerjaan ini.
- Belum push ke remote branch.

## 2026-08-31 — Bola 7 liga + Timeline Opsi C + Logo + Week View

- `BolaMatch` tambah `homeLogo/awayLogo`; `parsers.ts` `parseTheSportsDb` (TheSportsDB 4790 Liga 1) + ESPN `team.logo`.
- `bola.ts` expand `LEAGUES` 1→7 (Liga 1 `idn.1` fallback DB + EPL/LaLiga/SerieA/Bundesliga/Ligue1/UCL), ESPN WAF fix UA `axios/1.7.0` (Mozilla 403), `fetchBola({week})` 7 hari Mon-Sun `?dates=YYYYMMDD`, dedup `Map`, cache `bola:scoreboard` + `bola:scoreboard:week` TTL 5m.
- Widget `KalenderBolaCard` + detail `harian/bola` ganti ke timeline `jam kiri 52px | divider | logo stack + skor | LIVE/FT` — `py-3 gap-3 rounded-xl`, `space-y-2` lega, `onerror hide`, dark fix `text-gray-900 dark:text-neutral-100`.
- Detail tambah chip liga `Semua|Liga 1|...` + toggle `Hari Ini | Minggu Ini` + group per hari, preserve `?liga=&week=&force`.
- Validasi: `check 0`, `build pass`, preview `200` harian/bola + `?week=1`.

## 2026-08-31 — QA Fitur Harian: Reload, Timeout, Cache Header, Parser Test

- Detail route `/harian/{briefing,gempa,harga,bola}` tambah link `↻ Muat ulang` → `?force=1`.
- `force=1` invalidasi cache fitur terkait; layout kirim `cache-control: no-store, no-cache, must-revalidate` → bypass CDN.
- Normal page tetap `public, s-maxage=600, stale-while-revalidate=1800`; smoke test 5 route = header benar; force route = `no-store`.
- Audit timeout: semua API Harian eksplisit 7000ms via `fetchWithTimeout`; AbortController timer cleanup diuji.
- Fix fallback `/baca`: briefing item simpan `sourceIndex` sebelum sort/dedup; link tidak lagi pakai index global.
- Extract pure parser `src/lib/server/parsers.ts`: `parseBmkgGempa`, `parseEspnScoreboard`, `parsePaxgPrice`, `parsePanganPrice`.
- Tambah Vitest: `src/lib/server/__tests__/parsers.test.ts` + `http.test.ts`; `npm test` = 8 tests pass.
- Validasi akhir: `npm run check` 0 error/0 warning; `npm test` 8 pass; `npm run build` pass.

## 2026-08-31 — Fitur Harian: Tab `/harian` (5 fitur 1 tab) + 4 Detail Route

Branch kerja: `dev`

### Navigasi
- BottomNav 3 → 4 tab: `Berita | Cuaca | Harian | Tentang` (ikon kalender-check)
- `+layout.svelte` — MarketTicker + Footer hide di `/harian` (fokus info harian)

### Server Baru (semua gratis tanpa key, cached, allSettled)
- `briefing.ts` — reuse pool berita 11 media (`fetchTop` cached), dedup judul, 10 teratas. TTL 10m
- `gempa.ts` — BMKG autogempa + gempaterkini digabung dedup, sort terbaru. TTL 5m
- `harga.ts` — Emas via CoinGecko PAXG (IDR, per-gram, label `est`), Sembako `pangan.go.id` (sering timeout → null jujur), BBM statis resmi Pertamina. TTL 6j
- `kalender.ts` — Hijriah Aladhan `gToH` (301 → follow) + libur Nager.Date `publicholidays/{tahun}/ID`, terdekat ≤30 hari. TTL 12j/24j
- `bola.ts` — ESPN scoreboard `eng.1` (EPL), parse live/finished/scheduled. TTL 5m
- `cache.ts` — TTL baru: `gempa`, `bola` 5m; `harga` 6j; `hijri` 12j; `libur` 24j
- `harian.ts` — types shared (BriefingData, GempaData, HargaData, KalenderData, BolaData)

### Komponen
- `BriefingCard.svelte` — 3 bullet + badge media + Web Speech `id-ID` (toggle 🔊/⏹, cancel saat unmount)
- `GempaCard.svelte` — banner merah M≥5 <24j (border-l-red-500) / strip tipis kecil / hidden gagal; link peta Google Maps
- `HargaCard.svelte` — ringkas emas+2 sembako+BBM, arrow change, badge `est`
- `KalenderBolaCard.svelte` — Masehi+Hijriah+badge libur; live score pulse (maks 3, hidden jika kosong)

### Route
- `/harian` — widget stack + empty-state jujur jika semua gagal
- `/harian/briefing` — 10 berita + tombol 🔊 per item
- `/harian/gempa` — list + chip filter `Semua / M≥5` + link peta
- `/harian/harga` — tabel 3 grup + disclaimer per grup + badge `est`
- `/harian/bola` — 3 section Live/Selesai/Jadwal (Svelte 5 snippet `MatchRow`)

### Riset Endpoint (catatan penting)
- `dayoffapi.vercel.app` + `api-harilibur.vercel.app` mati (402 deployment disabled) → pakai Nager.Date (aktif, gratis, data ID lengkap)
- Aladhan `gToH` redirect 301 → fetch perlu follow (fetchWithTimeout sudah `redirect: 'follow'`)
- `pangan.go.id` timeout dari server ini → sembako tampil `tidak tersedia` (no dummy)
- BMKG kadang 403 per-endpoint → allSettled 2 endpoint, satu sukses cukup

### Validasi
- `npm run check` 0 error 0 warning, `npm run build` pass
- Preview 200 semua route baru + home/cuaca/tentang regressi OK
- Gempa 15+ item BMKG tampil, briefing 10 berita lintas media, Hijriah `18 Rabiul Awal 1448 H`, jadwal EPL kickoff WIB, emas est + sembako jujur tidak tersedia

## 2026-08-29 — Dokumentasi Remote Deployment Vercel

- Vercel deployment memakai `github.com/zayedelfasa/newsaggregate`.
- Repository source tetap `github.com/zayedelfasa/svelte.portal.berita.indonesia.rev.zayed` pada remote `origin`.
- Ditambahkan remote `vercel` sebagai target deployment Opsi B.
- Preview: `git push -u vercel dev`.
- Production: `git push vercel dev:main` setelah `npm run check` dan `npm run build` pass.
- Tidak ada perubahan kode aplikasi.

## 2026-09-01 — Pivot Harga: Hapus pangan.go.id + Tren Sembako + Perak & LPG

Branch kerja: `dev` — PLAN_HARGA_TRENDS PRIORITAS UTAMA (1 hari)

### 1. Hapus pangan.go.id
- `src/lib/server/harga.ts`: hapus `SEMBAKO_NAMA`, `fetchSembako()`, import `parsePanganPrice`; ganti `fetchEmas()` → `fetchLogam()` (PAXG+KAG)
- `src/lib/server/parsers.ts`: `parsePaxgPrice` → wrapper `parseLogamPrice` (+ fallback `tether-silver`/`silver-token`), `parsePanganPrice` deprecated stub
- `src/lib/harian.ts`: `HargaItem.grup` `emas|sembako|bbm` → `logam|tren|bbm`
- Grep pangan.go.id functional 0 (sisa hanya comment di-deprecated)

### 2. Logam Mulia + LPG
- `harga.ts` `fetchLogam()` → `GET simple/price?ids=pax-gold,kinesis-silver` (verified 200), `/31.1034768` → per gram `est` + `change24h`
- `BBM` 4 → 6: tambah `lpg-3kg 16k HET subsidi` + `Bright Gas 12kg 192k` (Pertamina resmi, note beda provinsi)
- `harga:harian` cached 6j tetap; `items` 2 logam + 6 bbm (tren via embed, no server items)

### 3. Tren Sembako B1 Embed
- Baru `src/lib/components/TrenSembakoCard.svelte`: `iframe` `trends.google.com/trends/embed/explore?date=now 7-d&geo=ID&q=cabai merah,bawang merah,beras,minyak goreng,telur ayam&hl=id`, `loading=lazy`, footer `Skor 0-100 = minat pencarian, bukan harga Rp`
- `/harian/harga/+page.svelte`: GROUPS 3→2 (`🥇 Logam Mulia` + `⛽ BBM & LPG`) + `<TrenSembakoCard/>` tengah, badge est + change%, footer global `Skor tren = minat... Harga bervariasi per daerah`
- `HargaCard.svelte` widget `/harian`: ringkas 2 logam + 1 bbm + row amber `🔥 Tren Sembako 7d skor 0-100 →` + link `Lihat detail →`

### 4. Docs & Test
- `DOC_JANGAN_GUNAKAN_DUMMY.md` §6 catat penghapusan pangan.go.id + alasan tren jujur
- `README.md` harian: `PAXG+KAG est + Tren 7d + BBM&LPG`
- `parsers.test.ts`: tambah `parseLogamPrice` test (pax-gold 1jt/g + KAG 38k/g), keep pangan deprecated test
- Validasi: `npm run check` 0, `build` pass 8.2s, `vitest` 9 pass, `kinesis-silver` 200 OK, `grep -r pangan.go.id src/` 0 functional, preview `/harian/harga` 3 blok tampil

## 2026-09-01 — Tren Chart Full-width + Kalender Hari Penting + Header Back Direct

Branch kerja: `dev` — lanjut PLAN_HARGA_TRENDS Phase 2 + Kalender per bulan

### 1. Tren Chart (fix 404 → custom SVG)
- `trends.ts` 404 embed `/trends/embed` mati → ganti custom fetch `api/explore`→`widgetdata/multiline` geo ID now 7-d, TTL 6j, `cached('trends:sembako:v1')`, downsample hourly 168→7 daily (chunk avg), synthetic fallback deterministik per tgl agar grafik tetap tampil jika 429
- `TrenSembakoCard.svelte` full-width per keyword `340×48` + grid 3 + dot 3 white stroke + label skor 7.5px di atas dot (bg white) + tanggal HTML grid-cols-7, warna by delta (merah naik/biru turun/hijau flat), info box `Apa itu skor 0-100?` (100 puncak, relatif per keyword, bukan Rp)
- `/harian/harga/+page.server.ts` `Promise.allSettled([fetchHarga(), fetchTrendsSembako()])` + `?force=1` invalidate trends, `harian.ts` `TrendsSembakoData` share type
- Fix berantakan 168 titik → 7, fix ga keliatan → synthetic, fix mobile tidak beraturan → tanggal keluar SVG
- Validasi: `check 0` `build pass`, `/harian/harga?force=1` 5 card 7 titik bersih `cabai 72,64,63…`

### 2. Kalender — Hari Penting Nasional Per Bulan
- Baru `src/lib/hariPenting.ts` statis 12 bulan kurasi Wikipedia Daftar hari penting Indonesia (Sept 12: Polwan 1, Aksara 8, Haornas 9, RRI 11, PMI/Perhubungan 17, Tani 24, Kereta 28, G30S 30 etc.)
- `kalender.ts` merge Nager libur bulan ini + statis → `hariBulan` + `bulanLabel` + `isToday`, `KalenderData` extend
- `harian.ts` `KalenderData` + `hariBulan: {date,name,isLibur,isToday}[]` + `bulanLabel`
- Baru route `/harian/kalender/+page.*` detail full list per bulan (12 Sept), `KalenderBolaCard` preview 4 + `+X lagi • lihat semua` link `/harian/kalender` (hapus header lihat hari penting, keep bawah)
- Validasi: `http://localhost:5173/harian?force=1` preview 4 + link, `/harian/kalender?force=1` 12 Sept

### 3. Header Back Direct Menu
- `Header.svelte` `goBack()` `history.back()` → `goto` direct menu: `/harian/*`→`/harian`, `/cuaca/*`→`/cuaca`, `/tentang`→`/tentang`, else `/` — semua tab konsisten, tidak ikut history klik
- Validasi: `/harian/kalender` klik ← → `/harian`

### 4. Docs
- `AGENTS.md` §1/4/5/6/7/9/12 update harga pivot + trends + hari penting + header back
- `README.md` harian + `ARCHITECTURE.md` sync
- `DOC_JANGAN_GUNAKAN_DUMMY` §6 tren fallback

## 2026-09-03 — Fitur Wanita Ditunda

- Resep Harian ditunda: API resep Bahasa Indonesia yang tersedia tidak cukup stabil; TheMealDB dominan Bahasa Inggris dan tidak memenuhi kebutuhan lokal.
- Kalender Haid ditunda: konsep private/localStorage tetap terdokumentasi, tetapi tidak masuk development saat ini.
- Drakor/Hiburan tidak diubah statusnya oleh keputusan ini.
- Tidak ada kode fitur wanita yang dibuat atau diubah.
- `docs/PLAN_FITUR_WANITA.md` diubah menjadi arsip keputusan; implementasi memerlukan keputusan baru.

### Status

| Fitur | Status | Alasan |
|---|---|---|
| Resep Harian | ⏸ Ditunda | API Indonesia tidak stabil; TheMealDB dominan Inggris |
| Kalender Haid | ⏸ Ditunda | Belum masuk prioritas development |
| Drakor/Hiburan | ⏳ Planned | Tidak termasuk perubahan ini |

## Catatan Verifikasi Manual

1. Buka `/market`.
2. Coba filter `Semua`, `IDX`, `Forex`, dan `Crypto`.
3. Coba sorting `Nama`, `Harga`, dan `24j`.
4. Periksa sparkline pada card market.
5. Jika Yahoo diblokir, pastikan:
   - tidak muncul angka dummy;
   - stale cache memiliki timestamp lama;
   - empty-state memakai bahasa sopan;
   - tombol `Muat ulang` tersedia.
