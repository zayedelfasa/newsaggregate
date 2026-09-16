# PLAN_HIBURAN.md — Katalog Film TMDB

> Branch: `dev`  
> Status: **Implemented MVP**
> Route utama: `/hiburan`  
> Provider: **TMDB API**  
> Scope awal: katalog film dan discovery; drakor/serial TV diabaikan dulu.

## 1. Tujuan

Membuat halaman hiburan mobile-first yang menampilkan film trending, film populer, film sedang tayang, film mendatang, trailer, genre, search, dan detail film.

Fitur bukan layanan streaming. Aplikasi hanya menampilkan metadata film dan membuka sumber/trailer jika tersedia.

## 2. Scope MVP

**Status implementasi:** `/hiburan` dan `/hiburan/movie/[id]` sudah aktif di branch `dev`. TMDB API menjadi provider film. Drakor/serial TV tetap di luar scope.

### Wajib

- Halaman `/hiburan`.
- Search film.
- Film trending hari ini/minggu ini.
- Film populer.
- Poster.
- Rating.
- Tahun rilis.
- Genre.
- Detail film.
- Empty-state dan error-state.
- Loading state.
- Dark mode.
- Mobile-first `max-w-[420px]`.

### Ditunda

- Drakor dan serial TV.
- Watchlist akun.
- Login.
- Review dan komentar.
- Person/cast detail.
- Recommendation personal.
- Watch provider.
- Notifikasi rilis.
- Infinite scroll.
- Trailer embed otomatis.
- Leaderboard/community.

## 3. Struktur UI `/hiburan`

```text
/hiburan
├── Header Hiburan
├── Search film
├── Filter utama
│   ├── Semua
│   ├── Populer
│   ├── Sedang tayang
│   └── Segera hadir
├── Trending
│   ├── Hari ini
│   └── Minggu ini
├── Film Populer
├── Sedang Tayang
├── Segera Hadir
├── Trailer Terbaru
└── Jelajahi Genre
```

### Pola card

- **Poster rail:** trending, populer, film serupa.
- **List card:** search, sedang tayang, segera hadir.
- Poster TMDB memakai `w342` atau `w500`.
- `poster_path` null → placeholder UI; jangan gunakan poster dummy.
- Klik card → `/hiburan/movie/{id}`.

## 4. Endpoint TMDB

Base URL:

```text
https://api.themoviedb.org/3
```

Endpoint MVP:

| Konten | Endpoint | Cache |
|---|---|---:|
| Trending hari ini | `/trending/movie/day` | 1j |
| Trending minggu ini | `/trending/movie/week` | 1j |
| Film populer | `/movie/popular?language=id-ID&region=ID` | 1j |
| Sedang tayang | `/movie/now_playing?language=id-ID&region=ID` | 1j |
| Film mendatang | `/movie/upcoming?language=id-ID&region=ID` | 1j |
| Search film | `/search/movie?query={q}&language=id-ID` | 1j |
| Daftar genre | `/genre/movie/list?language=id-ID` | 24j |
| Discover genre | `/discover/movie?with_genres={id}&language=id-ID` | 1j |
| Detail film | `/movie/{id}?language=id-ID&append_to_response=credits,videos,similar` | 6j |

Catatan:

- Jika judul/overview Bahasa Indonesia tidak tersedia, boleh tampilkan field fallback dari `en-US` jika endpoint mendukung.
- Jangan hardcode jadwal, rating, tanggal, atau poster.
- `region=ID` dipakai untuk endpoint yang mendukung data regional.
- Data TMDB bisa kosong untuk region Indonesia; tampilkan empty-state jujur.

## 5. Auth TMDB

Credential server-only:

```env
TMDB_API_KEY=...
```

Atau:

```env
TMDB_API_TOKEN=...
```

Aturan:

- Jangan commit `.env`.
- Jangan import credential dari `$env/static/private` ke komponen client.
- Request hanya dari `src/lib/server/hiburan.ts`.
- Jangan kirim credential melalui props ke `+page.svelte`.
- Vercel perlu env untuk Development, Preview, dan Production.
- HTTP 401 → error config, bukan fallback data dummy.
- HTTP 429 → stale cache, lalu empty-state.

## 6. Tipe data internal

Simpan tipe shared di `src/lib/hiburan.ts` atau `src/lib/harian.ts` jika dipakai widget `/harian`.

```ts
export interface MovieItem {
  id: number;
  title: string;
  poster: string | null;
  backdrop: string | null;
  rating: number | null;
  voteCount: number | null;
  year: number | null;
  releaseDate: string | null;
  genres: string[];
  overview: string | null;
  status?: string | null;
  runtime?: number | null;
  sourceUrl: string;
}

export interface MovieVideo {
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface MovieDetail extends MovieItem {
  cast: MovieCast[];
  videos: MovieVideo[];
  similar: MovieItem[];
}
```

Normalisasi diperlukan agar UI tidak bergantung pada response mentah TMDB.

## 7. Server implementation

File utama:

```text
src/lib/server/hiburan.ts
```

Function rencana:

```ts
fetchTrendingMovies(period: 'day' | 'week')
fetchPopularMovies()
fetchNowPlayingMovies()
fetchUpcomingMovies()
searchMovies(query: string)
fetchMovieGenres()
fetchMoviesByGenre(genreId: number)
fetchMovieDetail(id: number)
```

Pola request:

```text
+page.server.ts
  → hiburan.ts
  → cached(key, fn, ttl)
  → fetchWithTimeout(url, options, 7000)
  → validate response
  → normalize TMDB response
  → return typed data
```

Jika beberapa section dipanggil bersamaan:

