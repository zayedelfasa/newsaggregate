# PLAN_FITUR_WANITA.md — Fitur Harian untuk Audiens Wanita

> Branch `dev` — 2026-08-27
> Status: **Ditunda** — Resep Harian dan Kalender Haid tidak masuk development saat ini. Dokumen ini menjadi arsip keputusan, bukan instruksi eksekusi.
> Referensi: `AGENTS.md`, `ARCHITECTURE.md`, `PLAN_FITUR_HARIAN.md` §6 (Skor Bola), `PLAN_CUACA.md`
> Goal: **imbangin Poin 6 Skor Bola (cowok 18-40)** dengan fitur habit harian untuk **wanita/ibu rumah tangga** — retention harian cewek, memakai API gratis sesuai ketentuan, mobile-first `max-w-[420px]`.
> Prinsip: sama dengan `AGENTS.md` §8 — server-only fetch, `cached()` + `s-maxage=600`, `Promise.allSettled`, Svelte 5 runes, no dummy, no paid key.

## 1. Ringkasan & Kenapa Butuh

### Skor Bola = Bias Gender

| Fitur existing P6 | Target | Cek harian | Kelemahan |
|---|---|---|---|
| Skor Bola Liga1/EPL | Pria 18-40 | malam hari | wanita jarang cek skor |

**Wanita butuh trigger beda:** masak tiap hari, drakor tiap malam, kalender haid tiap bulan — **frekuensi lebih tinggi daripada bola.**

### 3 Kandidat Pengganti / Pelengkap (cek API live 2026-08-27)

| Opsi | Fitur | API Free (live test) | Effort | Retention cewek | Catatan |
|---|---|---|---|---|---|
| **A** | **Resep Harian — Ide Masak Hari Ini** | `themealdb.com` ✅ `200 OK` tanpa key (key `1`) | Kecil 0.5 hari | ⭐⭐⭐⭐⭐ | Ibu cek tiap pagi/sore, habit terkuat cewek |
| **B** | **Drakor / Film Hollywood** | **TMDB API** ✅ API key/token gratis sesuai ketentuan | Sedang 1-2 hari | ⭐⭐⭐⭐ | Drakor + film dalam satu katalog hiburan |
| **C** | **Kalender Haid + Tips Harian** | Tanpa API ✅ localStorage | Kecil 0.5 hari | ⭐⭐⭐⭐⭐ | Private, no quota, cek tiap hari |

**Keputusan 2026-09-03:** Resep Harian dan Kalender Haid **ditunda**. Resep tidak cocok saat ini karena API Bahasa Indonesia tidak stabil, sedangkan TheMealDB dominan Bahasa Inggris. Kalender Haid juga tidak dikembangkan sekarang karena belum masuk prioritas eksekusi. Jangan mulai implementasi tanpa keputusan baru.

> Keputusan baru: gunakan **TMDB API** sebagai provider hiburan utama. TVMaze, Kitsu, Jikan, dan API hiburan lain tidak digunakan. Credential TMDB wajib disimpan server-only lewat environment variable.

**Tunda:** Horoskop/Quotes (retention rendah), Skincare scrape (CORS berat), Marketplace promo (butuh affiliate key).

---

## 2. Opsi A — Resep Harian (Ide Masak Hari Ini) ⏸ Ditunda

### API Gratis (verified)

| API | Endpoint | Key | Limit | Test |
|---|---|---|---|---|
| **TheMealDB** | `https://www.themealdb.com/api/json/v1/1/random.php` | `1` (test key, tanpa daftar) | Unlimited (fair use) | ✅ 200 OK 2026-08-27 |
| Kategori | `.../categories.php` , `.../filter.php?c=Seafood` , `.../list.php?a=list` | sama | — | ✅ |
| Filter area | `.../filter.php?a=Canadian` ( `a=Indonesian` → `null`, fallback ke random) | sama | — | ✅ |
| Fallback | `.../search.php?s=Arrabiata` | sama | — | ✅ |

Response: `{meals:[{idMeal, strMeal, strCategory, strArea, strInstructions, strMealThumb, strYoutube, strIngredient1..20, strMeasure1..20}]}`

> Catatan: TheMealDB gratis selamanya di titik akses. Key `1` untuk dev/edukasi. Untuk publish appstore perlu supporter key, tapi Vercel Hobby web tidak perlu — tetap pakai `1`. Jangan hardcode key lain.

### Arsitektur (ikuti `weather.ts` / `market.ts`)

