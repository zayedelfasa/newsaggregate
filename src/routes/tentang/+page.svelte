<svelte:head>
	<title>Tentang Aplikasi — Portal Berita Indonesia</title>
	<meta name="description" content="Tentang Portal Berita Indonesia — agregator 11 media lokal, fitur Cuaca & Polusi." />
</svelte:head>

<div class="px-4 py-6">
	<h2 class="text-lg font-bold tracking-tight text-gray-900 dark:text-neutral-100">Tentang Aplikasi</h2>
	<p class="mt-1 text-xs leading-relaxed text-gray-500 dark:text-neutral-400">
		Portal Berita Indonesia — berita nasional, cuaca, informasi harian, market, dan hiburan dalam satu aplikasi.
	</p>

	<div class="mt-6 rounded-xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
		<h3 class="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-neutral-300">Apa ini?</h3>
		<p class="mt-2 text-xs leading-relaxed text-gray-600 dark:text-neutral-400">
			Aplikasi ini menampilkan headline dari 11 media Indonesia (Detik, CNN Indonesia, Antara News, CNBC Indonesia, Tempo, Republika, Okezone, Kumparan, JPNN, Media Indonesia, dan iNews). User dapat membaca ringkasan, mencari artikel, memfilter kategori, menyimpan berita, lalu membuka artikel lengkap di situs media asli.
		</p>
	</div>

	<div class="mt-4 rounded-xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
		<h3 class="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-neutral-300">Fitur Utama</h3>
		<ul class="mt-2 space-y-2 text-xs leading-relaxed text-gray-600 dark:text-neutral-400">
			<li><span class="font-bold text-gray-900 dark:text-neutral-200">📰 Berita</span> — Agregasi 11 sumber, filter kategori (Nasional, Ekonomi, Tekno, Olahraga, Hiburan, Gaya Hidup) & filter sumber, pencarian, bookmark.</li>
			<li><span class="font-bold text-gray-900 dark:text-neutral-200">🌤️ Cuaca</span> — Suhu saat ini, polusi AQI/PM2.5, forecast 7 hari & 24 jam, search kota & geolocation via Open-Meteo (gratis tanpa key, cache 10 menit).</li>
			<li><span class="font-bold text-gray-900 dark:text-neutral-200">📅 Harian</span> — Kalender Hijriah, hari penting, gempa BMKG, harga logam, tren sembako, BBM & LPG, dan skor bola.</li>
			<li><span class="font-bold text-gray-900 dark:text-neutral-200">🎬 Hiburan</span> — Katalog film trending, populer, sedang tayang, upcoming, search, genre, rating, poster, trailer, dan detail film melalui TMDB API.</li>
			<li><span class="font-bold text-gray-900 dark:text-neutral-200">📈 Market</span> — Informasi market read-only. Bukan aplikasi trading dan bukan rekomendasi investasi.</li>
		</ul>
	</div>

	<div class="mt-4 rounded-xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
		<h3 class="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-neutral-300">Sumber Data</h3>
		<ul class="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed text-gray-600 dark:text-neutral-400">
			<li>Berita: RSS resmi + aggregator <code class="rounded bg-gray-100 px-1 py-0.5 dark:bg-neutral-800">berita-indo-api</code></li>
			<li>Harian: BMKG, CoinGecko, Nager.Date, Aladhan, Google Trends, Pertamina, ESPN, dan sumber terkait sesuai fitur.</li>
			<li>Market: widget/source market yang tersedia di route market; data ditampilkan read-only.</li>
			<li>Hiburan: TMDB API dan TMDB Image CDN untuk metadata film, poster, rating, genre, trailer, dan detail.</li>
			<li>Cuaca & Polusi: Open-Meteo Weather + Air Quality + Geocoding — tanpa API key, unlimited.</li>
		</ul>
		<p class="mt-2 text-[11px] text-gray-400 dark:text-neutral-500">Bukan rekomendasi investasi. Data hanya untuk informasi.</p>
	</div>

	<div class="mt-4 rounded-xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
		<h3 class="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-neutral-300">Versi</h3>
		<p class="mt-2 text-xs text-gray-600 dark:text-neutral-400">v0.1.0 • Berita, Cuaca, Harian, Market, dan Hiburan</p>
	</div>

	<p class="mt-6 text-center text-[11px] text-gray-400 dark:text-neutral-500">© {new Date().getFullYear()} Portal Berita Indonesia</p>
</div>
