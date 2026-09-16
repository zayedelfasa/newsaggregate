<script lang="ts">
	import type { MovieDetail } from '$lib/hiburan';
	import MovieRail from '$lib/components/MovieRail.svelte';
	let { data }: { data: { movie: MovieDetail } } = $props();
	const movie = $derived(data.movie);
	function formatDate(value: string) {
		const [year, month, day] = value.split('-');
		return year && month && day ? `${day}/${month}/${year}` : value;
	}
</script>

<svelte:head><title>{movie.title} — Hiburan | Portal Berita</title></svelte:head>

<div class="space-y-4 pb-4">
	{#if movie.backdrop}<img src={movie.backdrop} alt="" class="h-44 w-full object-cover opacity-80" />{/if}
	<div class="space-y-3 px-4">
		<div class="flex gap-3">
			<div class="h-40 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-neutral-800">{#if movie.poster}<img src={movie.poster} alt={movie.title} class="h-full w-full object-cover" />{:else}<div class="flex h-full items-center justify-center p-2 text-center text-xs text-gray-400">Poster tidak tersedia</div>{/if}</div>
			<div><h1 class="text-xl font-bold text-gray-900 dark:text-neutral-100">{movie.title}</h1><p class="mt-2 text-xs text-gray-500 dark:text-neutral-400">{#if movie.year}{movie.year}{/if}{#if movie.runtime} • {movie.runtime} menit{/if}{#if movie.rating != null}<span class="text-yellow-500"> • ★ {movie.rating.toFixed(1)}</span>{/if}</p>{#if movie.genres.length}<p class="mt-2 text-xs text-gray-600 dark:text-neutral-300">{movie.genres.join(' • ')}</p>{/if}{#if movie.releaseDate}<p class="mt-2 text-[11px] text-gray-400">Rilis {formatDate(movie.releaseDate)}</p>{/if}</div>
		</div>
		{#if movie.tagline}<p class="text-sm italic text-gray-500 dark:text-neutral-400">“{movie.tagline}”</p>{/if}
		<section class="rounded-xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
			<h2 class="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">Deskripsi</h2>
			{#if movie.overview}<p class="mt-2 text-sm leading-relaxed text-gray-700 dark:text-neutral-300">{movie.overview}</p>{:else}<p class="mt-2 text-sm text-gray-400 dark:text-neutral-500">Deskripsi film belum tersedia.</p>{/if}
		</section>
		<section class="rounded-xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"><h2 class="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">Informasi</h2><div class="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-neutral-300"><div>Status<br /><b>{movie.status ?? 'Tidak tersedia'}</b></div><div>Bahasa asli<br /><b>{movie.originalLanguage ?? 'Tidak tersedia'}</b></div><div>Negara produksi<br /><b>{movie.productionCountries?.join(', ') || 'Tidak tersedia'}</b></div><div>Jumlah suara<br /><b>{movie.voteCount?.toLocaleString('id-ID') ?? 'Tidak tersedia'}</b></div></div></section>
		{#if movie.cast.length}<section><h2 class="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">Pemeran</h2><div class="flex gap-3 overflow-x-auto">{#each movie.cast as actor (actor.id)}<div class="w-16 shrink-0 text-center"><div class="h-16 w-16 overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800">{#if actor.profile}<img src={actor.profile} alt={actor.name} class="h-full w-full object-cover" />{/if}</div><p class="mt-1 line-clamp-2 text-[10px] text-gray-600 dark:text-neutral-300">{actor.name}</p></div>{/each}</div></section>{/if}
		{#if movie.videos.length}<section><h2 class="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">Trailer</h2><div class="space-y-2">{#each movie.videos.slice(0, 3) as video (video.key)}<a href={`https://www.youtube.com/watch?v=${video.key}`} target="_blank" rel="noreferrer" class="block rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-300">▶ {video.name} ↗</a>{/each}</div></section>{/if}
		<a href={movie.sourceUrl} target="_blank" rel="noreferrer" class="block text-center text-xs font-bold text-red-500">Lihat sumber TMDB ↗</a>
		<MovieRail title="Film Serupa" movies={movie.similar} />
		<p class="text-center text-[10px] text-gray-400">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
	</div>
</div>