```
+page.server.ts → cached('resep:harian:{date}', 6j) → fetchWithTimeout(7000) → TheMealDB random.php
              → fallback cached('resep:fallback') peekCache 24j jika 5xx
              → Promise.allSettled (resep gagal → card Tidak tersedia, page tetap 200)
+page.svelte → $derived dari data.resep → card + bahan list + langkah
localStorage 'resep:fav' → simpan favorit (mirip bookmarks)
```

Cache keys:
- `resep:harian:{YYYY-MM-DD}` TTL 6 jam (ganti tiap hari, hemat quota)
- `resep:kategori:{cat}` TTL 1 jam
- Peek stale 24j via `peekCache()` (pola market).

### UI (standar portal `rounded-xl border-gray-100 bg-white`)

- **Home widget (stack di atas berita, di bawah Sholat/Briefing):**
  ```
  Card Resep: 🍳 Ide Masak Hari Ini
  [thumb 16:9] Cevapi Sausages • Croatian • Beef — 30 menit
  Bahan: Minced Beef 500g | Onion 1 | ... (+7)
  [Lihat Resep] [🎲 Acak Lagi] [❤️ Simpan]
  ```
  Style: `px-4 py-4 rounded-xl border border-gray-100 bg-white`, `text-xs font-bold uppercase tracking-wide` untuk header, thumb `rounded-lg`.

- **Halaman `/resep`:**
  - Hero thumb + title + category/area badge `Beef • Croatian`
  - Bahan grid 2 kolom `500g Minced Beef` + thumb ingredient `.../images/ingredients/lime.png`
  - Langkah `strInstructions` split `\r\n` → ordered list
  - Youtube embed `strYoutube` → link `Tonton Video`
  - Tombol `Acak Resep Lain` → `?random=1` → invalidate cache harian (force fetch baru)
  - Favorit list `localStorage` di `/resep?simpan`

- **Empty/err:** `Resep tidak tersedia — coba lagi` + `Muat ulang` (no dummy).

### File

| File | Fungsi |
|---|---|
| `src/lib/server/resep.ts` | `fetchResepHarian()`, `fetchResepByCategory(cat)` — `cached()` + `fetchWithTimeout` |
| `src/lib/components/ResepCard.svelte` | Card home + detail bahan/langkah |
| `src/routes/resep/+page.server.ts` | load harian `?random=&c=` |
| `src/routes/resep/+page.svelte` | Hero + bahan + langkah + acak + simpan |

### Verifikasi

```bash
npm run check && npm run build
# /resep → 200, thumb + bahan tampil, klik Acak → resep baru, Simpan → localStorage, offline → Tidak tersedia
# Home widget → 1 card resep harian, konsisten seharian (cache 6j)
```

---

## 3. Opsi B — Drakor + Film Hollywood via TMDB ⭐ Prioritas 2

### API TMDB (API key/token wajib; API tidak berbayar sesuai ketentuan)

| API | Endpoint | Key | Limit | Test |
|---|---|---|---|---|
| **TMDB** | `/3/discover/tv` + `/3/discover/movie` + `/3/search/tv` + `/3/search/movie` + detail endpoint | **API key/token** | Mengikuti limit/kebijakan TMDB | ✅ provider utama |

> Keputusan: **pakai TMDB sebagai provider utama untuk drakor dan film Hollywood**. Tidak ada fallback TVMaze/Kitsu. Jika TMDB gagal, gunakan stale cache lalu empty-state jujur.
>
> Environment variable: `TMDB_API_KEY` atau `TMDB_API_TOKEN`. Credential hanya boleh diakses dari server-side code.
>
> Filter drakor: `with_origin_country=KR` + `with_original_language=ko`. Film Hollywood memakai discover/search movie TMDB.
>
> Poster: `https://image.tmdb.org/t/p/w500{poster_path}`. Jika `poster_path` null, tampilkan placeholder UI tanpa dummy image.

### Arsitektur

```
+page.server.ts → Promise.allSettled
              ├─ cached('hiburan:drakor:{page}', 1j)
              │  → TMDB /3/discover/tv?with_origin_country=KR&with_original_language=ko
              ├─ cached('hiburan:movie:popular', 1j)
              │  → TMDB /3/trending/movie/week atau /3/movie/popular
              ├─ cached('hiburan:search:{type}:{q}', 1j)
              │  → TMDB /3/search/tv atau /3/search/movie
              └─ cached('hiburan:detail:{type}:{id}', 6j)
                 → TMDB /3/tv/{id} atau /3/movie/{id}
```

Credential TMDB tidak boleh dikirim ke client. Semua request memakai `fetchWithTimeout(7000)` + `cached()`. Jika upstream gagal, baca stale cache maksimal 24 jam lalu tampilkan empty-state.

