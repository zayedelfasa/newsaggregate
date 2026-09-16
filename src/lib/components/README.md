# components/ — Komponen UI Svelte

Komponen presentational. Data selalu masuk lewat props (dari load function), tidak pernah fetch sendiri.

## Daftar Komponen

| Komponen | Props | Dipakai di | Fungsi |
|---|---|---|---|
| `Header.svelte` | — (baca `page` & `page.data`) | `+layout.svelte` | Top bar sticky: back, judul, tema, cari, bookmark badge, thumb toggle, refresh, tanggal + Diperbarui |
| `Footer.svelte` | — | `+layout.svelte` (hide di `/cuaca`) | Credit sumber + slot QRIS nonaktif |
| `NewsItem.svelte` | `article: Article`, `index: number`, `marketPool?` | SourceSection, /media, /cari, /simpan | 1 baris artikel: judul clamp-2, badge BARU (<30 mnt), waktu relatif, thumbnail opsional, bookmark, tag market |
| `SourceSection.svelte` | `result: SourceResult`, `marketPool?` | home | Header media + 3 NewsItem; retry via `/api/source/:id` |
| `SkeletonSection.svelte` | — | home, /media | Placeholder animate-pulse saat `navigating` |
| `ArticleView.svelte` | `article: Article`, `sourceName` | `/baca` | Detail: gambar aspect-video, judul, summary, Baca sumber ↗ / Bagikan / Simpan + tag market |
| `Ticker.svelte` | `articles: Article[]` | home | Marquee 8 headline terbaru, pause on hover, reduced-motion |
| `MarketTicker.svelte` | `data: MarketData \| null` | `+layout.svelte` conditional | **Market ticker** IHSG/LQ45/USD·IDR+BTC/... marquee 80s `bg-slate-900`, duplikasi loop seamless |
| `BottomNav.svelte` | — (baca `page.url.pathname` + `localStorage cuaca:loc`) | `+layout.svelte` | **Bottom nav 4 tab** `Berita /` + `Cuaca /cuaca` + `Harian /harian` + `Tentang /tentang`; `safe-area`, active `text-red-500` |
| `WeatherCard.svelte` | `weather, cityName, lat, lon, fetchedAt` | `/cuaca` | **Cuaca** card `Lokasi Saat Ini` standar `border-gray-100 bg-white p-4`, icon `bg-sky-50`, temp/feels/H/L/humidity/wind |
| `AirQualityCard.svelte` | `air: AirQualityData` | `/cuaca` | **Polusi** AQI 0-300 bar warna, badge kategori, PM2.5/PM10/O3 grid `bg-gray-50` |
| `ForecastStrip.svelte` | `weather: WeatherData` | `/cuaca` | **Forecast** 7 hari + 24 jam horizontal scroll `border-gray-100 bg-gray-50` |
| `Sparkline.svelte` | `points, up` | `/market` | Sparkline 7d SVG native tanpa lib |
| `MarketCalculator.svelte` | `item, usdIdr` | `/market` | Kalkulator lot & converter |
| `Toast.svelte` | `message, show` | ArticleView | Notifikasi kecil fixed bottom |
| `MovieCard.svelte` | `movie: MovieItem` | MovieRail | Poster film, judul, rating, tahun; link detail |
| `MovieRail.svelte` | `title, movies, href?` | `/hiburan`, detail movie | Horizontal film rail + `Lihat semua` |
| `MovieListItem.svelte` | `movie: MovieItem` | `/hiburan` search/section | Poster, tanggal rilis, rating, genre, durasi, vote, overview |

## Konvensi

- Semua komponen **dark-mode ready** (`dark:`) + standar `rounded-xl border border-gray-100 bg-white p-4` (cuaca/tentang) atau `rounded-xl border bg-white` (market)
- Waktu relatif baca `clock.now` → label jalan tiap 30 detik
- Event runes (`onclick={}`), icon inline SVG `stroke="currentColor"`
- Cuaca persist `localStorage 'cuaca:loc'` dibaca BottomNav + `/cuaca` untuk href dinamis & auto-restore
- Hiburan hanya menerima data via props; TMDB fetch tetap di server. Header Berita punya satu shortcut Hiburan, bukan tab BottomNav.

## Contoh penggunaan

```svelte
<script lang="ts">
  import NewsItem from '$lib/components/NewsItem.svelte';
  import type { Article } from '$lib/types';
  let { articles }: { articles: Article[] } = $props();
</script>

{#each articles as article, i (article.url)}
  <NewsItem {article} index={i} />
{/each}
```
