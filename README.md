# Portal Berita Indonesia

Agregator berita lokal Indonesia — 11 media, 3 berita teratas per media + **Cuaca & Polusi (Open-Meteo)** + **Harian (Gempa/Harga/Kalender/Bola 7 liga, no dummy)** + **Katalog Film Hiburan (TMDB)** + **Market read-only (hidden)**.
Dibangun dengan **SvelteKit 2 (Svelte 5 runes) + Tailwind CSS v4**, deploy target **Vercel**.

**4 Tab Aktif:** `📰 Berita` · `🌤️ Cuaca` · `📅 Harian` (gempa, harga, kalender, bola 7 liga) · `ℹ️ Tentang`. Ringkasan Pagi tampil di tab Berita. `/hiburan` diakses dari shortcut Berita, bukan tab kelima. Market `/market` tetap ada tapi **hidden dari BottomNav**. Navigasi via **Bottom Tab** fixed `max-w-[420px]`.

## Media Sumber

| Media | Jalur |
|---|---|
| Detik | RSS `news.detik.com/rss` |
| CNN Indonesia | RSS `cnnindonesia.com/rss` |
| Antara News | aggregator (+ fallback RSS resmi) |
| CNBC Indonesia | aggregator (+ fallback RSS resmi) |
| Tempo | aggregator |
| Republika | aggregator |
| Okezone | aggregator |
| Kumparan | aggregator |
| JPNN.com | RSS `jpnn.com/rss` |
| Media Indonesia | RSS `mediaindonesia.com/feed` |
| iNews | RSS `inews.id/feed` |

Aggregator berita: [berita-indo-api](https://github.com/satyawikananda/berita-indo-api).
Market: [CoinGecko API v3](https://api.coingecko.com/api/v3/coins/markets) (crypto, tanpa key) + [TwelveData](https://api.twelvedata.com/quote) (Forex USD/IDR, tanpa key, IDX tunda) — no dummy, empty jujur. Detail: [`docs/DOC_FITUR_MARKET_TENTANG.md`](docs/DOC_FITUR_MARKET_TENTANG.md).
Cuaca: [Open-Meteo](https://open-meteo.com) Weather + Air Quality + Geocoding (gratis tanpa key, unlimited) + [BigDataCloud](https://www.bigdatacloud.com) reverse-geocode (gratis tanpa key) — suhu, AQI, forecast 7 hari, hourly 24 jam, nama kota dari lat/lon. Detail: [`docs/PLAN_CUACA.md`](docs/PLAN_CUACA.md).
Harian: Briefing (reuse pool berita, Web Speech) + Gempa BMKG + Harga (Logam PAXG+KAG est + Tren 7d Google Trends full-width 5×7 skor + BBM&LPG 6) + Kalender Hijriah (Aladhan) + libur & Hari Penting per bulan (Nager.Date + kurasi statis, /harian/kalender) + Bola 7 liga (ESPN + TheSportsDB 4790 Liga 1, UA fix, week Mon-Sun, timeline + logo). Detail: [`docs/PLAN_FITUR_HARIAN.md`](docs/PLAN_FITUR_HARIAN.md) + [`docs/PLAN_HARGA_TRENDS.md`](docs/PLAN_HARGA_TRENDS.md).

> Tribun News / Jawa Pos / Suara.com tidak dipakai — endpoint & RSS-nya mati/bot-block saat riset (lihat `docs/PLAN.md`).

## Menjalankan Lokal

```bash
npm install
npm run dev          # dev server
npm run build        # build produksi
npm run preview      # preview hasil build
npm run check        # svelte-check 0 error
```

## Arsitektur Singkat

- Semua fetch upstream dilakukan **server-side** (`src/lib/server`) → bebas masalah CORS.
- Cache memori TTL 10 menit per sumber + split `market:crypto 2m, idx 15m, forex 10m, weather 10m, geo 1j, reverse 1d, harga 6j, trends 6j, hijri 12j` + header `s-maxage=600` untuk CDN Vercel.
- Satu sumber gagal ≠ halaman gagal (`Promise.allSettled`, section menampilkan pesan kecil; market gagal → empty jujur, cuaca gagal → card `Tidak tersedia`, layout tidak crash).
- `+layout.server.ts` load **MarketTicker** global conditional (`{#if data?.market && !isCuaca && !isHarian && !isTentang}`) — tampil di bawah Header hanya di `/` (hide di `/cuaca`, `/harian`, `/tentang`).
- BottomNav fixed 4 tab (`/`, `/cuaca`, `/harian`, `/tentang`) — `safe-area-inset-bottom` aware, `cuacaHref` dinamis via `localStorage 'cuaca:loc'` → persist lokasi terakhir, Footer `Berita dikumpulkan` hide di `/cuaca`, `/harian` & `/tentang`.
- Halaman `/cuaca` → `?lat=&lon=&name=` default Jakarta, geolocation + search kota `/cuaca/cari`; `/market` hidden; `/baca?source=X&id=Y&u=...` detail; `/tentang` static — lihat [`src/routes/README.md`](src/routes/README.md).

Detail lengkap: lihat [`docs/PLAN.md`](docs/PLAN.md). Docs lain: [`docs/PLAN_CUACA.md`](docs/PLAN_CUACA.md) (Cuaca+Polusi, Done C1/C2) · [`docs/PLAN_FITUR_HARIAN.md`](docs/PLAN_FITUR_HARIAN.md) (daily habit) · [`docs/CHANGELOG.md`](docs/CHANGELOG.md).

## Deployment Vercel

Vercel memakai repository `zayedelfasa/newsaggregate`, bukan `origin` source repository ini. Tambahkan remote deployment lalu push branch `dev`:

```bash
git remote add vercel git@github.com:zayedelfasa/newsaggregate.git
git push -u vercel dev
```

Untuk production, hanya setelah validasi:

```bash
npm run check && npm run build
git push vercel dev:main
```

Detail aturan deployment ada di [`AGENTS.md`](AGENTS.md).