### UI

- **Home widget `/harian`:** Card `🎬 Hiburan Pilihan` horizontal scroll.
  ```
  [poster] Queen of Tears • ⭐8.6 • Returning Series
  [poster] Dune: Part Two • ⭐8.6 • 2024
  ```
- **Halaman `/hiburan`:**
  - Tab `Drakor` dan `Film Hollywood`.
  - Search `?type=drakor&q=...` atau `?type=movie&q=...`.
  - List poster, rating, tahun, genre, status.
  - Detail `/hiburan/{type}/{id}`.
  - Jadwal hanya ditampilkan jika TMDB menyediakan episode/air-date; jangan hardcode jadwal.

### File

| File | Fungsi |
|---|---|
| `src/lib/server/hiburan.ts` | `fetchDrakorToday()`, `searchDrakor(q)` cached |
| `src/lib/components/DrakorCard.svelte` | Poster + rating + jadwal |
| `src/routes/hiburan/+page.server.ts` + `+page.svelte` | List + search |

---

## 4. Opsi C — Kalender Haid + Tips Harian (Private, Tanpa API) ⏸ Ditunda

### API: Tidak ada — 100% local

| Komponen | Sumber | Privacy |
|---|---|---|
| Hitung siklus | `localStorage 'haid:config'` `{lastDate, cycleLen:28, periodLen:5}` | 100% local, tidak kirim server |
| Prediksi | JS `date-fns` hitung `next = last + cycle` | — |
| Tips | Static JSON `src/lib/data/tipsHaid.json` 30 tips | — |

> Kenapa tanpa API = keunggulan: no 403/429, no quota, no CORS, instant. Sesuai pola `simpan/` bookmarks.

### Logika

```ts
// utils/haid.svelte.ts (runes)
cycle = $state(28)
last = $state('2026-08-20')
next = $derived(addDays(last, cycle)) // 2026-09-17
countdown = $derived(diffDays(next, clock.now)) // 21 hari lagi
phase = $derived(phaseOf(today, last, cycle)) // haid / ovulasi / aman
```

Notif: `Notification` 1 hari sebelum `next` → `Haid diperkirakan besok` (permission eksplisit, max 1/hari).

### UI (empathetic, soft pink `#fdf2f8`, bukan merah alarm)

- **Home widget:** Card `🩷 Kalender Haid • 3 hari lagi` + progress bar siklus 28 hari + `Catat Hari Ini`
- **Halaman `/haid`:**
  - Kalender bulan mini (dot pink di hari haid prediksi)
  - Form `Hari pertama haid terakhir` (date picker) + `Panjang siklus` (21-35) + `Simpan`
  - Tips hari ini `Minum air putih 2L • Istirahat cukup`
  - Disclaimer: `Prediksi estimasi, bukan medis. Konsultasi dokter jika tidak teratur.`
  - Data tidak pernah upload — badge `🔒 100% di HP kamu`

### File

| File | Fungsi |
|---|---|
| `src/lib/utils/haid.svelte.ts` | runes state + hitung prediksi |
| `src/lib/data/tipsHaid.json` | 30 tips static |
| `src/lib/components/HaidCard.svelte` | Countdown + kalender mini |
| `src/routes/haid/+page.svelte` | Full kalender + form (client only, tanpa `+page.server.ts`) |

---

## 5. Struktur Navigasi (Rekomendasi — tetap 4 tab, wanita-friendly)

**Tetap 4 tab (jangan 5 sesak, `AGENTS.md` §8):**

```
BottomNav: [Berita /] [Cuaca /cuaca] [Harian /harian] [Tentang /tentang]
- Baru: /harian sebagai 1 tab koleksi habit (hemat tab, rapi)
- /harian isi 4 section: Sholat + Briefing + Gempa + (Resep/Haid/Drakor toggle)
```

**Alternatif Opsi B (4 tab + widget, jika belum mau tab baru):**

```
BottomNav: [Berita /] [Cuaca /cuaca] [Tentang /tentang] (tetap 3)
Home stack: Sholat → Briefing → Gempa banner → 🍳 Resep → 🩷 Haid → 🎬 Drakor → Berita
(Gempa & Resep/Haid sebagai widget home, bukan tab — iterasi Phase 1)
```

**Status:** Rekomendasi widget home dan validasi retention **ditunda**. Tidak ada integrasi Resep atau Haid ke `/harian` saat ini.

> Market tetap hidden dari nav (2026-08-27), route `/market` tetap ada.

---

## 6. Roadmap Arsip — Tidak Dieksekusi Saat Ini

