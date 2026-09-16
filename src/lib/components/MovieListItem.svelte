<script lang="ts">
	import type { MovieItem } from '$lib/hiburan';
	let { movie }: { movie: MovieItem } = $props();
	function formatDate(value: string) {
		const [year, month, day] = value.split('-');
		return year && month && day ? `${day}/${month}/${year}` : value;
	}
</script>

<a href={`/hiburan/movie/${movie.id}`} class="flex gap-3 rounded-xl border border-gray-100 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
	<div class="h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-neutral-800">
		{#if movie.poster}<img src={movie.poster} alt={movie.title} loading="lazy" class="h-full w-full object-cover" />{:else}<div class="flex h-full items-center justify-center p-1 text-center text-[9px] text-gray-400">Poster tidak tersedia</div>{/if}
	</div>
	<div class="min-w-0">
		<h3 class="line-clamp-2 text-sm font-bold text-gray-900 dark:text-neutral-100">{movie.title}</h3>
		<p class="mt-1 text-[11px] text-gray-500 dark:text-neutral-400">
			{#if movie.year}{movie.year}{/if}
			{#if movie.releaseDate} • Rilis {formatDate(movie.releaseDate)}{/if}
			{#if movie.rating != null}<span class="text-yellow-500"> • ★ {movie.rating.toFixed(1)}</span>{/if}
		</p>
		{#if movie.genres.length}<p class="mt-1 line-clamp-1 text-[11px] text-gray-600 dark:text-neutral-300">{movie.genres.join(' · ')}</p>{/if}
		{#if movie.runtime}<p class="mt-1 text-[10px] text-gray-400 dark:text-neutral-500">Durasi {movie.runtime} menit</p>{/if}
		{#if movie.voteCount != null}<p class="mt-1 text-[10px] text-gray-400 dark:text-neutral-500">{movie.voteCount.toLocaleString('id-ID')} suara</p>{/if}
		{#if movie.overview}<p class="mt-2 line-clamp-3 text-xs leading-relaxed text-gray-600 dark:text-neutral-400">{movie.overview}</p>{/if}
	</div>
</a>
