<script lang="ts">
	import MovieRail from '$lib/components/MovieRail.svelte';
	import MovieListItem from '$lib/components/MovieListItem.svelte';
	let { data } = $props();
	let query = $state('');
	$effect(() => {
		query = data.query;
	});
	const activeMovies = $derived(data.search ?? data.genreMovies);
	const activeTitle = $derived(data.search ? `Hasil: ${data.query}` : data.genreMovies ? 'Jelajah Genre' : '');
	const sectionMovies = $derived(data.section === 'popular' ? data.popular : data.section === 'now-playing' ? data.nowPlaying : data.section === 'upcoming' ? data.upcoming : data.section === 'trending' ? data.trendingWeek : null);
	const sectionTitle = $derived(data.section === 'popular' ? 'Film Populer' : data.section === 'now-playing' ? 'Sedang Tayang' : data.section === 'upcoming' ? 'Segera Hadir' : data.section === 'trending' ? 'Trending' : '');
	function submitSearch() { const q = query.trim(); location.href = q ? `/hiburan?q=${encodeURIComponent(q)}` : '/hiburan'; }
</script>

<svelte:head><title>Hiburan — Film | Portal Berita</title><meta name="description" content="Katalog film trending, populer, sedang tayang, dan segera hadir." /></svelte:head>

<div class="space-y-5 px-4 py-4">
	<div class="flex items-center justify-between"><div><h1 class="text-lg font-bold text-gray-900 dark:text-neutral-100">🎬 Hiburan</h1><p class="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">Katalog film dari TMDB</p></div><a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" class="text-[10px] text-gray-400">TMDB ↗</a></div>
	<form onsubmit={(e) => { e.preventDefault(); submitSearch(); }} class="flex gap-2">
		<input bind:value={query} aria-label="Cari film" placeholder="Cari judul film..." class="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100" />
		<button class="rounded-xl bg-gray-900 px-4 text-xs font-bold text-white dark:bg-white dark:text-gray-900">Cari</button>
	</form>
	{#if data.genres.length}
		<div class="space-y-1.5">
			<p class="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-neutral-500">Genre</p>
			<div class="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{#each data.genres.slice(0, 10) as genre (genre.id)}<a href={`/hiburan?genre=${genre.id}`} class="shrink-0 rounded-full border border-gray-200 px-3 py-1.5 text-[11px] font-semibold text-gray-600 dark:border-neutral-700 dark:text-neutral-300">{genre.name}</a>{/each}
			</div>
		</div>
	{/if}
	{#if data.message}<div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-5 text-center text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">{data.message}<p class="mt-1 text-xs">Isi TMDB_API_KEY atau TMDB_API_TOKEN di env server.</p></div>{/if}
	{#if activeMovies || sectionMovies}
		{@const movies = activeMovies ?? sectionMovies ?? []}
		<section><h2 class="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">{activeTitle || sectionTitle}</h2>{#if movies.length}<div class="space-y-2">{#each movies as movie (movie.id)}<MovieListItem {movie} />{/each}</div>{:else}<p class="rounded-xl border border-gray-100 p-5 text-center text-sm text-gray-500 dark:border-neutral-800">Film tidak ditemukan.</p>{/if}</section>
	{:else}
		<div class="space-y-1.5">
			<p class="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-neutral-500">Jelajah</p>
			<div class="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				<a href="/hiburan?section=trending" class="shrink-0 rounded-full border border-gray-200 px-3 py-1.5 text-[11px] font-semibold text-gray-600 dark:border-neutral-700 dark:text-neutral-300">Trending</a>
				<a href="/hiburan?section=popular" class="shrink-0 rounded-full border border-gray-200 px-3 py-1.5 text-[11px] font-semibold text-gray-600 dark:border-neutral-700 dark:text-neutral-300">Populer</a>
				<a href="/hiburan?section=now-playing" class="shrink-0 rounded-full border border-gray-200 px-3 py-1.5 text-[11px] font-semibold text-gray-600 dark:border-neutral-700 dark:text-neutral-300">Sedang tayang</a>
				<a href="/hiburan?section=upcoming" class="shrink-0 rounded-full border border-gray-200 px-3 py-1.5 text-[11px] font-semibold text-gray-600 dark:border-neutral-700 dark:text-neutral-300">Segera hadir</a>
			</div>
		</div>
		<MovieRail title="Trending Hari Ini" href="/hiburan?section=trending" movies={data.trendingDay} />
		<MovieRail title="Trending Minggu Ini" href="/hiburan?section=trending" movies={data.trendingWeek} />
		<MovieRail title="Film Populer" href="/hiburan?section=popular" movies={data.popular} />
		<MovieRail title="Sedang Tayang" href="/hiburan?section=now-playing" movies={data.nowPlaying} />
		<MovieRail title="Segera Hadir" href="/hiburan?section=upcoming" movies={data.upcoming} />
		{#if !data.configured}<p class="rounded-xl border border-gray-100 p-5 text-center text-sm text-gray-500 dark:border-neutral-800">Data hiburan belum tersedia.</p>{/if}
	{/if}
</div>