```ts
Promise.allSettled([
  fetchTrendingMovies('day'),
  fetchPopularMovies(),
  fetchNowPlayingMovies(),
  fetchUpcomingMovies()
]);
```

Satu endpoint gagal tidak boleh membuat halaman `/hiburan` crash.

## 8. Cache key

```text
hiburan:trending:day       TTL 1j
hiburan:trending:week      TTL 1j
hiburan:popular             TTL 1j
hiburan:now-playing         TTL 1j
hiburan:upcoming            TTL 1j
hiburan:search:{query}      TTL 1j
hiburan:genres              TTL 24j
hiburan:genre:{id}          TTL 1j
hiburan:detail:{id}         TTL 6j
```

Gunakan `peekCache()` untuk stale cache maksimal 24 jam jika upstream error. Jangan membuat data sintetis film.

## 9. Route

### List

```text
src/routes/hiburan/+page.server.ts
src/routes/hiburan/+page.svelte
```

Query yang didukung:

```text
/hiburan
/hiburan?q=inception
/hiburan?section=trending
/hiburan?section=popular
/hiburan?section=now-playing
/hiburan?section=upcoming
/hiburan?genre=28
```

MVP boleh memakai `q` dan `genre` lebih dulu. Section default tetap tampil jika query kosong.

### Detail

```text
src/routes/hiburan/movie/[id]/+page.server.ts
src/routes/hiburan/movie/[id]/+page.svelte
```

URL:

```text
/hiburan/movie/27205
```

Detail berisi:

- Backdrop/poster.
- Judul.
- Rating.
- Tahun.
- Runtime.
- Genre.
- Status.
- Tanggal rilis.
- Overview.
- Pemeran utama jika tersedia.
- Trailer link jika tersedia.
- Film serupa jika tersedia.

## 10. Komponen

```text
src/lib/components/MovieCard.svelte
src/lib/components/MovieRail.svelte
src/lib/components/MovieListItem.svelte
src/lib/components/MovieDetail.svelte
src/lib/components/EntertainmentHeader.svelte
```

File awal yang wajib:

```text
src/lib/components/MovieCard.svelte
```

`DrakorCard.svelte` tidak digunakan pada scope ini.

Konvensi:

- Svelte 5 runes.
- Props via `$props()`.
- Event via `onclick={}`.
- Inline SVG jika butuh icon.
- Semua komponen dark-mode ready.
- Tidak fetch API dari komponen.

## 11. Integrasi tab Berita

`/hiburan` bukan tab BottomNav baru.

BottomNav tetap:

```text
Berita | Cuaca | Harian | Tentang
```

Tab Berita memiliki satu shortcut header:

```text
Header Berita
└── Hiburan → /hiburan
```

Jangan tampilkan dua konten hiburan di halaman Berita. Tidak ada card hiburan tambahan di bagian bawah feed berita.

## 12. Integrasi `/harian`

Ditunda sampai halaman `/hiburan` stabil.

Setelah MVP selesai, widget optional:

```text
🎬 Film Populer
[poster] Film A · ⭐8.4
[poster] Film B · ⭐8.1
Lihat semua → /hiburan
```

Request widget harus masuk `Promise.allSettled()` pada `/harian`. Hiburan gagal → widget disembunyikan; `/harian` tetap HTTP 200.

## 13. Error dan empty state

| Kondisi | UI |
|---|---|
| API key kosong | `Data hiburan belum dikonfigurasi.` |
| TMDB 401 | `Credential TMDB tidak valid.` |
| TMDB 429 | Stale cache atau `Data sedang sibuk. Coba lagi.` |
| TMDB 5xx | Stale cache atau `Film belum tersedia.` |
| Search kosong | `Film tidak ditemukan.` |
| Poster null | Placeholder poster |
| Rating null | Sembunyikan rating |
| Overview null | Sembunyikan ringkasan |
| Trailer kosong | Sembunyikan section trailer |
| Region ID kosong | Empty-state, tanpa angka dummy |

## 14. Tahapan pengerjaan

### Phase 1 — Backend

- Tambah env TMDB.
- Buat `hiburan.ts`.
- Buat TMDB request helper.
- Buat normalizer movie.
- Tambah cache.
- Tambah error handling.

### Phase 2 — `/hiburan`

- Header.
- Search.
- Filter section.
- Trending rail.
- Popular rail.
- Now playing list.
- Upcoming list.
- Loading/error/empty state.

### Phase 3 — Detail

- Route `/hiburan/movie/[id]`.
- Detail movie.
- Cast.
- Trailer link.
- Similar movies.

### Phase 4 — Genre

- Genre list.
- Discover berdasarkan genre.
- Query `?genre=`.

### Phase 5 — `/harian`

- Widget film populer.
- `Promise.allSettled`.
- Hide jika data kosong/gagal.

## 15. Verifikasi

```bash
npm run check
npm run build
npm test
```

Manual:

```text
/hiburan
/hiburan?q=inception
/hiburan?section=now-playing
/hiburan?section=upcoming
/hiburan?genre=28
/hiburan/movie/27205
```

Checklist:

- [ ] TMDB key tidak masuk bundle client.
- [ ] Tidak ada data film dummy.
- [ ] Poster null aman.
- [ ] Rating null aman.
- [ ] API 401/429/5xx aman.
- [ ] Stale cache maksimal 24 jam.
- [ ] Search query di-encode.
- [ ] Dark mode aman.
- [ ] Layout tidak melebar dari `420px`.
- [ ] Header Berita hanya punya satu shortcut Hiburan.
- [ ] BottomNav tetap 4 tab.
- [ ] `/harian` tidak crash jika hiburan gagal.