| Urutan | Fitur | Estimasi | Deliverable | Cache |
|---|---|---|---|---|
| 1 | **A Resep Harian** | Ditunda | Tidak ada implementasi | API Indonesia belum stabil; TheMealDB dominan Inggris |
| 2 | **C Haid** | Ditunda | Tidak ada implementasi | Belum masuk prioritas |
| 3 | **B Drakor + Film via TMDB** | Planned terpisah | Belum dibuat | TMDB key/token server-only |
| 4 | Integrasi `/harian` tab | Ditunda | Tidak ada implementasi | Menunggu keputusan fitur |

**Total estimasi tidak berlaku.** Seluruh roadmap wanita berstatus arsip sampai ada keputusan eksekusi baru.

Setelah ini gabung ke `PLAN_FITUR_HARIAN.md` §8 (roadmap) dan `AGENTS.md` §9 Next.

---

## 7. Arsitektur & Alur Data (update ARCHITECTURE.md)

```
Browser → Vercel CDN (s-maxage=600) → SvelteKit Server (Promise.allSettled)
                                              ├─ sources/* → cached('rss:{id}') TTL 10m → RSS
                                              ├─ weather.ts → cached('weather:*') TTL 10m → Open-Meteo
                                              ├─ resep.ts → cached('resep:*') TTL 6j → TheMealDB (A)
                                              ├─ hiburan.ts → cached('hiburan:*') TTL 1j/6j → TMDB (B)
                                              └─ haid: client only → localStorage (C) — no server fetch
```

Aturan tetap: fetch server-side only (kecuali C), `fetchWithTimeout(7000)`, UA browser, `peekCache()` 24j stale fallback, empty jujur `Tidak tersedia` tanpa dummy.

---

## 8. Verifikasi Tiap Fitur

```bash
npm run check && npm run build
# Resep: /resep → 200 thumb+bahan, /resep?random=1 → baru, / (home) card resep tampil 1x/hari
# Haid: /haid → form simpan → localStorage → countdown jalan, ganti siklus 28→30 → prediksi update, notif 1x
# Drakor: /hiburan → 5 drakor Korea, /hiburan?q=odyssey → search 200, klik → detail poster
# Dark mode, BottomNav active, Footer hide di /harian atau /resep sesuai layout
```

Checklist no-dummy (`DOC_JANGAN_GUNAKAN_DUMMY.md`):
- [ ] Tidak hardcode resep dummy — pakai stale cache 24j → empty jujur
- [ ] Tidak hardcode harga/key TMDB
- [ ] Haid tidak kirim data ke server (privacy)

---

## 9. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| TheMealDB `a=Indonesian` null / 500 | Pakai random + `c=Seafood` fallback, `Promise.allSettled` → card `Tidak tersedia` |
| TMDB 5xx/401/429 atau 0 hasil | Validasi credential → stale cache 24j → empty `Data hiburan belum tersedia`; jangan fallback ke provider lain |
| Haid data sensitif | 100% localStorage, disclaimer medis, no analytics, no server log |
| BottomNav sesak 5 tab | Tetap 4 tab max, Harian sebagai 1 tab koleksi atau widget |
| Gambar resep berat | `loading=lazy` + `preview/medium` thumb, CDN cache |

---

## 10. Referensi API (verified 2026-08-27)

- TheMealDB: `https://www.themealdb.com/api.php` — random `.../api/json/v1/1/random.php` (key `1`), filter `.../filter.php?c=Seafood`, list `.../list.php?c=list`
- TMDB API: `https://developer.themoviedb.org/docs` — endpoint discover/search/detail movie + TV
- TMDB authentication: `https://developer.themoviedb.org/docs/authentication-application` — API key V3 atau API Read Access Token V4
- TMDB images: `https://image.tmdb.org/t/p/w500` dan `w1280`
- Attribution: `This product uses the TMDB API but is not endorsed or certified by TMDB.`

---

## 11. Status Tracker

| Fitur | Status | File Kunci | API |
|---|---|---|---|
| A Resep Harian | ⏸ Ditunda | Belum dibuat | API Indonesia tidak stabil; TheMealDB dominan Inggris |
| B Drakor/Hiburan | ⏳ Planned | `hiburan.ts`, `DrakorCard.svelte`, `routes/hiburan/` | TMDB API key/token server-only |
| C Kalender Haid | ⏸ Ditunda | Belum dibuat | Belum masuk prioritas |

> Status diperbarui hanya setelah ada keputusan eksekusi baru. Drakor/Hiburan siap masuk development memakai TMDB; Resep Harian dan Kalender Haid tetap ditunda.

